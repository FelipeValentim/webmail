using Google.Apis.Auth.OAuth2.Flows;
using Google.Apis.Auth.OAuth2;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.Extensions.Caching.Memory;
using System.Net;
using webmail_backend.Models;
using webmail_backend.Services;
using static webmail_backend.Models.WebMailModels;
using webmail_backend.Constants;
using Google.Apis.PeopleService.v1;
using Newtonsoft.Json;
using Google.Apis.Oauth2.v2.Data;

namespace webmail_backend.Controllers
{
    [ApiController]
    [Route("[controller]")]
    public class OAuthController : ControllerBase
    {
        private readonly IMemoryCache _cache;

        public OAuthController(IMemoryCache cache)
        {
            _cache = cache;
        }

        [AllowAnonymous]
        [HttpGet("GoogleAuthenticate")]
        public IActionResult GoogleAuthenticate()
        {
            try
            {
                // Defina suas credenciais do cliente do Google
                string redirectUri = $"{Request.Scheme}://{Request.Host}/oauth/googlecallback";


                // Crie o fluxo de autenticação do Google
                var clientSecrets = new ClientSecrets
                {
                    ClientId = OAuth.CLIENTID_GOOGLE,
                    ClientSecret = OAuth.CLIENTSECRET_GOOGLE,
                };
                var flow = new GoogleAuthorizationCodeFlow(new GoogleAuthorizationCodeFlow.Initializer
                {
                    ClientSecrets = clientSecrets,
                    Scopes = new[] { PeopleServiceService.Scope.UserinfoEmail, "https://mail.google.com/" },
                    Prompt = "consent",
                });

                // Gere a URL de autorização 
                var authorizationUrl = flow.CreateAuthorizationCodeRequest(redirectUri).Build().ToString();

                // Redirecione para a URL de autorização
                return StatusCode(StatusCodes.Status200OK, authorizationUrl);
            }
            catch (Exception ex)
            {
                return StatusCode(StatusCodes.Status500InternalServerError, ex.Message);
            }
        }

        [AllowAnonymous]
        [HttpGet("GoogleCallback")]
        public async Task<IActionResult> GoogleCallback(string code, string error)
        {
            string filePath = Path.Combine(Directory.GetCurrentDirectory(), "wwwroot/html", "OAuthResult.html");

            string html = System.IO.File.ReadAllText(filePath);

            try
            {
                AuthResult authResult;

                if (code == null)
                {
                    return Content(html, "text/html");
                }

                // Defina suas credenciais do cliente do Google
                string redirectUri = $"{Request.Scheme}://{Request.Host}/oauth/googlecallback";

                // Crie o fluxo de autenticação do Google
                var clientSecrets = new ClientSecrets
                {
                    ClientId = OAuth.CLIENTID_GOOGLE,
                    ClientSecret = OAuth.CLIENTSECRET_GOOGLE,
                };
                var flow = new GoogleAuthorizationCodeFlow(new GoogleAuthorizationCodeFlow.Initializer
                {
                    ClientSecrets = clientSecrets,
                });

                var token = await flow.ExchangeCodeForTokenAsync("user", code, redirectUri, CancellationToken.None);


                using (var client = new HttpClient())
                {
                    var response = await client.GetAsync($"https://www.googleapis.com/oauth2/v1/userinfo?access_token={token.AccessToken}");

                    if (response.IsSuccessStatusCode)
                    {
                        var responseBody = await response.Content.ReadAsStringAsync();

                        Userinfo userData = JsonConvert.DeserializeObject<Userinfo>(responseBody);

                        authResult = new AuthResult(userData.Email, token.AccessToken, token.RefreshToken, (int)ServiceType.Google);

                        var json = JsonConvert.SerializeObject(authResult);

                        html = html.Replace("[authResult]", json);
                    }
                    else
                    {
                        return Content(html, "text/html");

                    }
                }

                return Content(html, "text/html");
            }
            catch
            {
                return new ContentResult
                {
                    Content = html,
                    ContentType = "text/html",
                };
            }
        }

    }
}