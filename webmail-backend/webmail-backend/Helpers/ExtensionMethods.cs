using MailKit.Net.Imap;
using MailKit.Search;
using MailKit;
using MimeKit;
using static webmail_backend.Models.WebMailModels;
using webmail_backend.Models;
using Microsoft.Extensions.Caching.Memory;
using webmail_backend.Constants;
using Google.Apis.PeopleService.v1.Data;
using MailKit.Security;
using static Google.Apis.Auth.OAuth2.Web.AuthorizationCodeWebApp;

namespace webmail_backend.Helpers
{
    public static class ExtensionMethods
    {
        /// <summary>
        /// Get ImapClient
        /// </summary>
        /// <param name="str"></param>
        /// <returns></returns>
        public static ImapClient GetImapClient(this IMemoryCache cache, User user, int hours = 1)
        {
            if (!cache.TryGetValue<ImapClient>(user.Username, out var imapClient))
            {
                imapClient = new ImapClient();

                imapClient.Timeout = 8000;

                imapClient.Connect(user.ImapProvider.Host, user.ImapProvider.Port, user.ImapProvider.SecureSocketOptions);

                if (string.IsNullOrEmpty(user.AccessToken))
                {
                    imapClient.Authenticate(user.Username, user.Password);
                }
                else
                {
                    var oauth2 = new SaslMechanismOAuth2(user.Username, user.AccessToken);

                    imapClient.Authenticate(oauth2);
                }



                var cacheOptions = new MemoryCacheEntryOptions().SetAbsoluteExpiration(TimeSpan.FromHours(hours));

                cache.Set(user.Username, imapClient, cacheOptions);
            }

            return imapClient;
        }

        /// <summary>
        /// Set ImapClient
        /// </summary>
        /// <param name="str"></param>
        /// <returns></returns>
        public static ConnectionResult SetImapClient(this IMemoryCache cache, User user, int hours = 1)
        {
            try
            {
                var imapClient = new ImapClient();

                imapClient.Timeout = 8000;

                imapClient.Connect(user.ImapProvider.Host, user.ImapProvider.Port, user.ImapProvider.SecureSocketOptions);

                if (string.IsNullOrEmpty(user.AccessToken))
                {
                    imapClient.Authenticate(user.Username, user.Password);
                }
                else
                {
                    var oauth2 = new SaslMechanismOAuth2(user.Username, user.AccessToken);

                    imapClient.Authenticate(oauth2);
                }

                var cacheOptions = new MemoryCacheEntryOptions().SetAbsoluteExpiration(TimeSpan.FromHours(hours));

                cache.Set(user.Username, imapClient, cacheOptions);

            }
            catch
            {
                return ConnectionResult.Failed("Algum problema aconteceu");
            }

            return ConnectionResult.Success;
        }

        /// <summary>
        /// Capitaliza a primeira letra de uma string
        /// </summary>
        /// <param name="str"></param>
        /// <returns></returns>
        public static string Capitalize(this string str)
        {
            if (str == null) return null;

            if (str.Length > 1)
                return char.ToUpper(str[0]) + str.Substring(1);

            return str.ToUpper();
        }

        /// <summary>
        /// Retorna os dados da pasta referente
        /// </summary>
        /// <param name="folder"></param>
        /// <returns></returns>
        public static FolderInfo GetFolderInfo(this IMailFolder folder) // Pega o nome caso seja uma SpecialFolder
        {
            // Emails não lidos
            var unread = folder.Search(SearchQuery.NotSeen).Count;

            // Caminho da pasta substituindo o separador padrão pelo ponto (.)
            var path = folder.GetPath();

            // Total de emails na pasta
            var totalEmails = folder.Count;

            // Lista de nomes da pasta caso ela tenha algum desses atributos
            Dictionary<FolderAttributes, string> specialFolders = new Dictionary<FolderAttributes, string>
            {
                { FolderAttributes.All, "Todas as mensagens" },
                { FolderAttributes.Inbox, "Caixa de entrada" },
                { FolderAttributes.Archive, "Arquivadas" },
                { FolderAttributes.Drafts, "Rascunhos" },
                { FolderAttributes.Flagged, "Favoritos" },
                { FolderAttributes.Important, "Importante" },
                { FolderAttributes.Junk, "Spam" },
                { FolderAttributes.Sent, "Enviados"},
                { FolderAttributes.Trash, "Lixeira" }
            };

            // Se possui um dos atributos definir como o nome
            foreach (KeyValuePair<FolderAttributes, string> pair in specialFolders)
            {
                if (folder.Attributes.HasFlag(pair.Key))
                {
                    return new FolderInfo { Path = path, Name = pair.Value, Unread = unread, TotalEmails = totalEmails };
                }
            }

            // Se não possui, definir o nome da pasta como ela mesma
            return new FolderInfo() { Path = path, Name = folder.Name.Capitalize(), Unread = unread, TotalEmails = totalEmails };
        }

