using Azure.Storage.Blobs;
using Microsoft.EntityFrameworkCore;
using SpaceLinx.Api.Audit;
using SpaceLinx.Api.BackgroundServices;
using SpaceLinx.Api.Interfaces;
using SpaceLinx.Api.Services;
using SpaceLinx.Model;
using StackExchange.Redis;

namespace SpaceLinx.Api.Configuration;

public static class ConfigureServices
{
    public static IServiceCollection AddServices(this IServiceCollection services,
        IConfiguration configuration)
    {
        //Add Services
        // Configure CORS from configuration (comma-separated string)
        var allowedOriginsConfig = configuration["Cors:AllowedOrigins"] ?? "";
        var allowedOrigins = allowedOriginsConfig
            .Split(',', StringSplitOptions.RemoveEmptyEntries | StringSplitOptions.TrimEntries)
            .ToArray();

        services.AddCors(options =>
        {
            options.AddPolicy("default", policy =>
            {
                if (allowedOrigins.Length > 0)
                {
                    policy.WithOrigins(allowedOrigins)
                        .AllowAnyHeader()
                        .AllowAnyMethod()
                        .AllowCredentials();
                }
            });
        });

        // Add memory cache services
        services.AddMemoryCache();
        services.AddHttpClient();

        // Add Redis distributed cache with fallback to in-memory cache
        var redisConnectionString = configuration["Redis:ConnectionString"];
        if (!string.IsNullOrEmpty(redisConnectionString))
        {
            services.AddStackExchangeRedisCache(options =>
            {
                options.Configuration = redisConnectionString;
                options.InstanceName = "SpaceLinx:";
            });

            // Register IConnectionMultiplexer for Redis operations (async with resilient config)
            services.AddSingleton<IConnectionMultiplexer>(sp =>
            {
                var options = ConfigurationOptions.Parse(redisConnectionString);
                options.AbortOnConnectFail = false; // Don't block startup if Redis is unavailable
                options.ConnectTimeout = 5000; // 5 second connection timeout
                options.SyncTimeout = 5000; // 5 second sync operation timeout
                options.AsyncTimeout = 5000; // 5 second async operation timeout
                return ConnectionMultiplexer.ConnectAsync(options).GetAwaiter().GetResult();
            });
        }
        else
        {
            // Fallback to in-memory cache if Redis is not configured
            services.AddDistributedMemoryCache();
        }

        // Register cache service
        services.AddScoped<ICacheService, CacheService>();

        // Add background task queue for async cache invalidation
        services.AddSingleton<IBackgroundTaskQueue, BackgroundTaskQueue>();
        services.AddHostedService<QueuedHostedService>();

        // BOM Cache Refresh scheduled service
        services.Configure<BomCacheRefreshOptions>(
            configuration.GetSection(BomCacheRefreshOptions.SectionName));
        services.AddScoped<IBomCacheRefreshService, BomCacheRefreshService>();
        services.AddHostedService<BomCacheRefreshHostedService>();

        // Part Cache Refresh scheduled service
        services.Configure<PartCacheRefreshOptions>(
            configuration.GetSection(PartCacheRefreshOptions.SectionName));
        services.AddScoped<IPartCacheRefreshService, PartCacheRefreshService>();
        services.AddHostedService<PartCacheRefreshHostedService>();

        // Office 365 User Sync scheduled service
        services.Configure<Office365UserSyncOptions>(
            configuration.GetSection(Office365UserSyncOptions.SectionName));
        services.AddScoped<IOffice365UserSyncService, Office365UserSyncService>();
        services.AddHostedService<Office365UserSyncHostedService>();

        var postgreConnectionString = configuration["PostgreSql:ConnectionString"];
        int poolSize = Convert.ToInt16(configuration["PostgreSql:PoolSize"]);
        services.AddHttpContextAccessor();

        // Platform audit trail: a singleton interceptor that centralizes audit-field stamping and
        // captures field-level change history into audit.change_log. Registered via the
        // IServiceProvider overload because AddDbContextPool reuses context instances.
        services.AddSingleton<SpaceLinxAuditInterceptor>();

        services.AddDbContextPool<SpaceLinxContext>((serviceProvider, options) =>
        {
            options.UseLoggerFactory(LoggerFactory.Create(builder => builder.AddConsole()));
            //options.UseQueryTrackingBehavior(QueryTrackingBehavior.NoTracking);
            //options.EnableThreadSafetyChecks(enableChecks: false);
            options.UseNpgsql(postgreConnectionString);
            options.AddInterceptors(serviceProvider.GetRequiredService<SpaceLinxAuditInterceptor>());
        }, poolSize
        );

        services.AddSingleton(provider =>
        {
            var connectionString = configuration["BlobStorage:ConnectionString"];
            var blobServiceClient = new BlobServiceClient(connectionString);
            return blobServiceClient;
        });

        services.AddScoped<IDocumentService, DocumentService>();
        services.AddScoped<IUserService, UserService>();
        services.AddScoped<IImageService, ImageService>();
        services.AddScoped<IVideoService, VideoService>();
        services.AddScoped<IGuideService, GuideService>();
        services.AddScoped<IWorkOrderService, WorkOrderService>();
        services.AddScoped<IWorkOrderTaskService, WorkOrderTaskService>();
        services.AddScoped<IBulkUploadService, BulkUploadService>();
        services.AddScoped<IPartService, PartService>();
        services.AddScoped<IEcoPartService, EcoPartService>();
        services.AddScoped<IEcoService, EcoService>();
        services.AddScoped<IGoodsReceiptNoteService, GoodsReceiptNoteService>();
        services.AddScoped<IStockMovementService, StockMovementService>();
        services.AddScoped<IJiraService, JiraService>();

        // DigiKey API Integration
        services.Configure<DigiKeyOptions>(configuration.GetSection(DigiKeyOptions.SectionName));
        services.AddHttpClient<IDigiKeyService, DigiKeyService>();

        services.AddScoped<IBomService, BomService>();
        services.AddScoped<IPartCacheService, PartCacheService>();
        services.AddScoped<IApprovalService, ApprovalService>();
        services.AddScoped<IApprovalNotificationService, ApprovalNotificationService>();
        services.AddScoped<IRequisitionApprovalService, RequisitionApprovalService>();
        services.AddScoped<IPurchaseOrderApprovalService, PurchaseOrderApprovalService>();
        services.AddScoped<IPurchaseOrderService, PurchaseOrderService>();

        // Tender Services
        services.AddScoped<ITenderService, TenderService>();
        services.AddScoped<ITenderApprovalService, TenderApprovalService>();

        // Email Services
        services.Configure<EmailOptions>(configuration.GetSection(EmailOptions.SectionName));
        services.Configure<GraphEmailOptions>(configuration.GetSection(GraphEmailOptions.SectionName));
        services.Configure<SmtpOptions>(configuration.GetSection(SmtpOptions.SectionName));

        // Register individual email providers
        services.AddScoped<IGraphEmailService, GraphEmailService>();
        services.AddScoped<ISmtpEmailService, SmtpEmailService>();

        // Register composite email service (Graph primary, SMTP fallback)
        services.AddScoped<IEmailService, EmailService>();

        services.AddScoped<IEmailTemplateService, EmailTemplateService>();
        services.AddScoped<IEcoNotificationService, EcoNotificationService>();
        services.AddScoped<IInventoryNotificationService, InventoryNotificationService>();
        services.AddScoped<IEntityLinkHelper, EntityLinkHelper>();

        return services;
    }
}
