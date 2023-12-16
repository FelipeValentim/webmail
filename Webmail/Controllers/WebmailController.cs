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
    public class WebmailController : ControllerBase
    {
        private readonly ImapClient _imapClient;

        private readonly IHttpContextAccessor _httpContextAccessor;

        public WebmailController(IHttpContextAccessor httpContextAccessor, ImapClient imapClient)
        {
            _httpContextAccessor = httpContextAccessor;
            _imapClient = imapClient;

        }

        private ServerOptions IMAP = new ServerOptions();
        private ImapClient ImapClient;
        private readonly List<string> spamNames = new List<string> { "Spam", "Lixo Eletrônico" };
        private readonly List<string> trashNames = new List<string> { "Lixo", "Lixeira", "Trash" };


        [HttpGet("Folders")]
        public IActionResult Folders() // TODO - Pastas aninhadas (nested)
        {

            List<FolderInfo> folders = new List<FolderInfo>();

            try
            {
                using (var imapClient = new ImapClient())
                {

                    //if (!_imapClient.IsConnected)
                    //{
                    var user = UserService.GetUser(_httpContextAccessor);

                    imapClient.Connect(user.Provider.Host, user.Provider.Port, user.Provider.SecureSocketOptions);

                    imapClient.Authenticate(user.Username, user.Password);
                    //}


                    var personal = imapClient.GetFolders(imapClient.PersonalNamespaces[0]);

                    // Sempre pega a pasta Inbox primeiro
                    var inbox = imapClient.Inbox;

                    inbox.Open(FolderAccess.ReadOnly);

                    folders.Add(new FolderInfo()
                    {
                        Name = "Caixa de entrada",
                        Path = inbox.GetPath(),
                        Unread = inbox.Search(SearchQuery.NotSeen).Count,
                        TotalEmails = inbox.Count,
                    });

                    // Pega as outras pastas, sempre checando se ela existe ou se é diferente da pasta inbox
                    foreach (var folder in personal)
                    {
                        if (folder.Exists && folder != inbox)
                        {
                            folder.Open(FolderAccess.ReadOnly);
                            var folderInfo = folder.GetFolderInfo();
                            folders.Add(folderInfo);
                        }
                    }
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
                return Folders();
            }
            catch
            {
                var user = UserService.GetUser(_httpContextAccessor);

                var result = user.Reconnect(_imapClient);

                if (!result.Succeeded)
                {
                    return BadRequest(new { message = result.Message });
                }

                return Folders();
            }
            return Ok(folders);
        }

        [HttpPost("Emails")]
        public IActionResult Emails(MessageFilter filter)
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
                return Folders();
            }
            catch
            {
                var user = UserService.GetUser(_httpContextAccessor);

                var result = user.Reconnect(_imapClient);

                if (!result.Succeeded)
                {
                    return BadRequest(new { message = result.Message });
                }

                return Folders();
            }

            return Ok(new { messages = emails, countMessages = queryUID.Count });
        }

        [HttpGet("GetEmail")]
        public IActionResult GetEmail(string folderName, uint uniqueId)
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


                        var folder = imapClient.GetFolder(folderName, FolderAccess.ReadWrite, cancel.Token);

                    // Retorna o email com os dados mais importantes
                    var item = folder.Fetch(new UniqueId[] { new UniqueId(uniqueId) }, MessageSummaryItems.Full | MessageSummaryItems.BodyStructure).FirstOrDefault();

                    // Marca o email como Seen (visto) 
                    folder.AddFlags(item.UniqueId, MessageFlags.Seen, false);

                    string htmlText = string.Empty;

                    List<MimeEntity> mimeEntities = new List<MimeEntity>();

                    // Checa se o HtmlBody e o TextBody são inválidos, se forem então é necessário percorrer o BodyParts do email
                    if (item.HtmlBody == null && item.TextBody == null)
                    {
                        foreach (var bodyPart in item.BodyParts)
                        {
                            var mimeEntity = folder.GetBodyPart(item.UniqueId, bodyPart);

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
                                var mimeEntity = folder.GetBodyPart(item.UniqueId, bodyPart);
                                mimeEntities.Add(mimeEntity);
                            }
                        }

                        var body = folder.GetBodyPart(item.UniqueId, item.HtmlBody ?? item.TextBody);

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
                    email.Attachments = item.Attachments.Select(x => new Webmail.Models.WebMailModels.Attachment() { FileName = x.ContentDisposition.FileName, FolderName = folderName, UniqueId = uniqueId, ContentId = x.ContentId, Size = Convert.ToInt64(x.Octets - (x.Octets / 3.5)) }).ToList();

                    email.ToAddresses.AddRange(item.Envelope.To.Mailboxes.Select(x => new EmailAddress { Address = x.Address, Name = x.Name }));
                    email.FromAddresses.AddRange(item.Envelope.From.Mailboxes.Select(x => new EmailAddress { Address = x.Address, Name = x.Name }));
                    email.IsSent = folder.Attributes.HasFlag(FolderAttributes.Sent);
                    email.IsDraft = folder.Attributes.HasFlag(FolderAttributes.Drafts);

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

                return GetEmail(folderName, uniqueId);
            }
            catch (Exception ex)
            {
                return Ok(new { message = ex.Message });
            }

            var json = Ok(email);

            return json;
        }

        [HttpGet("DownloadAttachment")]
        public ActionResult DownloadAttachment(Attachment attachment)
        {
            try
            {
                using (var cancel = new CancellationTokenSource())
                {
                    //ImapClient = MailKitImapClient.Instance;

                    var folder = ImapClient.GetFolder(attachment.FolderName, FolderAccess.ReadOnly, cancel.Token);

                    var message = folder.Fetch(new UniqueId[] { new UniqueId(attachment.UniqueId) }, MessageSummaryItems.BodyStructure).FirstOrDefault();
                    BodyPartBasic bodyPartBasic;

                    if (attachment.ContentId != null)
                    {
                        bodyPartBasic = message.Attachments.FirstOrDefault(x => attachment.ContentId.Contains(x.ContentId));
                    }
                    else
                    {
                        bodyPartBasic = message.Attachments.FirstOrDefault(x => x.ContentDisposition.FileName.Contains(attachment.FileName));
                    }
                    MimePart attach = folder.GetBodyPart(message.UniqueId, bodyPartBasic) as MimePart;

                    if (attachment != null)
                    {
                        var stream = new MemoryStream();
                        attach.Content.DecodeTo(stream);
                        stream.Position = 0;
                        return File(stream, attach.ContentType.MimeType);
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

                return DownloadAttachment(attachment);
            }
            catch (Exception ex)
            {
                return Ok(new { message = ex.Message });
            }
            return null;
        }

        [HttpGet("DownloadAttachments")]
        public ActionResult DownloadAttachments(string folderName, uint uniqueId)
        {
            try
            {
                using (var cancel = new CancellationTokenSource())
                {
                    //ImapClient = MailKitImapClient.Instance;

                    var folder = ImapClient.GetFolder(folderName, FolderAccess.ReadOnly, cancel.Token);
                    var message = folder.Fetch(new UniqueId[] { new UniqueId(uniqueId) }, MessageSummaryItems.BodyStructure).FirstOrDefault();

                    using (var memoryStream = new MemoryStream())
                    {
                        // Zipa os arquivos com o nome sendo o assunto do email
                        using (var zipArchive = new ZipArchive(memoryStream, ZipArchiveMode.Create, true))
                        {
                            foreach (var attachment in message.Attachments)
                            {
                                MimePart attach = folder.GetBodyPart(message.UniqueId, attachment) as MimePart;

                                if (attach != null)
                                {
                                    var stream = new MemoryStream();
                                    attach.Content.DecodeTo(stream);
                                    stream.Position = 0;
                                    var entry = zipArchive.CreateEntry(attach.ContentDisposition?.FileName ?? attach.ContentType.Name);
                                    using (var entryStream = entry.Open())
                                    {
                                        stream.CopyTo(entryStream);
                                    }
                                }
                            }
                        }
                        return File(memoryStream.ToArray(), "application/zip");
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

                return DownloadAttachments(folderName, uniqueId);
            }
            catch (Exception ex)
            {
                return Ok(new { message = ex.Message });
            }
        }

        [HttpGet("ToggleFlagged")]
        public IActionResult ToggleFlagged(string folderPath, uint[] emails, string type)
        {
            using (var cancel = new CancellationTokenSource())
            {
                try
                {
                    //ImapClient = MailKitImapClient.Instance;

                    var folder = ImapClient.GetFolder(folderPath, FolderAccess.ReadWrite, cancel.Token);

                    List<UniqueId> uniqueIds = new List<UniqueId>();

                    foreach (var email in emails)
                    {
                        uniqueIds.Add(new UniqueId(email));
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

                    return ToggleFlagged(folderPath, emails, type);
                }
                catch (Exception ex)
                {
                    return Ok(new { success = false, message = ex.Message });
                }
            }
        }

        [HttpGet("ToggleRead")]
        public IActionResult ToggleRead(string folderPath, uint[] emails, string type)
        {
            using (var cancel = new CancellationTokenSource())
            {
                try
                {
                    //ImapClient = MailKitImapClient.Instance;

                    var folder = ImapClient.GetFolder(folderPath, FolderAccess.ReadWrite, cancel.Token);

                    List<UniqueId> uniqueIds = new List<UniqueId>();

                    foreach (var email in emails)
                    {
                        uniqueIds.Add(new UniqueId(email));
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

                    return ToggleFlagged(folderPath, emails, type);
                }
                catch (Exception ex)
                {
                    return Ok(new { success = false, message = ex.Message });
                }
            }
        }

        [HttpGet("DeleteEmails")]
        public IActionResult DeleteEmails(string folderName, uint[] emails)
        {
            using (var cancel = new CancellationTokenSource())
            {
                try
                {
                    //ImapClient = MailKitImapClient.Instance;

                    var folder = ImapClient.GetFolder(folderName, FolderAccess.ReadWrite, cancel.Token);

                    List<UniqueId> uniqueIds = new List<UniqueId>();

                    foreach (var email in emails)
                    {
                        uniqueIds.Add(new UniqueId(email));
                    }

                    var folders = ImapClient.GetFolders(ImapClient.PersonalNamespaces[0]);

                    var trash = folders.FirstOrDefault(x => x.Attributes.HasFlag(FolderAttributes.Trash));

                    if (trash == null)
                    {
                        // get the default personal namespace root folder
                        trash = folders.FirstOrDefault(x => trashNames.Any(s => x.FullName.EndsWith(s, StringComparison.OrdinalIgnoreCase)));
                        if (trash == null)
                        {
                            trash = ImapClient.Inbox.Create("Lixo", true);
                        }
                    }

                    if (trash == folder)
                    {
                        folder.AddFlags(uniqueIds, MessageFlags.Deleted, true);

                        folder.Expunge();

                        return Ok(new { success = true, message = emails.Length > 1 ? "Mensagens deletadas com sucesso" : "Mensagem deletada com sucesso" });
                    }
                    else
                    {
                        folder.MoveTo(uniqueIds, trash);

                        return Ok(new { success = true, message = emails.Length > 1 ? "Mensagens movidas para lixeira" : "Mensagem movida para lixeira" });

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

                    return DeleteEmails(folderName, emails);
                }
                catch (Exception ex)
                {
                    return Ok(new { success = false, message = ex.Message });
                }
            }

        }

        [HttpGet("SpamEmails")]
        public IActionResult SpamEmails(string folderName, uint[] emails)
        {
            using (var cancel = new CancellationTokenSource())
            {
                try
                {
                    //ImapClient = MailKitImapClient.Instance;

                    var folder = ImapClient.GetFolder(folderName, FolderAccess.ReadWrite, cancel.Token);

                    List<UniqueId> uniqueIds = new List<UniqueId>();

                    foreach (var email in emails)
                    {
                        uniqueIds.Add(new UniqueId(email));
                    }


                    var folders = ImapClient.GetFolders(ImapClient.PersonalNamespaces[0]);

                    var spam = folders.FirstOrDefault(x => x.Attributes.HasFlag(FolderAttributes.Junk));

                    if (spam == null)
                    {
                        // get the default personal namespace root folder
                        spam = folders.FirstOrDefault(x => spamNames.Any(s => x.FullName.EndsWith(s, StringComparison.OrdinalIgnoreCase)));
                        if (spam == null)
                        {
                            spam = ImapClient.Inbox.Create("Spam", true);
                        }
                    }

                    if (spam == folder) return Ok(new { success = false, message = "Mensagem já marcada como spam" });

                    folder.MoveTo(uniqueIds, spam);

                    return Ok(new { success = true, message = emails.Length > 1 ? "Mensagens marcadas como spam" : "Mensagem marcada como spam" });
                }
                catch (ImapProtocolException)
                {
                    //IMAP.SetIMAPServer();
                    var result = IMAP.Reconnect(ImapClient);

                    if (!result.Succeeded)
                    {
                        return Ok(new { success = false, message = result.Message });
                    }

                    return SpamEmails(folderName, emails);
                }
                catch (Exception ex)
                {
                    return Ok(new { success = false, message = ex.Message });
                }
            }
        }

        [HttpGet("MoveTo")]
        public IActionResult MoveTo(string folderFromPath, string folderToPath, uint[] emails)
        {
            using (var cancel = new CancellationTokenSource())
            {
                try
                {
                    //ImapClient = MailKitImapClient.Instance;

                    var folderTo = ImapClient.GetFolder(folderToPath, FolderAccess.ReadWrite, cancel.Token);

                    var folderFrom = ImapClient.GetFolder(folderFromPath, FolderAccess.ReadWrite, cancel.Token);

                    if (folderTo == folderFrom)
                    {
                        return Ok(new { success = false, message = $"O email já está na pasta {folderTo}" });
                    }

                    List<UniqueId> uniqueIds = new List<UniqueId>();

                    foreach (var email in emails)
                    {
                        uniqueIds.Add(new UniqueId(email));
                    }

                    folderFrom.MoveTo(uniqueIds, folderTo);

                    return Ok(new { success = true, message = emails.Length > 1 ? $"Mensagens movidas para {folderTo.Name}" : $"Mensagem movida para {folderTo.Name}" });
                }
                catch (ImapProtocolException)
                {
                    //IMAP.SetIMAPServer();

                    var result = IMAP.Reconnect(ImapClient);

                    if (!result.Succeeded)
                    {
                        return Ok(new { success = false, message = result.Message });
                    }

                    return MoveTo(folderFromPath, folderToPath, emails);
                }
                catch (Exception ex)
                {
                    return Ok(new { success = false, message = ex.Message });
                }
            }
        }
    }
}