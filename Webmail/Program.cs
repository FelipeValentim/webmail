using MailKit.Net.Imap;
using Microsoft.AspNetCore.Authentication.JwtBearer;
using Microsoft.IdentityModel.Tokens;
using Net6_Controller_And_VIte;
using System.Diagnostics;
using System.Security.Cryptography;
using System.Text;
using Webmail.Helpers;
using Webmail.Services;

var builder = WebApplication.CreateBuilder(args);

// Add services to the container.
builder.Services.AddControllers();

// Learn more about configuring Swagger/OpenAPI at https://aka.ms/aspnetcore/swashbuckle
builder.Services.AddEndpointsApiExplorer();
builder.Services.AddSwaggerGen();
builder.Services.AddSingleton<IHttpContextAccessor, HttpContextAccessor>();
builder.Services.AddDistributedMemoryCache();
builder.Services.AddAuthorization();
builder.Services.AddHttpContextAccessor();
builder.Services.AddSession(options =>
{
    options.IdleTimeout = TimeSpan.FromMinutes(60); // Defina o tempo limite de inatividade da sessão
    options.Cookie.HttpOnly = true;
    options.Cookie.IsEssential = true;
});

builder.Services.AddSingleton(provider =>
{
    var client = new ImapClient();
    return client;
});


builder.Services.AddAuthentication(options =>
{
    options.DefaultAuthenticateScheme = JwtBearerDefaults.AuthenticationScheme;
    options.DefaultChallengeScheme = JwtBearerDefaults.AuthenticationScheme;

}).AddJwtBearer(options =>
{
    options.RequireHttpsMetadata= false;
    options.SaveToken = true;
    options.TokenValidationParameters = new TokenValidationParameters
    {
        ValidateIssuer = false,
        ValidateAudience = false,
        ValidateIssuerSigningKey = true,
        IssuerSigningKey = new SymmetricSecurityKey(Encoding.UTF8.GetBytes(Settings.SecretKey)),
    };
    options.Events = new JwtBearerEvents
    {
        OnMessageReceived = context =>
        {
            var request = context.HttpContext.Request;
            var cookies = request.Cookies;
            if (cookies.TryGetValue(TokenService.CookieName,
                out var accessTokenValue))
            {
                context.Token = accessTokenValue;
            }
            return Task.CompletedTask;
        }
    };
});

// In production, the Vite files will be served from this directory
builder.Services.AddSpaStaticFiles(configuration =>
{
    configuration.RootPath = "ClientApp/dist";
});


var app = builder.Build();

// Configure the HTTP request pipeline.
if (app.Environment.IsDevelopment())
{
    app.UseSwagger();
    app.UseSwaggerUI();
}


app.UseHttpsRedirection();

app.UseStaticFiles();
app.UseSpaStaticFiles();

app.UseRouting();

app.UseAuthentication();
app.UseAuthorization();
app.UseSession();

app.UseEndpoints(endpoints => endpoints.MapControllers());

app.UseSpa(spa =>
{
    if (app.Environment.IsDevelopment())
        spa.UseViteDevelopmentServer(sourcePath: "ClientApp");
});

app.Run();
