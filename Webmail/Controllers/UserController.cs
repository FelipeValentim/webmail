using MailKit.Net.Imap;
using MailKit.Net.Smtp;
using Microsoft.AspNetCore.Mvc;
using System.Security.Authentication;
using Webmail.Helpers;
using Webmail.Models;

namespace Net6_Controller_And_VIte.Controllers
{
    [ApiController]
    [Route("[controller]")]
    public class UserController : ControllerBase
    {
        //private EmailOptions Email => new EmailOptions("Felipe", "valentimdeveloper@gmail.com", "mhsqewnmqlwwepwx");

        private readonly ILogger<UserController> _logger;

        public UserController(ILogger<UserController> logger)
        {
            _logger = logger;
        }

        [HttpPost("LogIn")]
        public IActionResult LogIn(LoginUser loginUser)
        {
            try
            {
                using (var client = new ImapClient())
                {
                    var (provider, serviceType) = Utils.GetProvider(loginUser.Email);

                    client.Connect(provider.Host, provider.Port, provider.SecureSocketOptions);

                    client.AuthenticationMechanisms.Remove("XOAUTH");

                    client.Authenticate(loginUser.Email, loginUser.Password);

                    HttpContext.Session.SetUser(loginUser.Email, loginUser.Password, serviceType);
                }
            }
            catch (ImapProtocolException)
            {
                return BadRequest(new { succeeded = false, payload = new { message = "Usuário ou senha incorreta" } });
            }
            catch (SmtpProtocolException)
            {
                return BadRequest(new { succeeded = false, payload = new { message = "Usuário ou senha incorreta" } });
            }
            catch (AuthenticationException)
            {
                return BadRequest(new { succeeded = false, payload = new { message = "Usuário ou senha incorreta" } });
            }
            catch (System.Net.Sockets.SocketException) //Este Host não é conhecido (válido) / Porta inválida (TimedOut)
            {
                return BadRequest(new { succeeded = false, payload = new { message = "Ocorreu algum problema ao tentar se conectar ao servidor" } } );
            }
            catch (Exception ex)
            {
                return BadRequest(new { succeeded = false, payload = new { message = "Usuário ou senha incorreta" } });
            }



            return Ok(new { succeeded = true, payload = loginUser });
        }

    }
}