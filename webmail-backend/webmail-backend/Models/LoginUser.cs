using MailKit;
using MailKit.Net.Imap;
using MailKit.Net.Smtp;
using MailKit.Security;

namespace webmail_backend.Models
{
    public class User
    {
        public string Id { get; set; }
        public string Username { get; set; }
        public string Password { get; set; }
        public ServiceType Service { get; set; }
        public Provider ImapProvider { get; set; }
        public Provider SmtpProvider { get; set; }

        public ConnectionResult Connect(IMailService client, CancellationToken cancel = default)
        {
            try
            {
                Connection(client, cancel);

                Authentication(client, cancel);
            }
            catch (ImapProtocolException)
            {
                return ConnectionResult.Failed("Usuário ou senha incorreta");
            }
            catch (SmtpProtocolException)
            {
                return ConnectionResult.Failed("Usuário ou senha incorreta");
            }
            catch (AuthenticationException)
            {
                return ConnectionResult.Failed("Usuário ou senha incorreta");
            }
            catch (System.Net.Sockets.SocketException) //Este Host não é conhecido (válido) / Porta inválida (TimedOut)
            {
                return ConnectionResult.Failed("Ocorreu algum problema ao tentar se conectar ao servidor");
            }
            catch (Exception ex)
            {
                return ConnectionResult.Failed(ex.Message);
            }

            return ConnectionResult.Success;
        }

        public ConnectionResult Reconnect(IMailService client, CancellationToken cancel = default)
        {
            client.Disconnect(true, cancel);

            return Connect(client, cancel);
        }

        private void Connection(IMailService client, CancellationToken cancel = default)
        {
            if (!client.IsConnected)
            {
                client.Connect(ImapProvider.Host, ImapProvider.Port, ImapProvider.SecureSocketOptions, cancel);
            }
        }

        private void Authentication(IMailService client, CancellationToken cancel = default)
        {
            if (!client.IsAuthenticated)
            {
                client.AuthenticationMechanisms.Remove("XOAUTH");

                client.Authenticate(Username, Password, cancel);
            }
        }

    }



    public enum ServiceType
    {
        Invalid = 0,
        Google = 1,
        Microsoft = 2,
        Unknown = 3
    }
}
