namespace Webmail.Models
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
}
