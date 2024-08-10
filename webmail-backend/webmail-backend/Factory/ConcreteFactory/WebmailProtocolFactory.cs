using MailKit.Net.Imap;
using webmail_backend.Factory.Abstract;
using webmail_backend.Factory.Concrete;

namespace webmail_backend.Factory.ConcreteFactory
{
    public class WebmailProtocolFactory : IWebmailProtocolFactory
    {
        public IWebmailProtocol CreateWebmailProtocol(string type)
        {
            if (type ==  "IMAP")
            {
                return new IMAProtocol();
            } 
            else if (type == "SMTP")
            {
                return new SMTProtocol();
            }
            else
            {
                throw new ArgumentException("Protocolo não encontrada");
            }
        }
    }
}
