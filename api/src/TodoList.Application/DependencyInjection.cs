using Microsoft.Extensions.DependencyInjection;
using TodoList.Application.Tasks.Commands;

namespace TodoList.Application;

public static class DependencyInjection
{
    public static IServiceCollection AddApplication(this IServiceCollection services)
    {
        services.AddMediatR(cfg =>
            cfg.RegisterServicesFromAssembly(typeof(CreateTaskCommand).Assembly));

        return services;
    }
}
