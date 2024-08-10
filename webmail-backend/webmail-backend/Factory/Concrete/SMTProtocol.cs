using MailKit.Net.Imap;
using MailKit.Net.Smtp;
using MailKit.Security;
using System.Reflection.Metadata;
using webmail_backend.Factory.Abstract;

namespace webmail_backend.Factory.Concrete
{
    public class SMTProtocol : IWebmailProtocol
    {
        private SmtpClient client = new SmtpClient();

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
