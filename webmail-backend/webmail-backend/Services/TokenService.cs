using Microsoft.IdentityModel.Tokens;
using System.IdentityModel.Tokens.Jwt;
using System.Security.Claims;
using System.Text;
using webmail_backend.Helpers;
using webmail_backend.Models;

namespace webmail_backend.Services
{
    public class TokenService
    {
        public static string CookieName => "mailbox.identity";

        public static (string, string) GenerateToken(User user, Provider imap, Provider smtp)
        {
            var id = Guid.NewGuid().ToString();

            var key = Encoding.UTF8.GetBytes(Settings.SecretKey);

            var tokenHandler = new JwtSecurityTokenHandler();

            var tokenDescriptor = new SecurityTokenDescriptor
            {
                Expires = DateTime.UtcNow.AddHours(2),
                SigningCredentials = new SigningCredentials(new SymmetricSecurityKey(key), SecurityAlgorithms.HmacSha256Signature),
                Subject = new ClaimsIdentity(new Claim[]
                {
                    new Claim(Constants.ClaimTypes.Id, id),
                    new Claim(Constants.ClaimTypes.Username, user.Username),
                    new Claim(Constants.ClaimTypes.Password, user.Password),
                    new Claim(Constants.ClaimTypes.Service, ((int)user.Service).ToString()),
                    new Claim(Constants.ClaimTypes.ImapHost, imap.Host.ToString()),
                    new Claim(Constants.ClaimTypes.ImapPort, imap.Port.ToString()),
                    new Claim(Constants.ClaimTypes.ImapSecurity, ((int)imap.SecureSocketOptions).ToString()),
                    new Claim(Constants.ClaimTypes.SmtpHost, smtp.Host.ToString()),
                    new Claim(Constants.ClaimTypes.SmtpPort, smtp.Port.ToString()),
                    new Claim(Constants.ClaimTypes.SmtpSecurity, ((int)smtp.SecureSocketOptions).ToString()),

                    // Adicione outras claims necessárias aqui.
                }),
            };

            var token = tokenHandler.CreateToken(tokenDescriptor);

            return (tokenHandler.WriteToken(token), id);
        }
    }
}
