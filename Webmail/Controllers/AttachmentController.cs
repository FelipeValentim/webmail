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
    public class AttachmentController : ControllerBase
    {
        private readonly ImapClient _imapClient;

        private readonly IHttpContextAccessor _httpContextAccessor;

        public AttachmentController(IHttpContextAccessor httpContextAccessor, ImapClient imapClient)
        {
            _httpContextAccessor = httpContextAccessor;
            _imapClient = imapClient;

        }

        private ServerOptions IMAP = new ServerOptions();
        private ImapClient ImapClient;


        [HttpPost("Download")]
        public ActionResult Download(Attachment attachment)
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

                return Download(attachment);
            }
            catch (Exception ex)
            {
                return Ok(new { message = ex.Message });
            }
            return null;
        }

        [HttpGet("Download/{folder}/{id}")]
        public ActionResult Download(string folder, uint id)
        {
            try
            {
                using (var cancel = new CancellationTokenSource())
                {
                    //ImapClient = MailKitImapClient.Instance;

                    var mailFolder = ImapClient.GetFolder(folder, FolderAccess.ReadOnly, cancel.Token);
                    var message = mailFolder.Fetch(new UniqueId[] { new UniqueId(id) }, MessageSummaryItems.BodyStructure).FirstOrDefault();

                    using (var memoryStream = new MemoryStream())
                    {
                        // Zipa os arquivos com o nome sendo o assunto do email
                        using (var zipArchive = new ZipArchive(memoryStream, ZipArchiveMode.Create, true))
                        {
                            foreach (var attachment in message.Attachments)
                            {
                                MimePart attach = mailFolder.GetBodyPart(message.UniqueId, attachment) as MimePart;

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

                return Download(folder, id);
            }
            catch (Exception ex)
            {
                return Ok(new { message = ex.Message });
            }
        }
    }
}