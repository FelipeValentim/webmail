using MailKit;
using MailKit.Net.Imap;
using MailKit.Net.Smtp;
using MailKit.Search;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.Extensions.Caching.Memory;
using Org.BouncyCastle.Crypto;
using System;
using webmail_backend.Constants;
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
        private readonly IHttpContextAccessor _httpContextAccessor;
        private readonly IMemoryCache _cache;

        public FolderController(IHttpContextAccessor httpContextAccessor, IMemoryCache cache)
        {
            _httpContextAccessor = httpContextAccessor;
            _cache = cache;
        }

        [HttpGet("Get")]
        public IActionResult Get()
        {

            List<FolderInfo> folders = new List<FolderInfo>();

            try
            {
                var user = UserService.GetUser(_httpContextAccessor);

                var imapClient = _cache.GetImapClient(user);

                lock (imapClient.SyncRoot)
                {
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

                var result = _cache.SetImapClient(user);

                if (!result.Succeeded)
                {
                    return StatusCode(StatusCodes.Status401Unauthorized, result.Message);
                }

                return Get();
            }
            catch (Exception ex)
            {
                return StatusCode(StatusCodes.Status500InternalServerError, ex.Message);
            }

            return StatusCode(StatusCodes.Status200OK, folders);
        }


        [HttpDelete("DeleteMessages")]
        public IActionResult DeleteMessages(SendDataMessages sendDataMessages)
        {
            using (var cancel = new CancellationTokenSource())
            {
                try
                {
                    var user = UserService.GetUser(_httpContextAccessor);

                    var imapClient = _cache.GetImapClient(user);

                    var folder = imapClient.GetFolder(sendDataMessages.Folder, FolderAccess.ReadWrite, cancel.Token);

                    List<UniqueId> uniqueIds = new List<UniqueId>();

                    foreach (var id in sendDataMessages.Ids)
                    {
                        uniqueIds.Add(new UniqueId(id));
                    }

                    var folders = imapClient.GetFolders(imapClient.PersonalNamespaces[0]);

                    var trash = folders.FirstOrDefault(x => x.Attributes.HasFlag(FolderAttributes.Trash));

                    if (trash == null)
                    {
                        // get the default personal namespace root folder
                        trash = folders.FirstOrDefault(x => FolderNames.Trash.Any(s => x.FullName.EndsWith(s, StringComparison.OrdinalIgnoreCase)));

                        if (trash == null)
                        {
                            trash = imapClient.Inbox.Create("Lixo", true);
                        }
                    }

                    if (trash == folder)
                    {
                        folder.AddFlags(uniqueIds, MessageFlags.Deleted, true);

                        folder.Expunge();

                        return StatusCode(StatusCodes.Status200OK, sendDataMessages.Ids.Length > 1 ? "Mensagens deletadas com sucesso" : "Mensagem deletada com sucesso");
                    }
                    else
                    {
                        folder.MoveTo(uniqueIds, trash);

                        return StatusCode(StatusCodes.Status200OK, sendDataMessages.Ids.Length > 1 ? "Mensagens movidas para lixeira" : "Mensagem movida para lixeira");
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

                    return DeleteMessages(sendDataMessages);
                }
                catch (Exception ex)
                {
                    return StatusCode(StatusCodes.Status500InternalServerError, ex.Message);
                }
            }
        }

        [HttpPut("ArchiveMessages")]
        public IActionResult ArchiveMessages(SendDataMessages sendDataMessages)
        {
            using (var cancel = new CancellationTokenSource())
            {
                try
                {
                    var user = UserService.GetUser(_httpContextAccessor);

                    var imapClient = _cache.GetImapClient(user);

                    var folder = imapClient.GetFolder(sendDataMessages.Folder, FolderAccess.ReadWrite, cancel.Token);

                    List<UniqueId> uniqueIds = new List<UniqueId>();

                    foreach (var id in sendDataMessages.Ids)
                    {
                        uniqueIds.Add(new UniqueId(id));
                    }

                    var folders = imapClient.GetFolders(imapClient.PersonalNamespaces[0]);

                    var archive = folders.FirstOrDefault(x => x.Attributes.HasFlag(FolderAttributes.Archive));

                    if (archive == null)
                    {
                        archive = folders.FirstOrDefault(x => FolderNames.Archive.Any(s => x.FullName.EndsWith(s, StringComparison.OrdinalIgnoreCase)));

                        if (archive == null)
                        {
                            archive = imapClient.Inbox.Create("Arquivados", true);
                        }
                    }

                    if (archive == folder) return StatusCode(StatusCodes.Status200OK, "Mensagem já marcada como spam");

                    folder.MoveTo(uniqueIds, archive);

                    return StatusCode(StatusCodes.Status200OK, sendDataMessages.Ids.Length > 1 ? "Mensagens arquivadas" : "Mensagem arquivada");
                }
                catch (ImapProtocolException)
                {
                    var user = UserService.GetUser(_httpContextAccessor);

                    var result = _cache.SetImapClient(user);

                    if (!result.Succeeded)
                    {
                        return StatusCode(StatusCodes.Status401Unauthorized, result.Message);
                    }

                    return ArchiveMessages(sendDataMessages);
                }
                catch (Exception ex)
                {
                    return StatusCode(StatusCodes.Status500InternalServerError, ex.Message);
                }
            }
        }

        [HttpPut("MoveMessages")]
        public IActionResult MoveMessages(SendDataMessages sendDataMessages)
        {
            using (var cancel = new CancellationTokenSource())
            {
                try
                {
                    var user = UserService.GetUser(_httpContextAccessor);

                    var imapClient = _cache.GetImapClient(user);

                    var folderTo = imapClient.GetFolder(sendDataMessages.Type, FolderAccess.ReadWrite, cancel.Token);

                    var folderFrom = imapClient.GetFolder(sendDataMessages.Folder, FolderAccess.ReadWrite, cancel.Token);

                    if (folderTo == folderFrom)
                    {
                        return StatusCode(StatusCodes.Status400BadRequest, $"O email já está na pasta {folderTo}");
                    }

                    List<UniqueId> uniqueIds = new List<UniqueId>();

                    foreach (var id in sendDataMessages.Ids)
                    {
                        uniqueIds.Add(new UniqueId(id));
                    }

                    folderFrom.MoveTo(uniqueIds, folderTo);

                    return StatusCode(StatusCodes.Status200OK, sendDataMessages.Ids.Length > 1 ? $"Mensagens movidas para {folderTo.Name}" : $"Mensagem movida para {folderTo.Name}");
                }
                catch (ImapProtocolException)
                {
                    var user = UserService.GetUser(_httpContextAccessor);

                    var result = _cache.SetImapClient(user);

                    if (!result.Succeeded)
                    {
                        return StatusCode(StatusCodes.Status401Unauthorized, result.Message);
                    }

                    return MoveMessages(sendDataMessages);
                }
                catch (Exception ex)
                {
                    return StatusCode(StatusCodes.Status500InternalServerError, ex.Message);
                }
            }
        }
    }
}