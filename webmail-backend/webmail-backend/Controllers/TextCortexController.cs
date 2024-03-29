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

                    var nText = $"Apenas faça correção ortográfica das palavras incorretas, e mantenha os estilos do HTML: {text}";

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

        [HttpPost("Autocomplete")]
        public async Task<IActionResult> Autocomplete()
        {
            try
            {
                var text = HttpContext.Request.Form.Keys.FirstOrDefault();

                using (var client = new HttpClient())
                {
                    client.DefaultRequestHeaders.Authorization = new AuthenticationHeaderValue("Bearer", Api.Key);

                    var nText = $"Apenas autocomplete esse texto, e mantenha os estilos do HTML: {text}";

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

        [HttpPost("Paraphrase")]
        public async Task<IActionResult> Paraphrase()
        {
            try
            {
                var text = HttpContext.Request.Form.Keys.FirstOrDefault();

                using (var client = new HttpClient())
                {
                    client.DefaultRequestHeaders.Authorization = new AuthenticationHeaderValue("Bearer", Api.Key);

                    var nText = $"Apenas troque as palavras desse texto sem mudar sem significado (paráfrase), e mantenha os estilos do HTML: {text}";

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

        [HttpPost("Summarize")]
        public async Task<IActionResult> Summarize()
        {
            try
            {
                var text = HttpContext.Request.Form.Keys.FirstOrDefault();

                using (var client = new HttpClient())
                {
                    client.DefaultRequestHeaders.Authorization = new AuthenticationHeaderValue("Bearer", Api.Key);

                    var nText = $"Apenas resuma esse texto, e mantenha os estilos do HTML: {text}";

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

        [HttpPost("Suggestion")]
        public async Task<IActionResult> Suggestion()
        {
            try
            {
                var text = HttpContext.Request.Form.Keys.FirstOrDefault();

                using (var client = new HttpClient())
                {
                    client.DefaultRequestHeaders.Authorization = new AuthenticationHeaderValue("Bearer", Api.Key);

                    var nText = $"Adicione ou remova palavras para melhorar esse texto, e mantenha os estilos do HTML: {text}";

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

        [HttpPost("GenerateText")]
        public async Task<IActionResult> GenerateText()
        {
            try
            {
                var text = HttpContext.Request.Form.Keys.FirstOrDefault();

                using (var client = new HttpClient())
                {
                    client.DefaultRequestHeaders.Authorization = new AuthenticationHeaderValue("Bearer", Api.Key);

                    var nText = $"No estilo HTML: {text}";

                    var model = new Codes(nText);

                    var payload = JsonConvert.SerializeObject(model);

                    var content = new StringContent(payload, Encoding.Default, "application/json");
                    content.Headers.ContentType.CharSet = null;

                    HttpResponseMessage response = await client.PostAsync(Urls.Codes, content);

                    if (response.IsSuccessStatusCode)
                    {
                        var json = await response.Content.ReadAsStringAsync();

                        var result = JsonConvert.DeserializeObject<Result>(json);

                        return StatusCode(StatusCodes.Status200OK, result.Data.Outputs.FirstOrDefault().Text);
                    }
                    else
                    {
                        var json = await response.Content.ReadAsStringAsync();

                        return StatusCode((int)response.StatusCode);
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
