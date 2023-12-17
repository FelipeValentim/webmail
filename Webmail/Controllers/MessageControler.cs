using MailKit;
using MailKit.Net.Imap;
using MailKit.Net.Smtp;
using MailKit.Search;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using MimeKit;
using MimeKit.Text;
using System.IO.Compression;
using System.Text.RegularExpressions;
using Webmail.Helpers;
using Webmail.Services;
using static Webmail.Models.WebMailModels;

namespace Net6_Controller_And_VIte.Controllers
{
    [Authorize]
    [ApiController]
    [Route("[controller]")]
    public class MessageController : ControllerBase
    {
        private readonly ImapClient _imapClient;

        private readonly IHttpContextAccessor _httpContextAccessor;

        public MessageController(IHttpContextAccessor httpContextAccessor, ImapClient imapClient)
        {
            _httpContextAccessor = httpContextAccessor;
            _imapClient = imapClient;

        }

        private ServerOptions IMAP = new ServerOptions();
        private ImapClient ImapClient;
        private readonly List<string> spamNames = new List<string> { "Spam", "Lixo Eletrônico" };
        private readonly List<string> trashNames = new List<string> { "Lixo", "Lixeira", "Trash" };


        [HttpPost("Get")]
        public IActionResult Get(MessageFilter filter)
        {
            List<EmailMessage> emails = new List<EmailMessage>();

            IList<UniqueId> queryUID = null;

            try
            {
                using (var imapClient = new ImapClient())
                {

                    // Seta a query por padrão como All
                    var searchQuery = SearchQuery.All;

                    // Se tiver selecionado alguma Query específica (Seen, Flagged, ...)
                    if (!string.IsNullOrEmpty(filter.SearchQuery))
                    {
                        searchQuery = Utils.GetSearchQuery(filter.SearchQuery);
                    }

                    // Se tiver texto para pesquisa, então configurar as Queries com os parametros selecionados 
                    
                    if (!string.IsNullOrEmpty(filter.SearchText))
                    {
                        searchQuery = searchQuery.GetQueries(filter.SearchParams, filter.SearchText);
                    }

                    ////ImapClient = MailKitImapClient.Instance;

                    //if (!_imapClient.IsConnected)
                    //{
                    var user = UserService.GetUser(_httpContextAccessor);

                    imapClient.Connect(user.Provider.Host, user.Provider.Port, user.Provider.SecureSocketOptions);

                    imapClient.Authenticate(user.Username, user.Password);
                    //}

                    var personal = imapClient.GetFolders(imapClient.PersonalNamespaces[0]);

                    IMailFolder folder = null;

                    folder = imapClient.GetFolder(filter.FolderName, FolderAccess.ReadOnly);

                    List<UniqueId> uids = null;

                    // Checa se o servidor possui suporte para o uso de Sort, se não possuir apenas utilizar o Search
                    if (imapClient.Capabilities.HasFlag(ImapCapabilities.Sort))
                    {
                        queryUID = folder.Sort(searchQuery, new[] { OrderBy.ReverseDate });
                        if (queryUID.Count <= filter.RowsPerPage * filter.Page)
                        {
                            filter.Page = queryUID.Count / filter.RowsPerPage;
                        }
                        uids = queryUID.Skip(filter.RowsPerPage * filter.Page).Take(filter.RowsPerPage).ToList(); // Pega UniqueID
                    }
                    else
                    {
                        queryUID = folder.Search(searchQuery);
                        if (queryUID.Count <= filter.RowsPerPage * filter.Page)
                        {
                            filter.Page = queryUID.Count / filter.RowsPerPage;
                        }
                        uids = queryUID.OrderByDescending(x => x.Id).Skip(filter.RowsPerPage * filter.Page).Take(filter.RowsPerPage).ToList(); // Pega UniqueID
                    }

                    // Info de mensagens apenas com os dados mais importantes (Email, Conteúdo parcial, Flags, Data, ...)
                    var items = folder.Fetch(uids, MessageSummaryItems.Envelope | MessageSummaryItems.Flags | MessageSummaryItems.Body | MessageSummaryItems.PreviewText);// Tirar PreviewText se quiser mais desempenho

                    // Checa se a pasta pertence é Sent ou Drafts
                    var isSent = folder.Attributes.HasFlag(FolderAttributes.Sent) || folder.Attributes.HasFlag(FolderAttributes.Drafts);

                    // Percorre os emails e cria os objetos
                    foreach (var email in items)
                    {
                        var emailMessage = new EmailMessage()
                        {
                            UniqueId = email.UniqueId,
                            Content = email.PreviewText,
                            Subject = string.IsNullOrEmpty(email.Envelope.Subject) ? "(Sem assunto)" : email.Envelope.Subject,
                            Date = email.Date.ToString("dd/MM/yyyy"),
                            HasAttachment = email.Attachments.Any(),
                            Seen = email.Flags.Value.HasFlag(MessageFlags.Seen),
                            IsSent = isSent,
                            Flagged = email.Flags.Value.HasFlag(MessageFlags.Flagged),
                        };
                        emailMessage.FromAddresses.AddRange(email.Envelope.From.Mailboxes.Select(x => new EmailAddress { Address = x.Address, Name = x.Name }));
                        emailMessage.ToAddresses.AddRange(email.Envelope.To.Mailboxes.Select(x => new EmailAddress { Address = x.Address, Name = x.Name }));

                        emails.Add(emailMessage);
                    }
                    emails.Reverse();
                }
            }
            catch (ImapProtocolException)
            {
                var user = UserService.GetUser(_httpContextAccessor);

                var result = user.Reconnect(_imapClient);

                if (!result.Succeeded)
                {
                    return BadRequest(new { message = result.Message });
                }

                // Se for sucedido, então apenas tente novamente
                return Get(filter);
            }
            catch
            {
                var user = UserService.GetUser(_httpContextAccessor);

                var result = user.Reconnect(_imapClient);

                if (!result.Succeeded)
                {
                    return BadRequest(new { message = result.Message });
                }

                return Get(filter);
            }

            return Ok(new { messages = emails, countMessages = queryUID.Count });
        }

