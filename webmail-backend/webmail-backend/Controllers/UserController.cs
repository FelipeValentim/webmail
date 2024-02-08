using MailKit.Net.Imap;
using MailKit.Net.Smtp;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Http;
using Microsoft.AspNetCore.Mvc;
using Microsoft.Extensions.Caching.Memory;
using System.Net;
using System.Security.Authentication;
using webmail_backend.Helpers;
using webmail_backend.Models;
using webmail_backend.Services;

namespace webmail_backend.Controllers
{
    [ApiController]
    [Route("[controller]")]
    public class UserController : ControllerBase
    {
        private readonly IMemoryCache _cache;

        public UserController(IMemoryCache cache)
        {
            _cache = cache;
        }

        //private EmailOptions Email => new EmailOptions("Felipe", "valentimdeveloper@gmail.com", "mhsqewnmqlwwepwx");

        [AllowAnonymous]
        [HttpPost("LogIn")]
        public IActionResult LogIn(User user)
        {
            try
            {
                var (imap, smtp, serviceType) = Utils.GetProvider(user.Username);

                ImapClient client = new ImapClient();

                client.Connect(imap.Host, imap.Port, imap.SecureSocketOptions);

                client.AuthenticationMechanisms.Remove("XOAUTH");

                client.Authenticate(user.Username, user.Password);

                var (token, id) = TokenService.GenerateToken(user, imap, smtp);

                var cacheOptions = new MemoryCacheEntryOptions()
                    .SetAbsoluteExpiration(TimeSpan.FromHours(1));

                _cache.Set(id, client, cacheOptions);

                Response.Cookies.Append(TokenService.CookieName, token, new CookieOptions
                {
                    HttpOnly = true,
                    Expires = DateTime.UtcNow.AddHours(1),
                    SameSite = SameSiteMode.None,
                    Secure = true
                });

                return StatusCode(StatusCodes.Status200OK);

            }
            catch (ImapProtocolException)
            {
                return StatusCode(StatusCodes.Status500InternalServerError, "Usuário ou senha incorreta");
            }
            catch (SmtpProtocolException)
            {
                return StatusCode(StatusCodes.Status500InternalServerError, "Usuário ou senha incorreta");
            }
            catch (AuthenticationException)
            {
                return StatusCode(StatusCodes.Status500InternalServerError, "Usuário ou senha incorreta");
            }
            catch (System.Net.Sockets.SocketException) //Este Host não é conhecido (válido) / Porta inválida (TimedOut)
            {
                return StatusCode(StatusCodes.Status500InternalServerError, "Ocorreu algum problema ao tentar se conectar ao servidor");
            }
            catch
            {
                return StatusCode(StatusCodes.Status500InternalServerError, "Usuário ou senha incorreta");
            }
        }

        [Authorize]
        [HttpGet("Logout")]
        public IActionResult Logout()
        {
            try
            {
                Response.Cookies.Delete(TokenService.CookieName);
            }
            catch
            {
                return new StatusCodeResult(StatusCodes.Status500InternalServerError);
            }

            return new StatusCodeResult(StatusCodes.Status200OK);
        }
    }
}