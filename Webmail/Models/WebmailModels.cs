using MailKit.Net.Imap;
using MailKit.Net.Smtp;
using MailKit.Security;
using MailKit;
using Microsoft.AspNetCore.Hosting.Server;
using Newtonsoft.Json;
using Google.Apis.Auth.OAuth2;
using Google.Apis.Auth.OAuth2.Flows;

namespace Webmail.Models
{
    public class WebMailModels
    {
        public class AuthInfo
        {
            public string Email { get; set; }

            [JsonProperty("access_token")]
            public string AccessToken { get; set; }

            [JsonProperty("refresh_token")]
            public string RefreshToken { get; set; }

            [JsonProperty("expires_in")]
            public int? ExpiresIn { get; set; }

            public int ServiceType { get; set; }

            public bool Succeeded { get; set; } = true;

            public static AuthInfo Failed => new AuthInfo { Succeeded = false };

            public AuthInfo() { }

            public AuthInfo(string accessToken, string refreshToken, int serviceType)
            {
                AccessToken = accessToken;
                RefreshToken = refreshToken;
                ServiceType = serviceType;
            }

            public bool IsExpired()
            {
                var url = $"https://oauth2.googleapis.com/tokeninfo?access_token={AccessToken}";

                using (var client = new HttpClient())
                {
                    HttpResponseMessage httpResponse = client.GetAsync(url).GetAwaiter().GetResult();

                    string responseBody = httpResponse.Content.ReadAsStringAsync().GetAwaiter().GetResult();

                    AuthInfo token = JsonConvert.DeserializeObject<AuthInfo>(responseBody);
                    return token.ExpiresIn == null || token.ExpiresIn <= 0;
                }
            }

            public void RefreshAccessToken(int webMailId)
            {
                var clientSecrets = new ClientSecrets
                {
                    ClientId = "697415031176-ks0ulk1p7ue0d4mn4d2ekloog88rv6h7.apps.googleusercontent.com",
                    ClientSecret = "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"
                };
                var flow = new GoogleAuthorizationCodeFlow(new GoogleAuthorizationCodeFlow.Initializer
                {
                    ClientSecrets = clientSecrets,
                });

                var token = flow.RefreshTokenAsync(Email, RefreshToken, CancellationToken.None).GetAwaiter().GetResult();

                AccessToken = token.AccessToken;
            }
        }

        /// <summary>
        /// Informações relativa a pasta.
        /// </summary>
        public class FolderInfo
        {
            public string Name { get; set; }
            public string Path { get; set; }
            public string Id { get; set; }
            /// <summary>
            /// Total de emails
            /// </summary>
            public int TotalEmails { get; set; }
            /// <summary>
            /// Total de emails não lidos
            /// </summary>
            public int Unread { get; set; }
            /// <summary>
            /// Pastas filhas
            /// </summary>
            public List<FolderInfo> SubFolders { get; set; }
            /// <summary>
            /// Pasta pai
            /// </summary>
            public FolderInfo Parent { get; set; }

            public FolderInfo()
            {
                SubFolders = new List<FolderInfo>();
            }
        }

        public class SendEmailBody
        {
            //public string From { get; set; }
            public string[] To { get; set; }
            public List<EmailAddress> ToAddresses { get; set; }
            public string Subject { get; set; }
            public string Content { get; set; }
            public List<SendAttachment> Files { get; set; }
        }

        public class SendAttachment
        {
            public string Name { get; set; }
            public string ContentType { get; set; }
            public string Url { get; set; }
        }

        public class EmailAddress
        {
            public string Name { get; set; }
            public string Address { get; set; }
        }

        public class MessageFilter
        {
            [JsonProperty("folder_name")]
            public string FolderName { get; set; }
            public int Page { get; set; }
            public int RowsPerPage { get; set; }
            public string SearchQuery { get; set; }
            public string SearchText { get; set; }
            public string[] SearchParams { get; set; }

        }

        public class Attachment
        {
            public string FolderName { get; set; }
            public uint UniqueId { get; set; }
            public string FileName { get; set; }
            public string ContentId { get; set; }
            public long Size { get; set; }
        }

