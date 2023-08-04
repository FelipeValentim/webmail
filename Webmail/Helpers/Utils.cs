using MailKit.Search;
using MimeKit;

namespace Webmail.Helpers
{
    public static class Utils
    {
        public static string Domain => "http://localhost:50012";


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
