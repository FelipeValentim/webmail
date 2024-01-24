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
using webmail_backend.Helpers;
using webmail_backend.Services;
using static webmail_backend.Models.WebMailModels;

namespace webmail_backend.Controllers
{
    [Authorize]
    [ApiController]
    [Route("[controller]")]
    public class WebmailController : ControllerBase
    {
        private readonly IHttpContextAccessor _httpContextAccessor;

        public WebmailController(IHttpContextAccessor httpContextAccessor)
        {
            _httpContextAccessor = httpContextAccessor;

        }

        private ServerOptions IMAP = new ServerOptions();
        private ImapClient ImapClient;
        private readonly List<string> spamNames = new List<string> { "Spam", "Lixo Eletrônico" };
        private readonly List<string> trashNames = new List<string> { "Lixo", "Lixeira", "Trash" };

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
                    email.Attachments = item.Attachments.Select(x => new Attachment() { FileName = x.ContentDisposition.FileName, FolderName = folderName, UniqueId = uniqueId, ContentId = x.ContentId, Size = Convert.ToInt64(x.Octets - (x.Octets / 3.5)) }).ToList();

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