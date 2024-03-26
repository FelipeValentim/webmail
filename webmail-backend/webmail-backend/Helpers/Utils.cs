using MailKit;
using MailKit.Search;
using MailKit.Security;
using Microsoft.IdentityModel.Tokens;
using MimeKit;
using System.IdentityModel.Tokens.Jwt;
using System.Security.Claims;
using System.Text;
using webmail_backend.Models;

namespace webmail_backend.Helpers
{
    public static class Utils
    {
        public static string Domain => "http://localhost:50012";

        private static ServiceType IdentifyProvider(string emailAddress)
        {
            if (string.IsNullOrWhiteSpace(emailAddress))
            {
                return ServiceType.Unknown;
            }

            string[] googleDomains = { "gmail.com" };
            string[] microsoftDomains = { "outlook.com", "hotmail.com" };

            string domain = emailAddress.Split('@')[1].ToLower();

            if (Array.Exists(googleDomains, d => d == domain))
            {
                return ServiceType.Google;
            }
            else if (Array.Exists(microsoftDomains, d => d == domain))
            {
                return ServiceType.Microsoft;
            }
            else
            {
                return ServiceType.Unknown;
            }
        }

        public static (Provider, Provider, ServiceType) GetProvider(string emailAddress)
        {
            Dictionary<ServiceType, (Provider IMAP, Provider SMTP)> providers = new Dictionary<ServiceType, (Provider, Provider)> {
            { ServiceType.Google, (new Provider("imap.gmail.com", 993, SecureSocketOptions.Auto), new Provider("smtp.gmail.com", 587, SecureSocketOptions.Auto)) },
            { ServiceType.Microsoft, (new Provider("outlook.office365.com", 993, SecureSocketOptions.StartTls), new Provider("smtp.office365.com", 587, SecureSocketOptions.StartTls)) },
            // Adicione outras configurações de provedor aqui
            };

            ServiceType serviceType = IdentifyProvider(emailAddress);

            if (providers.TryGetValue(serviceType, out var providerTuple))
            {
                return (providerTuple.IMAP, providerTuple.SMTP, serviceType);
            }

            return (null, null, serviceType);
        }

        public static (Provider, Provider, ServiceType) GetProviderFromServiceType(ServiceType serviceType)
        {
            Dictionary<ServiceType, (Provider IMAP, Provider SMTP)> providers = new Dictionary<ServiceType, (Provider, Provider)> {
            { ServiceType.Google, (new Provider("imap.gmail.com", 993, SecureSocketOptions.Auto), new Provider("smtp.gmail.com", 587, SecureSocketOptions.Auto)) },
            { ServiceType.Microsoft, (new Provider("outlook.office365.com", 993, SecureSocketOptions.StartTls), new Provider("smtp.office365.com", 587, SecureSocketOptions.StartTls)) },
            // Adicione outras configurações de provedor aqui
            };

            if (providers.TryGetValue(serviceType, out var providerTuple))
            {
                return (providerTuple.IMAP, providerTuple.SMTP, serviceType);
            }

            return (null, null, serviceType);
        }

        /// <summary>
        /// Retorna a Query selecionada como um objeto.
        /// </summary>
        /// <param name="key">Nome da Query</param>
        /// <returns></returns>
        public static SearchQuery GetSearchQuery(string key)
        {
            Dictionary<string, SearchQuery> searchQueries =
            new Dictionary<string, SearchQuery>()
            {
                { "All", SearchQuery.All },
                { "Seen", SearchQuery.Seen },
                { "NotSeen", SearchQuery.NotSeen },
                { "Flagged", SearchQuery.Flagged },
                { "NotAnswered", SearchQuery.NotAnswered }
            };

            if (searchQueries.TryGetValue(key, out SearchQuery searchQuery))
            {
                return searchQuery;
            }

            return SearchQuery.All;
        }

        /// <summary>
        /// Faz a troca das imagens que estão integradas ao corpo do email (ao invés de um link)
        /// </summary>
        /// <param name="htmlText">Conteúdo do email.</param>
        /// <param name="resources">As imagens.</param>
        /// <returns></returns>
        public static string GetHtmlEmbeddedImage(string htmlText, IEnumerable<MimeEntity> resources)
        {
            if (htmlText != null)
            {
                foreach (MimePart mimePart in resources)
                {
                    if (mimePart.Content != null && (htmlText.IndexOf("cid:" + mimePart.ContentId) > -1))
                    {
                        byte[] array;
                        using (var memory = new MemoryStream())
                        {
                            mimePart.Content.DecodeTo(memory);
                            array = memory.ToArray();
                        }
                        string imageBase64 = "data:" + mimePart.ContentType.MimeType + ";base64," + Convert.ToBase64String(array);
                        htmlText = htmlText.Replace("cid:" + mimePart.ContentId, imageBase64);
                    }
                }
            }

            return htmlText;
        }

    }
}
