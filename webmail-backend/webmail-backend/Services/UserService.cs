using Microsoft.AspNetCore.Mvc;
using Microsoft.IdentityModel.Tokens;
using System.IdentityModel.Tokens.Jwt;
using System.Security.Claims;
using System.Text;
using webmail_backend.Helpers;
using webmail_backend.Models;
using MailKit.Security;

namespace webmail_backend.Services
{
    public class UserService
    {
        

        public static User GetUser(IHttpContextAccessor httpContext)
        {
            var id = httpContext.HttpContext.User.FindFirstValue(Constants.ClaimTypes.Id);
            var username = httpContext.HttpContext.User.FindFirstValue(Constants.ClaimTypes.Username);
            var password = httpContext.HttpContext.User.FindFirstValue(Constants.ClaimTypes.Password);
            var service = httpContext.HttpContext.User.FindFirstValue(Constants.ClaimTypes.Service);
            var host = httpContext.HttpContext.User.FindFirstValue(Constants.ClaimTypes.Host);
            var port = httpContext.HttpContext.User.FindFirstValue(Constants.ClaimTypes.Port);
            var security = httpContext.HttpContext.User.FindFirstValue(Constants.ClaimTypes.Security);

            return new User()
            {
                Id = id,
                Username = username,
                Password = password,
                Service = (ServiceType)int.Parse(service),
                Provider = new Provider(host, int.Parse(port), (SecureSocketOptions)int.Parse(security))
            };
        }
    }
}
