﻿using MailKit.Net.Imap;
using MailKit.Net.Smtp;
using MailKit.Security;
using MailKit;
using Microsoft.AspNetCore.Hosting.Server;
using Newtonsoft.Json;
using Google.Apis.Auth.OAuth2;
using Google.Apis.Auth.OAuth2.Flows;
using webmail_backend.Constants;
using static Google.Apis.Auth.OAuth2.Web.AuthorizationCodeWebApp;

namespace webmail_backend.Models
{
    public class WebMailModels
    {
        public class AuthResult
        {
            [JsonProperty("email")]
            public string Email { get; set; }

            [JsonProperty("accessToken")]
            public string AccessToken { get; set; }

            [JsonProperty("refreshToken")]
            public string RefreshToken { get; set; }

            [JsonProperty("expires_in")]
            public int? ExpiresIn { get; set; }

            [JsonProperty("serviceType")]
            public int ServiceType { get; set; }

            [JsonProperty("succeeded")]
            public bool Succeeded { get; set; } = true;

            public static AuthResult Failed => new AuthResult { Succeeded = false };

            private AuthResult() { }

            public AuthResult(string email, string accessToken, string refreshToken, int serviceType)
            {
                Email = email;
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

                    AuthResult token = JsonConvert.DeserializeObject<AuthResult>(responseBody);
                    return token.ExpiresIn == null || token.ExpiresIn <= 0;
                }
            }

            public void RefreshAccessToken(int webMailId)
            {
                var clientSecrets = new ClientSecrets
                {
                    ClientId = OAuth.CLIENTID_GOOGLE,
                    ClientSecret = OAuth.CLIENTSECRET_GOOGLE
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

     


        

            public int Id { get; set; }
            public string Name { get; set; }
            public string Address { get; set; }
            public string Password { get; set; }
        }

        public class SendDataMessages
        {
            [JsonProperty("folder")]
            public string Folder { get; set; }

            [JsonProperty("ids")]
            public uint[] Ids { get; set; }

            [JsonProperty("type")]
            public string Type { get; set; }
        }

        public class SendDataMessage
        {
            [JsonProperty("folder")]
            public string Folder { get; set; }

            [JsonProperty("ids")]
            public uint Id { get; set; }

            [JsonProperty("type")]
            public string Type { get; set; }
        }

        public class SendMessage
        {
            [JsonProperty("toAddresses")]
            public string[] ToAddresses { get; set; }

            [JsonProperty("subject")]
            public string Subject { get; set; }

            [JsonProperty("content")]
            public string Content { get; set; }
        }
    }
}
