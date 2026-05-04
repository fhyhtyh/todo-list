using Microsoft.OpenApi.Models;
using Serilog;
using OpenTelemetry.Metrics;
using OpenTelemetry.Resources;
using OpenTelemetry.Trace;
using TodoList.Application;
using TodoList.Infrastructure;

var builder = WebApplication.CreateBuilder(args);

builder.Host.UseSerilog((context, configuration) =>
    configuration.ReadFrom.Configuration(context.Configuration));

var serviceName = "TodoList.API";
builder.Services.AddOpenTelemetry()
    .ConfigureResource(resource => resource.AddService(serviceName))
    .WithTracing(tracing =>
    {
        tracing.AddAspNetCoreInstrumentation()
               .AddOtlpExporter(opts =>
               {
                   opts.Endpoint = new Uri(builder.Configuration["Otlp:Endpoint"] ?? "http://localhost:4317");
               });
    })
    .WithMetrics(metrics =>
    {
        metrics.AddAspNetCoreInstrumentation()
               .AddOtlpExporter(opts =>
               {
                   opts.Endpoint = new Uri(builder.Configuration["Otlp:Endpoint"] ?? "http://localhost:4317");
               });
    });

builder.Services
    .AddApplication()
    .AddInfrastructure(builder.Configuration);

builder.Services.AddControllers();

builder.Services.AddSwaggerGen(options =>
{
    options.SwaggerDoc("v1", new OpenApiInfo
    {
        Title = "TodoList API",
        Version = "v1",
        Description = "REST API for managing tasks in the TodoList application."
    });

    options.UseInlineDefinitionsForEnums();
});

var app = builder.Build();

if (app.Environment.IsDevelopment())
{
    app.UseSwagger();
    app.UseSwaggerUI(options =>
    {
        options.SwaggerEndpoint("/swagger/v1/swagger.json", "TodoList API v1");
        options.RoutePrefix = string.Empty; 
    });
}

app.UseHttpsRedirection();

app.UseSerilogRequestLogging();

app.UseAuthorization();

app.MapControllers();

app.Run();