        [HttpGet("{folder}/{id}")]
        public IActionResult GetEmail(string folder, uint id)
        {
            EmailMessage email = new EmailMessage();

            try
            {
                using (var cancel = new CancellationTokenSource())
                {
                    //ImapClient = MailKitImapClient.Instance;

                    using (var imapClient = new ImapClient())
                    {

                        var user = UserService.GetUser(_httpContextAccessor);

                        imapClient.Connect(user.Provider.Host, user.Provider.Port, user.Provider.SecureSocketOptions);

                        imapClient.Authenticate(user.Username, user.Password);


                        var mailFolder = imapClient.GetFolder(folder, FolderAccess.ReadWrite, cancel.Token);

                    // Retorna o email com os dados mais importantes
                    var item = mailFolder.Fetch(new UniqueId[] { new UniqueId(id) }, MessageSummaryItems.Full | MessageSummaryItems.BodyStructure).FirstOrDefault();

                        // Marca o email como Seen (visto) 
                        mailFolder.AddFlags(item.UniqueId, MessageFlags.Seen, false);

                    string htmlText = string.Empty;

                    List<MimeEntity> mimeEntities = new List<MimeEntity>();

                    // Checa se o HtmlBody e o TextBody são inválidos, se forem então é necessário percorrer o BodyParts do email
                    if (item.HtmlBody == null && item.TextBody == null)
                    {
                        foreach (var bodyPart in item.BodyParts)
                        {
                            var mimeEntity = mailFolder.GetBodyPart(item.UniqueId, bodyPart);

                            // Checa se o BodyPart retorna é um tipo TextPart, se for então é um texto
                            if (mimeEntity is TextPart textPart)
                            {
                                htmlText += textPart.Text;
                            }

                            // Se for diferente de null então é Embedded
                            if (mimeEntity.ContentId != null)
                            {
                                mimeEntities.Add(mimeEntity);
                            }
                        }
                    }
                    else
                    {
                        // Se HtmlBody ou TextBody forem diferentes de Null, então é apenas necessário pegar o BodyPart diretamente dele
                        foreach (var bodyPart in item.BodyParts)
                        {
                            if (bodyPart.ContentId != null)
                            {
                                var mimeEntity = mailFolder.GetBodyPart(item.UniqueId, bodyPart);
                                mimeEntities.Add(mimeEntity);
                            }
                        }

                        var body = mailFolder.GetBodyPart(item.UniqueId, item.HtmlBody ?? item.TextBody);

                        htmlText = ((TextPart)body).Text;

                        // Se HtmlBody for inválido (significa que pegou de TextBody), então é necessário converter de texto plano para Html
                        if (item.HtmlBody == null) htmlText = new TextToHtml().Convert(htmlText);
                    }

                    // Converte todas as imagens Embedded no Html para Base64
                    htmlText = Utils.GetHtmlEmbeddedImage(htmlText, mimeEntities);

                    htmlText = Regex.Replace(htmlText, @"<style\b[^<]*(?:(?!<\/style>)<[^<]*)*<\/style>", "");

                    // Pega a data convertida
                    string date = item.Date.ToString("dd 'de' MMM. 'de' yyyy 'às' HH:mm", new System.Globalization.CultureInfo("pt-BR"));

                    // Pega a data com o tempo percorrido
                    date = $"{date} {item.Date.GetPastTime()}";

                    email.Content = htmlText;
                    email.Subject = string.IsNullOrEmpty(item.Envelope.Subject) ? "(Sem assunto)" : item.Envelope.Subject;
                    email.Date = date;
                    email.Attachments = item.Attachments.Select(x => new Attachment() { FileName = x.ContentDisposition.FileName, FolderName = folder, UniqueId = id, ContentId = x.ContentId, Size = Convert.ToInt64(x.Octets - (x.Octets / 3.5)) }).ToList();

                    email.ToAddresses.AddRange(item.Envelope.To.Mailboxes.Select(x => new EmailAddress { Address = x.Address, Name = x.Name }));
                    email.FromAddresses.AddRange(item.Envelope.From.Mailboxes.Select(x => new EmailAddress { Address = x.Address, Name = x.Name }));
                    email.IsSent = mailFolder.Attributes.HasFlag(FolderAttributes.Sent);
                    email.IsDraft = mailFolder.Attributes.HasFlag(FolderAttributes.Drafts);
                        email.Flagged = item.Flags.Value.HasFlag(MessageFlags.Flagged);


                        //ImapClient.Disconnect(true, cancel.Token);
                    }
                }

            }
            catch (ImapProtocolException)
            {
                //IMAP.SetIMAPServer();

                var result = IMAP.Reconnect(ImapClient);

                if (!result.Succeeded)
                {
                    return Ok(new { message = result.Message });
                }

                return GetEmail(folder, id);
            }
            catch (Exception ex)
            {
                return Ok(new { message = ex.Message });
            }

            var json = Ok(email);

            return json;
        }


