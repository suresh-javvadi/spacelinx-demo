using AutoMapper;
using Microsoft.ApplicationInsights.Extensibility;
using Microsoft.Extensions.Options;
using Serilog;
using Serilog.Events;
using SpaceLinx.Api.Configuration;
using SpaceLinx.Api.Middleware;
using SpaceLinx.Model;
using System.Text.Json;
using System.Text.Json.Serialization;

var builder = WebApplication.CreateBuilder(args);
AppContext.SetSwitch("Npgsql.EnableLegacyTimestampBehavior", true);
builder.Configuration.AddEnvironmentVariables();

// Configure Serilog
var loggerConfiguration = new LoggerConfiguration()
    .ReadFrom.Configuration(builder.Configuration);

// Add Application Insights sink if enabled
var appInsightsEnabled = builder.Configuration.GetValue<bool>("ApplicationInsights:Enabled");
var appInsightsConnectionString = builder.Configuration["ApplicationInsights:ConnectionString"];

if (appInsightsEnabled && !string.IsNullOrEmpty(appInsightsConnectionString))
{
    var telemetryConfiguration = TelemetryConfiguration.CreateDefault();
    telemetryConfiguration.ConnectionString = appInsightsConnectionString;

    loggerConfiguration.WriteTo.ApplicationInsights(
        telemetryConfiguration,
        TelemetryConverter.Traces);
}

Log.Logger = loggerConfiguration.CreateLogger();

builder.Host.UseSerilog();

// Add services to the container.
builder.Services.AddSpaceLinxAuthentication(builder.Configuration);
builder.Services.AddSpaceLinxAuthorization(builder.Configuration);
builder.Services.AddServices(builder.Configuration);

builder.Services.AddControllers()
    .AddJsonOptions(
        options =>
        {
            options.JsonSerializerOptions.PropertyNamingPolicy = JsonNamingPolicy.CamelCase;
            options.JsonSerializerOptions.ReferenceHandler = ReferenceHandler.IgnoreCycles;
        });
// Learn more about configuring Swagger/OpenAPI at https://aka.ms/aspnetcore/swashbuckle
builder.Services.AddEndpointsApiExplorer();
builder.Services.AddSwaggerGen(setup => builder.Services.SwaggerUISetup(builder.Environment.EnvironmentName, setup));
//builder.Services.AddAutoMapper(typeof(SpaceLinxAutoMapperProfile).Assembly);

var mapperConfig = new MapperConfiguration(mc =>
{
    mc.AddProfile(new SpaceLinxAutoMapperProfile());
});

IMapper mapper = mapperConfig.CreateMapper();
builder.Services.AddSingleton(mapper);

var app = builder.Build();

// Configure the HTTP request pipeline.
if (app.Environment.IsDevelopment())
{
    app.UseSwagger()
        .UseSwaggerUI(setup =>
        {
            var stringDict = new Dictionary<string, string>()
            {
                { "resource", builder.Configuration["AzureAd:ClientId"] }
            };

            setup.SwaggerEndpoint("/swagger/v1/swagger.json", "SpaceLinx API");
            setup.OAuthClientId(builder.Configuration["AzureAd:ClientId"]);
            setup.OAuthRealm($"https://dev/swagger/ui/o2c-html");
            setup.OAuthAppName($"Scutoid Tenant Administration Dev");
            setup.OAuthAdditionalQueryStringParams(stringDict);
        });
}

if (app.Environment.IsProduction())
{
    app.UseHsts();
}

app.UseHttpsRedirection();

// Establish a correlation id per request (shared by audit rows and logs)
app.UseMiddleware<CorrelationMiddleware>();

// Add Serilog request logging for HTTP requests
app.UseSerilogRequestLogging(options =>
{
    options.MessageTemplate = "HTTP {RequestMethod} {RequestPath} responded {StatusCode} in {Elapsed:0.0000} ms";
});

app.UseCors("default");

app.UseMiddleware<GlobalExceptionMiddleware>();

app.UseAuthentication();
app.UseAuthorization();
app.UseStaticFiles();

app.MapControllers();

try
{
    Log.Information("Starting SpaceLinx API");
    app.Run();
}
catch (Exception ex)
{
    Log.Fatal(ex, "SpaceLinx API terminated unexpectedly");
}
finally
{
    Log.CloseAndFlush();
}
