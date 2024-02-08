using MailKit.Net.Imap;
using MailKit.Net.Smtp;
using MailKit.Security;

namespace webmail_backend.Models
{
    public class Provider
    {
        public Provider(string host, int port, SecureSocketOptions secureSocketOptions)
        {
            Host = host;
            Port = port;
            SecureSocketOptions = secureSocketOptions;
        }

        public string Type { get; set; }
        public string Host { get; set; }
        public SecureSocketOptions SecureSocketOptions { get; set; }
        public int Port { get; set; }
    }


}
