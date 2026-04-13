using CareOps.Application.Abstractions;
using CareOps.Infrastructure.Persistence;
using Microsoft.Data.Sqlite;
using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.Configuration;
using Microsoft.Extensions.DependencyInjection;

namespace CareOps.Infrastructure;

public static class DependencyInjection
{
    public static IServiceCollection AddInfrastructure(this IServiceCollection services, IConfiguration configuration)
    {
        var raw = configuration.GetConnectionString("Default") ?? "Data Source=careops.db";
        var connectionString = NormalizeSqliteConnectionString(raw);

        services.AddDbContext<ApplicationDbContext>(options =>
            options.UseSqlite(connectionString, sql =>
                sql.UseQuerySplittingBehavior(QuerySplittingBehavior.SplitQuery)));

        services.AddScoped<IApplicationDbContext>(sp => sp.GetRequiredService<ApplicationDbContext>());

        return services;
    }

    /// <summary>
    /// Shared cache + busy timeout reduce "database is locked" under concurrent reads (health checks + API).
    /// </summary>
    private static string NormalizeSqliteConnectionString(string connectionString)
    {
        var builder = new SqliteConnectionStringBuilder(connectionString)
        {
            Cache = SqliteCacheMode.Shared,
            DefaultTimeout = 30,
        };
        return builder.ConnectionString;
    }
}
