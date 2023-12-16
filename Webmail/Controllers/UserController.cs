using MailKit.Net.Imap;
using MailKit.Net.Smtp;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Http;
using Microsoft.AspNetCore.Mvc;
using System.Net;
using System.Security.Authentication;
using Webmail.Helpers;
using Webmail.Models;
using Webmail.Services;

namespace Net6_Controller_And_VIte.Controllers
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
                return StatusCode(StatusCodes.Status500InternalServerError, new { message = "Usuário ou senha incorreta" });
            }
            catch (SmtpProtocolException)
            {
                return StatusCode(StatusCodes.Status500InternalServerError, new { message = "Usuário ou senha incorreta" });
            }
            catch (AuthenticationException)
            {
                return StatusCode(StatusCodes.Status500InternalServerError, new { message = "Usuário ou senha incorreta" });
            }
            catch (System.Net.Sockets.SocketException) //Este Host não é conhecido (válido) / Porta inválida (TimedOut)
            {
                return StatusCode(StatusCodes.Status500InternalServerError, new { message = "Ocorreu algum problema ao tentar se conectar ao servidor" });
            }
            catch
            {
                return StatusCode(StatusCodes.Status500InternalServerError, new { message = "Usuário ou senha incorreta" });
            }
        }

        [Authorize]
        [HttpGet("IsLoggedIn")]
        public IActionResult IsLoggedIn()
        {
            return StatusCode(StatusCodes.Status200OK, new { message = "Usuário logado" });
        }
    }
}