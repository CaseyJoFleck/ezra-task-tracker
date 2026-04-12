using CareOps.Application.Members;
using CareOps.Application.Tasks;
using FluentValidation;
using Microsoft.Extensions.DependencyInjection;

namespace CareOps.Application;

public static class DependencyInjection
{
    public static IServiceCollection AddApplication(this IServiceCollection services)
    {
        services.AddScoped<IMemberService, MemberService>();
        services.AddScoped<ITaskService, TaskService>();
        services.AddValidatorsFromAssembly(typeof(DependencyInjection).Assembly);
        return services;
    }
}