        public class ReplyInfo
        {
            public string FolderName { get; set; }
            public uint UniqueId { get; set; }
            public string Content { get; set; }
            public bool ReplyToAll { get; set; }
        }

        public class ForwardInfo
        {
            public string FolderName { get; set; }
            public uint UniqueId { get; set; }
            public string Subject { get; set; }
            public string Content { get; set; }
            public List<EmailAddress> ToAddresses { get; set; }
        }

        public class EmailMessage
        {
            public EmailMessage()
            {
                ToAddresses = new List<EmailAddress>();
                FromAddresses = new List<EmailAddress>();
            }

            public UniqueId UniqueId { get; set; }

            public List<EmailAddress> ToAddresses { get; set; }
            public List<EmailAddress> FromAddresses { get; set; }
            public string Subject { get; set; }
            public string Cc { get; set; }
            public string Date { get; set; }
            public string Content { get; set; }
            public bool Seen { get; set; }
            public bool HasAttachment { get; set; }
            public List<Attachment> Attachments { get; set; }
            public bool IsSent { get; set; }
            public bool IsDraft { get; set; }
            public bool Flagged { get; set; }
        }

        public class ServersOptions
        {
            public int? ProviderId { get; set; }
            public ServerOptions Imap { get; private set; }
            public ServerOptions Smtp { get; private set; }
            public Provider ImapProvider { get; set; } // DTO
            public Provider SmtpProvider { get; set; } // DTO


            private void GetServerOptions() // 
            {
                Dictionary<int?, ServersOptions> providers = new Dictionary<int?, ServersOptions> {
                    { 1, new ServersOptions { ImapProvider = new Provider("imap.gmail.com", 993, 1), SmtpProvider = new Provider("smtp.gmail.com", 587, 1) } },
                    { 2, new ServersOptions { ImapProvider = new Provider("outlook.office365.com", 993, 1), SmtpProvider = new Provider("smtp.office365.com", 587,  3) } } ,
                    { 3, new ServersOptions { ImapProvider = new Provider("imap.mail.yahoo.com", 993, 1), SmtpProvider = new Provider("smtp.mail.yahoo.com", 587, 1) } },
                    // adicione outras configurações aqui
                };

                if (providers.TryGetValue(ProviderId, out ServersOptions options))
                {
                    ImapProvider = options.ImapProvider;
                    SmtpProvider = options.SmtpProvider;
                }
            }

            public void SetServerOptions(EmailOptions emailOptions)
            {
                if (ProviderId != null)
                {
                    GetServerOptions();
                }

                Imap = new ServerOptions(ImapProvider.Host, ImapProvider.Port, emailOptions, ImapProvider.SecureSocketOptions);
                Smtp = new ServerOptions(SmtpProvider.Host, SmtpProvider.Port, emailOptions, ImapProvider.SecureSocketOptions);
            }
        }

        public class Provider // DTO
        {
            public string Type { get; set; }
            public string Host { get; set; }
            public int SecureSocketOption { get; set; }
            public SecureSocketOptions SecureSocketOptions => (SecureSocketOptions)SecureSocketOption;
            public int Port { get; set; }

            public Provider() { }

            public Provider(string host, int port, int secureSocketOption)
            {
                Host = host;
                Port = port;
                SecureSocketOption = secureSocketOption;
            }

            public IMailService CreateClient()
            {
                if (Type == "imap")
                {
                    return new ImapClient();
                }
                else if (Type == "smtp")
                {
                    return new SmtpClient();
                }

                throw new ArgumentException("Tipo de provedor de e-mail inválido");

            }
        }

        public class ServerOptions
        {
            public class ConnectionResult
            {
                public bool Succeeded { get; private set; }
                public string Message { get; private set; }

                public static ConnectionResult Success => new ConnectionResult { Succeeded = true };

                public static ConnectionResult Failed(string error)
                {
                    return new ConnectionResult { Succeeded = false, Message = error };
                }
            }

            public ServerOptions() { }
            public ServerOptions(string host, int port, SecureSocketOptions secureSocketOptions = SecureSocketOptions.Auto)
            {
                Host = host;
                Port = port;
                SecureSocketOptions = secureSocketOptions;
            }

