using MailKit.Net.Imap;
using MailKit.Net.Smtp;
using Microsoft.AspNetCore.Authorization;
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

        [HttpPost("LogIn")]
        [AllowAnonymous]
        public IActionResult LogIn(User user)
        {
            try
            {
                using (var client = new ImapClient())
                {
                    var (provider, serviceType) = Utils.GetProvider(user.Username);

                    client.Connect(provider.Host, provider.Port, provider.SecureSocketOptions);

                    client.AuthenticationMechanisms.Remove("XOAUTH");

                    client.Authenticate(user.Username, user.Password);

                    var token = UserService.GenerateToken(user, provider);

                    return new JsonResult(new { succeeded = true, status = (int)HttpStatusCode.OK, payload = token });
                }
            }
            catch (ImapProtocolException)
            {
                return new JsonResult(new { succeeded = false, status = (int)HttpStatusCode.InternalServerError, payload = new { message = "Usuário ou senha incorreta" } });
            }
            catch (SmtpProtocolException)
            {
                return new JsonResult(new { succeeded = false, status = (int)HttpStatusCode.InternalServerError, payload = new { message = "Usuário ou senha incorreta" } });
            }
            catch (AuthenticationException)
            {
                return new JsonResult(new { succeeded = false, status = (int)HttpStatusCode.InternalServerError, payload = new { message = "Usuário ou senha incorreta" } });
            }
            catch (System.Net.Sockets.SocketException) //Este Host não é conhecido (válido) / Porta inválida (TimedOut)
            {
                return new JsonResult(new { succeeded = false, status = (int)HttpStatusCode.InternalServerError, payload = new { message = "Ocorreu algum problema ao tentar se conectar ao servidor" } });
            }
            catch
            {
                return new JsonResult(new { succeeded = false, status = (int)HttpStatusCode.InternalServerError, payload = new { message = "Usuário ou senha incorreta" } });
            }
        }

        [Authorize]
        [HttpGet("IsLoggedIn")]
        public IActionResult IsLoggedIn()
        {
            return new JsonResult(new { succeeded = true, status = (int)HttpStatusCode.OK, payload = new { message = "Usuário logado" } });
        }
    }
}