using MailKit.Net.Imap;
using MailKit.Security;

namespace webmail_backend.Factory.Abstract
{
    public interface IWebmailProtocol
    {
        public void Connect(string host, int port, SecureSocketOptions secureSocketOptions = SecureSocketOptions.Auto);

        public void Authenticate(string userName, string password);

        public void Disconnect();
    }
}