            public ServerOptions(string host, int port, EmailOptions emailOptions, SecureSocketOptions secureSocketOptions = SecureSocketOptions.Auto)
            : this(host, port, secureSocketOptions)
            {
                Email = emailOptions;
            }

            private string Host { get; set; }
            private int Port { get; set; }
            private SecureSocketOptions SecureSocketOptions { get; set; }
            public EmailOptions Email { get; private set; }

           
            public ConnectionResult Connect(IMailService client, CancellationToken cancel = default)
            {
                try
                {
                    Connection(client, cancel);

                    if (Email.AuthInfo != null)
                    {
                        if (Email.AuthInfo.IsExpired())
                        {
                            Email.AuthInfo.RefreshAccessToken(Email.Id);
                        }

                        AuthenticationOAuth2(client, cancel);
                    }
                    else
                    {
                        Authentication(client, cancel);
                    }

                }
                catch (ImapProtocolException)
                {
                    return ConnectionResult.Failed("Usuário ou senha incorreta");
                }
                catch (SmtpProtocolException)
                {
                    return ConnectionResult.Failed("Usuário ou senha incorreta");
                }
                catch (AuthenticationException)
                {
                    return ConnectionResult.Failed("Usuário ou senha incorreta");
                }
                catch (System.Net.Sockets.SocketException) //Este Host não é conhecido (válido) / Porta inválida (TimedOut)
                {
                    return ConnectionResult.Failed("Ocorreu algum problema ao tentar se conectar ao servidor");
                }
                catch (Exception ex)
                {
                    return ConnectionResult.Failed(ex.Message);
                }

                return ConnectionResult.Success;
            }

            private void Connection(IMailService client, CancellationToken cancel = default)
            {
                if (!client.IsConnected)
                {
                    client.Connect(Host, Port, SecureSocketOptions, cancel);
                }
            }

            private void Authentication(IMailService client, CancellationToken cancel = default)
            {
                if (!client.IsAuthenticated)
                {
                    client.AuthenticationMechanisms.Remove("XOAUTH");

                    client.Authenticate(Email.Address, Email.Password, cancel);
                }
            }

            private void AuthenticationOAuth2(IMailService client, CancellationToken cancel = default)
            {
                if (!client.IsAuthenticated)
                {
                    client.Authenticate(new SaslMechanismOAuth2(Email.Address, Email.AuthInfo.AccessToken), cancel);
                }
            }

            public ConnectionResult Reconnect(IMailService client, CancellationToken cancel = default)
            {
                client.Disconnect(true, cancel);

                return Connect(client, cancel);
            }

            public ConnectionResult TestConnection(IMailService client, CancellationToken cancel = default)
            {
                try
                {
                    Connection(client, cancel);
                }
                catch (ImapProtocolException)
                {
                    return ConnectionResult.Failed("Usuário ou senha incorreta");
                }
                catch (SmtpProtocolException)
                {
                    return ConnectionResult.Failed("Usuário ou senha incorreta");
                }
                catch (AuthenticationException)
                {
                    return ConnectionResult.Failed("Usuário ou senha incorreta");
                }
                catch (System.Net.Sockets.SocketException) //Este Host não é conhecido (válido) / Porta inválida (TimedOut)
                {
                    return ConnectionResult.Failed("Ocorreu algum problema ao tentar se conectar ao servidor");
                }
                catch (Exception ex)
                {
                    return ConnectionResult.Failed(ex.Message);
                }

                return ConnectionResult.Success;
            }
        }

        public class EmailOptions
        {
            public EmailOptions() { }
            public EmailOptions(string name, string address, string password)
            {
                Name = name;
                Address = address;
                Password = password;
            }
            public EmailOptions(int id, string name, string address, string password)
            {
                Id = id;
                Name = name;
                Address = address;
                Password = password;
            }

            public EmailOptions(string name, string address, AuthInfo authInfo)
            {
                Name = name;
                Address = address;
                AuthInfo = authInfo;
            }


            public EmailOptions(int id, string name, string address, AuthInfo authInfo)
            {
                Id = id;
                Name = name;
                Address = address;
                AuthInfo = authInfo;
            }

            public int Id { get; set; }
            public string Name { get; set; }
            public string Address { get; set; }
            public string Password { get; set; }
            public AuthInfo AuthInfo { get; set; }
        }
    }
}
