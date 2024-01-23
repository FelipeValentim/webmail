using MailKit.Net.Imap;
using MailKit.Net.Smtp;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Http;
using Microsoft.AspNetCore.Mvc;
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


        //private EmailOptions Email => new EmailOptions("Felipe", "valentimdeveloper@gmail.com", "mhsqewnmqlwwepwx");

        [AllowAnonymous]
        [HttpPost("LogIn")]
        public IActionResult LogIn(User user)
        {
            try
            {
                var (provider, serviceType) = Utils.GetProvider(user.Username);

                using (var imapClient = new ImapClient())
                {
                    imapClient.Connect(provider.Host, provider.Port, provider.SecureSocketOptions);

                    imapClient.AuthenticationMechanisms.Remove("XOAUTH");

                    imapClient.Authenticate(user.Username, user.Password);
                }

                var token = TokenService.GenerateToken(user, provider);

                Response.Cookies.Append(TokenService.CookieName, token, new CookieOptions
                {
                    HttpOnly = true,
                    Expires = DateTime.UtcNow.AddHours(2),
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