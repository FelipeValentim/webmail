using Microsoft.AspNetCore.Mvc;
using Microsoft.IdentityModel.Tokens;
using System.IdentityModel.Tokens.Jwt;
using System.Security.Claims;
using System.Text;
using Webmail.Helpers;
using Webmail.Models;
using MailKit.Security;

namespace Webmail.Services
{
    public class UserService
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
                    new Claim(Constants.ClaimTypes.Id, Guid.NewGuid().ToString()),
                    new Claim(Constants.ClaimTypes.Username, user.Username),
                    new Claim(Constants.ClaimTypes.Password, user.Password),
                    new Claim(Constants.ClaimTypes.Service, ((int)user.Service).ToString()),
                    new Claim(Constants.ClaimTypes.Host, provider.Host.ToString()),
                    new Claim(Constants.ClaimTypes.Port, provider.Port.ToString()),
                    new Claim(Constants.ClaimTypes.Security, ((int)provider.SecureSocketOptions).ToString()),

                    // Adicione outras claims necessárias aqui.
                }),
            };

            var token = tokenHandler.CreateToken(tokenDescriptor);

            return tokenHandler.WriteToken(token);
        }

        public static User GetUser(IHttpContextAccessor httpContext)
        {
            var username = httpContext.HttpContext.User.FindFirstValue(Constants.ClaimTypes.Username);
            var password = httpContext.HttpContext.User.FindFirstValue(Constants.ClaimTypes.Password);
            var service = httpContext.HttpContext.User.FindFirstValue(Constants.ClaimTypes.Service);
            var host = httpContext.HttpContext.User.FindFirstValue(Constants.ClaimTypes.Host);
            var port = httpContext.HttpContext.User.FindFirstValue(Constants.ClaimTypes.Port);
            var security = httpContext.HttpContext.User.FindFirstValue(Constants.ClaimTypes.Security);

            return new User()
            {
                Username = username,
                Password = password,
                Service = (ServiceType)int.Parse(service),
                Provider = new Provider(host, int.Parse(port), (SecureSocketOptions)int.Parse(security))
            };
        }
    }
}
