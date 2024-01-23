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
    public class FolderController : ControllerBase
    {
        private readonly ImapClient _imapClient;

        private readonly IHttpContextAccessor _httpContextAccessor;

        public FolderController(IHttpContextAccessor httpContextAccessor, ImapClient imapClient)
        {
            _httpContextAccessor = httpContextAccessor;
            _imapClient = imapClient;

        }

        private ServerOptions IMAP = new ServerOptions();
        private ImapClient ImapClient;
        private readonly List<string> spamNames = new List<string> { "Spam", "Lixo Eletrônico" };
        private readonly List<string> trashNames = new List<string> { "Lixo", "Lixeira", "Trash" };


        [HttpGet("Get")]
        public IActionResult Get()
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
                return Get();
            }
            catch
            {
                var user = UserService.GetUser(_httpContextAccessor);

                var result = user.Reconnect(_imapClient);

                if (!result.Succeeded)
                {
                    return BadRequest(new { message = result.Message });
                }

                return Get();
            }
            return Ok(folders);
        }


        [HttpDelete("DeleteMessages")]
        public IActionResult DeleteMessages(string folder, uint[] ids)
        {
            using (var cancel = new CancellationTokenSource())
            {
                try
                {
                    //ImapClient = MailKitImapClient.Instance;

                    var mailFolder = ImapClient.GetFolder(folder, FolderAccess.ReadWrite, cancel.Token);

                    List<UniqueId> uniqueIds = new List<UniqueId>();

                    foreach (var id in ids)
                    {
                        uniqueIds.Add(new UniqueId(id));
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

                    if (trash == mailFolder)
                    {
                        mailFolder.AddFlags(uniqueIds, MessageFlags.Deleted, true);

                        mailFolder.Expunge();

                        return Ok(new { success = true, message = ids.Length > 1 ? "Mensagens deletadas com sucesso" : "Mensagem deletada com sucesso" });
                    }
                    else
                    {
                        mailFolder.MoveTo(uniqueIds, trash);

                        return Ok(new { success = true, message = ids.Length > 1 ? "Mensagens movidas para lixeira" : "Mensagem movida para lixeira" });

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

                    return DeleteMessages(folder, ids);
                }
                catch (Exception ex)
                {
                    return Ok(new { success = false, message = ex.Message });
                }
            }

        }
        [HttpGet("SpamMessages")]
        public IActionResult SpamMessages(string folder, uint[] ids)
        {
            using (var cancel = new CancellationTokenSource())
            {
                try
                {
                    //ImapClient = MailKitImapClient.Instance;

                    var mailFolder = ImapClient.GetFolder(folder, FolderAccess.ReadWrite, cancel.Token);

                    List<UniqueId> uniqueIds = new List<UniqueId>();

                    foreach (var id in ids)
                    {
                        uniqueIds.Add(new UniqueId(id));
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

                    if (spam == mailFolder) return Ok(new { success = false, message = "Mensagem já marcada como spam" });

                    mailFolder.MoveTo(uniqueIds, spam);

                    return Ok(new { success = true, message = ids.Length > 1 ? "Mensagens marcadas como spam" : "Mensagem marcada como spam" });
                }
                catch (ImapProtocolException)
                {
                    //IMAP.SetIMAPServer();
                    var result = IMAP.Reconnect(ImapClient);

                    if (!result.Succeeded)
                    {
                        return Ok(new { success = false, message = result.Message });
                    }

                    return SpamMessages(folder, ids);
                }
                catch (Exception ex)
                {
                    return Ok(new { success = false, message = ex.Message });
                }
            }
        }

        [HttpGet("MoveTo")]
        public IActionResult MoveTo(string fromPath, string toPath, uint[] ids)
        {
            using (var cancel = new CancellationTokenSource())
            {
                try
                {
                    //ImapClient = MailKitImapClient.Instance;

                    var folderFrom = ImapClient.GetFolder(fromPath, FolderAccess.ReadWrite, cancel.Token);

                    var folderTo = ImapClient.GetFolder(toPath, FolderAccess.ReadWrite, cancel.Token);

                    if (folderTo == folderFrom)
                    {
                        return Ok(new { success = false, message = $"O email já está na pasta {folderTo}" });
                    }

                    List<UniqueId> uniqueIds = new List<UniqueId>();

                    foreach (var id in ids)
                    {
                        uniqueIds.Add(new UniqueId(id));
                    }

                    folderFrom.MoveTo(uniqueIds, folderTo);

                    return Ok(new { success = true, message = ids.Length > 1 ? $"Mensagens movidas para {folderTo.Name}" : $"Mensagem movida para {folderTo.Name}" });
                }
                catch (ImapProtocolException)
                {
                    //IMAP.SetIMAPServer();

                    var result = IMAP.Reconnect(ImapClient);

                    if (!result.Succeeded)
                    {
                        return Ok(new { success = false, message = result.Message });
                    }

                    return MoveTo(fromPath, toPath, ids);
                }
                catch (Exception ex)
                {
                    return Ok(new { success = false, message = ex.Message });
                }
            }
        }
    }
}