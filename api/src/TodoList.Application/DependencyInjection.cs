using Microsoft.Extensions.DependencyInjection;
using TodoList.Application.Tasks.Commands;
using System.Diagnostics.CodeAnalysis;

namespace TodoList.Application;

[ExcludeFromCodeCoverage]
public static class DependencyInjection
{
    public static IServiceCollection AddApplication(this IServiceCollection services)
    {
        services.AddMediatR(cfg =>
            cfg.RegisterServicesFromAssembly(typeof(CreateTaskCommand).Assembly));

        return services;
    }
}
