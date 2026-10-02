namespace webmail_backend.Constants
{
    public class OAuth
    {
        public static string CLIENTID_GOOGLE => Environment.GetEnvironmentVariable("GOOGLE_CLIENT_ID") ?? "PLACEHOLDER_GOOGLE_CLIENT_ID.apps.googleusercontent.com";
        public static string CLIENTSECRET_GOOGLE => Environment.GetEnvironmentVariable("GOOGLE_CLIENT_SECRET") ?? "PLACEHOLDER_GOOGLE_CLIENT_SECRET";
    }
}