        /// <summary>
        /// Retorna as queries selecionadas pelo usuário
        /// </summary>
        /// <param name="searchQuery"></param>
        /// <param name="queries">Parâmetros de consultas selecionadas pelo usuário</param>
        /// <param name="searchText">Texto de pesquisa</param>
        /// <returns></returns>
        public static SearchQuery GetQueries(this SearchQuery searchQuery, string[] queries, string searchText)
        {
            SearchQuery searchQueries = null;

            // Lista de parâmetros que podem ser selecionadas
            Dictionary<string, Func<string, SearchQuery>> queryMap = new Dictionary<string, Func<string, SearchQuery>>
            {
                { "subject", SearchQuery.SubjectContains },
                { "body", SearchQuery.BodyContains },
                { "from", SearchQuery.FromContains },
                { "to", SearchQuery.ToContains },
            };

            // Percorre cada parâmetro selecionado checando se existe dentro do Dictionary e adicionar ele a lista de queries com o operador
            foreach (string query in queries)
            {
                if (queryMap.ContainsKey(query.ToLower()))
                {
                    var searchFunction = queryMap[query.ToLower()];
                    SearchQuery fieldQuery = searchFunction(searchText);
                    searchQueries = searchQueries?.Or(fieldQuery) ?? fieldQuery;
                }
            }

            searchQuery = searchQuery.And(searchQueries);

            return searchQuery;
        }

        /// <summary>
        /// Retorna a pasta a partir do caminho completo
        /// </summary>
        /// <param name="client"></param>
        /// <param name="path">Caminho completo da pasta</param>
        /// <param name="folderAccess">Nível de acesso à pasta</param>
        /// <param name="cancel"></param>
        /// <returns></returns>
        public static IMailFolder GetFolder(this ImapClient client, string path, FolderAccess folderAccess = FolderAccess.ReadOnly, CancellationToken cancel = default)
        {
            IMailFolder folder = null;

            var folders = client.GetFolders(client.PersonalNamespaces[0]).Append(client.Inbox);

            // Troca o ponto (.) pelo separador padrão para ficar igual ao do servidor
            path = client.Inbox.SetPath(path);

            folder = folders.FirstOrDefault(f => f.FullName.Equals(path, StringComparison.OrdinalIgnoreCase));

            if (folder == null)
            {
                return client.Inbox;
            }

            folder.Open(folderAccess, cancel);

            return folder;
        }

        /// <summary>
        /// Retorna o caminho completo da pasta substituindo o separador padrão pelo ponto (.), é o caminho inverso do SetPath.
        /// </summary>
        /// <param name="folder"></param>
        /// <returns></returns>
        public static string GetPath(this IMailFolder folder)
        {
            var path = folder.FullName;
            var directorySeparator = folder.DirectorySeparator;
            path = path.Replace(directorySeparator, '.');
            return path;
        }

        /// <summary>
        /// Retorna o caminho completo da pasta substituindo o ponto (.) pelo separador padrão, é o caminho inverso do GetPath.
        /// </summary>
        /// <param name="folder"></param>
        /// <param name="path">Caminho de determinada pasta que deveria ser passado</param>
        /// <returns></returns>
        public static string SetPath(this IMailFolder folder, string path)
        {
            var directorySeparator = folder.DirectorySeparator;
            path = path.Replace('.', directorySeparator);
            return path;
        }

