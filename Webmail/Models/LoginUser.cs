using MailKit.Net.Imap;

namespace Webmail.Models
{
    public class LoginUser
    {
        public string Email { get; set; }
        public string Password { get; set; }
        public ServiceType Service { get; set; }
    }

    public enum ServiceType
    {
        Invalid = 0,
        Google = 1,
        Microsoft = 2,
        Unknown = 3
    }
}
