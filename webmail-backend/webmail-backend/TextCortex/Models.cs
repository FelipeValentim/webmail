using Newtonsoft.Json;

namespace webmail_backend.TextCortex
{
    public class TextCortex
    {
        public class Result
        {
            [JsonProperty("status")]
            public string Status { get; set; }

            [JsonProperty("data")]
            public Data Data { get; set; }
        }

        public class Response
        {
            public bool Succeeded { get; private set; }
            public string Message { get; private set; }
            public Result Result { get; private set; }

            public static Response Success => new Response { Succeeded = true };

            public static Response Failed(string error)
            {
                return new Response { Succeeded = false, Message = error };
            }
        }

        public class Data
        {
            [JsonProperty("outputs")]
            public ICollection<Output> Outputs { get; set; }

            [JsonProperty("remaining_credits")]
            public double RemainingCredits { get; set; }
        }

        public class Output
        {
            [JsonProperty("index")]
            public int Index { get; set; }

            [JsonProperty("text")]
            public string Text { get; set; }

            [JsonProperty("id")]
            public string Id { get; set; }
        }


        public class Codes
        {
            public Codes(string text)
            {
                MaxTokens = 2048;
                Mode = "python";
                Model = "icortex-1";
                N = 1;
                Temperature = 0;
                Text = text;
            }

            [JsonProperty("max_tokens")]
            public int MaxTokens { get; set; }

            [JsonProperty("mode")]
            public string Mode { get; set; }

            [JsonProperty("model")]
            public string Model { get; set; }

            [JsonProperty("n")]
            public int N { get; set; }

            [JsonProperty("temperature")]
            public int Temperature { get; set; }

            [JsonProperty("text")]
            public string Text { get; set; }
        }
    }
   
}
