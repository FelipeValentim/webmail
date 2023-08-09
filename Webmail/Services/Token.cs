using Microsoft.IdentityModel.Tokens;
using System.IdentityModel.Tokens.Jwt;
using System.Security.Claims;
using System.Text;
using Webmail.Helpers;
using Webmail.Models;

namespace Webmail.Services
{
    public class Token
    {
        public static string GenerateToken(User user, Provider provider)
        {
            var key = Encoding.UTF8.GetBytes(Settings.SecretKey);

            var tokenHandler = new JwtSecurityTokenHandler();

            var tokenDescriptor = new SecurityTokenDescriptor
            {
                Expires = DateTime.UtcNow.AddDays(1),
                SigningCredentials = new SigningCredentials(new SymmetricSecurityKey(key), SecurityAlgorithms.HmacSha256Signature),
                Subject = new ClaimsIdentity(new Claim[]
                {
                    new Claim("Id", Guid.NewGuid().ToString()),
                    new Claim(ClaimTypes.Name, user.Username),
                    new Claim("Password", user.Password),
                    new Claim("Service", ((int)user.Service).ToString()),
                    new Claim("Host", provider.Host.ToString()),
                    new Claim("Port", provider.Port.ToString()),
                    new Claim("Security", ((int)provider.SecureSocketOptions).ToString()),

                    // Adicione outras claims necessárias aqui.
                }),
            };

            var token = tokenHandler.CreateToken(tokenDescriptor);

            return tokenHandler.WriteToken(token);
        }
    }
}
