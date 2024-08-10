using MailKit.Net.Imap;
using MailKit.Security;
using webmail_backend.Factory.Abstract;

namespace webmail_backend.Factory.Concrete
{
    public class IMAProtocol : IWebmailProtocol
    {
        private ImapClient client = new ImapClient();


        public void Connect(string host, int port, SecureSocketOptions secureSocketOptions = SecureSocketOptions.Auto)
        {
            client.Timeout = 8000;

            client.Connect(host, port, secureSocketOptions);
        }

        public void Authenticate(string userName, string password)
        {
            client.Timeout = 8000;

            client.Authenticate(userName, password);
        }

        public void Disconnect()
        {
            client.Disconnect(true);
        }
    }
}
