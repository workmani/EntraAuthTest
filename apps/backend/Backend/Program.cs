using Microsoft.AspNetCore.Authentication.JwtBearer;
using Microsoft.AspNetCore.Authorization;
using Microsoft.IdentityModel.Tokens;
using Microsoft.IdentityModel.Logging;
using System.IdentityModel.Tokens.Jwt;
using System.Linq;

var builder = WebApplication.CreateBuilder(args);

// Enable PII logging in development
IdentityModelEventSource.ShowPII = builder.Environment.IsDevelopment();

// CORS Policy
var MyAllowSpecificOrigins = "_myAllowSpecificOrigins";
builder.Services.AddCors(options =>
{
    options.AddPolicy(name: MyAllowSpecificOrigins,
                      policy  =>
                      {
                          policy.WithOrigins("http://localhost:3000") // Frontend dev server
                                .AllowAnyHeader()
                                .AllowAnyMethod();
                      });
});

// Add services to the container.
// Learn more about configuring OpenAPI at https://aka.ms/aspnet/openapi
builder.Services.AddAuthentication(JwtBearerDefaults.AuthenticationScheme)
    .AddJwtBearer(options =>
    {
        var azureSettings = builder.Configuration.GetSection("AzureAd");
        var clientId = azureSettings["ClientId"];
        var tenantId = azureSettings["TenantId"]; // Get TenantId

        // Construct v2.0 Authority
        string authority = $"https://login.microsoftonline.com/{tenantId}/v2.0";
        // Construct v2.0 Issuer
        // string validIssuer = $"https://sts.windows.net/{tenantId}/"; // Old issuer format
        // Construct Audience using App ID URI format
        string validAudience = clientId!; // Audience is just the Client ID in this token

        Console.WriteLine($"AuthConfig: TenantId: {tenantId}");
        Console.WriteLine($"AuthConfig: Authority (v2.0): {authority}");
        Console.WriteLine($"AuthConfig: Validating Audience: {validAudience}");
        // Console.WriteLine($"AuthConfig: Validating Issuer: {validIssuer}"); // Log authority instead

        options.Authority = authority; // Use v2.0 Authority
        options.TokenValidationParameters = new TokenValidationParameters()
        {
            ValidAudience = validAudience, // Use Client ID as Audience
            ValidateIssuer = true,
            ValidateAudience = true,
            ValidateLifetime = true,
            ValidateIssuerSigningKey = true,
            // ValidIssuer = validIssuer // Let Authority handle issuer validation implicitly
        };
        
        // Add event handlers for logging
        options.Events = new JwtBearerEvents
        {
            OnTokenValidated = context =>
            {
                Console.WriteLine("Token validated successfully!");
                var token = context.SecurityToken as JwtSecurityToken;
                if (token != null)
                {
                    Console.WriteLine($"Token audience: {string.Join(", ", token.Audiences)}");
                    Console.WriteLine($"Token issuer: {token.Issuer}");
                    Console.WriteLine($"Token scopes: {string.Join(", ", token.Claims.Where(c => c.Type == "scp" || c.Type == "http://schemas.microsoft.com/identity/claims/scope").Select(c => c.Value))}");
                }
                return Task.CompletedTask;
            },
            OnAuthenticationFailed = context =>
            {
                Console.WriteLine($"Authentication failed: {context.Exception.Message}");
                if (context.Exception.InnerException != null)
                {
                    Console.WriteLine($"Inner exception: {context.Exception.InnerException.Message}");
                }
                return Task.CompletedTask;
            },
            OnChallenge = context =>
            {
                Console.WriteLine($"Challenge issued: {context.Error ?? "no error"}, {context.ErrorDescription ?? "no description"}");
                return Task.CompletedTask;
            },
            OnMessageReceived = context =>
            {
                var token = context.Token;
                Console.WriteLine($"Received token: {(token?.Length > 10 ? token.Substring(0, 10) + "..." : "(none)")}");
                return Task.CompletedTask;
            }
        };
    });
builder.Services.AddAuthorization(); // Keep this simple for now

builder.Services.AddOpenApi();

var app = builder.Build();

// Configure the HTTP request pipeline.
if (app.Environment.IsDevelopment())
{
    app.MapOpenApi();
}

// Apply CORS middleware BEFORE HTTPS Redirection
app.UseCors(MyAllowSpecificOrigins); 

// app.UseHttpsRedirection(); // Comment out for local development to simplify CORS

app.UseAuthentication();
app.UseAuthorization();

var summaries = new[]
{
    "Freezing", "Bracing", "Chilly", "Cool", "Mild", "Warm", "Balmy", "Hot", "Sweltering", "Scorching"
};

app.MapGet("/weatherforecast", () =>
{
    var forecast =  Enumerable.Range(1, 5).Select(index =>
        new WeatherForecast
        (
            DateOnly.FromDateTime(DateTime.Now.AddDays(index)),
            Random.Shared.Next(-20, 55),
            summaries[Random.Shared.Next(summaries.Length)]
        ))
        .ToArray();
    return forecast;
})
.WithName("GetWeatherForecast")
.RequireAuthorization();

app.Run();

record WeatherForecast(DateOnly Date, int TemperatureC, string? Summary)
{
    public int TemperatureF => 32 + (int)(TemperatureC / 0.5556);
}
