using Microsoft.Extensions.Options;
using SpaceLinx.Api.Configuration;
using SpaceLinx.Model;

namespace SpaceLinx.Api.Services;

/// <summary>
/// Helper service for generating frontend URLs to specific entity records.
/// Used in email templates to provide direct links to records.
/// </summary>
public interface IEntityLinkHelper
{
    /// <summary>
    /// Generates a direct link to view a specific entity record in the frontend.
    /// </summary>
    /// <param name="entityType">The type of entity (e.g., "Eco", "Requisition", "PurchaseOrder")</param>
    /// <param name="entityId">The unique identifier of the entity</param>
    /// <returns>Full URL to the record, or empty string if URL cannot be generated</returns>
    string GetRecordLink(string entityType, Guid entityId);
}

public class EntityLinkHelper : IEntityLinkHelper
{
    private readonly string _frontendBaseUrl;
    private readonly ILogger<EntityLinkHelper> _logger;

    // Route mappings for each entity type
    private static readonly Dictionary<string, string> EntityRoutes = new(StringComparer.OrdinalIgnoreCase)
    {
        [SpaceLinxEntities.Eco] = "/plm/eco/{0}",
        [SpaceLinxEntities.InventoryPart] = "/inventory/parts/{0}",
        [SpaceLinxEntities.Requisition] = "/procurement/requisitions/{0}",
        [SpaceLinxEntities.PurchaseOrder] = "/procurement/purchaseorders/{0}",
        [SpaceLinxEntities.Tender] = "/procurement/tenders/{0}",
        [SpaceLinxEntities.Part] = "/plm/parts/{0}",
        [SpaceLinxEntities.Product] = "/plm/products/{0}",
        [SpaceLinxEntities.GoodsReceiptNote] = "/procurement/grn/{0}",
        [SpaceLinxEntities.VendorReturnRequest] = "/procurement/vendor-returns/{0}",
        [SpaceLinxEntities.ScrapRequest] = "/inventory/scrap-requests/{0}",
        [SpaceLinxEntities.MaterialKit] = "/mes/materialkits/{0}",
        [SpaceLinxEntities.Staff] = "/admin/staff/{0}",
        [SpaceLinxEntities.Organization] = "/admin/organizations/{0}"
    };

    public EntityLinkHelper(IOptions<EmailOptions> emailOptions, ILogger<EntityLinkHelper> logger)
    {
        _frontendBaseUrl = emailOptions.Value.FrontendBaseUrl?.TrimEnd('/') ?? string.Empty;
        _logger = logger;
    }

    public string GetRecordLink(string entityType, Guid entityId)
    {
        if (string.IsNullOrEmpty(_frontendBaseUrl))
        {
            _logger.LogWarning("FrontendBaseUrl is not configured. Cannot generate record link for {EntityType} {EntityId}",
                entityType, entityId);
            return string.Empty;
        }

        if (string.IsNullOrEmpty(entityType))
        {
            _logger.LogWarning("EntityType is empty. Cannot generate record link for {EntityId}", entityId);
            return string.Empty;
        }

        if (entityId == Guid.Empty)
        {
            _logger.LogWarning("EntityId is empty. Cannot generate record link for {EntityType}", entityType);
            return string.Empty;
        }

        if (!EntityRoutes.TryGetValue(entityType, out var routeTemplate))
        {
            _logger.LogWarning("No route mapping found for entity type: {EntityType}", entityType);
            return string.Empty;
        }

        var relativePath = string.Format(routeTemplate, entityId);
        return $"{_frontendBaseUrl}{relativePath}";
    }
}
