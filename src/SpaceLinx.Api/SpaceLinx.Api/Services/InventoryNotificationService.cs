using Microsoft.EntityFrameworkCore;
using SpaceLinx.Api.Interfaces;
using Task = System.Threading.Tasks.Task;
using SpaceLinx.Model;

namespace SpaceLinx.Api.Services
{
    public class InventoryNotificationService : IInventoryNotificationService
    {
        private readonly SpaceLinxContext _spacelinxcontext;
        private readonly IEmailTemplateService _templateService;
        private readonly IEmailService _emailService;
        private readonly IEntityLinkHelper _entityLinkHelper;
        private readonly ILogger<InventoryNotificationService> _logger;

        public InventoryNotificationService(SpaceLinxContext spacelinxcontext, IEmailTemplateService templateService, IEmailService emailService,
            IEntityLinkHelper entityLinkHelper, ILogger<InventoryNotificationService> logger)
        {
            _spacelinxcontext = spacelinxcontext;
            _templateService = templateService;
            _emailService = emailService;
            _entityLinkHelper = entityLinkHelper;
            _logger = logger;
        }

        public async Task NotifyReorderLevelAsync(Guid inventoryPartId)
        {
            var inventoryPart = await GetInventoryPartAsync(inventoryPartId);
            if (inventoryPart == null) 
            {
                return;
            }

            int availableQty = inventoryPart.QtyOnhand - inventoryPart.QtyReserved - inventoryPart.QtyIssued - inventoryPart.QtyQcFailed - inventoryPart.QtyQcPending;

            if (availableQty > inventoryPart.ReorderLevel)
            {
                return;
            }

            var placeholders = BuildPlaceholders(inventoryPart, inventoryPartId, availableQty);

            var recipients = await GetRecipientsAsync(inventoryPart);

            foreach (var recipient in recipients)
            {
                placeholders["RecipientName"] = recipient.Name;

                var rendered = await _templateService.RenderTemplateAsync(EmailTemplateCode.InventoryReorderAlert, placeholders);

                if (rendered != null)
                {
                    await _emailService.QueueEmailAsync(
                        recipient.Email,
                        rendered.Subject,
                        rendered.Body,
                        rendered.IsHtml,
                        EmailTemplateCode.InventoryReorderAlert,
                        SpaceLinxEntities.InventoryPart,
                        inventoryPartId);
                }
            }

            _logger.LogInformation("Queued Inventory reorder notifications for InventoryPart {InventoryPartId} to {Count} recipients", inventoryPartId, recipients.Count);
        }

        private async Task<InventoryPart?> GetInventoryPartAsync(Guid inventoryPartId)
        {
            var part = await _spacelinxcontext.InventoryParts
                .Include(x => x.Part)
                .AsNoTracking()
                .FirstOrDefaultAsync(x => x.Id == inventoryPartId && x.DeletedBy == null);

            if (part == null)
            {
                _logger.LogWarning("InventoryPart not found for reorder notification: {Id}", inventoryPartId);
            }

            return part;
        }

        private async Task<List<EmailRecipient>> GetRecipientsAsync(InventoryPart inventoryPart)
        {
            var recipients = new List<EmailRecipient>();

            var user = await _spacelinxcontext.Users
                    .AsNoTracking()
                    .FirstOrDefaultAsync(u => u.Email.ToLower() == inventoryPart.CreatedBy.ToLower());

            if (user != null)
            {
                recipients.Add(new EmailRecipient(
                    user.Email,
                    $"{user.FirstName} {user.LastName}".Trim()));
            }

            return recipients;
        }

        private Dictionary<string, string> BuildPlaceholders(InventoryPart inventoryPart, Guid inventoryPartId, int availableQty)
        {
            return new Dictionary<string, string>
            {
                ["PartNumber"] = inventoryPart.Part.PartNumber,
                ["PartName"] = inventoryPart.Part.Name,
                ["AvailableQty"] = availableQty.ToString(),
                ["ReorderLevel"] = inventoryPart.ReorderLevel.ToString(),
                ["Status"] = "Below Reorder Level",
                ["Timestamp"] = DateTime.UtcNow.ToString("yyyy-MM-dd HH:mm:ss UTC"),
                ["RecordLink"] = _entityLinkHelper.GetRecordLink(SpaceLinxEntities.InventoryPart, inventoryPartId),
            };
        }

        private record EmailRecipient(string Email, string Name);
    }
}
