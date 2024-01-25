using MailKit;
using MailKit.Net.Imap;
using MailKit.Net.Smtp;
using MailKit.Search;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.Extensions.Caching.Memory;
using MimeKit;
using MimeKit.Text;
using Org.BouncyCastle.Asn1.X509;
using Org.BouncyCastle.Crypto;
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
        private readonly IHttpContextAccessor _httpContextAccessor;
        private readonly IMemoryCache _cache;

        public FolderController(IHttpContextAccessor httpContextAccessor, IMemoryCache cache)
        {
            _httpContextAccessor = httpContextAccessor;
            _cache = cache;
        }

        private readonly List<string> spamNames = new List<string> { "Spam", "Lixo Eletrônico" };
        private readonly List<string> trashNames = new List<string> { "Lixo", "Lixeira", "Trash" };


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

      
    }
}