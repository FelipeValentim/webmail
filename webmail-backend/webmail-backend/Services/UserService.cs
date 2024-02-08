﻿using Microsoft.AspNetCore.Mvc;
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
            var imapHost = httpContext.HttpContext.User.FindFirstValue(Constants.ClaimTypes.ImapHost);
            var imapPort = httpContext.HttpContext.User.FindFirstValue(Constants.ClaimTypes.ImapPort);
            var imapSecurity = httpContext.HttpContext.User.FindFirstValue(Constants.ClaimTypes.ImapSecurity);
            var smtpHost = httpContext.HttpContext.User.FindFirstValue(Constants.ClaimTypes.SmtpHost);
            var smtpPort = httpContext.HttpContext.User.FindFirstValue(Constants.ClaimTypes.SmtpPort);
            var smtpSecurity = httpContext.HttpContext.User.FindFirstValue(Constants.ClaimTypes.SmtpSecurity);

            return new User()
            {
                Id = id,
                Username = username,
                Password = password,
                Service = (ServiceType)int.Parse(service),
                ImapProvider = new Provider(imapHost, int.Parse(imapPort), (SecureSocketOptions)int.Parse(imapSecurity)),
                SmtpProvider = new Provider(smtpHost, int.Parse(smtpPort), (SecureSocketOptions)int.Parse(smtpSecurity))

            };
        }
    }
}