        /// <summary>
        /// Retorna uma diferença de horário como uma string padronizada.
        /// </summary>
        /// <param name="date"></param>
        /// <returns></returns>
        public static string GetPastTime(this DateTimeOffset date)
        {
            TimeSpan diferenca = DateTimeOffset.Now - date;

            if (diferenca.TotalSeconds < 60)
            {
                return $"(há {Math.Floor(diferenca.TotalSeconds)} segundos)";
            }
            else if (diferenca.TotalMinutes < 60)
            {
                return $"(há {Math.Floor(diferenca.TotalMinutes)} minutos)";
            }
            else if (diferenca.TotalHours < 24)
            {
                return $"(há {Math.Floor(diferenca.TotalHours)} horas)";
            }
            else if (diferenca.TotalDays < 30)
            {
                return $"(há {Math.Floor(diferenca.TotalDays)} dias)";

            }
            else if (diferenca.TotalDays < 365)
            {
                int mesesPassados = (int)(Math.Floor(diferenca.TotalDays) / 30);
                return $"(há {mesesPassados} {(mesesPassados == 1 ? "mês" : "meses")})";
            }
            else
            {
                int anosPassados = (int)(Math.Floor(diferenca.TotalDays) / 365);
                return $"(há {anosPassados} {(anosPassados == 1 ? "ano" : "anos")})";
            }
        }

        /// <summary>
        /// Passa determinada mensagem para a pasta Sent (Enviados), caso essa pasta ou similar não seja encontrada, será criada uma nova.
        /// </summary>
        /// <param name="client"></param>
        /// <param name="message"></param>
        public static void AppendSent(this ImapClient client, MimeMessage message)
        {
            // Pega as pastas
            var folders = client.GetFolders(client.PersonalNamespaces[0]);

            // Procura a pasta enviada pela flag
            var sent = folders.FirstOrDefault(x => x.Attributes.HasFlag(FolderAttributes.Sent));

            if (sent == null)
            {
                // Se não encontrar, procure pelos nomes comuns
                sent = folders.FirstOrDefault(x => FolderNames.Sent.Any(s => x.FullName.EndsWith(s, StringComparison.OrdinalIgnoreCase)));
                
                if (sent == null)
                {
                    // Se ainda assim não encontrar, criar a pasta
                    sent = client.Inbox.Create("Enviados", true);
                }
            }

            // Abrir a pasta
            sent.Open(FolderAccess.ReadWrite);

            // Coloca a mensagem na pasta Sent
            sent.Append(message, MessageFlags.Seen);
        }

        /// <summary>
        /// Passa determinada mensagem para a pasta Sent (Enviados), caso essa pasta ou similar não seja encontrada, será criada uma nova.
        /// </summary>
        /// <param name="client"></param>
        /// <param name="message"></param>
        public static void AppendDraft(this ImapClient client, MimeMessage message)
        {
            // Pega as pastas
            var folders = client.GetFolders(client.PersonalNamespaces[0]);

            // Procura a pasta enviada pela flag
            var draft = folders.FirstOrDefault(x => x.Attributes.HasFlag(FolderAttributes.Drafts));

            if (draft == null)
            {
                // Se não encontrar, procure pelos nomes comuns
                draft = folders.FirstOrDefault(x => new List<string> { "Rascunho", "Rascunhos", "Draft", "Drafts" }.Any(s => x.FullName.EndsWith(s, StringComparison.OrdinalIgnoreCase)));
                if (draft == null)
                {
                    // Se ainda assim não encontrar, criar a pasta
                    draft = client.Inbox.Create("Rascunhos", true);
                }
            }

            // Abrir a pasta
            draft.Open(FolderAccess.ReadWrite);

            // Coloca a mensagem na pasta Sent
            draft.Append(message, MessageFlags.Seen);
        }
    }
}
