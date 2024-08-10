namespace webmail_backend.Factory.Abstract
{
    public interface IWebmailProtocolFactory
    {
        public IWebmailProtocol CreateWebmailProtocol(string type);
    }
}