        [HttpGet("ToggleFlagged")]
        public IActionResult ToggleFlagged(string path, uint[] ids, string type)
        {
            using (var cancel = new CancellationTokenSource())
            {
                try
                {
                    //ImapClient = MailKitImapClient.Instance;

                    var folder = ImapClient.GetFolder(path, FolderAccess.ReadWrite, cancel.Token);

                    List<UniqueId> uniqueIds = new List<UniqueId>();

                    foreach (var id in ids)
                    {
                        uniqueIds.Add(new UniqueId(id));
                    }

                    if (type == "flagged")
                    {
                        folder.AddFlags(uniqueIds, MessageFlags.Flagged, false);
                        return Ok(new { success = true, message = uniqueIds.Count > 1 ? "Mensagens marcadas como importante" : "Mensagem marcada como importante" });
                    }
                    else
                    {
                        folder.RemoveFlags(uniqueIds, MessageFlags.Flagged, false);
                        return Ok(new { success = true, message = uniqueIds.Count > 1 ? "Mensagens marcadas como não importante" : "Mensagem marcada como não importante" });

                    }

                }
                catch (ImapProtocolException)
                {
                    //IMAP.SetIMAPServer();

                    var result = IMAP.Reconnect(ImapClient);

                    if (!result.Succeeded)
                    {
                        return Ok(new { message = result.Message });
                    }

                    return ToggleFlagged(path, ids, type);
                }
                catch (Exception ex)
                {
                    return Ok(new { success = false, message = ex.Message });
                }
            }
        }

        [HttpGet("ToggleRead")]
        public IActionResult ToggleRead(string path, uint[] ids, string type)
        {
            using (var cancel = new CancellationTokenSource())
            {
                try
                {
                    //ImapClient = MailKitImapClient.Instance;

                    var folder = ImapClient.GetFolder(path, FolderAccess.ReadWrite, cancel.Token);

                    List<UniqueId> uniqueIds = new List<UniqueId>();

                    foreach (var id in ids)
                    {
                        uniqueIds.Add(new UniqueId(id));
                    }

                    if (type == "read")
                    {
                        folder.AddFlags(uniqueIds, MessageFlags.Seen, false);
                        return Ok(new { success = true, message = uniqueIds.Count > 1 ? "Mensagens marcadas como lidas" : "Mensagem marcada como lida" });
                    }
                    else
                    {
                        folder.RemoveFlags(uniqueIds, MessageFlags.Seen, false);
                        return Ok(new { success = true, message = uniqueIds.Count > 1 ? "Mensagens marcadas como não lidas" : "Mensagem marcada como não lida" });

                    }

                }
                catch (ImapProtocolException)
                {
                    //IMAP.SetIMAPServer();

                    var result = IMAP.Reconnect(ImapClient);

                    if (!result.Succeeded)
                    {
                        return Ok(new { message = result.Message });
                    }

                    return ToggleFlagged(path, ids, type);
                }
                catch (Exception ex)
                {
                    return Ok(new { success = false, message = ex.Message });
                }
            }
        }

    }
}