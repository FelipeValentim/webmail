using MailKit;
using MailKit.Net.Imap;
using MailKit.Net.Smtp;
using MailKit.Search;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Http;
using Microsoft.AspNetCore.Mvc;
using Microsoft.Extensions.Caching.Memory;
using MimeKit;
using MimeKit.Text;
using Org.BouncyCastle.Asn1.X509;
using System.IO.Compression;
using System.Net.Mail;
using System.Runtime.Serialization;
using System.Runtime.Serialization.Formatters.Binary;
using System.Text;
using System.Text.Json;
using System.Text.RegularExpressions;
using webmail_backend.Helpers;
using webmail_backend.Services;
using static webmail_backend.Models.WebMailModels;

namespace webmail_backend.Controllers
{
    [Authorize]
    [ApiController]
    [Route("[controller]")]
    public class MessageController : ControllerBase
    {
        private readonly IHttpContextAccessor _httpContextAccessor;
        private readonly IMemoryCache _cache;

        public MessageController(IHttpContextAccessor httpContextAccessor, IMemoryCache cache)
        {
            _httpContextAccessor = httpContextAccessor;
            _cache = cache;
        }

        private readonly List<string> spamNames = new List<string> { "Spam", "Lixo Eletrônico" };
        private readonly List<string> trashNames = new List<string> { "Lixo", "Lixeira", "Trash" };


        [HttpPost("Get")]
        public IActionResult Get(MessageFilter filter)
        {
            List<EmailMessage> emails = new List<EmailMessage>();

            IList<UniqueId> queryUID = null;

            try
            {
                var user = UserService.GetUser(_httpContextAccessor);

                var imapClient = _cache.GetImapClient(user);

                lock (imapClient.SyncRoot)
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

                var result = _cache.SetImapClient(user);

                if (!result.Succeeded)
                {
                    return StatusCode(StatusCodes.Status401Unauthorized, result.Message);
                }

                return Get(filter);
            }
            catch (Exception ex)
            {
                return StatusCode(StatusCodes.Status500InternalServerError, ex.Message);
            }

            return StatusCode(StatusCodes.Status200OK, new { messages = emails, countMessages = queryUID.Count });
        }

        [HttpGet("{folder}/{id}")]
        public IActionResult GetEmail(string folder, uint id)
        {
            EmailMessage email = new EmailMessage();

            try
            {
                using (var cancel = new CancellationTokenSource())
                {
                    var user = UserService.GetUser(_httpContextAccessor);

                    var imapClient = _cache.GetImapClient(user);

                    lock (imapClient.SyncRoot)
                    {
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
                        email.Attachments = item.Attachments.Select(x => new Models.WebMailModels.Attachment() { FileName = x.ContentDisposition.FileName, FolderName = folder, UniqueId = id, ContentId = x.ContentId, Size = Convert.ToInt64(x.Octets - (x.Octets / 3.5)) }).ToList();

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
                var user = UserService.GetUser(_httpContextAccessor);

                var result = _cache.SetImapClient(user);

                if (!result.Succeeded)
                {
                    return StatusCode(StatusCodes.Status401Unauthorized, result.Message);
                }

                return GetEmail(folder, id);
            }
            catch (Exception ex)
            {
                return StatusCode(StatusCodes.Status500InternalServerError, ex.Message);
            }

            return StatusCode(StatusCodes.Status200OK, email);

        }

        [HttpPut("SpamMessages")]
        public IActionResult SpamMessages(SendDataMessages sendDataMessages)
        {
            try
            {
                using (var cancel = new CancellationTokenSource())
                {
                    var user = UserService.GetUser(_httpContextAccessor);

                    var imapClient = _cache.GetImapClient(user);

                    lock (imapClient.SyncRoot)
                    {
                        var folder = imapClient.GetFolder(sendDataMessages.Folder, FolderAccess.ReadWrite, cancel.Token);

                        List<UniqueId> uniqueIds = new List<UniqueId>();

                        foreach (var id in sendDataMessages.Ids)
                        {
                            uniqueIds.Add(new UniqueId(id));
                        }


                        var folders = imapClient.GetFolders(imapClient.PersonalNamespaces[0]);

                        var spam = folders.FirstOrDefault(x => x.Attributes.HasFlag(FolderAttributes.Junk));

                        if (spam == null)
                        {
                            // get the default personal namespace root folder
                            spam = folders.FirstOrDefault(x => spamNames.Any(s => x.FullName.EndsWith(s, StringComparison.OrdinalIgnoreCase)));

                            if (spam == null)
                            {
                                spam = imapClient.Inbox.Create("Spam", true);
                            }
                        }

                        if (spam == folder) return Ok(new { success = false, message = "Mensagem já marcada como spam" });

                        folder.MoveTo(uniqueIds, spam);

                        return StatusCode(StatusCodes.Status200OK, sendDataMessages.Ids.Length > 1 ? "Mensagens marcadas como spam" : "Mensagem marcada como spam" );
                    }
                }
            }
            catch (ImapProtocolException)
            {
                var user = UserService.GetUser(_httpContextAccessor);

                var result = _cache.SetImapClient(user);

                if (!result.Succeeded)
                {
                    return StatusCode(StatusCodes.Status401Unauthorized, result.Message);
                }

                return SpamMessages(sendDataMessages);
            }
            catch (Exception ex)
            {
                return StatusCode(StatusCodes.Status500InternalServerError, ex.Message);
            }
        }
        [HttpPut("Flagged")]
        public IActionResult Flagged(SendDataMessage sendDataMessage)
        {
            using (var cancel = new CancellationTokenSource())
            {
                try
                {
                    var user = UserService.GetUser(_httpContextAccessor);

                    var imapClient = _cache.GetImapClient(user);

                    lock (imapClient.SyncRoot)
                    {
                        var folder = imapClient.GetFolder(sendDataMessage.Folder, FolderAccess.ReadWrite, cancel.Token);

                        var uniqueId = new UniqueId(sendDataMessage.Id);

                        if (sendDataMessage.Type == "flagged")
                        {
                            folder.AddFlags(uniqueId, MessageFlags.Flagged, false);
                            return StatusCode(StatusCodes.Status200OK, "Mensagem marcada como importante");
                        }
                        else
                        {
                            folder.RemoveFlags(uniqueId, MessageFlags.Flagged, false);
                            return StatusCode(StatusCodes.Status200OK, "Mensagem marcada como não importante");

                        }
                    }

                }
                catch (ImapProtocolException)
                {
                    var user = UserService.GetUser(_httpContextAccessor);

                    var result = _cache.SetImapClient(user);

                    if (!result.Succeeded)
                    {
                        return StatusCode(StatusCodes.Status401Unauthorized, result.Message);
                    }

                    return Flagged(sendDataMessage);
                }
                catch (Exception ex)
                {
                    return StatusCode(StatusCodes.Status500InternalServerError, ex.Message);
                }
            }
        }
    }
}