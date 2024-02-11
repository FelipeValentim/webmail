using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using webmail_backend.TextCortex;
using Newtonsoft.Json;
using static webmail_backend.TextCortex.TextCortex;
using System.Net.Http.Headers;
using System.Net.Http;
using System.Text.Json.Nodes;
using System.Text;
using System;
using Org.BouncyCastle.Ocsp;

namespace webmail_backend.Controllers
{
    [Authorize]
    [ApiController]
    [Route("[controller]")]
    public class TextCortexController : ControllerBase
    {
        [HttpPost("Correct")]
        public async Task<IActionResult> Correct()
        {
            try
            {
                var text = HttpContext.Request.Form.Keys.FirstOrDefault();

                using (var client = new HttpClient()) 
                {
                    client.DefaultRequestHeaders.Authorization = new AuthenticationHeaderValue("Bearer", Api.Key);

                    var nText = $"Faça apenas a correção ortográfica das palavras incorretas, e mantenha os estilos do RichTextEditor: {text}";

                    var model = new Codes(nText);

                    var payload = JsonConvert.SerializeObject(model);

                    var content = new StringContent(payload, Encoding.Default, "application/json");
                    content.Headers.ContentType.CharSet = null;

                    HttpResponseMessage response = await client.PostAsync(Urls.Codes, content);

                    if (response.IsSuccessStatusCode)
                    {
                        var json = await response.Content.ReadAsStringAsync();

                        var data = JsonConvert.DeserializeObject<Result>(json);

                        return StatusCode(StatusCodes.Status200OK, data.Data.Outputs.FirstOrDefault().Text);
                    }
                    else
                    {
                        var json = await response.Content.ReadAsStringAsync();

                        return StatusCode(StatusCodes.Status400BadRequest);
                    }
                }

            }
            catch
            {
                return StatusCode(StatusCodes.Status500InternalServerError);
            }
        }
    }
}
