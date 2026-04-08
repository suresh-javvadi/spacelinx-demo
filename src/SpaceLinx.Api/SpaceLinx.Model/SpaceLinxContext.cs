using Microsoft.EntityFrameworkCore;

namespace SpaceLinx.Model;

public partial class SpaceLinxContext : DbContext
{
    public SpaceLinxContext()
    {
    }

    public SpaceLinxContext(DbContextOptions<SpaceLinxContext> options)
        : base(options)
    {
    }

    public virtual DbSet<Address> Addresses { get; set; }

    public virtual DbSet<AdditionalRecipientConfiguration> AdditionalRecipientConfigurations { get; set; }

    public virtual DbSet<App> Apps { get; set; }

    public virtual DbSet<Approval> Approvals { get; set; }

    public virtual DbSet<ApprovalConfiguration> ApprovalConfigurations { get; set; }

    public virtual DbSet<ApprovalLog> ApprovalLogs { get; set; }

    public virtual DbSet<ApprovalNotificationRecipient> ApprovalNotificationRecipients { get; set; }

    public virtual DbSet<AssemblyLocation> AssemblyLocations { get; set; }

    public virtual DbSet<BankAccount> BankAccounts { get; set; }

    public virtual DbSet<BinManagement> BinManagements { get; set; }

    public virtual DbSet<BulkUpload> BulkUploads { get; set; }

    public virtual DbSet<Contact> Contacts { get; set; }

    public virtual DbSet<Company> Companies { get; set; }

    public virtual DbSet<CompanyAddress> CompanyAddresses { get; set; }

    public virtual DbSet<CompanyBankAccount> CompanyBankAccounts { get; set; }

    public virtual DbSet<CompanyContact> CompanyContacts { get; set; }

    public virtual DbSet<CompanyPart> CompanyParts { get; set; }

    public virtual DbSet<CompanyWithOrganizationVw> CompanyWithOrganizationVws { get; set; }

    public virtual DbSet<Country> Countries { get; set; }

    public virtual DbSet<Currency> Currencies { get; set; }

    public virtual DbSet<Department> Departments { get; set; }

    public virtual DbSet<Customer> Customers { get; set; }

    public virtual DbSet<Document> Documents { get; set; }

    public virtual DbSet<DocumentWithUsersVw> DocumentWithUsersVws { get; set; }

    public virtual DbSet<Ebom> Eboms { get; set; }

    public virtual DbSet<Eco> Ecos { get; set; }

    public virtual DbSet<EcoLog> EcoLogs { get; set; }

    public virtual DbSet<EcoPart> EcoParts { get; set; }

    public virtual DbSet<EcoWithUsersVw> EcoWithUsersVws { get; set; }

    public virtual DbSet<EmailLog> EmailLogs { get; set; }

    public virtual DbSet<EmailTemplate> EmailTemplates { get; set; }

    public virtual DbSet<FeatureBit> FeatureBits { get; set; }

    public virtual DbSet<GoodsReceiptNote> GoodsReceiptNotes { get; set; }

    public virtual DbSet<GrnLineItem> GrnLineItems { get; set; }

    public virtual DbSet<GrnWithUserVw> GrnWithUserVws { get; set; }

    public virtual DbSet<GrnsByPurchaseOrderVw> GrnsByPurchaseOrderVws { get; set; }

    public virtual DbSet<Guide> Guides { get; set; }

    public virtual DbSet<GuideCheckOutHistory> GuideCheckOutHistories { get; set; }

    public virtual DbSet<GuideEbom> GuideEboms { get; set; }

    public virtual DbSet<GuideMbom> GuideMboms { get; set; }

    public virtual DbSet<GuideMbomDetail> GuideMbomDetails { get; set; }

    public virtual DbSet<GuideMbomVw> GuideMbomVws { get; set; }

    public virtual DbSet<GuideStep> GuideSteps { get; set; }

    public virtual DbSet<GuideStepEquipment> GuideStepEquipments { get; set; }

    public virtual DbSet<GuideStepTask> GuideStepTasks { get; set; }

    public virtual DbSet<GuideType> GuideTypes { get; set; }

    public virtual DbSet<Image> Images { get; set; }

    public virtual DbSet<InventoryGoodsVw> InventoryGoodsVws { get; set; }

    public virtual DbSet<InventoryPart> InventoryParts { get; set; }

    public virtual DbSet<InventoryPartPriceVw> InventoryPartPriceVws { get; set; }

    public virtual DbSet<InventoryPartVw> InventoryPartVws { get; set; }

    public virtual DbSet<InventoryServicesVw> InventoryServicesVws { get; set; }

    public virtual DbSet<InventoryStock> InventoryStocks { get; set; }

    public virtual DbSet<InventoryTransaction> InventoryTransactions { get; set; }

    public virtual DbSet<InventoryTransactionVw> InventoryTransactionVws { get; set; }

    public virtual DbSet<Issue> Issues { get; set; }

    public virtual DbSet<IssueHistoryVw> IssueHistoryVws { get; set; }

    public virtual DbSet<Kit> Kits { get; set; }

    public virtual DbSet<KitBomComment> KitBomComments { get; set; }

    public virtual DbSet<KitSerial> KitSerials { get; set; }

    public virtual DbSet<Location> Locations { get; set; }

    public virtual DbSet<Machine> Machines { get; set; }

    public virtual DbSet<MachineType> MachineTypes { get; set; }

    public virtual DbSet<MaterialKit> MaterialKits { get; set; }

    public virtual DbSet<Milestone> Milestones { get; set; }

    public virtual DbSet<News> News { get; set; }

    public virtual DbSet<NewsType> NewsTypes { get; set; }

    public virtual DbSet<OptionSet> OptionSets { get; set; }

    public virtual DbSet<Organization> Organizations { get; set; }

    public virtual DbSet<OrganizationAddress> OrganizationAddresses { get; set; }

    public virtual DbSet<Part> Parts { get; set; }

    public virtual DbSet<PartLevel> PartLevels { get; set; }

    public virtual DbSet<PartType> PartTypes { get; set; }

    public virtual DbSet<PartTypeCategory> PartTypeCategories { get; set; }

    public virtual DbSet<PartsNotAssociatedWithGuide> PartsNotAssociatedWithGuides { get; set; }

    public virtual DbSet<PaymentTerm> PaymentTerms { get; set; }

    public virtual DbSet<Permission> Permissions { get; set; }

    public virtual DbSet<Platform> Platforms { get; set; }

    public virtual DbSet<PoLineItem> PoLineItems { get; set; }

    public virtual DbSet<Product> Products { get; set; }

    public virtual DbSet<Program> Programs { get; set; }

    public virtual DbSet<Project> Projects { get; set; }

    public virtual DbSet<PurchaseHistoryVw> PurchaseHistoryVws { get; set; }

    public virtual DbSet<PurchaseOrder> PurchaseOrders { get; set; }

    public virtual DbSet<PurchaseOrdersVw> PurchaseOrdersVws { get; set; }

    public virtual DbSet<Requisition> Requisitions { get; set; }

    public virtual DbSet<RequisitionLineItem> RequisitionLineItems { get; set; }

    public virtual DbSet<RequisitionsWithUserVw> RequisitionsWithUserVws { get; set; }

    public virtual DbSet<Role> Roles { get; set; }

    public virtual DbSet<RoleFilter> RoleFilters { get; set; }

    public virtual DbSet<RolePermission> RolePermissions { get; set; }

    public virtual DbSet<ScrapLineItem> ScrapLineItems { get; set; }

    public virtual DbSet<ScrapRequest> ScrapRequests { get; set; }

    public virtual DbSet<ScrapRequestWithUserVw> ScrapRequestWithUserVws { get; set; }

    public virtual DbSet<StockMovement> StockMovements { get; set; }

    public virtual DbSet<StockMovementLineItem> StockMovementLineItems { get; set; }

    public virtual DbSet<StockMovementWithUserVw> StockMovementWithUserVws { get; set; }

    public virtual DbSet<Staff> Staff { get; set; }

    public virtual DbSet<Subsystem> Subsystems { get; set; }

    public virtual DbSet<Task> Tasks { get; set; }

    public virtual DbSet<TaskDependency> TaskDependencies { get; set; }

    public virtual DbSet<TaskAssignee> TaskAssignees { get; set; }

    public virtual DbSet<TaskComment> TaskComments { get; set; }

    public virtual DbSet<TaskActivity> TaskActivities { get; set; }

    public virtual DbSet<TaskGanttVw> TaskGanttVws { get; set; }

    public virtual DbSet<BoardColumn> BoardColumns { get; set; }

    public virtual DbSet<TimeEntry> TimeEntries { get; set; }

    public virtual DbSet<DashboardWidget> DashboardWidgets { get; set; }

    public virtual DbSet<ResourceAllocation> ResourceAllocations { get; set; }

    public virtual DbSet<ResourceWorkloadVw> ResourceWorkloadVws { get; set; }

    public virtual DbSet<Tool> Tools { get; set; }

    public virtual DbSet<ToolType> ToolTypes { get; set; }

    public virtual DbSet<UnitOfMeasure> UnitOfMeasures { get; set; }

    public virtual DbSet<User> Users { get; set; }

    public virtual DbSet<UserRole> UserRoles { get; set; }

    public virtual DbSet<VendorReturnLineItem> VendorReturnLineItems { get; set; }

    public virtual DbSet<VendorReturnRequest> VendorReturnRequests { get; set; }

    public virtual DbSet<VendorReturnRequestWithUserVw> VendorReturnRequestWithUserVws { get; set; }

    public virtual DbSet<Video> Videos { get; set; }

    public virtual DbSet<WorkOrder> WorkOrders { get; set; }

    public virtual DbSet<WorkOrderStep> WorkOrderSteps { get; set; }

    public virtual DbSet<WorkOrderTask> WorkOrderTasks { get; set; }

    public virtual DbSet<WorkPackage> WorkPackages { get; set; }

    public virtual DbSet<Workorderguidestepsview> Workorderguidestepsviews { get; set; }

    public virtual DbSet<Tender> Tenders { get; set; }

    public virtual DbSet<TenderLineItem> TenderLineItems { get; set; }

    public virtual DbSet<TenderVendor> TenderVendors { get; set; }

    public virtual DbSet<TenderQuotation> TenderQuotations { get; set; }

    public virtual DbSet<TenderQuotationLineItem> TenderQuotationLineItems { get; set; }

    protected override void OnModelCreating(ModelBuilder modelBuilder)
    {
        modelBuilder.Entity<Address>(entity =>
        {
            entity.HasKey(e => e.Id).HasName("address_pkey");

            entity.ToTable("address", "common");

            entity.Property(e => e.Id)
                .HasDefaultValueSql("gen_random_uuid()")
                .HasColumnName("id");
            entity.Property(e => e.AddressLine1)
                .HasMaxLength(255)
                .HasColumnName("address_line1");
            entity.Property(e => e.AddressLine2)
                .HasMaxLength(255)
                .HasColumnName("address_line2");
            entity.Property(e => e.City)
                .HasMaxLength(100)
                .HasColumnName("city");
            entity.Property(e => e.CountryId).HasColumnName("country_id");
            entity.Property(e => e.CreatedAt)
                .HasDefaultValueSql("CURRENT_TIMESTAMP")
                .HasColumnName("created_at");
            entity.Property(e => e.CreatedBy)
                .HasMaxLength(255)
                .HasColumnName("created_by");
            entity.Property(e => e.DeletedAt).HasColumnName("deleted_at");
            entity.Property(e => e.DeletedBy)
                .HasMaxLength(255)
                .HasColumnName("deleted_by");
            entity.Property(e => e.IsActive)
                .HasDefaultValue(true)
                .HasColumnName("is_active");
            entity.Property(e => e.Latitude)
                .HasPrecision(9, 6)
                .HasColumnName("latitude");
            entity.Property(e => e.Longitude)
                .HasPrecision(9, 6)
                .HasColumnName("longitude");
            entity.Property(e => e.PhoneNumber)
                .HasMaxLength(20)
                .HasColumnName("phone_number");
            entity.Property(e => e.PostalCode)
                .HasMaxLength(20)
                .HasColumnName("postal_code");
            entity.Property(e => e.State)
                .HasMaxLength(100)
                .HasColumnName("state");
            entity.Property(e => e.UpdatedAt).HasColumnName("updated_at");
            entity.Property(e => e.UpdatedBy)
                .HasMaxLength(255)
                .HasColumnName("updated_by");
        });

        modelBuilder.Entity<App>(entity =>
        {
            entity.HasKey(e => e.Id).HasName("app_pkey");

            entity.ToTable("app", "application");

            entity.HasIndex(e => e.AppName, "app_app_name_key").IsUnique();

            entity.HasIndex(e => e.AppNumber, "app_app_number_key").IsUnique();

            entity.Property(e => e.Id)
                .HasDefaultValueSql("gen_random_uuid()")
                .HasColumnName("id");
            entity.Property(e => e.AppName)
                .HasMaxLength(255)
                .HasColumnName("app_name");
            entity.Property(e => e.AppNumber)
                .ValueGeneratedOnAdd()
                .HasColumnName("app_number");
            entity.Property(e => e.CreatedAt)
                .HasDefaultValueSql("CURRENT_TIMESTAMP")
                .HasColumnName("created_at");
            entity.Property(e => e.CreatedBy)
                .HasMaxLength(255)
                .HasColumnName("created_by");
            entity.Property(e => e.DeletedAt).HasColumnName("deleted_at");
            entity.Property(e => e.DeletedBy)
                .HasMaxLength(255)
                .HasColumnName("deleted_by");
            entity.Property(e => e.Description).HasColumnName("description");
            entity.Property(e => e.IsActive)
                .HasDefaultValue(true)
                .HasColumnName("is_active");
            entity.Property(e => e.UpdatedAt).HasColumnName("updated_at");
            entity.Property(e => e.UpdatedBy)
                .HasMaxLength(255)
                .HasColumnName("updated_by");
        });

        modelBuilder.Entity<Approval>(entity =>
        {
            entity.HasKey(e => e.Id).HasName("approval_pkey");

            entity.ToTable("approval", "common");

            entity.HasIndex(e => new { e.EntityId, e.StageNumber, e.ApproverId, e.DeletedAt }, "approval_entity_id_stage_number_approver_id_deleted_at_key").IsUnique();

            entity.Property(e => e.Id)
                .HasDefaultValueSql("gen_random_uuid()")
                .HasColumnName("id");
            entity.Property(e => e.ActedAt).HasColumnName("acted_at");
            entity.Property(e => e.ApproverId).HasColumnName("approver_id");
            entity.Property(e => e.Comment).HasColumnName("comment");
            entity.Property(e => e.CreatedAt)
                .HasDefaultValueSql("CURRENT_TIMESTAMP")
                .HasColumnName("created_at");
            entity.Property(e => e.CreatedBy)
                .HasMaxLength(255)
                .HasColumnName("created_by");
            entity.Property(e => e.DeletedAt).HasColumnName("deleted_at");
            entity.Property(e => e.DeletedBy)
                .HasMaxLength(255)
                .HasColumnName("deleted_by");
            entity.Property(e => e.EntityId).HasColumnName("entity_id");
            entity.Property(e => e.EntityType)
                .HasMaxLength(255)
                .HasColumnName("entity_type");
            entity.Property(e => e.IsActive)
                .HasDefaultValue(true)
                .HasColumnName("is_active");
            entity.Property(e => e.StageNumber).HasColumnName("stage_number");
            entity.Property(e => e.Status)
                .HasMaxLength(255)
                .HasDefaultValueSql("'Pending'::character varying")
                .HasColumnName("status");
            entity.Property(e => e.UpdatedAt).HasColumnName("updated_at");
            entity.Property(e => e.UpdatedBy)
                .HasMaxLength(255)
                .HasColumnName("updated_by");
        });

        modelBuilder.Entity<ApprovalConfiguration>(entity =>
        {
            entity.HasKey(e => e.Id).HasName("approval_configuration_pkey");

            entity.ToTable("approval_configuration", "common");

            entity.HasIndex(e => e.EntityType, "idx_approval_configuration_entity_type").HasFilter("(deleted_at IS NULL)");

            entity.HasIndex(e => new { e.EntityType, e.DeletedAt }, "uq_approval_configuration_entity_type").IsUnique();

            entity.Property(e => e.Id)
                .HasDefaultValueSql("gen_random_uuid()")
                .HasColumnName("id");
            entity.Property(e => e.CreatedAt)
                .HasDefaultValueSql("CURRENT_TIMESTAMP")
                .HasColumnName("created_at");
            entity.Property(e => e.CreatedBy)
                .HasMaxLength(255)
                .HasColumnName("created_by");
            entity.Property(e => e.DeletedAt).HasColumnName("deleted_at");
            entity.Property(e => e.DeletedBy)
                .HasMaxLength(255)
                .HasColumnName("deleted_by");
            entity.Property(e => e.Description).HasColumnName("description");
            entity.Property(e => e.EntityType)
                .HasMaxLength(100)
                .HasColumnName("entity_type");
            entity.Property(e => e.IsActive)
                .HasDefaultValue(true)
                .HasColumnName("is_active");
            entity.Property(e => e.NumberOfLevels)
                .HasDefaultValue(1)
                .HasColumnName("number_of_levels");
            entity.Property(e => e.RequireSequentialApproval)
                .HasDefaultValue(true)
                .HasColumnName("require_sequential_approval");
            entity.Property(e => e.UpdatedAt).HasColumnName("updated_at");
            entity.Property(e => e.UpdatedBy)
                .HasMaxLength(255)
                .HasColumnName("updated_by");
        });

        modelBuilder.Entity<ApprovalLog>(entity =>
        {
            entity.HasKey(e => e.Id).HasName("approval_log_pkey");

            entity.ToTable("approval_log", "common");

            entity.HasIndex(e => e.ActionAt, "idx_approval_log_action_at").IsDescending();

            entity.HasIndex(e => new { e.EntityType, e.EntityId }, "idx_approval_log_entity");

            entity.Property(e => e.Id)
                .HasDefaultValueSql("gen_random_uuid()")
                .HasColumnName("id");
            entity.Property(e => e.Action)
                .HasMaxLength(50)
                .HasColumnName("action");
            entity.Property(e => e.ActionAt)
                .HasDefaultValueSql("CURRENT_TIMESTAMP")
                .HasColumnName("action_at");
            entity.Property(e => e.ActionBy)
                .HasMaxLength(255)
                .HasColumnName("action_by");
            entity.Property(e => e.CreatedAt)
                .HasDefaultValueSql("CURRENT_TIMESTAMP")
                .HasColumnName("created_at");
            entity.Property(e => e.CreatedBy)
                .HasMaxLength(255)
                .HasColumnName("created_by");
            entity.Property(e => e.DeletedAt).HasColumnName("deleted_at");
            entity.Property(e => e.DeletedBy)
                .HasMaxLength(255)
                .HasColumnName("deleted_by");
            entity.Property(e => e.EntityId).HasColumnName("entity_id");
            entity.Property(e => e.EntityType)
                .HasMaxLength(100)
                .HasColumnName("entity_type");
            entity.Property(e => e.IsActive)
                .HasDefaultValue(true)
                .HasColumnName("is_active");
            entity.Property(e => e.NewStatus)
                .HasMaxLength(50)
                .HasColumnName("new_status");
            entity.Property(e => e.Notes).HasColumnName("notes");
            entity.Property(e => e.PreviousStatus)
                .HasMaxLength(50)
                .HasColumnName("previous_status");
            entity.Property(e => e.StageNumber).HasColumnName("stage_number");
            entity.Property(e => e.UpdatedAt).HasColumnName("updated_at");
            entity.Property(e => e.UpdatedBy)
                .HasMaxLength(255)
                .HasColumnName("updated_by");
        });

        modelBuilder.Entity<ApprovalNotificationRecipient>(entity =>
        {
            entity.HasKey(e => e.Id).HasName("approval_notification_recipient_pkey");

            entity.ToTable("approval_notification_recipient", "common");

            entity.HasIndex(e => new { e.EntityType, e.EntityId }, "idx_approval_notification_recipient_entity").HasFilter("(deleted_at IS NULL)");

            entity.HasIndex(e => e.RecipientUserId, "idx_approval_notification_recipient_user");

            entity.Property(e => e.Id)
                .HasDefaultValueSql("gen_random_uuid()")
                .HasColumnName("id");
            entity.Property(e => e.CreatedAt)
                .HasDefaultValueSql("CURRENT_TIMESTAMP")
                .HasColumnName("created_at");
            entity.Property(e => e.CreatedBy)
                .HasMaxLength(255)
                .HasColumnName("created_by");
            entity.Property(e => e.DeletedAt).HasColumnName("deleted_at");
            entity.Property(e => e.DeletedBy)
                .HasMaxLength(255)
                .HasColumnName("deleted_by");
            entity.Property(e => e.EntityId).HasColumnName("entity_id");
            entity.Property(e => e.EntityType)
                .HasMaxLength(100)
                .HasColumnName("entity_type");
            entity.Property(e => e.IsActive)
                .HasDefaultValue(true)
                .HasColumnName("is_active");
            entity.Property(e => e.RecipientType)
                .HasMaxLength(50)
                .HasColumnName("recipient_type");
            entity.Property(e => e.RecipientUserId).HasColumnName("recipient_user_id");
            entity.Property(e => e.UpdatedAt).HasColumnName("updated_at");
            entity.Property(e => e.UpdatedBy)
                .HasMaxLength(255)
                .HasColumnName("updated_by");

            entity.HasOne(d => d.RecipientUser).WithMany(p => p.ApprovalNotificationRecipients)
                .HasForeignKey(d => d.RecipientUserId)
                .HasConstraintName("fk_approval_notification_recipient_user");
        });

        modelBuilder.Entity<AdditionalRecipientConfiguration>(entity =>
        {
            entity.HasKey(e => e.Id).HasName("additional_recipient_configuration_pkey");

            entity.ToTable("additional_recipient_configuration", "common");

            entity.HasIndex(e => e.TemplateCode, "idx_additional_recipient_config_template").HasFilter("(deleted_at IS NULL)");

            entity.Property(e => e.Id)
                .HasDefaultValueSql("gen_random_uuid()")
                .HasColumnName("id");
            entity.Property(e => e.CreatedAt)
                .HasDefaultValueSql("CURRENT_TIMESTAMP")
                .HasColumnName("created_at");
            entity.Property(e => e.CreatedBy)
                .HasMaxLength(255)
                .HasColumnName("created_by");
            entity.Property(e => e.DeletedAt).HasColumnName("deleted_at");
            entity.Property(e => e.DeletedBy)
                .HasMaxLength(255)
                .HasColumnName("deleted_by");
            entity.Property(e => e.Email)
                .HasMaxLength(255)
                .HasColumnName("email");
            entity.Property(e => e.IsActive)
                .HasDefaultValue(true)
                .HasColumnName("is_active");
            entity.Property(e => e.RecipientName)
                .HasMaxLength(255)
                .HasColumnName("recipient_name");
            entity.Property(e => e.RecipientType)
                .HasMaxLength(50)
                .HasColumnName("recipient_type");
            entity.Property(e => e.TemplateCode)
                .HasMaxLength(100)
                .HasColumnName("template_code");
            entity.Property(e => e.UpdatedAt).HasColumnName("updated_at");
            entity.Property(e => e.UpdatedBy)
                .HasMaxLength(255)
                .HasColumnName("updated_by");
        });

        modelBuilder.Entity<AssemblyLocation>(entity =>
        {
            entity.HasKey(e => e.Id).HasName("assembly_location_pkey");

            entity.ToTable("assembly_location", "mes");

            entity.Property(e => e.Id)
                .HasDefaultValueSql("gen_random_uuid()")
                .HasColumnName("id");
            entity.Property(e => e.CreatedAt)
                .HasDefaultValueSql("CURRENT_TIMESTAMP")
                .HasColumnName("created_at");
            entity.Property(e => e.CreatedBy)
                .HasMaxLength(255)
                .HasColumnName("created_by");
            entity.Property(e => e.DeletedAt).HasColumnName("deleted_at");
            entity.Property(e => e.DeletedBy)
                .HasMaxLength(255)
                .HasColumnName("deleted_by");
            entity.Property(e => e.Description).HasColumnName("description");
            entity.Property(e => e.IsActive)
                .HasDefaultValue(true)
                .HasColumnName("is_active");
            entity.Property(e => e.Name)
                .HasMaxLength(255)
                .HasColumnName("name");
            entity.Property(e => e.UpdatedAt).HasColumnName("updated_at");
            entity.Property(e => e.UpdatedBy)
                .HasMaxLength(255)
                .HasColumnName("updated_by");
        });

        modelBuilder.Entity<BankAccount>(entity =>
        {
            entity.HasKey(e => e.Id).HasName("bank_account_pkey");

            entity.ToTable("bank_account", "common");

            entity.Property(e => e.Id)
                .HasDefaultValueSql("gen_random_uuid()")
                .HasColumnName("id");
            entity.Property(e => e.AccountNumber)
                .HasMaxLength(100)
                .HasColumnName("account_number");
            entity.Property(e => e.AddressId).HasColumnName("address_id");
            entity.Property(e => e.BankName)
                .HasMaxLength(255)
                .HasColumnName("bank_name");
            entity.Property(e => e.BranchName)
                .HasMaxLength(255)
                .HasColumnName("branch_name");
            entity.Property(e => e.CreatedAt)
                .HasDefaultValueSql("CURRENT_TIMESTAMP")
                .HasColumnName("created_at");
            entity.Property(e => e.CreatedBy)
                .HasMaxLength(255)
                .HasColumnName("created_by");
            entity.Property(e => e.CurrencyId).HasColumnName("currency_id");
            entity.Property(e => e.DeletedAt).HasColumnName("deleted_at");
            entity.Property(e => e.DeletedBy)
                .HasMaxLength(255)
                .HasColumnName("deleted_by");
            entity.Property(e => e.IfscCode)
                .HasMaxLength(20)
                .HasColumnName("ifsc_code");
            entity.Property(e => e.IsActive)
                .HasDefaultValue(true)
                .HasColumnName("is_active");
            entity.Property(e => e.SwiftCode)
                .HasMaxLength(20)
                .HasColumnName("swift_code");
            entity.Property(e => e.UpdatedAt).HasColumnName("updated_at");
            entity.Property(e => e.UpdatedBy)
                .HasMaxLength(255)
                .HasColumnName("updated_by");

            entity.HasOne(d => d.Address).WithMany(p => p.BankAccounts)
                .HasForeignKey(d => d.AddressId)
                .OnDelete(DeleteBehavior.SetNull)
                .HasConstraintName("bank_account_address_id_fkey");

            entity.HasOne(d => d.Currency).WithMany(p => p.BankAccounts)
                .HasForeignKey(d => d.CurrencyId)
                .OnDelete(DeleteBehavior.SetNull)
                .HasConstraintName("bank_account_currency_id_fkey");
        });

        modelBuilder.Entity<BinManagement>(entity =>
        {
            entity.HasKey(e => e.Id).HasName("bin_management_pkey");

            entity.ToTable("bin_management", "sc");

            entity.Property(e => e.Id)
                .HasDefaultValueSql("gen_random_uuid()")
                .HasColumnName("id");
            entity.Property(e => e.Aisle)
                .HasMaxLength(255)
                .HasColumnName("aisle");
            entity.Property(e => e.BinCode)
                .HasMaxLength(225)
                .HasColumnName("bin_code");
            entity.Property(e => e.Capacity).HasColumnName("capacity");
            entity.Property(e => e.CreatedAt)
                .HasDefaultValueSql("CURRENT_TIMESTAMP")
                .HasColumnName("created_at");
            entity.Property(e => e.CreatedBy)
                .HasMaxLength(255)
                .HasColumnName("created_by");
            entity.Property(e => e.DeletedAt).HasColumnName("deleted_at");
            entity.Property(e => e.DeletedBy)
                .HasMaxLength(255)
                .HasColumnName("deleted_by");
            entity.Property(e => e.IsActive)
                .HasDefaultValue(true)
                .HasColumnName("is_active");
            entity.Property(e => e.LocationId).HasColumnName("location_id");
            entity.Property(e => e.Rack)
                .HasMaxLength(255)
                .HasColumnName("rack");
            entity.Property(e => e.UnitOfMeasureId).HasColumnName("unit_of_measure_id");
            entity.Property(e => e.UpdatedAt).HasColumnName("updated_at");
            entity.Property(e => e.UpdatedBy)
                .HasMaxLength(255)
                .HasColumnName("updated_by");

            entity.HasOne(d => d.Location).WithMany(p => p.BinManagements)
                .HasForeignKey(d => d.LocationId)
                .OnDelete(DeleteBehavior.SetNull)
                .HasConstraintName("bin_management_location_id_fkey");

            entity.HasOne(d => d.UnitOfMeasure).WithMany(p => p.BinManagements)
                .HasForeignKey(d => d.UnitOfMeasureId)
                .OnDelete(DeleteBehavior.SetNull)
                .HasConstraintName("bin_management_unit_of_measure_id_fkey");
        });

        modelBuilder.Entity<BulkUpload>(entity =>
        {
            entity.HasKey(e => e.Id).HasName("bulk_upload_pkey");

            entity.ToTable("bulk_upload", "application");

            entity.Property(e => e.Id)
                .HasDefaultValueSql("gen_random_uuid()")
                .HasColumnName("id");
            entity.Property(e => e.ApplicationName)
                .HasMaxLength(255)
                .HasDefaultValueSql("'All'::character varying")
                .HasColumnName("application_name");
            entity.Property(e => e.CreatedAt)
                .HasDefaultValueSql("CURRENT_TIMESTAMP")
                .HasColumnName("created_at");
            entity.Property(e => e.CreatedBy)
                .HasMaxLength(255)
                .HasColumnName("created_by");
            entity.Property(e => e.DeletedAt).HasColumnName("deleted_at");
            entity.Property(e => e.DeletedBy)
                .HasMaxLength(255)
                .HasColumnName("deleted_by");
            entity.Property(e => e.Error)
                .HasColumnType("json")
                .HasColumnName("error");
            entity.Property(e => e.FailedCount).HasColumnName("failed_count");
            entity.Property(e => e.FileName)
                .HasMaxLength(255)
                .HasColumnName("file_name");
            entity.Property(e => e.FilePath)
                .HasMaxLength(500)
                .HasColumnName("file_path");
            entity.Property(e => e.IsActive)
                .HasDefaultValue(true)
                .HasColumnName("is_active");
            entity.Property(e => e.RequestedAt)
                .HasDefaultValueSql("CURRENT_TIMESTAMP")
                .HasColumnName("requested_at");
            entity.Property(e => e.RequestedBy)
                .HasMaxLength(255)
                .HasColumnName("requested_by");
            entity.Property(e => e.Status)
                .HasMaxLength(255)
                .HasColumnName("status");
            entity.Property(e => e.SuccessCount).HasColumnName("success_count");
            entity.Property(e => e.TotalCount).HasColumnName("total_count");
            entity.Property(e => e.Type)
                .HasMaxLength(255)
                .HasColumnName("type");
            entity.Property(e => e.UpdatedAt).HasColumnName("updated_at");
            entity.Property(e => e.UpdatedBy)
                .HasMaxLength(255)
                .HasColumnName("updated_by");
            entity.Property(e => e.Url)
                .HasMaxLength(500)
                .HasColumnName("url");
        });

        modelBuilder.Entity<Company>(entity =>
        {
            entity.HasKey(e => e.Id).HasName("company_pkey");

            entity.ToTable("company", "sc");

            entity.Property(e => e.Id)
                .HasDefaultValueSql("gen_random_uuid()")
                .HasColumnName("id");
            entity.Property(e => e.AlternatePhone)
                .HasMaxLength(20)
                .HasColumnName("alternate_phone");
            entity.Property(e => e.AvgOrderValue)
                .HasDefaultValueSql("0")
                .HasColumnName("avg_order_value");
            entity.Property(e => e.Category)
                .HasMaxLength(100)
                .HasColumnName("category");
            entity.Property(e => e.CompanyCode)
                .HasMaxLength(50)
                .HasDefaultValueSql("sc.generate_company_code()")
                .HasColumnName("company_code");
            entity.Property(e => e.ContactName)
                .HasMaxLength(100)
                .HasColumnName("contact_name");
            entity.Property(e => e.CreatedAt)
                .HasDefaultValueSql("CURRENT_TIMESTAMP")
                .HasColumnName("created_at");
            entity.Property(e => e.CreatedBy)
                .HasMaxLength(255)
                .HasColumnName("created_by");
            entity.Property(e => e.CurrencyCode)
                .HasMaxLength(3)
                .IsFixedLength()
                .HasColumnName("currency_code");
            entity.Property(e => e.CurrencyId).HasColumnName("currency_id");
            entity.Property(e => e.CustomerCode)
                .HasMaxLength(50)
                .HasDefaultValueSql("sc.generate_customer_code()")
                .HasColumnName("customer_code");
            entity.Property(e => e.DeletedAt).HasColumnName("deleted_at");
            entity.Property(e => e.DeletedBy)
                .HasMaxLength(255)
                .HasColumnName("deleted_by");
            entity.Property(e => e.Department)
                .HasMaxLength(100)
                .HasColumnName("department");
            entity.Property(e => e.Email)
                .HasMaxLength(255)
                .HasColumnName("email");
            entity.Property(e => e.IsActive)
                .HasDefaultValue(true)
                .HasColumnName("is_active");
            entity.Property(e => e.IsCustomer).HasColumnName("is_customer");
            entity.Property(e => e.IsPartner).HasColumnName("is_partner");
            entity.Property(e => e.IsVendor).HasColumnName("is_vendor");
            entity.Property(e => e.LastActivityDate).HasColumnName("last_activity_date");
            entity.Property(e => e.LogoUrl).HasColumnName("logo_url");
            entity.Property(e => e.MemberSince).HasColumnName("member_since");
            entity.Property(e => e.Name)
                .HasMaxLength(255)
                .HasColumnName("name");
            entity.Property(e => e.Notes).HasColumnName("notes");
            entity.Property(e => e.OnTimeDeliveryRate)
                .HasDefaultValueSql("0")
                .HasColumnName("on_time_delivery_rate");
            entity.Property(e => e.PanNumber)
                .HasMaxLength(10)
                .HasColumnName("pan_number");
            entity.Property(e => e.PartnerCode)
                .HasMaxLength(50)
                .HasDefaultValueSql("sc.generate_partner_code()")
                .HasColumnName("partner_code");
            entity.Property(e => e.PaymentTermId).HasColumnName("payment_term_id");
            entity.Property(e => e.PhoneNumber)
                .HasMaxLength(20)
                .HasColumnName("phone_number");
            entity.Property(e => e.QualityScore)
                .HasDefaultValue(0)
                .HasColumnName("quality_score");
            entity.Property(e => e.TaxId)
                .HasMaxLength(50)
                .HasColumnName("tax_id");
            entity.Property(e => e.TotalOrders)
                .HasDefaultValue(0)
                .HasColumnName("total_orders");
            entity.Property(e => e.TotalSpent)
                .HasDefaultValueSql("0")
                .HasColumnName("total_spent");
            entity.Property(e => e.UpdatedAt).HasColumnName("updated_at");
            entity.Property(e => e.UpdatedBy)
                .HasMaxLength(255)
                .HasColumnName("updated_by");
            entity.Property(e => e.VendorCode)
                .HasMaxLength(50)
                .HasDefaultValueSql("sc.generate_vendor_code()")
                .HasColumnName("vendor_code");
            entity.Property(e => e.Website).HasColumnName("website");

            entity.HasOne(d => d.Currency).WithMany(p => p.Companies)
                .HasForeignKey(d => d.CurrencyId)
                .OnDelete(DeleteBehavior.SetNull)
                .HasConstraintName("company_currency_id_fkey");

            entity.HasOne(d => d.PaymentTerm).WithMany(p => p.Companies)
                .HasForeignKey(d => d.PaymentTermId)
                .OnDelete(DeleteBehavior.SetNull)
                .HasConstraintName("company_payment_term_id_fkey");
        });

        modelBuilder.Entity<CompanyAddress>(entity =>
        {
            entity.HasKey(e => e.Id).HasName("company_address_pkey");

            entity.ToTable("company_address", "sc");

            entity.Property(e => e.Id)
                .HasDefaultValueSql("gen_random_uuid()")
                .HasColumnName("id");
            entity.Property(e => e.AddressId).HasColumnName("address_id");
            entity.Property(e => e.AddressType)
                .HasMaxLength(50)
                .HasColumnName("address_type");
            entity.Property(e => e.CompanyId).HasColumnName("company_id");
            entity.Property(e => e.CreatedAt)
                .HasDefaultValueSql("CURRENT_TIMESTAMP")
                .HasColumnName("created_at");
            entity.Property(e => e.CreatedBy)
                .HasMaxLength(255)
                .HasColumnName("created_by");
            entity.Property(e => e.DeletedAt).HasColumnName("deleted_at");
            entity.Property(e => e.DeletedBy)
                .HasMaxLength(255)
                .HasColumnName("deleted_by");
            entity.Property(e => e.IsActive)
                .HasDefaultValue(true)
                .HasColumnName("is_active");
            entity.Property(e => e.UpdatedAt).HasColumnName("updated_at");
            entity.Property(e => e.UpdatedBy)
                .HasMaxLength(255)
                .HasColumnName("updated_by");

            entity.HasOne(d => d.Address).WithMany(p => p.CompanyAddresses)
                .HasForeignKey(d => d.AddressId)
                .OnDelete(DeleteBehavior.SetNull)
                .HasConstraintName("company_address_address_id_fkey");

            entity.HasOne(d => d.Company).WithMany(p => p.CompanyAddresses)
                .HasForeignKey(d => d.CompanyId)
                .OnDelete(DeleteBehavior.SetNull)
                .HasConstraintName("company_address_company_id_fkey");
        });

        modelBuilder.Entity<CompanyBankAccount>(entity =>
        {
            entity.HasKey(e => e.Id).HasName("company_bank_account_pkey");

            entity.ToTable("company_bank_account", "sc");

            entity.Property(e => e.Id)
                .HasDefaultValueSql("gen_random_uuid()")
                .HasColumnName("id");
            entity.Property(e => e.BankAccountId).HasColumnName("bank_account_id");
            entity.Property(e => e.CompanyId).HasColumnName("company_id");
            entity.Property(e => e.CreatedAt)
                .HasDefaultValueSql("CURRENT_TIMESTAMP")
                .HasColumnName("created_at");
            entity.Property(e => e.CreatedBy)
                .HasMaxLength(255)
                .HasColumnName("created_by");
            entity.Property(e => e.DeletedAt).HasColumnName("deleted_at");
            entity.Property(e => e.DeletedBy)
                .HasMaxLength(255)
                .HasColumnName("deleted_by");
            entity.Property(e => e.IsActive)
                .HasDefaultValue(true)
                .HasColumnName("is_active");
            entity.Property(e => e.UpdatedAt).HasColumnName("updated_at");
            entity.Property(e => e.UpdatedBy)
                .HasMaxLength(255)
                .HasColumnName("updated_by");

            entity.HasOne(d => d.BankAccount).WithMany(p => p.CompanyBankAccounts)
                .HasForeignKey(d => d.BankAccountId)
                .OnDelete(DeleteBehavior.SetNull)
                .HasConstraintName("company_bank_account_bank_account_id_fkey");

            entity.HasOne(d => d.Company).WithMany(p => p.CompanyBankAccounts)
                .HasForeignKey(d => d.CompanyId)
                .OnDelete(DeleteBehavior.SetNull)
                .HasConstraintName("company_bank_account_company_id_fkey");
        });

        modelBuilder.Entity<CompanyContact>(entity =>
        {
            entity.HasKey(e => e.Id).HasName("company_contact_pkey");

            entity.ToTable("company_contact", "sc");

            entity.Property(e => e.Id)
                .HasDefaultValueSql("gen_random_uuid()")
                .HasColumnName("id");
            entity.Property(e => e.CompanyId).HasColumnName("company_id");
            entity.Property(e => e.ContactId).HasColumnName("contact_id");
            entity.Property(e => e.ContactType)
                .HasMaxLength(50)
                .HasColumnName("contact_type");
            entity.Property(e => e.CreatedAt)
                .HasDefaultValueSql("CURRENT_TIMESTAMP")
                .HasColumnName("created_at");
            entity.Property(e => e.CreatedBy)
                .HasMaxLength(255)
                .HasColumnName("created_by");
            entity.Property(e => e.DeletedAt).HasColumnName("deleted_at");
            entity.Property(e => e.DeletedBy)
                .HasMaxLength(255)
                .HasColumnName("deleted_by");
            entity.Property(e => e.IsActive)
                .HasDefaultValue(true)
                .HasColumnName("is_active");
            entity.Property(e => e.UpdatedAt).HasColumnName("updated_at");
            entity.Property(e => e.UpdatedBy)
                .HasMaxLength(255)
                .HasColumnName("updated_by");

            entity.HasOne(d => d.Company).WithMany(p => p.CompanyContacts)
                .HasForeignKey(d => d.CompanyId)
                .OnDelete(DeleteBehavior.SetNull)
                .HasConstraintName("company_contact_company_id_fkey");

            entity.HasOne(d => d.Contact).WithMany(p => p.CompanyContacts)
                .HasForeignKey(d => d.ContactId)
                .OnDelete(DeleteBehavior.SetNull)
                .HasConstraintName("company_contact_contact_id_fkey");
        });

        modelBuilder.Entity<CompanyPart>(entity =>
        {
            entity.HasKey(e => e.Id).HasName("company_part_pkey");

            entity.ToTable("company_part", "sc");

            entity.Property(e => e.Id)
                .HasDefaultValueSql("gen_random_uuid()")
                .HasColumnName("id");
            entity.Property(e => e.CompanyId).HasColumnName("company_id");
            entity.Property(e => e.CreatedAt)
                .HasDefaultValueSql("CURRENT_TIMESTAMP")
                .HasColumnName("created_at");
            entity.Property(e => e.CreatedBy)
                .HasMaxLength(255)
                .HasColumnName("created_by");
            entity.Property(e => e.DeletedAt).HasColumnName("deleted_at");
            entity.Property(e => e.DeletedBy)
                .HasMaxLength(255)
                .HasColumnName("deleted_by");
            entity.Property(e => e.IsActive)
                .HasDefaultValue(true)
                .HasColumnName("is_active");
            entity.Property(e => e.PartId).HasColumnName("part_id");
            entity.Property(e => e.UpdatedAt).HasColumnName("updated_at");
            entity.Property(e => e.UpdatedBy)
                .HasMaxLength(255)
                .HasColumnName("updated_by");

            // New PLM Industry Standard fields
            entity.Property(e => e.UnitPrice)
                .HasColumnType("numeric(18,4)")
                .HasColumnName("unit_price");
            entity.Property(e => e.CurrencyId).HasColumnName("currency_id");
            entity.Property(e => e.LeadTimeDays).HasColumnName("lead_time_days");
            entity.Property(e => e.MinOrderQuantity).HasColumnName("min_order_quantity");
            entity.Property(e => e.OrderMultiple).HasColumnName("order_multiple");
            entity.Property(e => e.IsPreferred)
                .HasDefaultValue(false)
                .HasColumnName("is_preferred");
            entity.Property(e => e.ValidFrom).HasColumnName("valid_from");
            entity.Property(e => e.ValidTo).HasColumnName("valid_to");
            entity.Property(e => e.VendorPartNumber)
                .HasMaxLength(255)
                .HasColumnName("vendor_part_number");
            entity.Property(e => e.ManufacturerPartNumber)
                .HasMaxLength(255)
                .HasColumnName("manufacturer_part_number");
            entity.Property(e => e.Notes).HasColumnName("notes");

            entity.HasOne(d => d.Company).WithMany(p => p.CompanyParts)
                .HasForeignKey(d => d.CompanyId)
                .OnDelete(DeleteBehavior.SetNull)
                .HasConstraintName("company_part_company_id_fkey");

            entity.HasOne(d => d.Part).WithMany(p => p.CompanyParts)
                .HasForeignKey(d => d.PartId)
                .OnDelete(DeleteBehavior.SetNull)
                .HasConstraintName("company_part_part_id_fkey");

            entity.HasOne(d => d.Currency).WithMany()
                .HasForeignKey(d => d.CurrencyId)
                .OnDelete(DeleteBehavior.SetNull)
                .HasConstraintName("company_part_currency_id_fkey");
        });

        modelBuilder.Entity<CompanyWithOrganizationVw>(entity =>
        {
            entity
                .HasNoKey()
                .ToView("company_with_organization_vw", "sc");

            entity.Property(e => e.CreatedAt).HasColumnName("created_at");
            entity.Property(e => e.CreatedBy)
                .HasMaxLength(255)
                .HasColumnName("created_by");
            entity.Property(e => e.EntityType).HasColumnName("entity_type");
            entity.Property(e => e.Id).HasColumnName("id");
            entity.Property(e => e.IsActive).HasColumnName("is_active");
            entity.Property(e => e.Name)
                .HasMaxLength(255)
                .HasColumnName("name");
            entity.Property(e => e.UpdatedAt).HasColumnName("updated_at");
            entity.Property(e => e.UpdatedBy)
                .HasMaxLength(255)
                .HasColumnName("updated_by");
        });

        modelBuilder.Entity<Contact>(entity =>
        {
            entity.HasKey(e => e.Id).HasName("contact_pkey");

            entity.ToTable("contact", "common");

            entity.Property(e => e.Id)
                .HasDefaultValueSql("gen_random_uuid()")
                .HasColumnName("id");
            entity.Property(e => e.AlternatePhone)
                .HasMaxLength(20)
                .HasColumnName("alternate_phone");
            entity.Property(e => e.CompanyId).HasColumnName("company_id");
            entity.Property(e => e.CreatedAt)
                .HasDefaultValueSql("CURRENT_TIMESTAMP")
                .HasColumnName("created_at");
            entity.Property(e => e.CreatedBy)
                .HasMaxLength(255)
                .HasColumnName("created_by");
            entity.Property(e => e.DeletedAt).HasColumnName("deleted_at");
            entity.Property(e => e.DeletedBy)
                .HasMaxLength(255)
                .HasColumnName("deleted_by");
            entity.Property(e => e.Email)
                .HasMaxLength(255)
                .HasColumnName("email");
            entity.Property(e => e.FirstName)
                .HasMaxLength(100)
                .HasColumnName("first_name");
            entity.Property(e => e.IsActive)
                .HasDefaultValue(true)
                .HasColumnName("is_active");
            entity.Property(e => e.IsPrimary)
                .HasDefaultValue(false)
                .HasColumnName("is_primary");
            entity.Property(e => e.JobTitle)
                .HasMaxLength(100)
                .HasColumnName("job_title");
            entity.Property(e => e.LastName)
                .HasMaxLength(100)
                .HasColumnName("last_name");
            entity.Property(e => e.Notes).HasColumnName("notes");
            entity.Property(e => e.PhoneNumber)
                .HasMaxLength(20)
                .HasColumnName("phone_number");
            entity.Property(e => e.UpdatedAt).HasColumnName("updated_at");
            entity.Property(e => e.UpdatedBy)
                .HasMaxLength(255)
                .HasColumnName("updated_by");

            entity.HasOne(d => d.Company).WithMany(p => p.Contacts)
                .HasForeignKey(d => d.CompanyId)
                .OnDelete(DeleteBehavior.SetNull)
                .HasConstraintName("contact_company_id_fkey");
        });

        modelBuilder.Entity<Country>(entity =>
        {
            entity.HasKey(e => e.Id).HasName("country_pkey");

            entity.ToTable("country", "common");

            entity.HasIndex(e => e.Iso2Code, "country_iso2_code_key").IsUnique();

            entity.HasIndex(e => e.Iso3Code, "country_iso3_code_key").IsUnique();

            entity.HasIndex(e => e.Name, "country_name_key").IsUnique();

            entity.HasIndex(e => e.NumericCode, "country_numeric_code_key").IsUnique();

            entity.Property(e => e.Id)
                .HasDefaultValueSql("gen_random_uuid()")
                .HasColumnName("id");
            entity.Property(e => e.CreatedAt)
                .HasDefaultValueSql("CURRENT_TIMESTAMP")
                .HasColumnName("created_at");
            entity.Property(e => e.CreatedBy)
                .HasMaxLength(255)
                .HasColumnName("created_by");
            entity.Property(e => e.DeletedAt).HasColumnName("deleted_at");
            entity.Property(e => e.DeletedBy)
                .HasMaxLength(255)
                .HasColumnName("deleted_by");
            entity.Property(e => e.IsActive)
                .HasDefaultValue(true)
                .HasColumnName("is_active");
            entity.Property(e => e.Iso2Code)
                .HasMaxLength(2)
                .HasColumnName("iso2_code");
            entity.Property(e => e.Iso3Code)
                .HasMaxLength(3)
                .HasColumnName("iso3_code");
            entity.Property(e => e.Name)
                .HasMaxLength(255)
                .HasColumnName("name");
            entity.Property(e => e.NumericCode).HasColumnName("numeric_code");
            entity.Property(e => e.UpdatedAt).HasColumnName("updated_at");
            entity.Property(e => e.UpdatedBy)
                .HasMaxLength(255)
                .HasColumnName("updated_by");
        });

        modelBuilder.Entity<Currency>(entity =>
        {
            entity.HasKey(e => e.Id).HasName("currency_pkey");

            entity.ToTable("currency", "common");

            entity.Property(e => e.Id)
                .HasDefaultValueSql("gen_random_uuid()")
                .HasColumnName("id");
            entity.Property(e => e.Code)
                .HasMaxLength(3)
                .HasColumnName("code");
            entity.Property(e => e.Country)
                .HasMaxLength(100)
                .HasColumnName("country");
            entity.Property(e => e.CreatedAt)
                .HasDefaultValueSql("CURRENT_TIMESTAMP")
                .HasColumnName("created_at");
            entity.Property(e => e.CreatedBy)
                .HasMaxLength(255)
                .HasColumnName("created_by");
            entity.Property(e => e.DeletedAt).HasColumnName("deleted_at");
            entity.Property(e => e.DeletedBy)
                .HasMaxLength(255)
                .HasColumnName("deleted_by");
            entity.Property(e => e.IsActive)
                .HasDefaultValue(true)
                .HasColumnName("is_active");
            entity.Property(e => e.MinorUnit)
                .HasDefaultValue(2)
                .HasColumnName("minor_unit");
            entity.Property(e => e.Name)
                .HasMaxLength(100)
                .HasColumnName("name");
            entity.Property(e => e.Symbol)
                .HasMaxLength(10)
                .HasColumnName("symbol");
            entity.Property(e => e.UpdatedAt).HasColumnName("updated_at");
            entity.Property(e => e.UpdatedBy)
                .HasMaxLength(255)
                .HasColumnName("updated_by");
        });

        modelBuilder.Entity<Customer>(entity =>
        {
            entity.HasKey(e => e.Id).HasName("customer_pkey");

            entity.ToTable("customer", "application");

            entity.HasIndex(e => e.TaxNumber, "uq_customer_tax_number").IsUnique();

            entity.Property(e => e.Id)
                .HasDefaultValueSql("gen_random_uuid()")
                .HasColumnName("id");
            entity.Property(e => e.Category)
                .HasMaxLength(255)
                .HasColumnName("category");
            entity.Property(e => e.CreatedAt)
                .HasDefaultValueSql("CURRENT_TIMESTAMP")
                .HasColumnName("created_at");
            entity.Property(e => e.CreatedBy)
                .HasMaxLength(255)
                .HasColumnName("created_by");
            entity.Property(e => e.CustomerAddressId).HasColumnName("customer_address_id");
            entity.Property(e => e.DeletedAt).HasColumnName("deleted_at");
            entity.Property(e => e.DeletedBy)
                .HasMaxLength(255)
                .HasColumnName("deleted_by");
            entity.Property(e => e.Description).HasColumnName("description");
            entity.Property(e => e.ImageUrl)
                .HasMaxLength(500)
                .HasColumnName("image_url");
            entity.Property(e => e.IsActive)
                .HasDefaultValue(true)
                .HasColumnName("is_active");
            entity.Property(e => e.Name)
                .HasMaxLength(255)
                .HasColumnName("name");
            entity.Property(e => e.TaxNumber)
                .HasMaxLength(255)
                .HasColumnName("tax_number");
            entity.Property(e => e.UpdatedAt).HasColumnName("updated_at");
            entity.Property(e => e.UpdatedBy)
                .HasMaxLength(255)
                .HasColumnName("updated_by");

            entity.HasOne(d => d.CustomerAddress).WithMany(p => p.Customers)
                .HasForeignKey(d => d.CustomerAddressId)
                .OnDelete(DeleteBehavior.SetNull)
                .HasConstraintName("fk_customer_address");
        });

        modelBuilder.Entity<Department>(entity =>
        {
            entity.HasKey(e => e.Id).HasName("department_pkey");

            entity.ToTable("department", "common");

            entity.Property(e => e.Id)
                .HasDefaultValueSql("gen_random_uuid()")
                .HasColumnName("id");
            entity.Property(e => e.Code)
                .HasMaxLength(50)
                .HasColumnName("code");
            entity.Property(e => e.Name)
                .HasMaxLength(255)
                .HasColumnName("name");
            entity.Property(e => e.Description).HasColumnName("description");
            entity.Property(e => e.CreatedAt)
                .HasDefaultValueSql("CURRENT_TIMESTAMP")
                .HasColumnName("created_at");
            entity.Property(e => e.CreatedBy)
                .HasMaxLength(255)
                .HasColumnName("created_by");
            entity.Property(e => e.DeletedAt).HasColumnName("deleted_at");
            entity.Property(e => e.DeletedBy)
                .HasMaxLength(255)
                .HasColumnName("deleted_by");
            entity.Property(e => e.IsActive)
                .HasDefaultValue(true)
                .HasColumnName("is_active");
            entity.Property(e => e.UpdatedAt).HasColumnName("updated_at");
            entity.Property(e => e.UpdatedBy)
                .HasMaxLength(255)
                .HasColumnName("updated_by");
        });

        modelBuilder.Entity<DashboardWidget>(entity =>
        {
            entity.HasKey(e => e.Id).HasName("dashboard_widget_pkey");

            entity.ToTable("dashboard_widget", "pm", tb => tb.HasComment("User-configurable dashboard widgets for project management"));

            entity.HasIndex(e => e.ProjectId, "idx_dashboard_widget_project_id").HasFilter("(deleted_at IS NULL)");

            entity.HasIndex(e => e.UserId, "idx_dashboard_widget_user_id").HasFilter("(deleted_at IS NULL)");

            entity.Property(e => e.Id)
                .HasDefaultValueSql("gen_random_uuid()")
                .HasColumnName("id");
            entity.Property(e => e.CreatedAt)
                .HasDefaultValueSql("CURRENT_TIMESTAMP")
                .HasColumnName("created_at");
            entity.Property(e => e.CreatedBy)
                .HasMaxLength(255)
                .HasColumnName("created_by");
            entity.Property(e => e.DeletedAt).HasColumnName("deleted_at");
            entity.Property(e => e.DeletedBy)
                .HasMaxLength(255)
                .HasColumnName("deleted_by");
            entity.Property(e => e.Height)
                .HasDefaultValue(2)
                .HasComment("Widget height in grid units")
                .HasColumnName("height");
            entity.Property(e => e.IsActive)
                .HasDefaultValue(true)
                .HasColumnName("is_active");
            entity.Property(e => e.PositionX)
                .HasDefaultValue(0)
                .HasComment("Grid X position (react-grid-layout)")
                .HasColumnName("position_x");
            entity.Property(e => e.PositionY)
                .HasDefaultValue(0)
                .HasComment("Grid Y position (react-grid-layout)")
                .HasColumnName("position_y");
            entity.Property(e => e.ProjectId)
                .HasComment("Optional: Filter widget data to specific project")
                .HasColumnName("project_id");
            entity.Property(e => e.Settings)
                .HasDefaultValueSql("'{}'::jsonb")
                .HasComment("Widget-specific settings as JSON (filters, display options, etc.)")
                .HasColumnType("jsonb")
                .HasColumnName("settings");
            entity.Property(e => e.Title)
                .HasMaxLength(100)
                .HasComment("Custom title for the widget (optional)")
                .HasColumnName("title");
            entity.Property(e => e.UpdatedAt).HasColumnName("updated_at");
            entity.Property(e => e.UpdatedBy)
                .HasMaxLength(255)
                .HasColumnName("updated_by");
            entity.Property(e => e.UserId)
                .HasComment("Reference to the user who owns this widget configuration")
                .HasColumnName("user_id");
            entity.Property(e => e.WidgetType)
                .HasMaxLength(50)
                .HasComment("Type of widget to render")
                .HasColumnName("widget_type");
            entity.Property(e => e.Width)
                .HasDefaultValue(4)
                .HasComment("Widget width in grid units")
                .HasColumnName("width");

            entity.HasOne(d => d.Project).WithMany()
                .HasForeignKey(d => d.ProjectId)
                .OnDelete(DeleteBehavior.Cascade)
                .HasConstraintName("dashboard_widget_project_id_fkey");
        });

        modelBuilder.Entity<Document>(entity =>
        {
            entity.HasKey(e => e.Id).HasName("document_pkey");

            entity.ToTable("document", "common");

            entity.Property(e => e.Id)
                .HasDefaultValueSql("gen_random_uuid()")
                .HasColumnName("id");
            entity.Property(e => e.CreatedAt)
                .HasDefaultValueSql("CURRENT_TIMESTAMP")
                .HasColumnName("created_at");
            entity.Property(e => e.CreatedBy)
                .HasMaxLength(255)
                .HasColumnName("created_by");
            entity.Property(e => e.DeletedAt).HasColumnName("deleted_at");
            entity.Property(e => e.DeletedBy)
                .HasMaxLength(255)
                .HasColumnName("deleted_by");
            entity.Property(e => e.Description).HasColumnName("description");
            entity.Property(e => e.DocumentStorageType)
                .HasMaxLength(20)
                .HasColumnName("document_storage_type");
            entity.Property(e => e.DocumentType)
                .HasMaxLength(100)
                .HasColumnName("document_type");
            entity.Property(e => e.EntityId).HasColumnName("entity_id");
            entity.Property(e => e.EntityType)
                .HasMaxLength(100)
                .HasColumnName("entity_type");
            entity.Property(e => e.ExternalUrl).HasColumnName("external_url");
            entity.Property(e => e.FileExtension)
                .HasMaxLength(50)
                .HasColumnName("file_extension");
            entity.Property(e => e.FileName)
                .HasMaxLength(255)
                .HasColumnName("file_name");
            entity.Property(e => e.FilePath)
                .HasMaxLength(500)
                .HasColumnName("file_path");
            entity.Property(e => e.FileRelativePath)
                .HasMaxLength(500)
                .HasColumnName("file_relative_path");
            entity.Property(e => e.FileSize).HasColumnName("file_size");
            entity.Property(e => e.IsActive)
                .HasDefaultValue(true)
                .HasColumnName("is_active");
            entity.Property(e => e.Metadata)
                .HasColumnType("jsonb")
                .HasColumnName("metadata");
            entity.Property(e => e.MimeType)
                .HasMaxLength(100)
                .HasColumnName("mime_type");
            entity.Property(e => e.Tags).HasColumnName("tags");
            entity.Property(e => e.Title)
                .HasMaxLength(255)
                .HasColumnName("title");
            entity.Property(e => e.UpdatedAt).HasColumnName("updated_at");
            entity.Property(e => e.UpdatedBy)
                .HasMaxLength(255)
                .HasColumnName("updated_by");
        });

        modelBuilder.Entity<DocumentWithUsersVw>(entity =>
        {
            entity
                .HasNoKey()
                .ToView("document_with_users_vw", "common");

            entity.Property(e => e.CreatedAt).HasColumnName("created_at");
            entity.Property(e => e.CreatedBy)
                .HasMaxLength(255)
                .HasColumnName("created_by");
            entity.Property(e => e.CreatedByFullName).HasColumnName("created_by_full_name");
            entity.Property(e => e.Description).HasColumnName("description");
            entity.Property(e => e.DocumentStorageType)
                .HasMaxLength(20)
                .HasColumnName("document_storage_type");
            entity.Property(e => e.DocumentType)
                .HasMaxLength(100)
                .HasColumnName("document_type");
            entity.Property(e => e.EntityId).HasColumnName("entity_id");
            entity.Property(e => e.EntityType)
                .HasMaxLength(100)
                .HasColumnName("entity_type");
            entity.Property(e => e.ExternalUrl).HasColumnName("external_url");
            entity.Property(e => e.FileExtension)
                .HasMaxLength(50)
                .HasColumnName("file_extension");
            entity.Property(e => e.FileName)
                .HasMaxLength(255)
                .HasColumnName("file_name");
            entity.Property(e => e.FilePath)
                .HasMaxLength(500)
                .HasColumnName("file_path");
            entity.Property(e => e.FileRelativePath)
                .HasMaxLength(500)
                .HasColumnName("file_relative_path");
            entity.Property(e => e.FileSize).HasColumnName("file_size");
            entity.Property(e => e.Id).HasColumnName("id");
            entity.Property(e => e.IsActive).HasColumnName("is_active");
            entity.Property(e => e.Metadata)
                .HasColumnType("jsonb")
                .HasColumnName("metadata");
            entity.Property(e => e.MimeType)
                .HasMaxLength(100)
                .HasColumnName("mime_type");
            entity.Property(e => e.Tags).HasColumnName("tags");
            entity.Property(e => e.Title)
                .HasMaxLength(255)
                .HasColumnName("title");
        });

        modelBuilder.Entity<Ebom>(entity =>
        {
            entity.HasKey(e => e.Id).HasName("ebom_pkey");

            entity.ToTable("ebom", "mes");

            entity.HasIndex(e => new { e.PartId, e.ChildPartId, e.DeletedAt }, "ebom_part_id_child_part_id_deleted_at_key").IsUnique();

            entity.Property(e => e.Id)
                .HasDefaultValueSql("gen_random_uuid()")
                .HasColumnName("id");
            entity.Property(e => e.AssemblyLocationId).HasColumnName("assembly_location_id");
            entity.Property(e => e.ChildPartId).HasColumnName("child_part_id");
            entity.Property(e => e.CreatedAt)
                .HasDefaultValueSql("CURRENT_TIMESTAMP")
                .HasColumnName("created_at");
            entity.Property(e => e.CreatedBy)
                .HasMaxLength(255)
                .HasColumnName("created_by");
            entity.Property(e => e.DeletedAt).HasColumnName("deleted_at");
            entity.Property(e => e.DeletedBy)
                .HasMaxLength(255)
                .HasColumnName("deleted_by");
            entity.Property(e => e.IsActive)
                .HasDefaultValue(true)
                .HasColumnName("is_active");
            entity.Property(e => e.PartId).HasColumnName("part_id");
            entity.Property(e => e.Quantity).HasColumnName("quantity");
            entity.Property(e => e.UpdatedAt).HasColumnName("updated_at");
            entity.Property(e => e.UpdatedBy)
                .HasMaxLength(255)
                .HasColumnName("updated_by");

            entity.HasOne(d => d.AssemblyLocation).WithMany(p => p.Eboms)
                .HasForeignKey(d => d.AssemblyLocationId)
                .OnDelete(DeleteBehavior.SetNull)
                .HasConstraintName("ebom_assembly_location_id_fkey");

            entity.HasOne(d => d.ChildPart).WithMany(p => p.EbomChildParts)
                .HasForeignKey(d => d.ChildPartId)
                .OnDelete(DeleteBehavior.ClientSetNull)
                .HasConstraintName("ebom_child_part_id_fkey");

            entity.HasOne(d => d.Part).WithMany(p => p.EbomParts)
                .HasForeignKey(d => d.PartId)
                .OnDelete(DeleteBehavior.ClientSetNull)
                .HasConstraintName("ebom_part_id_fkey");
        });

        modelBuilder.Entity<Eco>(entity =>
        {
            entity.HasKey(e => e.Id).HasName("eco_pkey");

            entity.ToTable("eco", "mes");

            entity.Property(e => e.Id)
                .HasDefaultValueSql("gen_random_uuid()")
                .HasColumnName("id");
            entity.Property(e => e.ApprovedBy)
                .HasMaxLength(255)
                .HasColumnName("approved_by");
            entity.Property(e => e.ApprovedDate).HasColumnName("approved_date");
            entity.Property(e => e.Approver)
                .HasMaxLength(255)
                .HasColumnName("approver");
            entity.Property(e => e.ChangeType)
                .HasMaxLength(255)
                .HasColumnName("change_type");
            entity.Property(e => e.CreatedAt)
                .HasDefaultValueSql("CURRENT_TIMESTAMP")
                .HasColumnName("created_at");
            entity.Property(e => e.CreatedBy)
                .HasMaxLength(255)
                .HasColumnName("created_by");
            entity.Property(e => e.DeletedAt).HasColumnName("deleted_at");
            entity.Property(e => e.DeletedBy)
                .HasMaxLength(255)
                .HasColumnName("deleted_by");
            entity.Property(e => e.Description).HasColumnName("description");
            entity.Property(e => e.ImpactAnalysis)
                .HasColumnName("impact_analysis");
            entity.Property(e => e.IsActive)
                .HasDefaultValue(true)
                .HasColumnName("is_active");
            entity.Property(e => e.Name)
                .HasMaxLength(255)
                .HasColumnName("name");
            entity.Property(e => e.Number)
                .HasMaxLength(50)
                .HasDefaultValueSql("mes.generate_eco_number()")
                .HasColumnName("number");
            entity.Property(e => e.PlannedImplementationDate)
                .HasDefaultValueSql("CURRENT_TIMESTAMP")
                .HasColumnName("planned_implementation_date");
            entity.Property(e => e.Priority)
                .HasMaxLength(255)
                .HasDefaultValueSql("'Low'::character varying")
                .HasColumnName("priority");
            entity.Property(e => e.ReasonForChange).HasColumnName("reason_for_change");
            entity.Property(e => e.Requestor)
                .HasMaxLength(255)
                .HasColumnName("requestor");
            entity.Property(e => e.Status)
                .HasMaxLength(255)
                .HasDefaultValueSql("'Draft'::character varying")
                .HasColumnName("status");
            entity.Property(e => e.UpdatedAt).HasColumnName("updated_at");
            entity.Property(e => e.UpdatedBy)
                .HasMaxLength(255)
                .HasColumnName("updated_by");
        });

        modelBuilder.Entity<EcoLog>(entity =>
        {
            entity.HasKey(e => e.Id).HasName("eco_log_pkey");

            entity.ToTable("eco_log", "mes");

            entity.Property(e => e.Id)
                .HasDefaultValueSql("gen_random_uuid()")
                .HasColumnName("id");
            entity.Property(e => e.Action)
                .HasMaxLength(50)
                .HasColumnName("action");
            entity.Property(e => e.ActionAt)
                .HasDefaultValueSql("CURRENT_TIMESTAMP")
                .HasColumnName("action_at");
            entity.Property(e => e.ActionBy)
                .HasMaxLength(255)
                .HasColumnName("action_by");
            entity.Property(e => e.CreatedAt)
                .HasDefaultValueSql("CURRENT_TIMESTAMP")
                .HasColumnName("created_at");
            entity.Property(e => e.CreatedBy)
                .HasMaxLength(255)
                .HasColumnName("created_by");
            entity.Property(e => e.DeletedAt).HasColumnName("deleted_at");
            entity.Property(e => e.DeletedBy)
                .HasMaxLength(255)
                .HasColumnName("deleted_by");
            entity.Property(e => e.EcoId).HasColumnName("eco_id");
            entity.Property(e => e.IsActive)
                .HasDefaultValue(true)
                .HasColumnName("is_active");
            entity.Property(e => e.Notes).HasColumnName("notes");
            entity.Property(e => e.UpdatedAt).HasColumnName("updated_at");
            entity.Property(e => e.UpdatedBy)
                .HasMaxLength(255)
                .HasColumnName("updated_by");

            entity.HasOne(d => d.Eco).WithMany(p => p.EcoLogs)
                .HasForeignKey(d => d.EcoId)
                .OnDelete(DeleteBehavior.ClientSetNull)
                .HasConstraintName("eco_log_eco_id_fkey");
        });

        modelBuilder.Entity<EcoPart>(entity =>
        {
            entity.HasKey(e => e.Id).HasName("eco_part_id_pkey");

            entity.ToTable("eco_part", "mes");

            entity.HasIndex(e => new { e.EcoId, e.PartId, e.DeletedAt }, "eco_part_eco_id_part_id_deleted_at_key").IsUnique();

            entity.Property(e => e.Id)
                .HasDefaultValueSql("gen_random_uuid()")
                .HasColumnName("id");
            entity.Property(e => e.CreatedAt)
                .HasDefaultValueSql("CURRENT_TIMESTAMP")
                .HasColumnName("created_at");
            entity.Property(e => e.CreatedBy)
                .HasMaxLength(255)
                .HasColumnName("created_by");
            entity.Property(e => e.DeletedAt).HasColumnName("deleted_at");
            entity.Property(e => e.DeletedBy)
                .HasMaxLength(255)
                .HasColumnName("deleted_by");
            entity.Property(e => e.Description).HasColumnName("description");
            entity.Property(e => e.EcoId).HasColumnName("eco_id");
            entity.Property(e => e.EffectiveDate).HasColumnName("effective_date");
            entity.Property(e => e.IsActive)
                .HasDefaultValue(true)
                .HasColumnName("is_active");
            entity.Property(e => e.NewVersion)
                .HasMaxLength(255)
                .HasColumnName("new_version");
            entity.Property(e => e.OldVersion)
                .HasMaxLength(255)
                .HasColumnName("old_version");
            entity.Property(e => e.PartId).HasColumnName("part_id");
            entity.Property(e => e.PreviousStatus)
                .HasMaxLength(255)
                .HasColumnName("previous_status");
            entity.Property(e => e.Status)
                .HasMaxLength(255)
                .HasColumnName("status");
            entity.Property(e => e.UpdatedAt).HasColumnName("updated_at");
            entity.Property(e => e.UpdatedBy)
                .HasMaxLength(255)
                .HasColumnName("updated_by");

            entity.HasOne(d => d.Eco).WithMany(p => p.EcoParts)
                .HasForeignKey(d => d.EcoId)
                .OnDelete(DeleteBehavior.ClientSetNull)
                .HasConstraintName("eco_part_eco_id_fkey");

            entity.HasOne(d => d.Part).WithMany(p => p.EcoParts)
                .HasForeignKey(d => d.PartId)
                .OnDelete(DeleteBehavior.ClientSetNull)
                .HasConstraintName("eco_part_part_id_fkey");
        });

        modelBuilder.Entity<EcoWithUsersVw>(entity =>
        {
            entity
                .HasNoKey()
                .ToView("eco_with_users_vw", "mes");

            entity.Property(e => e.ApprovedBy)
                .HasMaxLength(255)
                .HasColumnName("approved_by");
            entity.Property(e => e.ApprovedDate).HasColumnName("approved_date");
            entity.Property(e => e.Approver)
                .HasMaxLength(255)
                .HasColumnName("approver");
            entity.Property(e => e.Approvers)
                .HasColumnType("json")
                .HasColumnName("approvers");
            entity.Property(e => e.ChangeType)
                .HasMaxLength(255)
                .HasColumnName("change_type");
            entity.Property(e => e.CreatedAt).HasColumnName("created_at");
            entity.Property(e => e.CreatedBy)
                .HasMaxLength(255)
                .HasColumnName("created_by");
            entity.Property(e => e.Description).HasColumnName("description");
            entity.Property(e => e.Id).HasColumnName("id");
            entity.Property(e => e.ImpactAnalysis).HasColumnName("impact_analysis");
            entity.Property(e => e.IsActive).HasColumnName("is_active");
            entity.Property(e => e.Name)
                .HasMaxLength(255)
                .HasColumnName("name");
            entity.Property(e => e.Number)
                .HasMaxLength(50)
                .HasColumnName("number");
            entity.Property(e => e.PlannedImplementationDate).HasColumnName("planned_implementation_date");
            entity.Property(e => e.Priority)
                .HasMaxLength(255)
                .HasColumnName("priority");
            entity.Property(e => e.ReasonForChange).HasColumnName("reason_for_change");
            entity.Property(e => e.Requestor)
                .HasMaxLength(255)
                .HasColumnName("requestor");
            entity.Property(e => e.RequestorEmail)
                .HasMaxLength(255)
                .HasColumnName("requestor_email");
            entity.Property(e => e.RequestorFullName).HasColumnName("requestor_full_name");
            entity.Property(e => e.RequestorId).HasColumnName("requestor_id");
            entity.Property(e => e.Status)
                .HasMaxLength(255)
                .HasColumnName("status");
            entity.Property(e => e.UpdatedAt).HasColumnName("updated_at");
            entity.Property(e => e.UpdatedBy)
                .HasMaxLength(255)
                .HasColumnName("updated_by");
        });

        modelBuilder.Entity<EmailLog>(entity =>
        {
            entity.HasKey(e => e.Id).HasName("email_log_pkey");

            entity.ToTable("email_log", "mes");

            entity.HasIndex(e => e.Status, "idx_email_log_status");
            entity.HasIndex(e => new { e.EntityType, e.EntityId }, "idx_email_log_entity");
            entity.HasIndex(e => e.CreatedAt, "idx_email_log_created");

            entity.Property(e => e.Id)
                .HasDefaultValueSql("gen_random_uuid()")
                .HasColumnName("id");
            entity.Property(e => e.TemplateCode)
                .HasMaxLength(100)
                .HasColumnName("template_code");
            entity.Property(e => e.EntityType)
                .HasMaxLength(100)
                .HasColumnName("entity_type");
            entity.Property(e => e.EntityId)
                .HasColumnName("entity_id");
            entity.Property(e => e.RecipientEmail)
                .HasMaxLength(255)
                .HasColumnName("recipient_email");
            entity.Property(e => e.Subject)
                .HasMaxLength(500)
                .HasColumnName("subject");
            entity.Property(e => e.Body)
                .HasColumnName("body");
            entity.Property(e => e.Status)
                .HasMaxLength(50)
                .HasDefaultValue("Pending")
                .HasColumnName("status");
            entity.Property(e => e.SentAt)
                .HasColumnName("sent_at");
            entity.Property(e => e.ErrorMessage)
                .HasColumnName("error_message");
            entity.Property(e => e.RetryCount)
                .HasDefaultValue(0)
                .HasColumnName("retry_count");
            entity.Property(e => e.IsActive)
                .HasDefaultValue(true)
                .HasColumnName("is_active");
            entity.Property(e => e.CreatedAt)
                .HasDefaultValueSql("CURRENT_TIMESTAMP")
                .HasColumnName("created_at");
            entity.Property(e => e.CreatedBy)
                .HasMaxLength(255)
                .HasColumnName("created_by");
            entity.Property(e => e.UpdatedAt).HasColumnName("updated_at");
            entity.Property(e => e.UpdatedBy)
                .HasMaxLength(255)
                .HasColumnName("updated_by");
            entity.Property(e => e.DeletedAt).HasColumnName("deleted_at");
            entity.Property(e => e.DeletedBy)
                .HasMaxLength(255)
                .HasColumnName("deleted_by");
        });

        modelBuilder.Entity<EmailTemplate>(entity =>
        {
            entity.HasKey(e => e.Id).HasName("email_template_pkey");

            entity.ToTable("email_template", "mes");

            entity.HasIndex(e => e.TemplateCode, "idx_email_template_code").IsUnique();

            entity.Property(e => e.Id)
                .HasDefaultValueSql("gen_random_uuid()")
                .HasColumnName("id");
            entity.Property(e => e.TemplateCode)
                .HasMaxLength(100)
                .HasColumnName("template_code");
            entity.Property(e => e.Name)
                .HasMaxLength(255)
                .HasColumnName("name");
            entity.Property(e => e.Subject)
                .HasMaxLength(500)
                .HasColumnName("subject");
            entity.Property(e => e.Body)
                .HasColumnName("body");
            entity.Property(e => e.Description)
                .HasColumnName("description");
            entity.Property(e => e.IsHtml)
                .HasDefaultValue(true)
                .HasColumnName("is_html");
            entity.Property(e => e.IsActive)
                .HasDefaultValue(true)
                .HasColumnName("is_active");
            entity.Property(e => e.CreatedAt)
                .HasDefaultValueSql("CURRENT_TIMESTAMP")
                .HasColumnName("created_at");
            entity.Property(e => e.CreatedBy)
                .HasMaxLength(255)
                .HasColumnName("created_by");
            entity.Property(e => e.UpdatedAt).HasColumnName("updated_at");
            entity.Property(e => e.UpdatedBy)
                .HasMaxLength(255)
                .HasColumnName("updated_by");
            entity.Property(e => e.DeletedAt).HasColumnName("deleted_at");
            entity.Property(e => e.DeletedBy)
                .HasMaxLength(255)
                .HasColumnName("deleted_by");
        });

        modelBuilder.Entity<FeatureBit>(entity =>
        {
            entity.HasKey(e => e.Id).HasName("feature_bit_pkey");

            entity.ToTable("feature_bit", "application");

            entity.HasIndex(e => e.FeatureName, "feature_bit_feature_name_key").IsUnique();

            entity.Property(e => e.Id)
                .HasDefaultValueSql("gen_random_uuid()")
                .HasColumnName("id");
            entity.Property(e => e.ApplicationName)
                .HasMaxLength(255)
                .HasDefaultValueSql("'All'::character varying")
                .HasColumnName("application_name");
            entity.Property(e => e.CreatedAt)
                .HasDefaultValueSql("CURRENT_TIMESTAMP")
                .HasColumnName("created_at");
            entity.Property(e => e.CreatedBy)
                .HasMaxLength(255)
                .HasColumnName("created_by");
            entity.Property(e => e.DeletedAt).HasColumnName("deleted_at");
            entity.Property(e => e.DeletedBy)
                .HasMaxLength(255)
                .HasColumnName("deleted_by");
            entity.Property(e => e.FeatureName)
                .HasMaxLength(255)
                .HasColumnName("feature_name");
            entity.Property(e => e.IsActive)
                .HasDefaultValue(true)
                .HasColumnName("is_active");
            entity.Property(e => e.UpdatedAt).HasColumnName("updated_at");
            entity.Property(e => e.UpdatedBy)
                .HasMaxLength(255)
                .HasColumnName("updated_by");
        });

        modelBuilder.Entity<GoodsReceiptNote>(entity =>
        {
            entity.HasKey(e => e.Id).HasName("goods_receipt_note_pkey");

            entity.ToTable("goods_receipt_note", "sc");

            entity.Property(e => e.Id)
                .HasDefaultValueSql("gen_random_uuid()")
                .HasColumnName("id");
            entity.Property(e => e.CreatedAt)
                .HasDefaultValueSql("CURRENT_TIMESTAMP")
                .HasColumnName("created_at");
            entity.Property(e => e.CreatedBy)
                .HasMaxLength(255)
                .HasColumnName("created_by");
            entity.Property(e => e.DeletedAt).HasColumnName("deleted_at");
            entity.Property(e => e.DeletedBy)
                .HasMaxLength(255)
                .HasColumnName("deleted_by");
            entity.Property(e => e.Description).HasColumnName("description");
            entity.Property(e => e.GrnNumber)
                .HasMaxLength(255)
                .HasDefaultValueSql("sc.generate_grn_number()")
                .HasColumnName("grn_number");
            entity.Property(e => e.InvoiceDate).HasColumnName("invoice_date");
            entity.Property(e => e.InvoiceNumber)
                .HasMaxLength(255)
                .HasColumnName("invoice_number");
            entity.Property(e => e.IsActive)
                .HasDefaultValue(true)
                .HasColumnName("is_active");
            entity.Property(e => e.LocationId).HasColumnName("location_id");
            entity.Property(e => e.PurchaseOrderId).HasColumnName("purchase_order_id");
            entity.Property(e => e.ReceivedById).HasColumnName("received_by_id");
            entity.Property(e => e.ReceivedDate).HasColumnName("received_date");
            entity.Property(e => e.ReferenceNumber)
                .HasMaxLength(255)
                .HasColumnName("reference_number");
            entity.Property(e => e.Status)
                .HasMaxLength(255)
                .HasDefaultValueSql("'In Process'::character varying")
                .HasColumnName("status");
            entity.Property(e => e.UpdatedAt).HasColumnName("updated_at");
            entity.Property(e => e.UpdatedBy)
                .HasMaxLength(255)
                .HasColumnName("updated_by");
            entity.Property(e => e.VendorId).HasColumnName("vendor_id");
            entity.Property(e => e.VendorReferenceId).HasColumnName("vendor_reference_id");

            entity.HasOne(d => d.Location).WithMany(p => p.GoodsReceiptNotes)
                .HasForeignKey(d => d.LocationId)
                .OnDelete(DeleteBehavior.SetNull)
                .HasConstraintName("goods_receipt_note_location_id_fkey");

            entity.HasOne(d => d.PurchaseOrder).WithMany(p => p.GoodsReceiptNotes)
                .HasForeignKey(d => d.PurchaseOrderId)
                .OnDelete(DeleteBehavior.SetNull)
                .HasConstraintName("goods_receipt_note_purchase_order_id_fkey");

            entity.HasOne(d => d.ReceivedBy).WithMany(p => p.GoodsReceiptNotes)
                .HasForeignKey(d => d.ReceivedById)
                .OnDelete(DeleteBehavior.SetNull)
                .HasConstraintName("goods_receipt_note_received_by_id_fkey");

            entity.HasOne(d => d.Vendor).WithMany(p => p.GoodsReceiptNotes)
                .HasForeignKey(d => d.VendorId)
                .OnDelete(DeleteBehavior.SetNull)
                .HasConstraintName("goods_receipt_note_vendor_id_fkey");
        });

        modelBuilder.Entity<GrnLineItem>(entity =>
        {
            entity.HasKey(e => e.Id).HasName("grn_line_item_pkey");

            entity.ToTable("grn_line_item", "sc");

            entity.Property(e => e.Id)
                .HasDefaultValueSql("gen_random_uuid()")
                .HasColumnName("id");
            entity.Property(e => e.CheckedById).HasColumnName("checked_by_id");
            entity.Property(e => e.CreatedAt)
                .HasDefaultValueSql("CURRENT_TIMESTAMP")
                .HasColumnName("created_at");
            entity.Property(e => e.CreatedBy)
                .HasMaxLength(255)
                .HasColumnName("created_by");
            entity.Property(e => e.DeletedAt).HasColumnName("deleted_at");
            entity.Property(e => e.DeletedBy)
                .HasMaxLength(255)
                .HasColumnName("deleted_by");
            entity.Property(e => e.Disposition)
                .HasMaxLength(50)
                .HasColumnName("disposition");
            entity.Property(e => e.ExpiryDate).HasColumnName("expiry_date");
            entity.Property(e => e.GrnId).HasColumnName("grn_id");
            entity.Property(e => e.IsActive)
                .HasDefaultValue(true)
                .HasColumnName("is_active");
            entity.Property(e => e.ManufacturingDate).HasColumnName("manufacturing_date");
            entity.Property(e => e.PartId).HasColumnName("part_id");
            entity.Property(e => e.PoLineItemId).HasColumnName("po_line_item_id");
            entity.Property(e => e.QcDate).HasColumnName("qc_date");
            entity.Property(e => e.QcRemark).HasColumnName("qc_remark");
            entity.Property(e => e.QcStatus)
                .HasMaxLength(50)
                .HasDefaultValueSql("'Pending'::character varying")
                .HasColumnName("qc_status");
            entity.Property(e => e.ReceivedQuantity).HasColumnName("received_quantity");
            entity.Property(e => e.Remark).HasColumnName("remark");
            entity.Property(e => e.TrackingId)
                .HasMaxLength(255)
                .HasColumnName("tracking_id");
            entity.Property(e => e.TrackingMethod)
                .HasMaxLength(50)
                .HasDefaultValueSql("'None'::character varying")
                .HasColumnName("tracking_method");
            entity.Property(e => e.UpdatedAt).HasColumnName("updated_at");
            entity.Property(e => e.UpdatedBy)
                .HasMaxLength(255)
                .HasColumnName("updated_by");

            entity.HasOne(d => d.CheckedBy).WithMany(p => p.GrnLineItems)
                .HasForeignKey(d => d.CheckedById)
                .OnDelete(DeleteBehavior.SetNull)
                .HasConstraintName("grn_line_item_checked_by_id_fkey");

            entity.HasOne(d => d.Grn).WithMany(p => p.GrnLineItems)
                .HasForeignKey(d => d.GrnId)
                .OnDelete(DeleteBehavior.SetNull)
                .HasConstraintName("grn_line_item_grn_id_fkey");

            entity.HasOne(d => d.Part).WithMany(p => p.GrnLineItems)
                .HasForeignKey(d => d.PartId)
                .OnDelete(DeleteBehavior.SetNull)
                .HasConstraintName("grn_line_item_part_id_fkey");

            entity.HasOne(d => d.PoLineItem).WithMany(p => p.GrnLineItems)
                .HasForeignKey(d => d.PoLineItemId)
                .OnDelete(DeleteBehavior.SetNull)
                .HasConstraintName("grn_line_item_po_line_item_id_fkey");
        });

        modelBuilder.Entity<GrnWithUserVw>(entity =>
        {
            entity
                .HasNoKey()
                .ToView("grn_with_user_vw", "sc");

            entity.Property(e => e.ApprovedBy)
                .HasMaxLength(255)
                .HasColumnName("approved_by");
            entity.Property(e => e.ApprovedDate).HasColumnName("approved_date");
            entity.Property(e => e.BillingAddressId).HasColumnName("billing_address_id");
            entity.Property(e => e.BuyerId).HasColumnName("buyer_id");
            entity.Property(e => e.CompanyId).HasColumnName("company_id");
            entity.Property(e => e.CreatedAt).HasColumnName("created_at");
            entity.Property(e => e.CreatedBy)
                .HasMaxLength(255)
                .HasColumnName("created_by");
            entity.Property(e => e.CurrencyId).HasColumnName("currency_id");
            entity.Property(e => e.DeliveryAddressId).HasColumnName("delivery_address_id");
            entity.Property(e => e.DeliveryDate).HasColumnName("delivery_date");
            entity.Property(e => e.DeliveryStatus)
                .HasMaxLength(255)
                .HasColumnName("delivery_status");
            entity.Property(e => e.Description).HasColumnName("description");
            entity.Property(e => e.GrnId).HasColumnName("grn_id");
            entity.Property(e => e.GrnNumber)
                .HasMaxLength(255)
                .HasColumnName("grn_number");
            entity.Property(e => e.InvoiceDate).HasColumnName("invoice_date");
            entity.Property(e => e.InvoiceNumber)
                .HasMaxLength(255)
                .HasColumnName("invoice_number");
            entity.Property(e => e.IsActive).HasColumnName("is_active");
            entity.Property(e => e.LocationId).HasColumnName("location_id");
            entity.Property(e => e.LocationName)
                .HasMaxLength(255)
                .HasColumnName("location_name");
            entity.Property(e => e.LocationNumber)
                .HasMaxLength(255)
                .HasColumnName("location_number");
            entity.Property(e => e.OrderDate).HasColumnName("order_date");
            entity.Property(e => e.PaymentTermId).HasColumnName("payment_term_id");
            entity.Property(e => e.PoId).HasColumnName("po_id");
            entity.Property(e => e.PoNumber)
                .HasMaxLength(255)
                .HasColumnName("po_number");
            entity.Property(e => e.PoStatus)
                .HasMaxLength(255)
                .HasColumnName("po_status");
            entity.Property(e => e.ProjectId).HasColumnName("project_id");
            entity.Property(e => e.PurchaseOrderId).HasColumnName("purchase_order_id");
            entity.Property(e => e.QuotationReferenceId).HasColumnName("quotation_reference_id");
            entity.Property(e => e.ReceivedByEmail)
                .HasMaxLength(255)
                .HasColumnName("received_by_email");
            entity.Property(e => e.ReceivedByFullName).HasColumnName("received_by_full_name");
            entity.Property(e => e.ReceivedById).HasColumnName("received_by_id");
            entity.Property(e => e.ReceivedDate).HasColumnName("received_date");
            entity.Property(e => e.ReferenceNumber)
                .HasMaxLength(255)
                .HasColumnName("reference_number");
            entity.Property(e => e.RequisitionId).HasColumnName("requisition_id");
            entity.Property(e => e.RevisionHistory)
                .HasMaxLength(255)
                .HasColumnName("revision_history");
            entity.Property(e => e.ShippingAddressId).HasColumnName("shipping_address_id");
            entity.Property(e => e.Status)
                .HasMaxLength(255)
                .HasColumnName("status");
            entity.Property(e => e.SupplyChainLeadId).HasColumnName("supply_chain_lead_id");
            entity.Property(e => e.TotalAmount)
                .HasPrecision(18, 4)
                .HasColumnName("total_amount");
            entity.Property(e => e.UpdatedAt).HasColumnName("updated_at");
            entity.Property(e => e.UpdatedBy)
                .HasMaxLength(255)
                .HasColumnName("updated_by");
            entity.Property(e => e.VendorCode)
                .HasMaxLength(50)
                .HasColumnName("vendor_code");
            entity.Property(e => e.VendorId).HasColumnName("vendor_id");
            entity.Property(e => e.VendorName)
                .HasMaxLength(255)
                .HasColumnName("vendor_name");
            entity.Property(e => e.VendorReferenceId).HasColumnName("vendor_reference_id");
        });

        modelBuilder.Entity<GrnsByPurchaseOrderVw>(entity =>
        {
            entity
                .HasNoKey()
                .ToView("grns_by_purchase_order_vw", "sc");

            entity.Property(e => e.CreatedAt).HasColumnName("created_at");
            entity.Property(e => e.CreatedBy)
                .HasMaxLength(255)
                .HasColumnName("created_by");
            entity.Property(e => e.Description).HasColumnName("description");
            entity.Property(e => e.GrnId).HasColumnName("grn_id");
            entity.Property(e => e.GrnLineItems)
                .HasColumnType("json")
                .HasColumnName("grn_line_items");
            entity.Property(e => e.GrnNumber)
                .HasMaxLength(255)
                .HasColumnName("grn_number");
            entity.Property(e => e.InvoiceDate).HasColumnName("invoice_date");
            entity.Property(e => e.InvoiceNumber)
                .HasMaxLength(255)
                .HasColumnName("invoice_number");
            entity.Property(e => e.IsActive).HasColumnName("is_active");
            entity.Property(e => e.LocationId).HasColumnName("location_id");
            entity.Property(e => e.LocationName)
                .HasMaxLength(255)
                .HasColumnName("location_name");
            entity.Property(e => e.LocationNumber)
                .HasMaxLength(255)
                .HasColumnName("location_number");
            entity.Property(e => e.PurchaseOrderId).HasColumnName("purchase_order_id");
            entity.Property(e => e.ReceivedByEmail)
                .HasMaxLength(255)
                .HasColumnName("received_by_email");
            entity.Property(e => e.ReceivedByFullName).HasColumnName("received_by_full_name");
            entity.Property(e => e.ReceivedById).HasColumnName("received_by_id");
            entity.Property(e => e.ReceivedDate).HasColumnName("received_date");
            entity.Property(e => e.ReferenceNumber)
                .HasMaxLength(255)
                .HasColumnName("reference_number");
            entity.Property(e => e.Status)
                .HasMaxLength(255)
                .HasColumnName("status");
            entity.Property(e => e.UpdatedAt).HasColumnName("updated_at");
            entity.Property(e => e.UpdatedBy)
                .HasMaxLength(255)
                .HasColumnName("updated_by");
            entity.Property(e => e.VendorCode)
                .HasMaxLength(50)
                .HasColumnName("vendor_code");
            entity.Property(e => e.VendorId).HasColumnName("vendor_id");
            entity.Property(e => e.VendorName)
                .HasMaxLength(255)
                .HasColumnName("vendor_name");
            entity.Property(e => e.VendorReferenceId).HasColumnName("vendor_reference_id");
        });

        modelBuilder.Entity<Guide>(entity =>
        {
            entity.HasKey(e => e.Id).HasName("guide_pkey");

            entity.ToTable("guide", "mes");

            entity.HasIndex(e => new { e.PartId, e.Number, e.Version }, "guide_part_id_number_version_key").IsUnique();

            entity.HasIndex(e => e.Sequence, "guide_sequence_key").IsUnique();

            entity.Property(e => e.Id)
                .HasDefaultValueSql("gen_random_uuid()")
                .HasColumnName("id");
            entity.Property(e => e.CalculatedWeight).HasColumnName("calculated_weight");
            entity.Property(e => e.Category)
                .HasMaxLength(255)
                .HasColumnName("category");
            entity.Property(e => e.CheckOutBy)
                .HasMaxLength(255)
                .HasColumnName("check_out_by");
            entity.Property(e => e.CloneFromId).HasColumnName("clone_from_id");
            entity.Property(e => e.CreatedAt)
                .HasDefaultValueSql("CURRENT_TIMESTAMP")
                .HasColumnName("created_at");
            entity.Property(e => e.CreatedBy)
                .HasMaxLength(255)
                .HasColumnName("created_by");
            entity.Property(e => e.DeletedAt).HasColumnName("deleted_at");
            entity.Property(e => e.DeletedBy)
                .HasMaxLength(255)
                .HasColumnName("deleted_by");
            entity.Property(e => e.GuideTypeId).HasColumnName("guide_type_id");
            entity.Property(e => e.IsActive)
                .HasDefaultValue(true)
                .HasColumnName("is_active");
            entity.Property(e => e.Name)
                .HasMaxLength(255)
                .HasColumnName("name");
            entity.Property(e => e.Number)
                .HasMaxLength(255)
                .HasDefaultValueSql("application.generate_alphanumeric_sequence('GD-'::character varying, currval('mes.guide_sequence_seq'::regclass))")
                .HasColumnName("number");
            entity.Property(e => e.PartId).HasColumnName("part_id");
            entity.Property(e => e.PlatformId).HasColumnName("platform_id");
            entity.Property(e => e.Sequence)
                .ValueGeneratedOnAdd()
                .HasColumnName("sequence");
            entity.Property(e => e.Status)
                .HasMaxLength(255)
                .HasDefaultValueSql("'Draft'::character varying")
                .HasColumnName("status");
            entity.Property(e => e.UpdatedAt).HasColumnName("updated_at");
            entity.Property(e => e.UpdatedBy)
                .HasMaxLength(255)
                .HasColumnName("updated_by");
            entity.Property(e => e.Version)
                .HasDefaultValue(1)
                .HasColumnName("version");

            entity.HasOne(d => d.CloneFrom).WithMany(p => p.InverseCloneFrom)
                .HasForeignKey(d => d.CloneFromId)
                .OnDelete(DeleteBehavior.SetNull)
                .HasConstraintName("guide_clone_from_id_fkey");

            entity.HasOne(d => d.GuideType).WithMany(p => p.Guides)
                .HasForeignKey(d => d.GuideTypeId)
                .OnDelete(DeleteBehavior.SetNull)
                .HasConstraintName("guide_guide_type_id_fkey");

            entity.HasOne(d => d.Part).WithMany(p => p.Guides)
                .HasForeignKey(d => d.PartId)
                .OnDelete(DeleteBehavior.SetNull)
                .HasConstraintName("guide_part_id_fkey");

            entity.HasOne(d => d.Platform).WithMany(p => p.Guides)
                .HasForeignKey(d => d.PlatformId)
                .OnDelete(DeleteBehavior.SetNull)
                .HasConstraintName("guide_platform_id_fkey");
        });

        modelBuilder.Entity<GuideCheckOutHistory>(entity =>
        {
            entity.HasKey(e => e.Id).HasName("guide_check_out_history_pkey");

            entity.ToTable("guide_check_out_history", "mes");

            entity.Property(e => e.Id)
                .HasDefaultValueSql("gen_random_uuid()")
                .HasColumnName("id");
            entity.Property(e => e.CreatedAt)
                .HasDefaultValueSql("CURRENT_TIMESTAMP")
                .HasColumnName("created_at");
            entity.Property(e => e.CreatedBy)
                .HasMaxLength(255)
                .HasColumnName("created_by");
            entity.Property(e => e.DeletedAt).HasColumnName("deleted_at");
            entity.Property(e => e.DeletedBy)
                .HasMaxLength(255)
                .HasColumnName("deleted_by");
            entity.Property(e => e.GuideId).HasColumnName("guide_id");
            entity.Property(e => e.IsActive)
                .HasDefaultValue(true)
                .HasColumnName("is_active");
            entity.Property(e => e.IsCheckedOut)
                .HasDefaultValue(true)
                .HasColumnName("is_checked_out");
            entity.Property(e => e.UpdatedAt).HasColumnName("updated_at");
            entity.Property(e => e.UpdatedBy)
                .HasMaxLength(255)
                .HasColumnName("updated_by");

            entity.HasOne(d => d.Guide).WithMany(p => p.GuideCheckOutHistories)
                .HasForeignKey(d => d.GuideId)
                .HasConstraintName("guide_check_out_history_guide_id_fkey");
        });

        modelBuilder.Entity<GuideEbom>(entity =>
        {
            entity.HasKey(e => e.Id).HasName("guide_ebom_pkey");

            entity.ToTable("guide_ebom", "mes");

            entity.HasIndex(e => new { e.GuideId, e.PartId, e.ChildPartId, e.DeletedAt }, "guide_ebom_guide_id_part_id_child_part_id_deleted_at_key").IsUnique();

            entity.Property(e => e.Id)
                .HasDefaultValueSql("gen_random_uuid()")
                .HasColumnName("id");
            entity.Property(e => e.ChildPartId).HasColumnName("child_part_id");
            entity.Property(e => e.CreatedAt)
                .HasDefaultValueSql("CURRENT_TIMESTAMP")
                .HasColumnName("created_at");
            entity.Property(e => e.CreatedBy)
                .HasMaxLength(255)
                .HasColumnName("created_by");
            entity.Property(e => e.DeletedAt).HasColumnName("deleted_at");
            entity.Property(e => e.DeletedBy)
                .HasMaxLength(255)
                .HasColumnName("deleted_by");
            entity.Property(e => e.GuideId).HasColumnName("guide_id");
            entity.Property(e => e.IsActive)
                .HasDefaultValue(true)
                .HasColumnName("is_active");
            entity.Property(e => e.PartId).HasColumnName("part_id");
            entity.Property(e => e.Quantity).HasColumnName("quantity");
            entity.Property(e => e.UpdatedAt).HasColumnName("updated_at");
            entity.Property(e => e.UpdatedBy)
                .HasMaxLength(255)
                .HasColumnName("updated_by");

            entity.HasOne(d => d.ChildPart).WithMany(p => p.GuideEbomChildParts)
                .HasForeignKey(d => d.ChildPartId)
                .OnDelete(DeleteBehavior.SetNull)
                .HasConstraintName("guide_ebom_child_part_id_fkey");

            entity.HasOne(d => d.Guide).WithMany(p => p.GuideEboms)
                .HasForeignKey(d => d.GuideId)
                .OnDelete(DeleteBehavior.SetNull)
                .HasConstraintName("guide_ebom_guide_id_fkey");

            entity.HasOne(d => d.Part).WithMany(p => p.GuideEbomParts)
                .HasForeignKey(d => d.PartId)
                .OnDelete(DeleteBehavior.SetNull)
                .HasConstraintName("guide_ebom_part_id_fkey");
        });

        modelBuilder.Entity<GuideMbom>(entity =>
        {
            entity.HasKey(e => e.Id).HasName("guide_mbom_pkey");

            entity.ToTable("guide_mbom", "mes");

            entity.HasIndex(e => new { e.GuideId, e.PartId, e.DeletedAt }, "guide_mbom_guide_id_part_id_deleted_at_key").IsUnique();

            entity.Property(e => e.Id)
                .HasDefaultValueSql("gen_random_uuid()")
                .HasColumnName("id");
            entity.Property(e => e.CreatedAt)
                .HasDefaultValueSql("CURRENT_TIMESTAMP")
                .HasColumnName("created_at");
            entity.Property(e => e.CreatedBy)
                .HasMaxLength(255)
                .HasColumnName("created_by");
            entity.Property(e => e.DeletedAt).HasColumnName("deleted_at");
            entity.Property(e => e.DeletedBy)
                .HasMaxLength(255)
                .HasColumnName("deleted_by");
            entity.Property(e => e.GuideId).HasColumnName("guide_id");
            entity.Property(e => e.IsActive)
                .HasDefaultValue(true)
                .HasColumnName("is_active");
            entity.Property(e => e.PartId).HasColumnName("part_id");
            entity.Property(e => e.Quantity).HasColumnName("quantity");
            entity.Property(e => e.UpdatedAt).HasColumnName("updated_at");
            entity.Property(e => e.UpdatedBy)
                .HasMaxLength(255)
                .HasColumnName("updated_by");
            entity.Property(e => e.Weight).HasColumnName("weight");

            entity.HasOne(d => d.Guide).WithMany(p => p.GuideMboms)
                .HasForeignKey(d => d.GuideId)
                .OnDelete(DeleteBehavior.ClientSetNull)
                .HasConstraintName("guide_mbom_guide_id_fkey");

            entity.HasOne(d => d.Part).WithMany(p => p.GuideMboms)
                .HasForeignKey(d => d.PartId)
                .OnDelete(DeleteBehavior.ClientSetNull)
                .HasConstraintName("guide_mbom_part_id_fkey");
        });

        modelBuilder.Entity<GuideMbomDetail>(entity =>
        {
            entity
                .HasNoKey()
                .ToView("guide_mbom_details", "mes");

            entity.Property(e => e.Guideid).HasColumnName("guideid");
            entity.Property(e => e.Partid).HasColumnName("partid");
            entity.Property(e => e.Quantity).HasColumnName("quantity");
        });

        modelBuilder.Entity<GuideMbomVw>(entity =>
        {
            entity
                .HasNoKey()
                .ToView("guide_mbom_vw", "mes");

            entity.Property(e => e.ChildPartWeight).HasColumnName("child_part_weight");
            entity.Property(e => e.EbomId).HasColumnName("ebom_id");
            entity.Property(e => e.EbomPartId).HasColumnName("ebom_part_id");
            entity.Property(e => e.GsePartId).HasColumnName("gse_part_id");
            entity.Property(e => e.GuideId).HasColumnName("guide_id");
            entity.Property(e => e.GuideMbomWeight).HasColumnName("guide_mbom_weight");
            entity.Property(e => e.GuidePartId).HasColumnName("guide_part_id");
            entity.Property(e => e.GuidePartName)
                .HasMaxLength(255)
                .HasColumnName("guide_part_name");
            entity.Property(e => e.GuidePartNumber)
                .HasMaxLength(255)
                .HasColumnName("guide_part_number");
            entity.Property(e => e.GuidePartNumberSuffix)
                .HasMaxLength(255)
                .HasColumnName("guide_part_number_suffix");
            entity.Property(e => e.IsSerialNumberRequired).HasColumnName("is_serial_number_required");
            entity.Property(e => e.Name)
                .HasMaxLength(255)
                .HasColumnName("name");
            entity.Property(e => e.PartNumber)
                .HasMaxLength(255)
                .HasColumnName("part_number");
            entity.Property(e => e.PartNumberSuffix)
                .HasMaxLength(255)
                .HasColumnName("part_number_suffix");
            entity.Property(e => e.QuantityE).HasColumnName("quantity_e");
            entity.Property(e => e.QuantityM).HasColumnName("quantity_m");
        });

        modelBuilder.Entity<GuideStep>(entity =>
        {
            entity.HasKey(e => e.Id).HasName("guide_step_pkey");

            entity.ToTable("guide_step", "mes");

            entity.HasIndex(e => e.ImageId, "fki_guide_step_image_id_fkey");

            entity.HasIndex(e => e.ImageId, "guide_step_image_id_fkey");

            entity.HasIndex(e => e.VideoId, "guide_step_video_id_fkey");

            entity.Property(e => e.Id)
                .HasDefaultValueSql("gen_random_uuid()")
                .HasColumnName("id");
            entity.Property(e => e.Comment).HasColumnName("comment");
            entity.Property(e => e.CreatedAt)
                .HasDefaultValueSql("CURRENT_TIMESTAMP")
                .HasColumnName("created_at");
            entity.Property(e => e.CreatedBy)
                .HasMaxLength(255)
                .HasColumnName("created_by");
            entity.Property(e => e.DeletedAt).HasColumnName("deleted_at");
            entity.Property(e => e.DeletedBy)
                .HasMaxLength(255)
                .HasColumnName("deleted_by");
            entity.Property(e => e.GuideId).HasColumnName("guide_id");
            entity.Property(e => e.ImageId).HasColumnName("image_id");
            entity.Property(e => e.IsActive)
                .HasDefaultValue(true)
                .HasColumnName("is_active");
            entity.Property(e => e.Sequence).HasColumnName("sequence");
            entity.Property(e => e.Title)
                .HasMaxLength(255)
                .HasColumnName("title");
            entity.Property(e => e.UpdatedAt).HasColumnName("updated_at");
            entity.Property(e => e.UpdatedBy)
                .HasMaxLength(255)
                .HasColumnName("updated_by");
            entity.Property(e => e.VideoId).HasColumnName("video_id");

            entity.HasOne(d => d.Guide).WithMany(p => p.GuideSteps)
                .HasForeignKey(d => d.GuideId)
                .HasConstraintName("guide_step_guide_id_fkey");

            entity.HasOne(d => d.Image).WithMany(p => p.GuideSteps)
                .HasForeignKey(d => d.ImageId)
                .OnDelete(DeleteBehavior.SetNull)
                .HasConstraintName("guide_step_image_id_fkey");

            entity.HasOne(d => d.Video).WithMany(p => p.GuideSteps)
                .HasForeignKey(d => d.VideoId)
                .OnDelete(DeleteBehavior.SetNull)
                .HasConstraintName("guide_step_video_id_fkey");
        });

        modelBuilder.Entity<GuideStepEquipment>(entity =>
        {
            entity.HasKey(e => e.Id).HasName("guide_step_equipment_pkey");

            entity.ToTable("guide_step_equipment", "mes");

            entity.Property(e => e.Id)
                .HasDefaultValueSql("gen_random_uuid()")
                .HasColumnName("id");
            entity.Property(e => e.CreatedAt)
                .HasDefaultValueSql("CURRENT_TIMESTAMP")
                .HasColumnName("created_at");
            entity.Property(e => e.CreatedBy)
                .HasMaxLength(255)
                .HasColumnName("created_by");
            entity.Property(e => e.DeletedAt).HasColumnName("deleted_at");
            entity.Property(e => e.DeletedBy)
                .HasMaxLength(255)
                .HasColumnName("deleted_by");
            entity.Property(e => e.EquipmentType)
                .HasMaxLength(255)
                .HasColumnName("equipment_type");
            entity.Property(e => e.GuideId).HasColumnName("guide_id");
            entity.Property(e => e.GuideStepId).HasColumnName("guide_step_id");
            entity.Property(e => e.IsActive)
                .HasDefaultValue(true)
                .HasColumnName("is_active");
            entity.Property(e => e.MachineId).HasColumnName("machine_id");
            entity.Property(e => e.PartId).HasColumnName("part_id");
            entity.Property(e => e.Quantity).HasColumnName("quantity");
            entity.Property(e => e.ToolId).HasColumnName("tool_id");
            entity.Property(e => e.UpdatedAt).HasColumnName("updated_at");
            entity.Property(e => e.UpdatedBy)
                .HasMaxLength(255)
                .HasColumnName("updated_by");

            entity.HasOne(d => d.Guide).WithMany(p => p.GuideStepEquipments)
                .HasForeignKey(d => d.GuideId)
                .HasConstraintName("guide_step_equipment_guide_id_fkey");

            entity.HasOne(d => d.GuideStep).WithMany(p => p.GuideStepEquipments)
                .HasForeignKey(d => d.GuideStepId)
                .HasConstraintName("guide_step_equipment_guide_step_id_fkey");

            entity.HasOne(d => d.Machine).WithMany(p => p.GuideStepEquipments)
                .HasForeignKey(d => d.MachineId)
                .OnDelete(DeleteBehavior.SetNull)
                .HasConstraintName("guide_step_equipment_machine_id_fkey");

            entity.HasOne(d => d.Part).WithMany(p => p.GuideStepEquipments)
                .HasForeignKey(d => d.PartId)
                .OnDelete(DeleteBehavior.SetNull)
                .HasConstraintName("guide_step_equipment_part_id_fkey");

            entity.HasOne(d => d.Tool).WithMany(p => p.GuideStepEquipments)
                .HasForeignKey(d => d.ToolId)
                .OnDelete(DeleteBehavior.SetNull)
                .HasConstraintName("guide_step_equipment_tool_id_fkey");
        });

        modelBuilder.Entity<GuideStepTask>(entity =>
        {
            entity.HasKey(e => e.Id).HasName("guide_step_task_pkey");

            entity.ToTable("guide_step_task", "mes");

            entity.Property(e => e.Id)
                .HasDefaultValueSql("gen_random_uuid()")
                .HasColumnName("id");
            entity.Property(e => e.CreatedAt)
                .HasDefaultValueSql("CURRENT_TIMESTAMP")
                .HasColumnName("created_at");
            entity.Property(e => e.CreatedBy)
                .HasMaxLength(255)
                .HasColumnName("created_by");
            entity.Property(e => e.DeletedAt).HasColumnName("deleted_at");
            entity.Property(e => e.DeletedBy)
                .HasMaxLength(255)
                .HasColumnName("deleted_by");
            entity.Property(e => e.Description).HasColumnName("description");
            entity.Property(e => e.GuideId).HasColumnName("guide_id");
            entity.Property(e => e.GuideStepId).HasColumnName("guide_step_id");
            entity.Property(e => e.IsActive)
                .HasDefaultValue(true)
                .HasColumnName("is_active");
            entity.Property(e => e.Ismandatory).HasColumnName("ismandatory");
            entity.Property(e => e.Name)
                .HasMaxLength(450)
                .HasColumnName("name");
            entity.Property(e => e.Sequence).HasColumnName("sequence");
            entity.Property(e => e.Taskdetails)
                .HasColumnType("json")
                .HasColumnName("taskdetails");
            entity.Property(e => e.Type)
                .HasMaxLength(50)
                .HasColumnName("type");
            entity.Property(e => e.UpdatedAt).HasColumnName("updated_at");
            entity.Property(e => e.UpdatedBy)
                .HasMaxLength(255)
                .HasColumnName("updated_by");

            entity.HasOne(d => d.Guide).WithMany(p => p.GuideStepTasks)
                .HasForeignKey(d => d.GuideId)
                .HasConstraintName("guide_step_task_guide_id_fkey");

            entity.HasOne(d => d.GuideStep).WithMany(p => p.GuideStepTasks)
                .HasForeignKey(d => d.GuideStepId)
                .HasConstraintName("guide_step_task_guide_step_id_fkey");
        });

        modelBuilder.Entity<GuideType>(entity =>
        {
            entity.HasKey(e => e.Id).HasName("guide_type_pkey");

            entity.ToTable("guide_type", "mes");

            entity.Property(e => e.Id)
                .HasDefaultValueSql("gen_random_uuid()")
                .HasColumnName("id");
            entity.Property(e => e.CreatedAt)
                .HasDefaultValueSql("CURRENT_TIMESTAMP")
                .HasColumnName("created_at");
            entity.Property(e => e.CreatedBy)
                .HasMaxLength(255)
                .HasColumnName("created_by");
            entity.Property(e => e.DeletedAt).HasColumnName("deleted_at");
            entity.Property(e => e.DeletedBy)
                .HasMaxLength(255)
                .HasColumnName("deleted_by");
            entity.Property(e => e.IsActive)
                .HasDefaultValue(true)
                .HasColumnName("is_active");
            entity.Property(e => e.Name)
                .HasMaxLength(255)
                .HasColumnName("name");
            entity.Property(e => e.UpdatedAt).HasColumnName("updated_at");
            entity.Property(e => e.UpdatedBy)
                .HasMaxLength(255)
                .HasColumnName("updated_by");
        });

        modelBuilder.Entity<Image>(entity =>
        {
            entity.HasKey(e => e.Id).HasName("image_pkey");

            entity.ToTable("image", "common");

            entity.Property(e => e.Id)
                .HasDefaultValueSql("gen_random_uuid()")
                .HasColumnName("id");
            entity.Property(e => e.CreatedAt)
                .HasDefaultValueSql("CURRENT_TIMESTAMP")
                .HasColumnName("created_at");
            entity.Property(e => e.CreatedBy)
                .HasMaxLength(255)
                .HasColumnName("created_by");
            entity.Property(e => e.DeletedAt).HasColumnName("deleted_at");
            entity.Property(e => e.DeletedBy)
                .HasMaxLength(255)
                .HasColumnName("deleted_by");
            entity.Property(e => e.EntityId).HasColumnName("entity_id");
            entity.Property(e => e.EntityType)
                .HasMaxLength(100)
                .HasColumnName("entity_type");
            entity.Property(e => e.FileExtension)
                .HasMaxLength(50)
                .HasColumnName("file_extension");
            entity.Property(e => e.FileName)
                .HasMaxLength(255)
                .HasColumnName("file_name");
            entity.Property(e => e.FilePath)
                .HasMaxLength(255)
                .HasColumnName("file_path");
            entity.Property(e => e.FileRelativePath)
                .HasMaxLength(255)
                .HasColumnName("file_relative_path");
            entity.Property(e => e.FileSize).HasColumnName("file_size");
            entity.Property(e => e.ImageType)
                .HasMaxLength(100)
                .HasColumnName("image_type");
            entity.Property(e => e.IsActive)
                .HasDefaultValue(true)
                .HasColumnName("is_active");
            entity.Property(e => e.UpdatedAt).HasColumnName("updated_at");
            entity.Property(e => e.UpdatedBy)
                .HasMaxLength(255)
                .HasColumnName("updated_by");
        });

        modelBuilder.Entity<InventoryGoodsVw>(entity =>
        {
            entity
                .HasNoKey()
                .ToView("inventory_goods_vw", "sc");

            entity.Property(e => e.ConsumedQuantity).HasColumnName("consumed_quantity");
            entity.Property(e => e.Description).HasColumnName("description");
            entity.Property(e => e.InventoryCreatedAt).HasColumnName("inventory_created_at");
            entity.Property(e => e.InventoryCreatedBy)
                .HasMaxLength(255)
                .HasColumnName("inventory_created_by");
            entity.Property(e => e.InventoryId).HasColumnName("inventory_id");
            entity.Property(e => e.InventoryIsActive).HasColumnName("inventory_is_active");
            entity.Property(e => e.InventoryPartId).HasColumnName("inventory_part_id");
            entity.Property(e => e.InventoryUnitPrice)
                .HasPrecision(18, 4)
                .HasColumnName("inventory_unit_price");
            entity.Property(e => e.InventoryUpdatedAt).HasColumnName("inventory_updated_at");
            entity.Property(e => e.InventoryUpdatedBy)
                .HasMaxLength(255)
                .HasColumnName("inventory_updated_by");
            entity.Property(e => e.IsSerialNumberRequired).HasColumnName("is_serial_number_required");
            entity.Property(e => e.ItemType)
                .HasMaxLength(255)
                .HasColumnName("item_type");
            entity.Property(e => e.ManufacturingPartNumber).HasColumnName("manufacturing_part_number");
            entity.Property(e => e.PartId).HasColumnName("part_id");
            entity.Property(e => e.PartIsActive).HasColumnName("part_is_active");
            entity.Property(e => e.PartName)
                .HasMaxLength(255)
                .HasColumnName("part_name");
            entity.Property(e => e.PartNumber)
                .HasMaxLength(255)
                .HasColumnName("part_number");
            entity.Property(e => e.PartNumberSuffix)
                .HasMaxLength(255)
                .HasColumnName("part_number_suffix");
            entity.Property(e => e.PartTypeId).HasColumnName("part_type_id");
            entity.Property(e => e.PartUnitPrice)
                .HasPrecision(18, 4)
                .HasColumnName("part_unit_price");
            entity.Property(e => e.QtyAvailable).HasColumnName("qty_available");
            entity.Property(e => e.QtyOnhand).HasColumnName("qty_onhand");
            entity.Property(e => e.QtyReserved).HasColumnName("qty_reserved");
            entity.Property(e => e.ReorderLevel).HasColumnName("reorder_level");
            entity.Property(e => e.SkuCode)
                .HasMaxLength(20)
                .HasColumnName("sku_code");
            entity.Property(e => e.Status)
                .HasMaxLength(20)
                .HasColumnName("status");
            entity.Property(e => e.Version)
                .HasMaxLength(2)
                .IsFixedLength()
                .HasColumnName("version");
            entity.Property(e => e.Weight).HasColumnName("weight");
        });

        modelBuilder.Entity<InventoryPartPriceVw>(entity =>
        {
            entity
                .HasNoKey()
                .ToView("inventory_part_price_vw", "sc");

            entity.Property(e => e.AvailablePrice).HasColumnName("available_price");
            entity.Property(e => e.BinId).HasColumnName("bin_id");
            entity.Property(e => e.ConsumedQuantity).HasColumnName("consumed_quantity");
            entity.Property(e => e.Description).HasColumnName("description");
            entity.Property(e => e.InventoryCreatedAt).HasColumnName("inventory_created_at");
            entity.Property(e => e.InventoryCreatedBy)
                .HasMaxLength(255)
                .HasColumnName("inventory_created_by");
            entity.Property(e => e.InventoryId).HasColumnName("inventory_id");
            entity.Property(e => e.InventoryIsActive).HasColumnName("inventory_is_active");
            entity.Property(e => e.InventoryPartId).HasColumnName("inventory_part_id");
            entity.Property(e => e.InventoryUnitPrice)
                .HasPrecision(18, 4)
                .HasColumnName("inventory_unit_price");
            entity.Property(e => e.InventoryUpdatedAt).HasColumnName("inventory_updated_at");
            entity.Property(e => e.InventoryUpdatedBy)
                .HasMaxLength(255)
                .HasColumnName("inventory_updated_by");
            entity.Property(e => e.IsSerialNumberRequired).HasColumnName("is_serial_number_required");
            entity.Property(e => e.IssuedPrice).HasColumnName("issued_price");
            entity.Property(e => e.LocationId).HasColumnName("location_id");
            entity.Property(e => e.ManufacturingPartNumber).HasColumnName("manufacturing_part_number");
            entity.Property(e => e.PartId).HasColumnName("part_id");
            entity.Property(e => e.PartIsActive).HasColumnName("part_is_active");
            entity.Property(e => e.PartName)
                .HasMaxLength(255)
                .HasColumnName("part_name");
            entity.Property(e => e.PartNumber)
                .HasMaxLength(255)
                .HasColumnName("part_number");
            entity.Property(e => e.PartNumberSuffix)
                .HasMaxLength(255)
                .HasColumnName("part_number_suffix");
            entity.Property(e => e.PartTypeId).HasColumnName("part_type_id");
            entity.Property(e => e.PartUnitPrice)
                .HasPrecision(18, 4)
                .HasColumnName("part_unit_price");
            entity.Property(e => e.QtyAvailable).HasColumnName("qty_available");
            entity.Property(e => e.QtyIssued).HasColumnName("qty_issued");
            entity.Property(e => e.QtyOnhand).HasColumnName("qty_onhand");
            entity.Property(e => e.QtyQcFailed).HasColumnName("qty_qc_failed");
            entity.Property(e => e.QtyQcPending).HasColumnName("qty_qc_pending");
            entity.Property(e => e.QtyReserved).HasColumnName("qty_reserved");
            entity.Property(e => e.QtyReturned).HasColumnName("qty_returned");
            entity.Property(e => e.QtyScrapped).HasColumnName("qty_scrapped");
            entity.Property(e => e.ReorderLevel).HasColumnName("reorder_level");
            entity.Property(e => e.ReservedPrice).HasColumnName("reserved_price");
            entity.Property(e => e.SkuCode)
                .HasMaxLength(20)
                .HasColumnName("sku_code");
            entity.Property(e => e.Status)
                .HasMaxLength(20)
                .HasColumnName("status");
            entity.Property(e => e.TotalPrice).HasColumnName("total_price");
            entity.Property(e => e.Version)
                .HasMaxLength(2)
                .IsFixedLength()
                .HasColumnName("version");
            entity.Property(e => e.Weight).HasColumnName("weight");
        });

        modelBuilder.Entity<InventoryPart>(entity =>
        {
            entity.HasKey(e => e.Id).HasName("inventory_part_pkey");

            entity.ToTable("inventory_part", "sc");

            entity.Property(e => e.Id)
                .HasDefaultValueSql("gen_random_uuid()")
                .HasColumnName("id");
            entity.Property(e => e.ConsumedQuantity)
                .HasDefaultValue(0)
                .HasColumnName("consumed_quantity");
            entity.Property(e => e.CreatedAt)
                .HasDefaultValueSql("CURRENT_TIMESTAMP")
                .HasColumnName("created_at");
            entity.Property(e => e.CreatedBy)
                .HasMaxLength(255)
                .HasColumnName("created_by");
            entity.Property(e => e.DeletedAt).HasColumnName("deleted_at");
            entity.Property(e => e.DeletedBy)
                .HasMaxLength(255)
                .HasColumnName("deleted_by");
            entity.Property(e => e.IsActive)
                .HasDefaultValue(true)
                .HasColumnName("is_active");
            entity.Property(e => e.LocationId).HasColumnName("location_id");
            entity.Property(e => e.BinId).HasColumnName("bin_id");
            entity.Property(e => e.PartId).HasColumnName("part_id");
            entity.Property(e => e.QtyAvailable)
                .HasComputedColumnSql("((((qty_onhand - qty_reserved) - qty_issued) - qty_qc_failed) - qty_qc_pending)", true)
                .HasColumnName("qty_available");
            entity.Property(e => e.QtyIssued)
                .HasDefaultValue(0)
                .HasColumnName("qty_issued");
            entity.Property(e => e.QtyOnhand)
                .HasDefaultValue(0)
                .HasColumnName("qty_onhand");
            entity.Property(e => e.QtyQcFailed)
                .HasDefaultValue(0)
                .HasColumnName("qty_qc_failed");
            entity.Property(e => e.QtyQcPending)
                .HasDefaultValue(0)
                .HasColumnName("qty_qc_pending");
            entity.Property(e => e.QtyReserved)
                .HasDefaultValue(0)
                .HasColumnName("qty_reserved");
            entity.Property(e => e.QtyScrapped)
                .HasDefaultValue(0)
                .HasColumnName("qty_scrapped");
            entity.Property(e => e.QtyReturned)
                .HasDefaultValue(0)
                .HasColumnName("qty_returned");
            entity.Property(e => e.ReorderLevel)
                .HasDefaultValue(0)
                .HasColumnName("reorder_level");
            entity.Property(e => e.SkuCode)
                .HasMaxLength(20)
                .HasColumnName("sku_code");
            entity.Property(e => e.TrackingType)
                .HasMaxLength(20)
                .HasColumnName("tracking_type");
            entity.Property(e => e.UnitPrice)
                .HasPrecision(18, 4)
                .HasColumnName("unit_price");
            entity.Property(e => e.UpdatedAt).HasColumnName("updated_at");
            entity.Property(e => e.UpdatedBy)
                .HasMaxLength(255)
                .HasColumnName("updated_by");

            entity.HasOne(d => d.Part).WithMany(p => p.InventoryParts)
                .HasForeignKey(d => d.PartId)
                .OnDelete(DeleteBehavior.SetNull)
                .HasConstraintName("inventory_part_part_id_fkey");

            entity.HasOne(d => d.Location).WithMany(p => p.InventoryParts)
                .HasForeignKey(d => d.LocationId)
                .OnDelete(DeleteBehavior.SetNull)
                .HasConstraintName("inventory_part_location_id_fkey");

            entity.HasOne(d => d.Bin).WithMany(p => p.InventoryParts)
                .HasForeignKey(d => d.BinId)
                .OnDelete(DeleteBehavior.SetNull)
                .HasConstraintName("inventory_part_bin_id_fkey");
        });

        modelBuilder.Entity<InventoryPartVw>(entity =>
        {
            entity
                .HasNoKey()
                .ToView("inventory_part_vw", "sc");

            entity.Property(e => e.ConsumedQuantity).HasColumnName("consumed_quantity");
            entity.Property(e => e.Description).HasColumnName("description");
            entity.Property(e => e.InventoryCreatedAt).HasColumnName("inventory_created_at");
            entity.Property(e => e.InventoryCreatedBy)
                .HasMaxLength(255)
                .HasColumnName("inventory_created_by");
            entity.Property(e => e.InventoryId).HasColumnName("inventory_id");
            entity.Property(e => e.InventoryIsActive).HasColumnName("inventory_is_active");
            entity.Property(e => e.InventoryPartId).HasColumnName("inventory_part_id");
            entity.Property(e => e.LocationId).HasColumnName("location_id");
            entity.Property(e => e.BinId).HasColumnName("bin_id");
            entity.Property(e => e.InventoryUnitPrice)
                .HasPrecision(18, 4)
                .HasColumnName("inventory_unit_price");
            entity.Property(e => e.InventoryUpdatedAt).HasColumnName("inventory_updated_at");
            entity.Property(e => e.InventoryUpdatedBy)
                .HasMaxLength(255)
                .HasColumnName("inventory_updated_by");
            entity.Property(e => e.IsSerialNumberRequired).HasColumnName("is_serial_number_required");
            entity.Property(e => e.ManufacturingPartNumber).HasColumnName("manufacturing_part_number");
            entity.Property(e => e.PartId).HasColumnName("part_id");
            entity.Property(e => e.PartIsActive).HasColumnName("part_is_active");
            entity.Property(e => e.PartName)
                .HasMaxLength(255)
                .HasColumnName("part_name");
            entity.Property(e => e.PartNumber)
                .HasMaxLength(255)
                .HasColumnName("part_number");
            entity.Property(e => e.PartNumberSuffix)
                .HasMaxLength(255)
                .HasColumnName("part_number_suffix");
            entity.Property(e => e.PartTypeId).HasColumnName("part_type_id");
            entity.Property(e => e.PartUnitPrice)
                .HasPrecision(18, 4)
                .HasColumnName("part_unit_price");
            entity.Property(e => e.QtyAvailable).HasColumnName("qty_available");
            entity.Property(e => e.QtyIssued).HasColumnName("qty_issued");
            entity.Property(e => e.QtyOnhand).HasColumnName("qty_onhand");
            entity.Property(e => e.QtyQcFailed).HasColumnName("qty_qc_failed");
            entity.Property(e => e.QtyQcPending).HasColumnName("qty_qc_pending");
            entity.Property(e => e.QtyReserved).HasColumnName("qty_reserved");
            entity.Property(e => e.QtyScrapped).HasColumnName("qty_scrapped");
            entity.Property(e => e.QtyReturned).HasColumnName("qty_returned");
            entity.Property(e => e.ReorderLevel).HasColumnName("reorder_level");
            entity.Property(e => e.SkuCode)
                .HasMaxLength(20)
                .HasColumnName("sku_code");
            entity.Property(e => e.Status)
                .HasMaxLength(20)
                .HasColumnName("status");
            entity.Property(e => e.Version)
                .HasMaxLength(2)
                .IsFixedLength()
                .HasColumnName("version");
            entity.Property(e => e.Weight).HasColumnName("weight");
        });

        modelBuilder.Entity<InventoryServicesVw>(entity =>
        {
            entity
                .HasNoKey()
                .ToView("inventory_services_vw", "sc");

            entity.Property(e => e.ConsumedQuantity).HasColumnName("consumed_quantity");
            entity.Property(e => e.Description).HasColumnName("description");
            entity.Property(e => e.InventoryCreatedAt).HasColumnName("inventory_created_at");
            entity.Property(e => e.InventoryCreatedBy)
                .HasMaxLength(255)
                .HasColumnName("inventory_created_by");
            entity.Property(e => e.InventoryId).HasColumnName("inventory_id");
            entity.Property(e => e.InventoryIsActive).HasColumnName("inventory_is_active");
            entity.Property(e => e.InventoryPartId).HasColumnName("inventory_part_id");
            entity.Property(e => e.InventoryUnitPrice)
                .HasPrecision(18, 4)
                .HasColumnName("inventory_unit_price");
            entity.Property(e => e.InventoryUpdatedAt).HasColumnName("inventory_updated_at");
            entity.Property(e => e.InventoryUpdatedBy)
                .HasMaxLength(255)
                .HasColumnName("inventory_updated_by");
            entity.Property(e => e.IsSerialNumberRequired).HasColumnName("is_serial_number_required");
            entity.Property(e => e.ItemType)
                .HasMaxLength(255)
                .HasColumnName("item_type");
            entity.Property(e => e.ManufacturingPartNumber).HasColumnName("manufacturing_part_number");
            entity.Property(e => e.PartId).HasColumnName("part_id");
            entity.Property(e => e.PartIsActive).HasColumnName("part_is_active");
            entity.Property(e => e.PartName)
                .HasMaxLength(255)
                .HasColumnName("part_name");
            entity.Property(e => e.PartNumber)
                .HasMaxLength(255)
                .HasColumnName("part_number");
            entity.Property(e => e.PartNumberSuffix)
                .HasMaxLength(255)
                .HasColumnName("part_number_suffix");
            entity.Property(e => e.PartTypeId).HasColumnName("part_type_id");
            entity.Property(e => e.PartUnitPrice)
                .HasPrecision(18, 4)
                .HasColumnName("part_unit_price");
            entity.Property(e => e.QtyAvailable).HasColumnName("qty_available");
            entity.Property(e => e.QtyOnhand).HasColumnName("qty_onhand");
            entity.Property(e => e.QtyReserved).HasColumnName("qty_reserved");
            entity.Property(e => e.ReorderLevel).HasColumnName("reorder_level");
            entity.Property(e => e.SkuCode)
                .HasMaxLength(20)
                .HasColumnName("sku_code");
            entity.Property(e => e.Status)
                .HasMaxLength(20)
                .HasColumnName("status");
            entity.Property(e => e.Version)
                .HasMaxLength(2)
                .IsFixedLength()
                .HasColumnName("version");
            entity.Property(e => e.Weight).HasColumnName("weight");
        });

        modelBuilder.Entity<InventoryStock>(entity =>
        {
            entity.HasKey(e => e.Id).HasName("inventory_stock_pkey");

            entity.ToTable("inventory_stock", "sc");

            entity.Property(e => e.Id)
                .HasDefaultValueSql("gen_random_uuid()")
                .HasColumnName("id");
            entity.Property(e => e.AssignedUserId).HasColumnName("assigned_user_id");
            entity.Property(e => e.AvailablePrice)
                .HasPrecision(18, 4)
                .HasComputedColumnSql("((((((((qty_onhand - qty_reserved) - qty_issued) - qty_qc_pending) - qty_qc_failed))::numeric * unit_price) * conversion_rate))::numeric(18,4)", true)
                .HasColumnName("available_price");
            entity.Property(e => e.BinId).HasColumnName("bin_id");
            entity.Property(e => e.ConversionRate)
                .HasPrecision(18, 4)
                .HasDefaultValueSql("1")
                .HasColumnName("conversion_rate");
            entity.Property(e => e.CreatedAt)
                .HasDefaultValueSql("CURRENT_TIMESTAMP")
                .HasColumnName("created_at");
            entity.Property(e => e.CreatedBy)
                .HasMaxLength(255)
                .HasColumnName("created_by");
            entity.Property(e => e.Currency)
                .HasMaxLength(255)
                .HasDefaultValueSql("'INR'::character varying")
                .HasColumnName("currency");
            entity.Property(e => e.DeletedAt).HasColumnName("deleted_at");
            entity.Property(e => e.DeletedBy)
                .HasMaxLength(255)
                .HasColumnName("deleted_by");
            entity.Property(e => e.Department)
                .HasMaxLength(255)
                .HasColumnName("department");
            entity.Property(e => e.IsActive)
                .HasDefaultValue(true)
                .HasColumnName("is_active");
            entity.Property(e => e.IssuedPrice)
                .HasPrecision(18, 4)
                .HasComputedColumnSql("((((qty_issued)::numeric * unit_price) * conversion_rate))::numeric(18,4)", true)
                .HasColumnName("issued_price");
            entity.Property(e => e.LocationId).HasColumnName("location_id");
            entity.Property(e => e.PartId).HasColumnName("part_id");
            entity.Property(e => e.ProjectId).HasColumnName("project_id");
            entity.Property(e => e.QtyAvailable)
                .HasPrecision(18, 4)
                .HasComputedColumnSql("(((((qty_onhand - qty_reserved) - qty_issued) - qty_qc_failed) - qty_qc_pending))::numeric(18,4)", true)
                .HasColumnName("qty_available");
            entity.Property(e => e.QtyConsumed)
                .HasDefaultValue(0)
                .HasColumnName("qty_consumed");
            entity.Property(e => e.QtyIssued)
                .HasDefaultValue(0)
                .HasColumnName("qty_issued");
            entity.Property(e => e.QtyOnhand)
                .HasDefaultValue(0)
                .HasColumnName("qty_onhand");
            entity.Property(e => e.QtyQcFailed)
                .HasDefaultValue(0)
                .HasColumnName("qty_qc_failed");
            entity.Property(e => e.QtyQcPending)
                .HasDefaultValue(0)
                .HasColumnName("qty_qc_pending");
            entity.Property(e => e.QtyReserved)
                .HasDefaultValue(0)
                .HasColumnName("qty_reserved");
            entity.Property(e => e.QtyReturned)
                .HasDefaultValue(0)
                .HasColumnName("qty_returned");
            entity.Property(e => e.QtyScrapped)
                .HasDefaultValue(0)
                .HasColumnName("qty_scrapped");
            entity.Property(e => e.ReservedPrice)
                .HasPrecision(18, 4)
                .HasComputedColumnSql("((((qty_reserved)::numeric * unit_price) * conversion_rate))::numeric(18,4)", true)
                .HasColumnName("reserved_price");
            entity.Property(e => e.TotalPrice)
                .HasPrecision(18, 4)
                .HasComputedColumnSql("((((((qty_issued)::numeric * unit_price) * conversion_rate) + (((qty_reserved)::numeric * unit_price) * conversion_rate)) + (((((((qty_onhand - qty_reserved) - qty_issued) - qty_qc_pending) - qty_qc_failed))::numeric * unit_price) * conversion_rate)))::numeric(18,4)", true)
                .HasColumnName("total_price");
            entity.Property(e => e.TrackingId)
                .HasMaxLength(100)
                .HasColumnName("tracking_id");
            entity.Property(e => e.TrackingType)
                .HasMaxLength(20)
                .HasColumnName("tracking_type");
            entity.Property(e => e.UnitPrice)
                .HasPrecision(18, 4)
                .HasColumnName("unit_price");
            entity.Property(e => e.UpdatedAt).HasColumnName("updated_at");
            entity.Property(e => e.UpdatedBy)
                .HasMaxLength(255)
                .HasColumnName("updated_by");

            entity.HasOne(d => d.AssignedUser).WithMany(p => p.InventoryStocks)
                .HasForeignKey(d => d.AssignedUserId)
                .OnDelete(DeleteBehavior.SetNull)
                .HasConstraintName("fk_inventory_stock_assigned_user");

            entity.HasOne(d => d.Bin).WithMany(p => p.InventoryStocks)
                .HasForeignKey(d => d.BinId)
                .OnDelete(DeleteBehavior.SetNull)
                .HasConstraintName("inventory_stock_bin_id_fkey");

            entity.HasOne(d => d.Location).WithMany(p => p.InventoryStocks)
                .HasForeignKey(d => d.LocationId)
                .OnDelete(DeleteBehavior.SetNull)
                .HasConstraintName("inventory_stock_location_id_fkey");

            entity.HasOne(d => d.Part).WithMany(p => p.InventoryStocks)
                .HasForeignKey(d => d.PartId)
                .OnDelete(DeleteBehavior.SetNull)
                .HasConstraintName("inventory_stock_part_id_fkey");

            entity.HasOne(d => d.Project).WithMany()
                .HasForeignKey(d => d.ProjectId)
                .OnDelete(DeleteBehavior.SetNull)
                .HasConstraintName("inventory_stock_project_id_fkey");
        });

        modelBuilder.Entity<InventoryTransaction>(entity =>
        {
            entity.HasKey(e => e.Id).HasName("inventory_transaction_pkey");

            entity.ToTable("inventory_transaction", "sc");

            entity.Property(e => e.Id)
                .HasDefaultValueSql("gen_random_uuid()")
                .HasColumnName("id");
            entity.Property(e => e.AssignedUserId).HasColumnName("assigned_user_id");
            entity.Property(e => e.CreatedAt)
                .HasDefaultValueSql("CURRENT_TIMESTAMP")
                .HasColumnName("created_at");
            entity.Property(e => e.CreatedBy)
                .HasMaxLength(255)
                .HasColumnName("created_by");
            entity.Property(e => e.CurrentQuantity).HasColumnName("current_quantity");
            entity.Property(e => e.DeletedAt).HasColumnName("deleted_at");
            entity.Property(e => e.DeletedBy)
                .HasMaxLength(255)
                .HasColumnName("deleted_by");
            entity.Property(e => e.Department)
                .HasMaxLength(255)
                .HasColumnName("department");
            entity.Property(e => e.FromLocationId).HasColumnName("from_location_id");
            entity.Property(e => e.IsActive)
                .HasDefaultValue(true)
                .HasColumnName("is_active");
            entity.Property(e => e.Notes).HasColumnName("notes");
            entity.Property(e => e.PartId).HasColumnName("part_id");
            entity.Property(e => e.PreviousQuantity).HasColumnName("previous_quantity");
            entity.Property(e => e.ProjectId).HasColumnName("project_id");
            entity.Property(e => e.ReferenceId).HasColumnName("reference_id");
            entity.Property(e => e.ReferenceType)
                .HasMaxLength(255)
                .HasColumnName("reference_type");
            entity.Property(e => e.ToLocationId).HasColumnName("to_location_id");
            entity.Property(e => e.TrackingId)
                .HasMaxLength(255)
                .HasColumnName("tracking_id");
            entity.Property(e => e.TrackingType)
                .HasMaxLength(50)
                .HasColumnName("tracking_type");
            entity.Property(e => e.TransactedQuantity).HasColumnName("transacted_quantity");
            entity.Property(e => e.TransactionDate)
                .HasDefaultValueSql("CURRENT_TIMESTAMP")
                .HasColumnName("transaction_date");
            entity.Property(e => e.TransactionType)
                .HasMaxLength(255)
                .HasColumnName("transaction_type");
            entity.Property(e => e.UpdatedAt).HasColumnName("updated_at");
            entity.Property(e => e.UpdatedBy)
                .HasMaxLength(255)
                .HasColumnName("updated_by");

            entity.HasOne(d => d.AssignedUser).WithMany(p => p.InventoryTransactions)
                .HasForeignKey(d => d.AssignedUserId)
                .OnDelete(DeleteBehavior.SetNull)
                .HasConstraintName("fk_inventory_transaction_assigned_user");

            entity.HasOne(d => d.FromLocation).WithMany(p => p.InventoryTransactionFromLocations)
                .HasForeignKey(d => d.FromLocationId)
                .OnDelete(DeleteBehavior.SetNull)
                .HasConstraintName("fk_inventory_transaction_from_location");

            entity.HasOne(d => d.Part).WithMany(p => p.InventoryTransactions)
                .HasForeignKey(d => d.PartId)
                .OnDelete(DeleteBehavior.SetNull)
                .HasConstraintName("inventory_transaction_part_id_fkey");

            entity.HasOne(d => d.Project).WithMany()
                .HasForeignKey(d => d.ProjectId)
                .OnDelete(DeleteBehavior.SetNull)
                .HasConstraintName("fk_inventory_transaction_project");

            entity.HasOne(d => d.ToLocation).WithMany(p => p.InventoryTransactionToLocations)
                .HasForeignKey(d => d.ToLocationId)
                .OnDelete(DeleteBehavior.SetNull)
                .HasConstraintName("fk_inventory_transaction_to_location");
        });

        modelBuilder.Entity<InventoryTransactionVw>(entity =>
        {
            entity
                .HasNoKey()
                .ToView("inventory_transaction_vw", "sc");

            entity.Property(e => e.CreatedAt).HasColumnName("created_at");
            entity.Property(e => e.CreatedBy)
                .HasMaxLength(255)
                .HasColumnName("created_by");
            entity.Property(e => e.CreatedByFullName).HasColumnName("created_by_full_name");
            entity.Property(e => e.CurrentQuantity).HasColumnName("current_quantity");
            entity.Property(e => e.FromLocationId).HasColumnName("from_location_id");
            entity.Property(e => e.FromLocationName)
                .HasMaxLength(255)
                .HasColumnName("from_location_name");
            entity.Property(e => e.FromLocationNumber)
                .HasMaxLength(255)
                .HasColumnName("from_location_number");
            entity.Property(e => e.Id).HasColumnName("id");
            entity.Property(e => e.ItemType)
                .HasMaxLength(255)
                .HasColumnName("item_type");
            entity.Property(e => e.Notes).HasColumnName("notes");
            entity.Property(e => e.PartId).HasColumnName("part_id");
            entity.Property(e => e.PartName)
                .HasMaxLength(255)
                .HasColumnName("part_name");
            entity.Property(e => e.PartNumber)
                .HasMaxLength(255)
                .HasColumnName("part_number");
            entity.Property(e => e.PartStatus)
                .HasMaxLength(20)
                .HasColumnName("part_status");
            entity.Property(e => e.PartTypeId).HasColumnName("part_type_id");
            entity.Property(e => e.PreviousQuantity).HasColumnName("previous_quantity");
            entity.Property(e => e.ReferenceId).HasColumnName("reference_id");
            entity.Property(e => e.ReferenceNumber)
                .HasMaxLength(255)
                .HasColumnName("reference_number");
            entity.Property(e => e.ReferenceType)
                .HasMaxLength(255)
                .HasColumnName("reference_type");
            entity.Property(e => e.ToLocationId).HasColumnName("to_location_id");
            entity.Property(e => e.ToLocationName)
                .HasMaxLength(255)
                .HasColumnName("to_location_name");
            entity.Property(e => e.ToLocationNumber)
                .HasMaxLength(255)
                .HasColumnName("to_location_number");
            entity.Property(e => e.TransactedQuantity).HasColumnName("transacted_quantity");
            entity.Property(e => e.TransactionDate).HasColumnName("transaction_date");
            entity.Property(e => e.TransactionType)
                .HasMaxLength(255)
                .HasColumnName("transaction_type");
            entity.Property(e => e.UpdatedAt).HasColumnName("updated_at");
            entity.Property(e => e.UpdatedBy)
                .HasMaxLength(255)
                .HasColumnName("updated_by");
        });

        modelBuilder.Entity<Issue>(entity =>
        {
            entity.HasKey(e => e.Id).HasName("issue_pkey");

            entity.ToTable("issue", "application");

            entity.Property(e => e.Id)
                .HasDefaultValueSql("gen_random_uuid()")
                .HasColumnName("id");
            entity.Property(e => e.CreatedAt)
                .HasDefaultValueSql("CURRENT_TIMESTAMP")
                .HasColumnName("created_at");
            entity.Property(e => e.CreatedBy)
                .HasMaxLength(255)
                .HasColumnName("created_by");
            entity.Property(e => e.DeletedAt).HasColumnName("deleted_at");
            entity.Property(e => e.DeletedBy)
                .HasMaxLength(255)
                .HasColumnName("deleted_by");
            entity.Property(e => e.Description).HasColumnName("description");
            entity.Property(e => e.DevopsId)
                .HasMaxLength(255)
                .HasColumnName("devops_id");
            entity.Property(e => e.GuideId).HasColumnName("guide_id");
            entity.Property(e => e.IsActive)
                .HasDefaultValue(true)
                .HasColumnName("is_active");
            entity.Property(e => e.IssueType)
                .HasMaxLength(100)
                .HasColumnName("issue_type");
            entity.Property(e => e.JiraId)
                .HasMaxLength(255)
                .HasColumnName("jira_id");
            entity.Property(e => e.Priority)
                .HasMaxLength(50)
                .HasColumnName("priority");
            entity.Property(e => e.ProductId).HasColumnName("product_id");
            entity.Property(e => e.ProjectName)
                .HasMaxLength(255)
                .HasColumnName("project_name");
            entity.Property(e => e.Summary).HasColumnName("summary");
            entity.Property(e => e.UpdatedAt).HasColumnName("updated_at");
            entity.Property(e => e.UpdatedBy)
                .HasMaxLength(255)
                .HasColumnName("updated_by");
            entity.Property(e => e.WorkOrderId).HasColumnName("work_order_id");

            entity.HasOne(d => d.Guide).WithMany(p => p.Issues)
                .HasForeignKey(d => d.GuideId)
                .OnDelete(DeleteBehavior.SetNull)
                .HasConstraintName("issue_guide_id_fkey");

            entity.HasOne(d => d.Product).WithMany(p => p.Issues)
                .HasForeignKey(d => d.ProductId)
                .OnDelete(DeleteBehavior.SetNull)
                .HasConstraintName("issue_product_id_fkey");

            entity.HasOne(d => d.WorkOrder).WithMany(p => p.Issues)
                .HasForeignKey(d => d.WorkOrderId)
                .OnDelete(DeleteBehavior.SetNull)
                .HasConstraintName("issue_work_order_id_fkey");
        });

        modelBuilder.Entity<IssueHistoryVw>(entity =>
        {
            entity
                .HasNoKey()
                .ToView("issue_history_vw", "sc");

            entity.Property(e => e.CreatedBy)
                .HasMaxLength(255)
                .HasColumnName("created_by");
            entity.Property(e => e.Department)
                .HasMaxLength(255)
                .HasColumnName("department");
            entity.Property(e => e.IssuedBin)
                .HasMaxLength(255)
                .HasColumnName("issued_bin");
            entity.Property(e => e.IssuedDate).HasColumnName("issued_date");
            entity.Property(e => e.IssuedQuantity).HasColumnName("issued_quantity");
            entity.Property(e => e.MovementNumber)
                .HasMaxLength(255)
                .HasColumnName("movement_number");
            entity.Property(e => e.MovementType)
                .HasMaxLength(255)
                .HasColumnName("movement_type");
            entity.Property(e => e.PartId).HasColumnName("part_id");
            entity.Property(e => e.ProjectName)
                .HasMaxLength(255)
                .HasColumnName("project_name");
            entity.Property(e => e.ResponsiblePerson)
                .HasMaxLength(255)
                .HasColumnName("responsible_person");
            entity.Property(e => e.StockMovementLineItemId).HasColumnName("stock_movement_line_item_id");
            entity.Property(e => e.TrackingId)
                .HasMaxLength(255)
                .HasColumnName("tracking_id");
        });

        modelBuilder.Entity<Kit>(entity =>
        {
            entity.HasKey(e => e.Id).HasName("kit_pkey");

            entity.ToTable("kit", "mes");

            entity.HasIndex(e => e.Number, "kit_number_key").IsUnique();

            entity.Property(e => e.Id)
                .HasDefaultValueSql("gen_random_uuid()")
                .HasColumnName("id");
            entity.Property(e => e.CreatedAt)
                .HasDefaultValueSql("CURRENT_TIMESTAMP")
                .HasColumnName("created_at");
            entity.Property(e => e.CreatedBy)
                .HasMaxLength(255)
                .HasColumnName("created_by");
            entity.Property(e => e.DeletedAt).HasColumnName("deleted_at");
            entity.Property(e => e.DeletedBy)
                .HasMaxLength(255)
                .HasColumnName("deleted_by");
            entity.Property(e => e.IsActive)
                .HasDefaultValue(true)
                .HasColumnName("is_active");
            entity.Property(e => e.LocationId).HasColumnName("location_id");
            entity.Property(e => e.MaterialKitId).HasColumnName("material_kit_id");
            entity.Property(e => e.Name)
                .HasMaxLength(255)
                .HasColumnName("name");
            entity.Property(e => e.Number)
                .HasMaxLength(255)
                .HasColumnName("number");
            entity.Property(e => e.PartId).HasColumnName("part_id");
            entity.Property(e => e.Status)
                .HasMaxLength(255)
                .HasDefaultValueSql("'Pending'::character varying")
                .HasColumnName("status");
            entity.Property(e => e.UpdatedAt).HasColumnName("updated_at");
            entity.Property(e => e.UpdatedBy)
                .HasMaxLength(255)
                .HasColumnName("updated_by");

            entity.HasOne(d => d.Location).WithMany(p => p.Kits)
                .HasForeignKey(d => d.LocationId)
                .OnDelete(DeleteBehavior.SetNull)
                .HasConstraintName("kit_location_id_fkey");

            entity.HasOne(d => d.MaterialKit).WithMany(p => p.Kits)
                .HasForeignKey(d => d.MaterialKitId)
                .OnDelete(DeleteBehavior.SetNull)
                .HasConstraintName("kit_material_kit_id_fkey");

            entity.HasOne(d => d.Part).WithMany(p => p.Kits)
                .HasForeignKey(d => d.PartId)
                .OnDelete(DeleteBehavior.SetNull)
                .HasConstraintName("kit_part_id_fkey");
        });

        modelBuilder.Entity<KitBomComment>(entity =>
        {
            entity.HasKey(e => e.Id).HasName("kit_bom_comment_pkey");

            entity.ToTable("kit_bom_comment", "mes");

            entity.Property(e => e.Id)
                .HasDefaultValueSql("gen_random_uuid()")
                .HasColumnName("id");
            entity.Property(e => e.Comments)
                .HasMaxLength(255)
                .HasColumnName("comments");
            entity.Property(e => e.CreatedAt)
                .HasDefaultValueSql("CURRENT_TIMESTAMP")
                .HasColumnName("created_at");
            entity.Property(e => e.CreatedBy)
                .HasMaxLength(255)
                .HasColumnName("created_by");
            entity.Property(e => e.DeletedAt).HasColumnName("deleted_at");
            entity.Property(e => e.DeletedBy)
                .HasMaxLength(255)
                .HasColumnName("deleted_by");
            entity.Property(e => e.IsActive)
                .HasDefaultValue(true)
                .HasColumnName("is_active");
            entity.Property(e => e.KitId).HasColumnName("kit_id");
            entity.Property(e => e.PartId).HasColumnName("part_id");
            entity.Property(e => e.UpdatedAt).HasColumnName("updated_at");
            entity.Property(e => e.UpdatedBy)
                .HasMaxLength(255)
                .HasColumnName("updated_by");

            entity.HasOne(d => d.Kit).WithMany(p => p.KitBomComments)
                .HasForeignKey(d => d.KitId)
                .OnDelete(DeleteBehavior.SetNull)
                .HasConstraintName("kit_bom_comment_kit_id_fkey");

            entity.HasOne(d => d.Part).WithMany(p => p.KitBomComments)
                .HasForeignKey(d => d.PartId)
                .OnDelete(DeleteBehavior.SetNull)
                .HasConstraintName("kit_bom_comment_part_id_fkey");
        });

        modelBuilder.Entity<KitSerial>(entity =>
        {
            entity.HasKey(e => e.Id).HasName("kit_serial_pkey");

            entity.ToTable("kit_serial", "mes");

            entity.HasIndex(e => new { e.KitId, e.PartId, e.Serialno }, "kit_serial_kit_id_part_id_serialno_key").IsUnique();

            entity.Property(e => e.Id)
                .HasDefaultValueSql("gen_random_uuid()")
                .HasColumnName("id");
            entity.Property(e => e.CreatedAt)
                .HasDefaultValueSql("CURRENT_TIMESTAMP")
                .HasColumnName("created_at");
            entity.Property(e => e.CreatedBy)
                .HasMaxLength(255)
                .HasColumnName("created_by");
            entity.Property(e => e.DeletedAt).HasColumnName("deleted_at");
            entity.Property(e => e.DeletedBy)
                .HasMaxLength(255)
                .HasColumnName("deleted_by");
            entity.Property(e => e.IsActive)
                .HasDefaultValue(true)
                .HasColumnName("is_active");
            entity.Property(e => e.KitId).HasColumnName("kit_id");
            entity.Property(e => e.PartId).HasColumnName("part_id");
            entity.Property(e => e.Serialno)
                .HasMaxLength(255)
                .HasColumnName("serialno");
            entity.Property(e => e.Status)
                .HasMaxLength(255)
                .HasDefaultValueSql("'Unconsumed'::character varying")
                .HasColumnName("status");
            entity.Property(e => e.UpdatedAt).HasColumnName("updated_at");
            entity.Property(e => e.UpdatedBy)
                .HasMaxLength(255)
                .HasColumnName("updated_by");

            entity.HasOne(d => d.Kit).WithMany(p => p.KitSerials)
                .HasForeignKey(d => d.KitId)
                .OnDelete(DeleteBehavior.SetNull)
                .HasConstraintName("kit_serial_kit_id_fkey");

            entity.HasOne(d => d.Part).WithMany(p => p.KitSerials)
                .HasForeignKey(d => d.PartId)
                .OnDelete(DeleteBehavior.SetNull)
                .HasConstraintName("kit_serial_part_id_fkey");
        });

        modelBuilder.Entity<Location>(entity =>
        {
            entity.HasKey(e => e.Id).HasName("location_pkey");

            entity.ToTable("location", "mes");

            entity.HasIndex(e => new { e.Number, e.Name, e.DeletedAt }, "location_number_name_deleted_at_key").IsUnique();

            entity.Property(e => e.Id)
                .HasDefaultValueSql("gen_random_uuid()")
                .HasColumnName("id");
            entity.Property(e => e.CreatedAt)
                .HasDefaultValueSql("CURRENT_TIMESTAMP")
                .HasColumnName("created_at");
            entity.Property(e => e.CreatedBy)
                .HasMaxLength(255)
                .HasColumnName("created_by");
            entity.Property(e => e.DeletedAt).HasColumnName("deleted_at");
            entity.Property(e => e.DeletedBy)
                .HasMaxLength(255)
                .HasColumnName("deleted_by");
            entity.Property(e => e.IsActive)
                .HasDefaultValue(true)
                .HasColumnName("is_active");
            entity.Property(e => e.Name)
                .HasMaxLength(255)
                .HasColumnName("name");
            entity.Property(e => e.Number)
                .HasMaxLength(255)
                .HasColumnName("number");
            entity.Property(e => e.UpdatedAt).HasColumnName("updated_at");
            entity.Property(e => e.UpdatedBy)
                .HasMaxLength(255)
                .HasColumnName("updated_by");
        });

        modelBuilder.Entity<Machine>(entity =>
        {
            entity.HasKey(e => e.Id).HasName("machine_pkey");

            entity.ToTable("machine", "mes");

            entity.HasIndex(e => e.Number, "machine_number_key").IsUnique();

            entity.Property(e => e.Id)
                .HasDefaultValueSql("gen_random_uuid()")
                .HasColumnName("id");
            entity.Property(e => e.CreatedAt)
                .HasDefaultValueSql("CURRENT_TIMESTAMP")
                .HasColumnName("created_at");
            entity.Property(e => e.CreatedBy)
                .HasMaxLength(255)
                .HasColumnName("created_by");
            entity.Property(e => e.DeletedAt).HasColumnName("deleted_at");
            entity.Property(e => e.DeletedBy)
                .HasMaxLength(255)
                .HasColumnName("deleted_by");
            entity.Property(e => e.IsActive)
                .HasDefaultValue(true)
                .HasColumnName("is_active");
            entity.Property(e => e.MachineTypeId).HasColumnName("machine_type_id");
            entity.Property(e => e.Name)
                .HasMaxLength(255)
                .HasColumnName("name");
            entity.Property(e => e.Number)
                .HasMaxLength(255)
                .HasColumnName("number");
            entity.Property(e => e.UpdatedAt).HasColumnName("updated_at");
            entity.Property(e => e.UpdatedBy)
                .HasMaxLength(255)
                .HasColumnName("updated_by");

            entity.HasOne(d => d.MachineType).WithMany(p => p.Machines)
                .HasForeignKey(d => d.MachineTypeId)
                .OnDelete(DeleteBehavior.SetNull)
                .HasConstraintName("machine_machine_type_id_fkey");
        });

        modelBuilder.Entity<MachineType>(entity =>
        {
            entity.HasKey(e => e.Id).HasName("machine_type_pkey");

            entity.ToTable("machine_type", "mes");

            entity.Property(e => e.Id)
                .HasDefaultValueSql("gen_random_uuid()")
                .HasColumnName("id");
            entity.Property(e => e.CreatedAt)
                .HasDefaultValueSql("CURRENT_TIMESTAMP")
                .HasColumnName("created_at");
            entity.Property(e => e.CreatedBy)
                .HasMaxLength(255)
                .HasColumnName("created_by");
            entity.Property(e => e.DeletedAt).HasColumnName("deleted_at");
            entity.Property(e => e.DeletedBy)
                .HasMaxLength(255)
                .HasColumnName("deleted_by");
            entity.Property(e => e.IsActive)
                .HasDefaultValue(true)
                .HasColumnName("is_active");
            entity.Property(e => e.Name)
                .HasMaxLength(255)
                .HasColumnName("name");
            entity.Property(e => e.UpdatedAt).HasColumnName("updated_at");
            entity.Property(e => e.UpdatedBy)
                .HasMaxLength(255)
                .HasColumnName("updated_by");
        });

        modelBuilder.Entity<MaterialKit>(entity =>
        {
            entity.HasKey(e => e.Id).HasName("material_kit_pkey");

            entity.ToTable("material_kit", "mes");

            entity.HasIndex(e => e.ImageId, "material_kit_image_id_fkey");

            entity.HasIndex(e => e.Number, "material_kit_number_key").IsUnique();

            entity.HasIndex(e => e.Sequence, "material_kit_sequence_key").IsUnique();

            entity.Property(e => e.Id)
                .HasDefaultValueSql("gen_random_uuid()")
                .HasColumnName("id");
            entity.Property(e => e.CreatedAt)
                .HasDefaultValueSql("CURRENT_TIMESTAMP")
                .HasColumnName("created_at");
            entity.Property(e => e.CreatedBy)
                .HasMaxLength(255)
                .HasColumnName("created_by");
            entity.Property(e => e.DeletedAt).HasColumnName("deleted_at");
            entity.Property(e => e.DeletedBy)
                .HasMaxLength(255)
                .HasColumnName("deleted_by");
            entity.Property(e => e.ImageId).HasColumnName("image_id");
            entity.Property(e => e.IsActive)
                .HasDefaultValue(true)
                .HasColumnName("is_active");
            entity.Property(e => e.LocationId).HasColumnName("location_id");
            entity.Property(e => e.Name)
                .HasMaxLength(255)
                .HasColumnName("name");
            entity.Property(e => e.Number)
                .HasMaxLength(255)
                .HasDefaultValueSql("application.generate_alphanumeric_sequence('KIT-'::character varying, currval('mes.material_kit_sequence_seq'::regclass))")
                .HasColumnName("number");
            entity.Property(e => e.PartId).HasColumnName("part_id");
            entity.Property(e => e.Quantity).HasColumnName("quantity");
            entity.Property(e => e.Sequence)
                .ValueGeneratedOnAdd()
                .HasColumnName("sequence");
            entity.Property(e => e.UpdatedAt).HasColumnName("updated_at");
            entity.Property(e => e.UpdatedBy)
                .HasMaxLength(255)
                .HasColumnName("updated_by");

            entity.HasOne(d => d.Image).WithMany(p => p.MaterialKits)
                .HasForeignKey(d => d.ImageId)
                .OnDelete(DeleteBehavior.SetNull)
                .HasConstraintName("material_kit_image_id_fkey");

            entity.HasOne(d => d.Location).WithMany(p => p.MaterialKits)
                .HasForeignKey(d => d.LocationId)
                .OnDelete(DeleteBehavior.SetNull)
                .HasConstraintName("material_kit_location_id_fkey");

            entity.HasOne(d => d.Part).WithMany(p => p.MaterialKits)
                .HasForeignKey(d => d.PartId)
                .OnDelete(DeleteBehavior.SetNull)
                .HasConstraintName("material_kit_part_id_fkey");
        });

        modelBuilder.Entity<Milestone>(entity =>
        {
            entity.HasKey(e => e.Id).HasName("milestone_pkey");

            entity.ToTable("milestone", "pm");

            entity.Property(e => e.Id)
                .HasDefaultValueSql("gen_random_uuid()")
                .HasColumnName("id");
            entity.Property(e => e.CreatedAt)
                .HasDefaultValueSql("CURRENT_TIMESTAMP")
                .HasColumnName("created_at");
            entity.Property(e => e.CreatedBy)
                .HasMaxLength(255)
                .HasColumnName("created_by");
            entity.Property(e => e.DeletedAt).HasColumnName("deleted_at");
            entity.Property(e => e.DeletedBy)
                .HasMaxLength(255)
                .HasColumnName("deleted_by");
            entity.Property(e => e.Description).HasColumnName("description");
            entity.Property(e => e.IsActive)
                .HasDefaultValue(true)
                .HasColumnName("is_active");
            entity.Property(e => e.Name)
                .HasMaxLength(255)
                .HasColumnName("name");
            entity.Property(e => e.ProjectId).HasColumnName("project_id");
            entity.Property(e => e.Status)
                .HasMaxLength(255)
                .HasColumnName("status");
            entity.Property(e => e.TargetDate).HasColumnName("target_date");
            entity.Property(e => e.UpdatedAt).HasColumnName("updated_at");
            entity.Property(e => e.UpdatedBy)
                .HasMaxLength(255)
                .HasColumnName("updated_by");

            entity.HasOne(d => d.Project).WithMany(p => p.Milestones)
                .HasForeignKey(d => d.ProjectId)
                .OnDelete(DeleteBehavior.SetNull)
                .HasConstraintName("milestone_project_id_fkey");
        });

        modelBuilder.Entity<News>(entity =>
        {
            entity.HasKey(e => e.Id).HasName("news_pkey");

            entity.ToTable("news", "mes");

            entity.HasIndex(e => e.Title, "news_title_key").IsUnique();

            entity.Property(e => e.Id)
                .HasDefaultValueSql("gen_random_uuid()")
                .HasColumnName("id");
            entity.Property(e => e.CreatedAt)
                .HasDefaultValueSql("CURRENT_TIMESTAMP")
                .HasColumnName("created_at");
            entity.Property(e => e.CreatedBy)
                .HasMaxLength(255)
                .HasColumnName("created_by");
            entity.Property(e => e.DeletedAt).HasColumnName("deleted_at");
            entity.Property(e => e.DeletedBy)
                .HasMaxLength(255)
                .HasColumnName("deleted_by");
            entity.Property(e => e.Hyperlink)
                .HasMaxLength(255)
                .HasColumnName("hyperlink");
            entity.Property(e => e.Image)
                .HasMaxLength(255)
                .HasColumnName("image");
            entity.Property(e => e.IsActive)
                .HasDefaultValue(true)
                .HasColumnName("is_active");
            entity.Property(e => e.NewsTypeId).HasColumnName("news_type_id");
            entity.Property(e => e.Origin)
                .HasMaxLength(255)
                .HasColumnName("origin");
            entity.Property(e => e.Title)
                .HasMaxLength(255)
                .HasColumnName("title");
            entity.Property(e => e.UpdatedAt).HasColumnName("updated_at");
            entity.Property(e => e.UpdatedBy)
                .HasMaxLength(255)
                .HasColumnName("updated_by");

            entity.HasOne(d => d.NewsType).WithMany(p => p.News)
                .HasForeignKey(d => d.NewsTypeId)
                .OnDelete(DeleteBehavior.SetNull)
                .HasConstraintName("news_news_type_id_fkey");
        });

        modelBuilder.Entity<NewsType>(entity =>
        {
            entity.HasKey(e => e.Id).HasName("news_type_pkey");

            entity.ToTable("news_type", "mes");

            entity.Property(e => e.Id)
                .HasDefaultValueSql("gen_random_uuid()")
                .HasColumnName("id");
            entity.Property(e => e.CreatedAt)
                .HasDefaultValueSql("CURRENT_TIMESTAMP")
                .HasColumnName("created_at");
            entity.Property(e => e.CreatedBy)
                .HasMaxLength(255)
                .HasColumnName("created_by");
            entity.Property(e => e.DeletedAt).HasColumnName("deleted_at");
            entity.Property(e => e.DeletedBy)
                .HasMaxLength(255)
                .HasColumnName("deleted_by");
            entity.Property(e => e.IsActive)
                .HasDefaultValue(true)
                .HasColumnName("is_active");
            entity.Property(e => e.Name)
                .HasMaxLength(255)
                .HasColumnName("name");
            entity.Property(e => e.UpdatedAt).HasColumnName("updated_at");
            entity.Property(e => e.UpdatedBy)
                .HasMaxLength(255)
                .HasColumnName("updated_by");
        });

        modelBuilder.Entity<OptionSet>(entity =>
        {
            entity.HasKey(e => e.Id).HasName("option_set_pkey");

            entity.ToTable("option_set", "application");

            entity.HasIndex(e => e.DisplayName, "option_set_display_name_key").IsUnique();

            entity.HasIndex(e => e.Name, "option_set_name_key").IsUnique();

            entity.Property(e => e.Id)
                .HasDefaultValueSql("gen_random_uuid()")
                .HasColumnName("id");
            entity.Property(e => e.ApplicationName)
                .HasMaxLength(255)
                .HasDefaultValueSql("'All'::character varying")
                .HasColumnName("application_name");
            entity.Property(e => e.Columns)
                .HasColumnType("json")
                .HasColumnName("columns");
            entity.Property(e => e.CreatedAt)
                .HasDefaultValueSql("CURRENT_TIMESTAMP")
                .HasColumnName("created_at");
            entity.Property(e => e.CreatedBy)
                .HasMaxLength(255)
                .HasColumnName("created_by");
            entity.Property(e => e.DeletedAt).HasColumnName("deleted_at");
            entity.Property(e => e.DeletedBy)
                .HasMaxLength(255)
                .HasColumnName("deleted_by");
            entity.Property(e => e.Description).HasColumnName("description");
            entity.Property(e => e.DisplayName)
                .HasMaxLength(255)
                .HasColumnName("display_name");
            entity.Property(e => e.IsActive)
                .HasDefaultValue(true)
                .HasColumnName("is_active");
            entity.Property(e => e.Name)
                .HasMaxLength(255)
                .HasColumnName("name");
            entity.Property(e => e.UpdatedAt).HasColumnName("updated_at");
            entity.Property(e => e.UpdatedBy)
                .HasMaxLength(255)
                .HasColumnName("updated_by");
            entity.Property(e => e.Values)
                .HasColumnType("json")
                .HasColumnName("values");
        });

        modelBuilder.Entity<Organization>(entity =>
        {
            entity.HasKey(e => e.Id).HasName("organization_pkey");

            entity.ToTable("organization", "application");

            entity.Property(e => e.Id)
                .HasDefaultValueSql("gen_random_uuid()")
                .HasColumnName("id");
            entity.Property(e => e.Category)
                .HasMaxLength(255)
                .HasColumnName("category");
            entity.Property(e => e.CreatedAt)
                .HasDefaultValueSql("CURRENT_TIMESTAMP")
                .HasColumnName("created_at");
            entity.Property(e => e.CreatedBy)
                .HasMaxLength(255)
                .HasColumnName("created_by");
            entity.Property(e => e.DeletedAt).HasColumnName("deleted_at");
            entity.Property(e => e.DeletedBy)
                .HasMaxLength(255)
                .HasColumnName("deleted_by");
            entity.Property(e => e.Description).HasColumnName("description");
            entity.Property(e => e.ImageUrl)
                .HasMaxLength(500)
                .HasColumnName("image_url");
            entity.Property(e => e.IsActive)
                .HasDefaultValue(true)
                .HasColumnName("is_active");
            entity.Property(e => e.Name)
                .HasMaxLength(255)
                .HasColumnName("name");
            entity.Property(e => e.TaxNumber)
                .HasMaxLength(255)
                .HasColumnName("tax_number");
            entity.Property(e => e.UpdatedAt).HasColumnName("updated_at");
            entity.Property(e => e.UpdatedBy)
                .HasMaxLength(255)
                .HasColumnName("updated_by");
        });

        modelBuilder.Entity<OrganizationAddress>(entity =>
        {
            entity.HasKey(e => e.Id).HasName("organization_address_pkey");

            entity.ToTable("organization_address", "application");

            entity.Property(e => e.Id)
                .HasDefaultValueSql("gen_random_uuid()")
                .HasColumnName("id");
            entity.Property(e => e.AddressId).HasColumnName("address_id");
            entity.Property(e => e.AddressType)
                .HasMaxLength(50)
                .HasColumnName("address_type");
            entity.Property(e => e.CreatedAt)
                .HasDefaultValueSql("CURRENT_TIMESTAMP")
                .HasColumnName("created_at");
            entity.Property(e => e.CreatedBy)
                .HasMaxLength(255)
                .HasColumnName("created_by");
            entity.Property(e => e.DeletedAt).HasColumnName("deleted_at");
            entity.Property(e => e.DeletedBy)
                .HasMaxLength(255)
                .HasColumnName("deleted_by");
            entity.Property(e => e.IsActive)
                .HasDefaultValue(true)
                .HasColumnName("is_active");
            entity.Property(e => e.OrganizationId).HasColumnName("organization_id");
            entity.Property(e => e.UpdatedAt).HasColumnName("updated_at");
            entity.Property(e => e.UpdatedBy)
                .HasMaxLength(255)
                .HasColumnName("updated_by");

            entity.HasOne(d => d.Address).WithMany(p => p.OrganizationAddresses)
                .HasForeignKey(d => d.AddressId)
                .OnDelete(DeleteBehavior.SetNull)
                .HasConstraintName("organization_address_address_id_fkey");

            entity.HasOne(d => d.Organization).WithMany(p => p.OrganizationAddresses)
                .HasForeignKey(d => d.OrganizationId)
                .OnDelete(DeleteBehavior.SetNull)
                .HasConstraintName("organization_address_organization_id_fkey");
        });

        modelBuilder.Entity<Part>(entity =>
        {
            entity.HasKey(e => e.Id).HasName("part_pkey");

            entity.ToTable("part", "mes");

            entity.HasIndex(e => e.Grade, "idx_part_grade").HasFilter("(deleted_at IS NULL)");

            entity.HasIndex(e => e.SubsystemId, "idx_part_subsystem_id");

            entity.HasIndex(e => new { e.PartNumberSuffix, e.Version }, "idx_part_suffix_version")
                .IsDescending(false, true)
                .HasFilter("((item_type IS NULL) AND (deleted_by IS NULL))");

            entity.HasIndex(e => new { e.ManufacturingPartNumber, e.DeletedAt }, "part_manufacturing_part_number_deleted_at_key").IsUnique();

            entity.HasIndex(e => e.PartNumber, "part_part_number_key").IsUnique();

            entity.Property(e => e.Id)
                .HasDefaultValueSql("gen_random_uuid()")
                .HasColumnName("id");
            entity.Property(e => e.CountryOfOriginId).HasColumnName("country_of_origin_id");
            entity.Property(e => e.CreatedAt)
                .HasDefaultValueSql("CURRENT_TIMESTAMP")
                .HasColumnName("created_at");
            entity.Property(e => e.CreatedBy)
                .HasMaxLength(255)
                .HasColumnName("created_by");
            entity.Property(e => e.DeletedAt).HasColumnName("deleted_at");
            entity.Property(e => e.DeletedBy)
                .HasMaxLength(255)
                .HasColumnName("deleted_by");
            entity.Property(e => e.Description).HasColumnName("description");
            entity.Property(e => e.EcoId).HasColumnName("eco_id");
            entity.Property(e => e.Grade)
                .HasMaxLength(100)
                .HasColumnName("grade");
            entity.Property(e => e.HasBom)
                .HasDefaultValue(false)
                .HasColumnName("has_bom");
            entity.Property(e => e.IsActive)
                .HasDefaultValue(true)
                .HasColumnName("is_active");
            entity.Property(e => e.IsSerialNumberRequired)
                .HasDefaultValue(true)
                .HasColumnName("is_serial_number_required");
            entity.Property(e => e.ItemType)
                .HasMaxLength(255)
                .HasColumnName("item_type");
            entity.Property(e => e.MakeBuy).HasColumnName("make_buy");
            entity.Property(e => e.ManufacturerName)
                .HasMaxLength(255)
                .HasColumnName("manufacturer_name");
            entity.Property(e => e.ManufacturingPartNumber).HasColumnName("manufacturing_part_number");
            entity.Property(e => e.Material)
                .HasMaxLength(255)
                .HasColumnName("material");
            entity.Property(e => e.Name)
                .HasMaxLength(255)
                .HasColumnName("name");
            entity.Property(e => e.Number)
                .HasMaxLength(255)
                .HasColumnName("number");
            entity.Property(e => e.Package)
                .HasMaxLength(100)
                .HasColumnName("package");
            entity.Property(e => e.PartNumber)
                .HasMaxLength(255)
                .HasComputedColumnSql("(((part_number_suffix)::text || '-'::text) || (version)::text)", true)
                .HasColumnName("part_number");
            entity.Property(e => e.PartNumberSuffix)
                .HasMaxLength(255)
                .HasColumnName("part_number_suffix");
            entity.Property(e => e.PartTypeId).HasColumnName("part_type_id");
            entity.Property(e => e.Qualification)
                .HasMaxLength(100)
                .HasColumnName("qualification");
            entity.Property(e => e.RadiationTolerance)
                .HasMaxLength(100)
                .HasColumnName("radiation_tolerance");
            entity.Property(e => e.ReferenceNumber)
                .HasMaxLength(255)
                .HasColumnName("reference_number");
            entity.Property(e => e.ShortDescription).HasColumnName("short_description");
            entity.Property(e => e.SpaceQualified).HasColumnName("space_qualified");
            entity.Property(e => e.Specification).HasColumnName("specification");
            entity.Property(e => e.Status)
                .HasMaxLength(20)
                .HasDefaultValueSql("'Draft'::character varying")
                .HasColumnName("status");
            entity.Property(e => e.SubsystemId).HasColumnName("subsystem_id");
            entity.Property(e => e.TempCoefficient)
                .HasMaxLength(50)
                .HasColumnName("temp_coefficient");
            entity.Property(e => e.TempRange)
                .HasMaxLength(50)
                .HasColumnName("temp_range");
            entity.Property(e => e.Trl).HasColumnName("trl");
            entity.Property(e => e.UnitOfMeasureId).HasColumnName("unit_of_measure_id");
            entity.Property(e => e.UnitPrice)
                .HasPrecision(18, 4)
                .HasColumnName("unit_price");
            entity.Property(e => e.UpdatedAt).HasColumnName("updated_at");
            entity.Property(e => e.UpdatedBy)
                .HasMaxLength(255)
                .HasColumnName("updated_by");
            entity.Property(e => e.Version)
                .HasMaxLength(2)
                .HasDefaultValueSql("'01'::bpchar")
                .IsFixedLength()
                .HasColumnName("version");
            entity.Property(e => e.Weight).HasColumnName("weight");

            entity.HasOne(d => d.Eco).WithMany(p => p.Parts)
                .HasForeignKey(d => d.EcoId)
                .OnDelete(DeleteBehavior.SetNull)
                .HasConstraintName("part_eco_id_fkey");

            entity.HasOne(d => d.PartType).WithMany(p => p.Parts)
                .HasForeignKey(d => d.PartTypeId)
                .OnDelete(DeleteBehavior.SetNull)
                .HasConstraintName("part_part_type_id_fkey");

            entity.HasOne(d => d.Subsystem).WithMany(p => p.Parts)
                .HasForeignKey(d => d.SubsystemId)
                .OnDelete(DeleteBehavior.SetNull)
                .HasConstraintName("part_subsystem_id_fkey");

            entity.HasOne(d => d.UnitOfMeasure).WithMany(p => p.Parts)
                .HasForeignKey(d => d.UnitOfMeasureId)
                .OnDelete(DeleteBehavior.SetNull)
                .HasConstraintName("part_unit_of_measure_id_fkey");
        });

        modelBuilder.Entity<PartLevel>(entity =>
        {
            entity.HasKey(e => e.Id).HasName("part_level_pkey");

            entity.ToTable("part_level", "mes");

            entity.HasIndex(e => new { e.Code, e.DeletedAt }, "part_level_code_deleted_at_key").IsUnique();

            entity.Property(e => e.Id)
                .HasDefaultValueSql("gen_random_uuid()")
                .HasColumnName("id");
            entity.Property(e => e.Code)
                .HasMaxLength(50)
                .HasColumnName("code");
            entity.Property(e => e.CreatedAt)
                .HasDefaultValueSql("CURRENT_TIMESTAMP")
                .HasColumnName("created_at");
            entity.Property(e => e.CreatedBy)
                .HasMaxLength(255)
                .HasColumnName("created_by");
            entity.Property(e => e.DeletedAt).HasColumnName("deleted_at");
            entity.Property(e => e.DeletedBy)
                .HasMaxLength(255)
                .HasColumnName("deleted_by");
            entity.Property(e => e.Description)
                .HasMaxLength(500)
                .HasColumnName("description");
            entity.Property(e => e.IsActive)
                .HasDefaultValue(true)
                .HasColumnName("is_active");
            entity.Property(e => e.Name)
                .HasMaxLength(100)
                .HasColumnName("name");
            entity.Property(e => e.SortOrder).HasColumnName("sort_order");
            entity.Property(e => e.UpdatedAt).HasColumnName("updated_at");
            entity.Property(e => e.UpdatedBy)
                .HasMaxLength(255)
                .HasColumnName("updated_by");
        });

        modelBuilder.Entity<PartType>(entity =>
        {
            entity.HasKey(e => e.Id).HasName("part_type_pkey");

            entity.ToTable("part_type", "mes");

            entity.Property(e => e.Id)
                .HasDefaultValueSql("gen_random_uuid()")
                .HasColumnName("id");
            entity.Property(e => e.Category)
                .HasMaxLength(255)
                .HasColumnName("category");
            entity.Property(e => e.CategoryType)
                .HasMaxLength(255)
                .HasColumnName("category_type");
            entity.Property(e => e.CreatedAt)
                .HasDefaultValueSql("CURRENT_TIMESTAMP")
                .HasColumnName("created_at");
            entity.Property(e => e.CreatedBy)
                .HasMaxLength(255)
                .HasColumnName("created_by");
            entity.Property(e => e.DeletedAt).HasColumnName("deleted_at");
            entity.Property(e => e.DeletedBy)
                .HasMaxLength(255)
                .HasColumnName("deleted_by");
            entity.Property(e => e.Department)
                .HasMaxLength(255)
                .HasColumnName("department");
            entity.Property(e => e.IsActive)
                .HasDefaultValue(true)
                .HasColumnName("is_active");
            entity.Property(e => e.IsVisibleInUi)
                .HasDefaultValue(true)
                .HasColumnName("is_visible_in_ui");
            entity.Property(e => e.Name)
                .HasMaxLength(255)
                .HasColumnName("name");
            entity.Property(e => e.PartLevelId).HasColumnName("part_level_id");
            entity.Property(e => e.PartNumberPrefix)
                .HasMaxLength(3)
                .HasColumnName("part_number_prefix");
            entity.Property(e => e.PartTypeCategoryId).HasColumnName("part_type_category_id");
            entity.Property(e => e.UpdatedAt).HasColumnName("updated_at");
            entity.Property(e => e.UpdatedBy)
                .HasMaxLength(255)
                .HasColumnName("updated_by");

            entity.HasOne(d => d.PartLevel).WithMany(p => p.PartTypes)
                .HasForeignKey(d => d.PartLevelId)
                .OnDelete(DeleteBehavior.SetNull)
                .HasConstraintName("part_type_part_level_id_fkey");

            entity.HasOne(d => d.PartTypeCategory).WithMany(p => p.PartTypes)
                .HasForeignKey(d => d.PartTypeCategoryId)
                .OnDelete(DeleteBehavior.SetNull)
                .HasConstraintName("part_type_part_type_category_id_fkey");
        });

        modelBuilder.Entity<PartTypeCategory>(entity =>
        {
            entity.HasKey(e => e.Id).HasName("part_type_category_pkey");

            entity.ToTable("part_type_category", "mes");

            entity.Property(e => e.Id)
                .HasDefaultValueSql("gen_random_uuid()")
                .HasColumnName("id");
            entity.Property(e => e.CreatedAt)
                .HasDefaultValueSql("CURRENT_TIMESTAMP")
                .HasColumnName("created_at");
            entity.Property(e => e.CreatedBy)
                .HasMaxLength(255)
                .HasColumnName("created_by");
            entity.Property(e => e.DeletedAt).HasColumnName("deleted_at");
            entity.Property(e => e.DeletedBy)
                .HasMaxLength(255)
                .HasColumnName("deleted_by");
            entity.Property(e => e.Description).HasColumnName("description");
            entity.Property(e => e.IsActive)
                .HasDefaultValue(true)
                .HasColumnName("is_active");
            entity.Property(e => e.Name)
                .HasMaxLength(255)
                .HasColumnName("name");
            entity.Property(e => e.UpdatedAt).HasColumnName("updated_at");
            entity.Property(e => e.UpdatedBy)
                .HasMaxLength(255)
                .HasColumnName("updated_by");
        });

        modelBuilder.Entity<PartsNotAssociatedWithGuide>(entity =>
        {
            entity
                .HasNoKey()
                .ToView("parts_not_associated_with_guides", "mes");

            entity.Property(e => e.CreatedAt).HasColumnName("created_at");
            entity.Property(e => e.CreatedBy)
                .HasMaxLength(255)
                .HasColumnName("created_by");
            entity.Property(e => e.Description).HasColumnName("description");
            entity.Property(e => e.ShortDescription).HasColumnName("short_description");
            entity.Property(e => e.Id).HasColumnName("id");
            entity.Property(e => e.IsActive).HasColumnName("is_active");
            entity.Property(e => e.IsSerialNumberRequired).HasColumnName("is_serial_number_required");
            entity.Property(e => e.MakeBuy).HasColumnName("make_buy");
            entity.Property(e => e.Name)
                .HasMaxLength(255)
                .HasColumnName("name");
            entity.Property(e => e.PartNumber)
                .HasMaxLength(255)
                .HasColumnName("part_number");
            entity.Property(e => e.PartTypeId).HasColumnName("part_type_id");
            entity.Property(e => e.ReferenceNumber)
                .HasMaxLength(255)
                .HasColumnName("reference_number");
            entity.Property(e => e.Status)
                .HasMaxLength(20)
                .HasColumnName("status");
            entity.Property(e => e.UnitOfMeasureId).HasColumnName("unit_of_measure_id");
            entity.Property(e => e.UpdatedAt).HasColumnName("updated_at");
            entity.Property(e => e.UpdatedBy)
                .HasMaxLength(255)
                .HasColumnName("updated_by");
        });

        modelBuilder.Entity<PaymentTerm>(entity =>
        {
            entity.HasKey(e => e.Id).HasName("payment_term_pkey");

            entity.ToTable("payment_term", "sc");

            entity.Property(e => e.Id)
                .HasDefaultValueSql("gen_random_uuid()")
                .HasColumnName("id");
            entity.Property(e => e.CreatedAt)
                .HasDefaultValueSql("CURRENT_TIMESTAMP")
                .HasColumnName("created_at");
            entity.Property(e => e.CreatedBy)
                .HasMaxLength(255)
                .HasColumnName("created_by");
            entity.Property(e => e.DeletedAt).HasColumnName("deleted_at");
            entity.Property(e => e.DeletedBy)
                .HasMaxLength(255)
                .HasColumnName("deleted_by");
            entity.Property(e => e.Description)
                .HasMaxLength(100)
                .HasColumnName("description");
            entity.Property(e => e.DiscountDays).HasColumnName("discount_days");
            entity.Property(e => e.DiscountPercent)
                .HasPrecision(5, 2)
                .HasColumnName("discount_percent");
            entity.Property(e => e.DueDays).HasColumnName("due_days");
            entity.Property(e => e.IsActive)
                .HasDefaultValue(true)
                .HasColumnName("is_active");
            entity.Property(e => e.Name)
                .HasMaxLength(50)
                .HasColumnName("name");
            entity.Property(e => e.PaymentTermType)
                .HasMaxLength(100)
                .HasColumnName("payment_term_type");
            entity.Property(e => e.PaymentTerms).HasColumnName("payment_terms");
            entity.Property(e => e.UpdatedAt).HasColumnName("updated_at");
            entity.Property(e => e.UpdatedBy)
                .HasMaxLength(255)
                .HasColumnName("updated_by");
        });

        modelBuilder.Entity<Permission>(entity =>
        {
            entity.HasKey(e => e.Id).HasName("permission_pkey");

            entity.ToTable("permission", "application");

            entity.HasIndex(e => e.Name, "permission_name_key").IsUnique();

            entity.Property(e => e.Id)
                .HasDefaultValueSql("gen_random_uuid()")
                .HasColumnName("id");
            entity.Property(e => e.CategoryName)
                .HasMaxLength(255)
                .HasColumnName("category_name");
            entity.Property(e => e.CreatedAt)
                .HasDefaultValueSql("CURRENT_TIMESTAMP")
                .HasColumnName("created_at");
            entity.Property(e => e.CreatedBy)
                .HasMaxLength(255)
                .HasColumnName("created_by");
            entity.Property(e => e.DeletedAt).HasColumnName("deleted_at");
            entity.Property(e => e.DeletedBy)
                .HasMaxLength(255)
                .HasColumnName("deleted_by");
            entity.Property(e => e.IsActive)
                .HasDefaultValue(true)
                .HasColumnName("is_active");
            entity.Property(e => e.Name)
                .HasMaxLength(255)
                .HasColumnName("name");
            entity.Property(e => e.UpdatedAt).HasColumnName("updated_at");
            entity.Property(e => e.UpdatedBy)
                .HasMaxLength(255)
                .HasColumnName("updated_by");
        });

        modelBuilder.Entity<Platform>(entity =>
        {
            entity.HasKey(e => e.Id).HasName("platform_pkey");

            entity.ToTable("platform", "mes");

            entity.HasIndex(e => e.Code, "platform_code_key").IsUnique();

            entity.Property(e => e.Id)
                .HasDefaultValueSql("gen_random_uuid()")
                .HasColumnName("id");
            entity.Property(e => e.Code)
                .HasMaxLength(255)
                .HasColumnName("code");
            entity.Property(e => e.CreatedAt)
                .HasDefaultValueSql("CURRENT_TIMESTAMP")
                .HasColumnName("created_at");
            entity.Property(e => e.CreatedBy)
                .HasMaxLength(255)
                .HasColumnName("created_by");
            entity.Property(e => e.DeletedAt).HasColumnName("deleted_at");
            entity.Property(e => e.DeletedBy)
                .HasMaxLength(255)
                .HasColumnName("deleted_by");
            entity.Property(e => e.Description)
                .HasMaxLength(1000)
                .HasColumnName("description");
            entity.Property(e => e.IsActive)
                .HasDefaultValue(true)
                .HasColumnName("is_active");
            entity.Property(e => e.Name)
                .HasMaxLength(255)
                .HasColumnName("name");
            entity.Property(e => e.UpdatedAt).HasColumnName("updated_at");
            entity.Property(e => e.UpdatedBy)
                .HasMaxLength(255)
                .HasColumnName("updated_by");
        });

        modelBuilder.Entity<PoLineItem>(entity =>
        {
            entity.HasKey(e => e.Id).HasName("po_line_item_pkey");

            entity.ToTable("po_line_item", "sc");

            entity.Property(e => e.Id)
                .HasDefaultValueSql("gen_random_uuid()")
                .HasColumnName("id");
            entity.Property(e => e.ActualDeliveryDate).HasColumnName("actual_delivery_date");
            entity.Property(e => e.ConversionRate)
                .HasPrecision(18, 4)
                .HasDefaultValueSql("1")
                .HasColumnName("conversion_rate");
            entity.Property(e => e.CreatedAt)
                .HasDefaultValueSql("CURRENT_TIMESTAMP")
                .HasColumnName("created_at");
            entity.Property(e => e.CreatedBy)
                .HasMaxLength(255)
                .HasColumnName("created_by");
            entity.Property(e => e.Currency)
                .HasMaxLength(255)
                .HasColumnName("currency");
            entity.Property(e => e.DeletedAt).HasColumnName("deleted_at");
            entity.Property(e => e.DeletedBy)
                .HasMaxLength(255)
                .HasColumnName("deleted_by");
            entity.Property(e => e.Description).HasColumnName("description");
            entity.Property(e => e.Discount)
                .HasPrecision(18, 4)
                .HasColumnName("discount");
            entity.Property(e => e.DiscountType)
                .HasMaxLength(50)
                .HasColumnName("discount_type");
            entity.Property(e => e.ExpectedDeliveryDate).HasColumnName("expected_delivery_date");
            entity.Property(e => e.Hsn)
                .HasMaxLength(255)
                .HasColumnName("hsn");
            entity.Property(e => e.IsActive)
                .HasDefaultValue(true)
                .HasColumnName("is_active");
            entity.Property(e => e.OrderedQuantity).HasColumnName("ordered_quantity");
            entity.Property(e => e.PartId).HasColumnName("part_id");
            entity.Property(e => e.PendingQuantity).HasColumnName("pending_quantity");
            entity.Property(e => e.PurchaseOrderId).HasColumnName("purchase_order_id");
            entity.Property(e => e.ReceivedQuantity).HasColumnName("received_quantity");
            entity.Property(e => e.Tax)
                .HasPrecision(18, 4)
                .HasColumnName("tax");
            entity.Property(e => e.TaxType)
                .HasMaxLength(50)
                .HasColumnName("tax_type");
            entity.Property(e => e.TotalPrice)
                .HasPrecision(18, 4)
                .HasColumnName("total_price");
            entity.Property(e => e.UnitPrice)
                .HasPrecision(18, 4)
                .HasColumnName("unit_price");
            entity.Property(e => e.UpdatedAt).HasColumnName("updated_at");
            entity.Property(e => e.UpdatedBy)
                .HasMaxLength(255)
                .HasColumnName("updated_by");

            entity.HasOne(d => d.Part).WithMany(p => p.PoLineItems)
                .HasForeignKey(d => d.PartId)
                .OnDelete(DeleteBehavior.SetNull)
                .HasConstraintName("po_line_item_part_id_fkey");

            entity.HasOne(d => d.PurchaseOrder).WithMany(p => p.PoLineItems)
                .HasForeignKey(d => d.PurchaseOrderId)
                .OnDelete(DeleteBehavior.SetNull)
                .HasConstraintName("po_line_item_purchase_order_id_fkey");
        });

        modelBuilder.Entity<Product>(entity =>
        {
            entity.HasKey(e => e.Id).HasName("product_pkey");

            entity.ToTable("product", "mes");

            entity.HasIndex(e => e.ImageId, "product_image_id_fkey");

            entity.HasIndex(e => e.Number, "product_number_key").IsUnique();

            entity.HasIndex(e => e.Sequence, "product_sequence_key").IsUnique();

            entity.Property(e => e.Id)
                .HasDefaultValueSql("gen_random_uuid()")
                .HasColumnName("id");
            entity.Property(e => e.CreatedAt)
                .HasDefaultValueSql("CURRENT_TIMESTAMP")
                .HasColumnName("created_at");
            entity.Property(e => e.CreatedBy)
                .HasMaxLength(255)
                .HasColumnName("created_by");
            entity.Property(e => e.DeletedAt).HasColumnName("deleted_at");
            entity.Property(e => e.DeletedBy)
                .HasMaxLength(255)
                .HasColumnName("deleted_by");
            entity.Property(e => e.Description).HasColumnName("description");
            entity.Property(e => e.ImageId).HasColumnName("image_id");
            entity.Property(e => e.IsActive)
                .HasDefaultValue(true)
                .HasColumnName("is_active");
            entity.Property(e => e.Name)
                .HasMaxLength(255)
                .HasColumnName("name");
            entity.Property(e => e.Number)
                .HasMaxLength(255)
                .HasDefaultValueSql("application.generate_alphanumeric_sequence('PD-'::character varying, currval('mes.product_sequence_seq'::regclass))")
                .HasColumnName("number");
            entity.Property(e => e.PartId).HasColumnName("part_id");
            entity.Property(e => e.PlatformId).HasColumnName("platform_id");
            entity.Property(e => e.Sequence)
                .ValueGeneratedOnAdd()
                .HasColumnName("sequence");
            entity.Property(e => e.UpdatedAt).HasColumnName("updated_at");
            entity.Property(e => e.UpdatedBy)
                .HasMaxLength(255)
                .HasColumnName("updated_by");

            entity.HasOne(d => d.Image).WithMany(p => p.Products)
                .HasForeignKey(d => d.ImageId)
                .OnDelete(DeleteBehavior.SetNull)
                .HasConstraintName("product_image_id_fkey");

            entity.HasOne(d => d.Part).WithMany(p => p.Products)
                .HasForeignKey(d => d.PartId)
                .OnDelete(DeleteBehavior.SetNull)
                .HasConstraintName("product_part_id_fkey");

            entity.HasOne(d => d.Platform).WithMany(p => p.Products)
                .HasForeignKey(d => d.PlatformId)
                .OnDelete(DeleteBehavior.SetNull)
                .HasConstraintName("product_platform_id_fkey");
        });

        modelBuilder.Entity<Program>(entity =>
        {
            entity.HasKey(e => e.Id).HasName("program_pkey");

            entity.ToTable("program", "pm");

            entity.Property(e => e.Id)
                .HasDefaultValueSql("gen_random_uuid()")
                .HasColumnName("id");
            entity.Property(e => e.ActualSpend)
                .HasPrecision(18, 4)
                .HasColumnName("actual_spend");
            entity.Property(e => e.Budget)
                .HasPrecision(18, 4)
                .HasColumnName("budget");
            entity.Property(e => e.BuyerId).HasColumnName("buyer_id");
            entity.Property(e => e.CreatedAt)
                .HasDefaultValueSql("CURRENT_TIMESTAMP")
                .HasColumnName("created_at");
            entity.Property(e => e.CreatedBy)
                .HasMaxLength(255)
                .HasColumnName("created_by");
            entity.Property(e => e.CustomerId).HasColumnName("customer_id");
            entity.Property(e => e.DeletedAt).HasColumnName("deleted_at");
            entity.Property(e => e.DeletedBy)
                .HasMaxLength(255)
                .HasColumnName("deleted_by");
            entity.Property(e => e.Description).HasColumnName("description");
            entity.Property(e => e.EndDate).HasColumnName("end_date");
            entity.Property(e => e.Goals).HasColumnName("goals");
            entity.Property(e => e.IsActive)
                .HasDefaultValue(true)
                .HasColumnName("is_active");
            entity.Property(e => e.Name)
                .HasMaxLength(255)
                .HasColumnName("name");
            entity.Property(e => e.ProgramCode)
                .HasMaxLength(255)
                .HasDefaultValueSql("pm.generate_program_code()")
                .HasColumnName("program_code");
            entity.Property(e => e.ProgramManagerId).HasColumnName("program_manager_id");
            entity.Property(e => e.StartDate).HasColumnName("start_date");
            entity.Property(e => e.Status)
                .HasMaxLength(255)
                .HasColumnName("status");
            entity.Property(e => e.SupplyChainManagerId).HasColumnName("supply_chain_manager_id");
            entity.Property(e => e.UpdatedAt).HasColumnName("updated_at");
            entity.Property(e => e.UpdatedBy)
                .HasMaxLength(255)
                .HasColumnName("updated_by");

            entity.HasOne(d => d.Buyer).WithMany(p => p.ProgramBuyers)
                .HasForeignKey(d => d.BuyerId)
                .OnDelete(DeleteBehavior.SetNull)
                .HasConstraintName("program_buyer_id_fkey");

            entity.HasOne(d => d.Customer).WithMany(p => p.Programs)
                .HasForeignKey(d => d.CustomerId)
                .OnDelete(DeleteBehavior.SetNull)
                .HasConstraintName("program_customer_id_fkey");

            entity.HasOne(d => d.ProgramManager).WithMany(p => p.ProgramProgramManagers)
                .HasForeignKey(d => d.ProgramManagerId)
                .OnDelete(DeleteBehavior.SetNull)
                .HasConstraintName("program_program_manager_id_fkey");

            entity.HasOne(d => d.SupplyChainManager).WithMany(p => p.ProgramSupplyChainManagers)
                .HasForeignKey(d => d.SupplyChainManagerId)
                .OnDelete(DeleteBehavior.SetNull)
                .HasConstraintName("program_supply_chain_manager_id_fkey");
        });

        modelBuilder.Entity<Project>(entity =>
        {
            entity.HasKey(e => e.Id).HasName("project_pkey");

            entity.ToTable("project", "pm");

            entity.Property(e => e.Id)
                .HasDefaultValueSql("gen_random_uuid()")
                .HasColumnName("id");
            entity.Property(e => e.Budget)
                .HasPrecision(18, 4)
                .HasColumnName("budget");
            entity.Property(e => e.CreatedAt)
                .HasDefaultValueSql("CURRENT_TIMESTAMP")
                .HasColumnName("created_at");
            entity.Property(e => e.CreatedBy)
                .HasMaxLength(255)
                .HasColumnName("created_by");
            entity.Property(e => e.DeletedAt).HasColumnName("deleted_at");
            entity.Property(e => e.DeletedBy)
                .HasMaxLength(255)
                .HasColumnName("deleted_by");
            entity.Property(e => e.Description).HasColumnName("description");
            entity.Property(e => e.EndDate).HasColumnName("end_date");
            entity.Property(e => e.IsActive)
                .HasDefaultValue(true)
                .HasColumnName("is_active");
            entity.Property(e => e.Name)
                .HasMaxLength(255)
                .HasColumnName("name");
            entity.Property(e => e.ProgramId).HasColumnName("program_id");
            entity.Property(e => e.ProjectCode)
                .HasMaxLength(255)
                .HasDefaultValueSql("pm.generate_project_code()")
                .HasColumnName("project_code");
            entity.Property(e => e.ProjectManagerId).HasColumnName("project_manager_id");
            entity.Property(e => e.StartDate).HasColumnName("start_date");
            entity.Property(e => e.Status)
                .HasMaxLength(255)
                .HasColumnName("status");
            entity.Property(e => e.UpdatedAt).HasColumnName("updated_at");
            entity.Property(e => e.UpdatedBy)
                .HasMaxLength(255)
                .HasColumnName("updated_by");

            entity.HasOne(d => d.Program).WithMany(p => p.Projects)
                .HasForeignKey(d => d.ProgramId)
                .OnDelete(DeleteBehavior.SetNull)
                .HasConstraintName("project_program_id_fkey");

            entity.HasOne(d => d.ProjectManager).WithMany(p => p.Projects)
                .HasForeignKey(d => d.ProjectManagerId)
                .OnDelete(DeleteBehavior.SetNull)
                .HasConstraintName("project_project_manager_id_fkey");
        });

        modelBuilder.Entity<PurchaseHistoryVw>(entity =>
        {
            entity
                .HasNoKey()
                .ToView("purchase_history_vw", "sc");

            entity.Property(e => e.CreatedBy)
                .HasMaxLength(255)
                .HasColumnName("created_by");
            entity.Property(e => e.GrnLineItemId).HasColumnName("grn_line_item_id");
            entity.Property(e => e.GrnNumber)
                .HasMaxLength(255)
                .HasColumnName("grn_number");
            entity.Property(e => e.PartId).HasColumnName("part_id");
            entity.Property(e => e.PoNumber)
                .HasMaxLength(255)
                .HasColumnName("po_number");
            entity.Property(e => e.ProjectName)
                .HasMaxLength(255)
                .HasColumnName("project_name");
            entity.Property(e => e.ReceivedBy)
                .HasMaxLength(255)
                .HasColumnName("received_by");
            entity.Property(e => e.ReceivedDate).HasColumnName("received_date");
            entity.Property(e => e.ReceivedQuantity).HasColumnName("received_quantity");
            entity.Property(e => e.TrackingId)
                .HasMaxLength(255)
                .HasColumnName("tracking_id");
            entity.Property(e => e.VendorName)
                .HasMaxLength(255)
                .HasColumnName("vendor_name");
        });

        modelBuilder.Entity<PurchaseOrder>(entity =>
        {
            entity.HasKey(e => e.Id).HasName("purchase_order_pkey");

            entity.ToTable("purchase_order", "sc");

            entity.Property(e => e.Id)
                .HasDefaultValueSql("gen_random_uuid()")
                .HasColumnName("id");
            entity.Property(e => e.ActualDeliveryDate).HasColumnName("actual_delivery_date");
            entity.Property(e => e.ApprovedBy)
                .HasMaxLength(255)
                .HasColumnName("approved_by");
            entity.Property(e => e.ApprovedDate).HasColumnName("approved_date");
            entity.Property(e => e.BillingAddressId).HasColumnName("billing_address_id");
            entity.Property(e => e.BuyerId).HasColumnName("buyer_id");
            entity.Property(e => e.CompanyId).HasColumnName("company_id");
            entity.Property(e => e.CreatedAt)
                .HasDefaultValueSql("CURRENT_TIMESTAMP")
                .HasColumnName("created_at");
            entity.Property(e => e.CreatedBy)
                .HasMaxLength(255)
                .HasColumnName("created_by");
            entity.Property(e => e.CurrencyId).HasColumnName("currency_id");
            entity.Property(e => e.CustomerInstructions).HasColumnName("customer_instructions");
            entity.Property(e => e.DeletedAt).HasColumnName("deleted_at");
            entity.Property(e => e.DeletedBy)
                .HasMaxLength(255)
                .HasColumnName("deleted_by");
            entity.Property(e => e.DeliveryAddressId).HasColumnName("delivery_address_id");
            entity.Property(e => e.DeliveryStatus)
                .HasMaxLength(255)
                .HasColumnName("delivery_status");
            entity.Property(e => e.DeliveryTerms).HasColumnName("delivery_terms");
            entity.Property(e => e.Description).HasColumnName("description");
            entity.Property(e => e.Discount)
                .HasPrecision(18, 4)
                .HasColumnName("discount");
            entity.Property(e => e.DiscountType)
                .HasMaxLength(50)
                .HasColumnName("discount_type");
            entity.Property(e => e.ExpectedDeliveryDate).HasColumnName("expected_delivery_date");
            entity.Property(e => e.IsActive)
                .HasDefaultValue(true)
                .HasColumnName("is_active");
            entity.Property(e => e.Number)
                .HasMaxLength(255)
                .HasDefaultValueSql("sc.generate_purchase_order_number()")
                .HasColumnName("number");
            entity.Property(e => e.OrderDate).HasColumnName("order_date");
            entity.Property(e => e.PaymentTermId).HasColumnName("payment_term_id");
            entity.Property(e => e.PoTerms).HasColumnName("po_terms");
            entity.Property(e => e.PoType)
                .HasMaxLength(255)
                .HasColumnName("po_type");
            entity.Property(e => e.ProjectId).HasColumnName("project_id");
            entity.Property(e => e.QuotationReferenceId).HasColumnName("quotation_reference_id");
            entity.Property(e => e.QuotationReferenceNumber)
                .HasMaxLength(255)
                .HasColumnName("quotation_reference_number");
            entity.Property(e => e.RejectedBy)
                .HasMaxLength(255)
                .HasColumnName("rejected_by");
            entity.Property(e => e.RejectedDate).HasColumnName("rejected_date");
            entity.Property(e => e.RequisitionId).HasColumnName("requisition_id");
            entity.Property(e => e.RevisionHistory)
                .HasMaxLength(255)
                .HasColumnName("revision_history");
            entity.Property(e => e.RoundOff)
                .HasPrecision(18, 4)
                .HasColumnName("round_off");
            entity.Property(e => e.ShipmentReferenceNumber)
                .HasMaxLength(255)
                .HasColumnName("shipment_reference_number");
            entity.Property(e => e.ShippingAddressId).HasColumnName("shipping_address_id");
            entity.Property(e => e.Status)
                .HasMaxLength(255)
                .HasDefaultValueSql("'Draft'::character varying")
                .HasColumnName("status");
            entity.Property(e => e.SupplyChainLeadId).HasColumnName("supply_chain_lead_id");
            entity.Property(e => e.TaxOption)
                .HasMaxLength(255)
                .HasColumnName("tax_option");
            entity.Property(e => e.TermsAndConditions).HasColumnName("terms_and_conditions");
            entity.Property(e => e.TotalAmount)
                .HasPrecision(18, 4)
                .HasColumnName("total_amount");
            entity.Property(e => e.UpdatedAt).HasColumnName("updated_at");
            entity.Property(e => e.UpdatedBy)
                .HasMaxLength(255)
                .HasColumnName("updated_by");
            entity.Property(e => e.VendorBillingAddressId).HasColumnName("vendor_billing_address_id");
            entity.Property(e => e.VendorBillingContactId).HasColumnName("vendor_billing_contact_id");

            entity.HasOne(d => d.BillingAddress).WithMany(p => p.PurchaseOrderBillingAddresses)
                .HasForeignKey(d => d.BillingAddressId)
                .OnDelete(DeleteBehavior.SetNull)
                .HasConstraintName("purchase_order_billing_address_id_fkey");

            entity.HasOne(d => d.Buyer).WithMany(p => p.PurchaseOrderBuyers)
                .HasForeignKey(d => d.BuyerId)
                .OnDelete(DeleteBehavior.SetNull)
                .HasConstraintName("purchase_order_buyer_id_fkey");

            entity.HasOne(d => d.Company).WithMany(p => p.PurchaseOrders)
                .HasForeignKey(d => d.CompanyId)
                .OnDelete(DeleteBehavior.SetNull)
                .HasConstraintName("purchase_order_company_id_fkey");

            entity.HasOne(d => d.Currency).WithMany(p => p.PurchaseOrders)
                .HasForeignKey(d => d.CurrencyId)
                .OnDelete(DeleteBehavior.SetNull)
                .HasConstraintName("purchase_order_currency_id_fkey");

            entity.HasOne(d => d.DeliveryAddress).WithMany(p => p.PurchaseOrderDeliveryAddresses)
                .HasForeignKey(d => d.DeliveryAddressId)
                .OnDelete(DeleteBehavior.SetNull)
                .HasConstraintName("purchase_order_delivery_address_id_fkey");

            entity.HasOne(d => d.PaymentTerm).WithMany(p => p.PurchaseOrders)
                .HasForeignKey(d => d.PaymentTermId)
                .OnDelete(DeleteBehavior.SetNull)
                .HasConstraintName("purchase_order_payment_term_id_fkey");

            entity.HasOne(d => d.Project).WithMany(p => p.PurchaseOrders)
                .HasForeignKey(d => d.ProjectId)
                .OnDelete(DeleteBehavior.SetNull)
                .HasConstraintName("purchase_order_project_id_fkey");

            entity.HasOne(d => d.Requisition).WithMany(p => p.PurchaseOrders)
                .HasForeignKey(d => d.RequisitionId)
                .OnDelete(DeleteBehavior.SetNull)
                .HasConstraintName("purchase_order_requisition_id_fkey");

            entity.HasOne(d => d.ShippingAddress).WithMany(p => p.PurchaseOrderShippingAddresses)
                .HasForeignKey(d => d.ShippingAddressId)
                .OnDelete(DeleteBehavior.SetNull)
                .HasConstraintName("purchase_order_shipping_address_id_fkey");

            entity.HasOne(d => d.SupplyChainLead).WithMany(p => p.PurchaseOrderSupplyChainLeads)
                .HasForeignKey(d => d.SupplyChainLeadId)
                .OnDelete(DeleteBehavior.SetNull)
                .HasConstraintName("purchase_order_supply_chain_lead_id_fkey");

            entity.HasOne(d => d.VendorBillingAddress).WithMany(p => p.PurchaseOrderVendorBillingAddresses)
                .HasForeignKey(d => d.VendorBillingAddressId)
                .OnDelete(DeleteBehavior.SetNull)
                .HasConstraintName("purchase_order_vendor_billing_address_id_fkey");

            entity.HasOne(d => d.VendorBillingContact).WithMany(p => p.PurchaseOrders)
                .HasForeignKey(d => d.VendorBillingContactId)
                .OnDelete(DeleteBehavior.SetNull)
                .HasConstraintName("purchase_order_vendor_billing_contact_id_fkey");
        });

        modelBuilder.Entity<PurchaseOrdersVw>(entity =>
        {
            entity
                .HasNoKey()
                .ToView("purchase_orders_vw", "sc");

            entity.Property(e => e.ApprovedBy)
                .HasMaxLength(255)
                .HasColumnName("approved_by");
            entity.Property(e => e.ApprovedDate).HasColumnName("approved_date");
            entity.Property(e => e.BillingCity)
                .HasMaxLength(100)
                .HasColumnName("billing_city");
            entity.Property(e => e.CreatedAt).HasColumnName("created_at");
            entity.Property(e => e.CreatedBy)
                .HasMaxLength(255)
                .HasColumnName("created_by");
            entity.Property(e => e.CustomerInstructions).HasColumnName("customer_instructions");
            entity.Property(e => e.DeliveryDate).HasColumnName("delivery_date");
            entity.Property(e => e.DeliveryTerms).HasColumnName("delivery_terms");
            entity.Property(e => e.Description).HasColumnName("description");
            entity.Property(e => e.Id).HasColumnName("id");
            entity.Property(e => e.Number)
                .HasMaxLength(255)
                .HasColumnName("number");
            entity.Property(e => e.OrderDate).HasColumnName("order_date");
            entity.Property(e => e.PaymentTerm)
                .HasMaxLength(50)
                .HasColumnName("payment_term");
            entity.Property(e => e.ProjectCode)
                .HasMaxLength(255)
                .HasColumnName("project_code");
            entity.Property(e => e.ProjectName)
                .HasMaxLength(255)
                .HasColumnName("project_name");
            entity.Property(e => e.RequisitionNumber)
                .HasMaxLength(255)
                .HasColumnName("requisition_number");
            entity.Property(e => e.ShippingCity)
                .HasMaxLength(100)
                .HasColumnName("shipping_city");
            entity.Property(e => e.TermsAndConditions).HasColumnName("terms_and_conditions");
            entity.Property(e => e.Status)
                .HasMaxLength(255)
                .HasColumnName("status");
            entity.Property(e => e.TotalAmount)
                .HasPrecision(18, 4)
                .HasColumnName("total_amount");
            entity.Property(e => e.VendorCode)
                .HasMaxLength(50)
                .HasColumnName("vendor_code");
            entity.Property(e => e.VendorContact)
                .HasMaxLength(100)
                .HasColumnName("vendor_contact");
            entity.Property(e => e.VendorName)
                .HasMaxLength(255)
                .HasColumnName("vendor_name");
            entity.Property(e => e.VendorPhone)
                .HasMaxLength(20)
                .HasColumnName("vendor_phone");
        });

        modelBuilder.Entity<Requisition>(entity =>
        {
            entity.HasKey(e => e.Id).HasName("requisition_pkey");

            entity.ToTable("requisition", "sc");

            entity.Property(e => e.Id)
                .HasDefaultValueSql("gen_random_uuid()")
                .HasColumnName("id");
            entity.Property(e => e.ApprovedBy)
                .HasMaxLength(255)
                .HasColumnName("approved_by");
            entity.Property(e => e.ApprovedDate).HasColumnName("approved_date");
            entity.Property(e => e.ApproverComment).HasColumnName("approver_comment");
            entity.Property(e => e.CreatedAt)
                .HasDefaultValueSql("CURRENT_TIMESTAMP")
                .HasColumnName("created_at");
            entity.Property(e => e.CreatedBy)
                .HasMaxLength(255)
                .HasColumnName("created_by");
            entity.Property(e => e.DeletedAt).HasColumnName("deleted_at");
            entity.Property(e => e.DeletedBy)
                .HasMaxLength(255)
                .HasColumnName("deleted_by");
            entity.Property(e => e.IsActive)
                .HasDefaultValue(true)
                .HasColumnName("is_active");
            entity.Property(e => e.Justification).HasColumnName("justification");
            entity.Property(e => e.Priority)
                .HasMaxLength(255)
                .HasColumnName("priority");
            entity.Property(e => e.ProjectId).HasColumnName("project_id");
            entity.Property(e => e.RejectedBy)
                .HasMaxLength(255)
                .HasColumnName("rejected_by");
            entity.Property(e => e.RejectedDate).HasColumnName("rejected_date");
            entity.Property(e => e.ReqNumber)
                .HasMaxLength(255)
                .HasDefaultValueSql("sc.generate_req_number()")
                .HasColumnName("req_number");
            entity.Property(e => e.RequestDate).HasColumnName("request_date");
            entity.Property(e => e.RequestedById).HasColumnName("requested_by_id");
            entity.Property(e => e.RequiredByDate).HasColumnName("required_by_date");
            entity.Property(e => e.Status)
                .HasMaxLength(255)
                .HasDefaultValueSql("'Draft'::character varying")
                .HasColumnName("status");
            entity.Property(e => e.Title)
                .HasMaxLength(255)
                .HasColumnName("title");
            entity.Property(e => e.TotalEstimatedAmount)
                .HasPrecision(18, 4)
                .HasColumnName("total_estimated_amount");
            entity.Property(e => e.UpdatedAt).HasColumnName("updated_at");
            entity.Property(e => e.UpdatedBy)
                .HasMaxLength(255)
                .HasColumnName("updated_by");

            entity.HasOne(d => d.Project).WithMany(p => p.Requisitions)
                .HasForeignKey(d => d.ProjectId)
                .OnDelete(DeleteBehavior.SetNull)
                .HasConstraintName("requisition_project_id_fkey");

            entity.HasOne(d => d.RequestedBy).WithMany(p => p.Requisitions)
                .HasForeignKey(d => d.RequestedById)
                .OnDelete(DeleteBehavior.SetNull)
                .HasConstraintName("requisition_requested_by_id_fkey");
        });

        modelBuilder.Entity<RequisitionLineItem>(entity =>
        {
            entity.HasKey(e => e.Id).HasName("requisition_line_item_pkey");

            entity.ToTable("requisition_line_item", "sc");

            entity.Property(e => e.Id)
                .HasDefaultValueSql("gen_random_uuid()")
                .HasColumnName("id");
            entity.Property(e => e.CreatedAt)
                .HasDefaultValueSql("CURRENT_TIMESTAMP")
                .HasColumnName("created_at");
            entity.Property(e => e.CreatedBy)
                .HasMaxLength(255)
                .HasColumnName("created_by");
            entity.Property(e => e.DeletedAt).HasColumnName("deleted_at");
            entity.Property(e => e.DeletedBy)
                .HasMaxLength(255)
                .HasColumnName("deleted_by");
            entity.Property(e => e.Description).HasColumnName("description");
            entity.Property(e => e.IsActive)
                .HasDefaultValue(true)
                .HasColumnName("is_active");
            entity.Property(e => e.PartId).HasColumnName("part_id");
            entity.Property(e => e.Quantity).HasColumnName("quantity");
            entity.Property(e => e.RequisitionId).HasColumnName("requisition_id");
            entity.Property(e => e.UpdatedAt).HasColumnName("updated_at");
            entity.Property(e => e.UpdatedBy)
                .HasMaxLength(255)
                .HasColumnName("updated_by");

            entity.HasOne(d => d.Part).WithMany(p => p.RequisitionLineItems)
                .HasForeignKey(d => d.PartId)
                .OnDelete(DeleteBehavior.SetNull)
                .HasConstraintName("requisition_line_item_part_id_fkey");

            entity.HasOne(d => d.Requisition).WithMany(p => p.RequisitionLineItems)
                .HasForeignKey(d => d.RequisitionId)
                .OnDelete(DeleteBehavior.SetNull)
                .HasConstraintName("requisition_line_item_requisition_id_fkey");
        });

        modelBuilder.Entity<RequisitionsWithUserVw>(entity =>
        {
            entity
                .HasNoKey()
                .ToView("requisitions_with_user_vw", "sc");

            entity.Property(e => e.ApprovedBy)
                .HasMaxLength(255)
                .HasColumnName("approved_by");
            entity.Property(e => e.ApprovedDate).HasColumnName("approved_date");
            entity.Property(e => e.ApproverComment).HasColumnName("approver_comment");
            entity.Property(e => e.CreatedAt).HasColumnName("created_at");
            entity.Property(e => e.CreatedBy)
                .HasMaxLength(255)
                .HasColumnName("created_by");
            entity.Property(e => e.Id).HasColumnName("id");
            entity.Property(e => e.Justification).HasColumnName("justification");
            entity.Property(e => e.PoId).HasColumnName("po_id");
            entity.Property(e => e.PoNumber)
                .HasMaxLength(255)
                .HasColumnName("po_number");
            entity.Property(e => e.Priority)
                .HasMaxLength(255)
                .HasColumnName("priority");
            entity.Property(e => e.ProjectId).HasColumnName("project_id");
            entity.Property(e => e.RejectedBy)
                .HasMaxLength(255)
                .HasColumnName("rejected_by");
            entity.Property(e => e.RejectedDate).HasColumnName("rejected_date");
            entity.Property(e => e.ReqNumber)
                .HasMaxLength(255)
                .HasColumnName("req_number");
            entity.Property(e => e.RequestDate).HasColumnName("request_date");
            entity.Property(e => e.RequestedById).HasColumnName("requested_by_id");
            entity.Property(e => e.RequiredByDate).HasColumnName("required_by_date");
            entity.Property(e => e.Status)
                .HasMaxLength(255)
                .HasColumnName("status");
            entity.Property(e => e.Title)
                .HasMaxLength(255)
                .HasColumnName("title");
            entity.Property(e => e.TotalEstimatedAmount)
                .HasPrecision(18, 4)
                .HasColumnName("total_estimated_amount");
            entity.Property(e => e.UserEmail)
                .HasMaxLength(255)
                .HasColumnName("user_email");
            entity.Property(e => e.UserFullName).HasColumnName("user_full_name");
            entity.Property(e => e.UserId).HasColumnName("user_id");
        });

        modelBuilder.Entity<ResourceAllocation>(entity =>
        {
            entity.HasKey(e => e.Id).HasName("resource_allocation_pkey");

            entity.ToTable("resource_allocation", "pm", tb => tb.HasComment("Resource allocation tracking for capacity planning"));
            entity.Property(e => e.Id)
                .HasDefaultValueSql("gen_random_uuid()")
                .HasColumnName("id");
            entity.Property(e => e.AllocatedHoursPerDay)
                .HasPrecision(4, 2)
                .HasDefaultValueSql("8.0")
                .HasComment("Hours per day allocated to this work")
                .HasColumnName("allocated_hours_per_day");
            entity.Property(e => e.AllocationPercent)
                .HasDefaultValue(100)
                .HasComment("Percentage of daily capacity (100% = full time)")
                .HasColumnName("allocation_percent");
            entity.Property(e => e.AllocationType)
                .HasMaxLength(50)
                .HasDefaultValueSql("'Project'::character varying")
                .HasComment("Type of allocation (Project, Task, Overhead, Leave, Training)")
                .HasColumnName("allocation_type");
            entity.Property(e => e.CreatedAt)
                .HasDefaultValueSql("CURRENT_TIMESTAMP")
                .HasColumnName("created_at");
            entity.Property(e => e.CreatedBy)
                .HasMaxLength(255)
                .HasColumnName("created_by");
            entity.Property(e => e.DeletedAt).HasColumnName("deleted_at");
            entity.Property(e => e.DeletedBy)
                .HasMaxLength(255)
                .HasColumnName("deleted_by");
            entity.Property(e => e.EndDate)
                .HasComment("End date of allocation period")
                .HasColumnName("end_date");
            entity.Property(e => e.IsActive)
                .HasDefaultValue(true)
                .HasColumnName("is_active");
            entity.Property(e => e.Notes).HasColumnName("notes");
            entity.Property(e => e.ProjectId)
                .HasComment("Project the resource is allocated to")
                .HasColumnName("project_id");
            entity.Property(e => e.StartDate)
                .HasComment("Start date of allocation period")
                .HasColumnName("start_date");
            entity.Property(e => e.TaskId)
                .HasComment("Optional: Specific task within the project")
                .HasColumnName("task_id");
            entity.Property(e => e.UpdatedAt).HasColumnName("updated_at");
            entity.Property(e => e.UpdatedBy)
                .HasMaxLength(255)
                .HasColumnName("updated_by");
            entity.Property(e => e.UserId)
                .HasComment("User being allocated to the resource")
                .HasColumnName("user_id");

            entity.HasOne(d => d.Project).WithMany()
                .HasForeignKey(d => d.ProjectId)
                .HasConstraintName("resource_allocation_project_id_fkey");

            entity.HasOne(d => d.Task).WithMany()
                .HasForeignKey(d => d.TaskId)
                .OnDelete(DeleteBehavior.SetNull)
                .HasConstraintName("resource_allocation_task_id_fkey");

            entity.HasOne(d => d.User).WithMany(p => p.ResourceAllocations)
                .HasForeignKey(d => d.UserId)
                .OnDelete(DeleteBehavior.SetNull)
                .HasConstraintName("resource_allocation_user_id_fkey");
        });

        modelBuilder.Entity<ResourceWorkloadVw>(entity =>
        {
            entity
                .HasNoKey()
                .ToView("resource_workload_vw", "pm");

            entity.Property(e => e.ActiveTasksCount).HasColumnName("active_tasks_count");
            entity.Property(e => e.CurrentAllocations)
                .HasColumnType("json")
                .HasColumnName("current_allocations");
            entity.Property(e => e.Department)
                .HasMaxLength(255)
                .HasColumnName("department");
            entity.Property(e => e.Email)
                .HasMaxLength(255)
                .HasColumnName("email");
            entity.Property(e => e.FirstName)
                .HasMaxLength(255)
                .HasColumnName("first_name");
            entity.Property(e => e.HoursLoggedThisMonth).HasColumnName("hours_logged_this_month");
            entity.Property(e => e.HoursLoggedThisWeek).HasColumnName("hours_logged_this_week");
            entity.Property(e => e.ImageUrl).HasColumnName("image_url");
            entity.Property(e => e.JobTitle)
                .HasMaxLength(255)
                .HasColumnName("job_title");
            entity.Property(e => e.LastName)
                .HasMaxLength(255)
                .HasColumnName("last_name");
            entity.Property(e => e.OverdueTasksCount).HasColumnName("overdue_tasks_count");
            entity.Property(e => e.PrimaryAssignmentsCount).HasColumnName("primary_assignments_count");
            entity.Property(e => e.TodayAllocationPercent).HasColumnName("today_allocation_percent");
            entity.Property(e => e.UserId).HasColumnName("user_id");
        });

        modelBuilder.Entity<Role>(entity =>
        {
            entity.HasKey(e => e.Id).HasName("role_pkey");

            entity.ToTable("role", "application");

            entity.HasIndex(e => new { e.RoleName, e.AppId, e.DeletedAt }, "role_role_name_app_id_deleted_at_key").IsUnique();

            entity.Property(e => e.Id)
                .HasDefaultValueSql("gen_random_uuid()")
                .HasColumnName("id");
            entity.Property(e => e.AppId).HasColumnName("app_id");
            entity.Property(e => e.CreatedAt)
                .HasDefaultValueSql("CURRENT_TIMESTAMP")
                .HasColumnName("created_at");
            entity.Property(e => e.CreatedBy)
                .HasMaxLength(255)
                .HasColumnName("created_by");
            entity.Property(e => e.DeletedAt).HasColumnName("deleted_at");
            entity.Property(e => e.DeletedBy)
                .HasMaxLength(255)
                .HasColumnName("deleted_by");
            entity.Property(e => e.IsActive)
                .HasDefaultValue(true)
                .HasColumnName("is_active");
            entity.Property(e => e.RoleDescription).HasColumnName("role_description");
            entity.Property(e => e.RoleName)
                .HasMaxLength(255)
                .HasColumnName("role_name");
            entity.Property(e => e.RoleNumber)
                .ValueGeneratedOnAdd()
                .HasColumnName("role_number");
            entity.Property(e => e.SystemDefined)
                .HasDefaultValue(false)
                .HasColumnName("system_defined");
            entity.Property(e => e.UpdatedAt).HasColumnName("updated_at");
            entity.Property(e => e.UpdatedBy)
                .HasMaxLength(255)
                .HasColumnName("updated_by");

            entity.HasOne(d => d.App).WithMany(p => p.Roles)
                .HasForeignKey(d => d.AppId)
                .OnDelete(DeleteBehavior.SetNull)
                .HasConstraintName("role_app_id_fkey");
        });

        modelBuilder.Entity<RoleFilter>(entity =>
        {
            entity.HasKey(e => e.Id).HasName("role_filter_pkey");

            entity.ToTable("role_filter", "application");

            entity.Property(e => e.Id)
                .HasDefaultValueSql("gen_random_uuid()")
                .HasColumnName("id");
            entity.Property(e => e.CreatedAt)
                .HasDefaultValueSql("CURRENT_TIMESTAMP")
                .HasColumnName("created_at");
            entity.Property(e => e.CreatedBy)
                .HasMaxLength(255)
                .HasColumnName("created_by");
            entity.Property(e => e.DeletedAt).HasColumnName("deleted_at");
            entity.Property(e => e.DeletedBy)
                .HasMaxLength(255)
                .HasColumnName("deleted_by");
            entity.Property(e => e.Entity)
                .HasMaxLength(100)
                .HasColumnName("entity");
            entity.Property(e => e.IsActive)
                .HasDefaultValue(true)
                .HasColumnName("is_active");
            entity.Property(e => e.Key)
                .HasMaxLength(100)
                .HasColumnName("key");
            entity.Property(e => e.Operator)
                .HasMaxLength(20)
                .HasColumnName("operator");
            entity.Property(e => e.RoleId).HasColumnName("role_id");
            entity.Property(e => e.UpdatedAt).HasColumnName("updated_at");
            entity.Property(e => e.UpdatedBy)
                .HasMaxLength(255)
                .HasColumnName("updated_by");
            entity.Property(e => e.Value).HasColumnName("value");

            entity.HasOne(d => d.Role).WithMany(p => p.RoleFilters)
                .HasForeignKey(d => d.RoleId)
                .OnDelete(DeleteBehavior.ClientSetNull)
                .HasConstraintName("role_filter_role_id_fkey");
        });

        modelBuilder.Entity<RolePermission>(entity =>
        {
            entity.HasKey(e => e.Id).HasName("role_permission_pkey");

            entity.ToTable("role_permission", "application");

            entity.HasIndex(e => new { e.RoleId, e.Permission, e.DeletedAt }, "role_permission_role_id_permission_deleted_at_key").IsUnique();

            entity.Property(e => e.Id)
                .HasDefaultValueSql("gen_random_uuid()")
                .HasColumnName("id");
            entity.Property(e => e.CreatedAt)
                .HasDefaultValueSql("CURRENT_TIMESTAMP")
                .HasColumnName("created_at");
            entity.Property(e => e.CreatedBy)
                .HasMaxLength(255)
                .HasColumnName("created_by");
            entity.Property(e => e.DeletedAt).HasColumnName("deleted_at");
            entity.Property(e => e.DeletedBy)
                .HasMaxLength(255)
                .HasColumnName("deleted_by");
            entity.Property(e => e.Enable)
                .HasDefaultValue(true)
                .HasColumnName("enable");
            entity.Property(e => e.IsActive)
                .HasDefaultValue(true)
                .HasColumnName("is_active");
            entity.Property(e => e.Permission)
                .HasMaxLength(255)
                .HasColumnName("permission");
            entity.Property(e => e.RoleId).HasColumnName("role_id");
            entity.Property(e => e.UpdatedAt).HasColumnName("updated_at");
            entity.Property(e => e.UpdatedBy)
                .HasMaxLength(255)
                .HasColumnName("updated_by");

            entity.HasOne(d => d.Role).WithMany(p => p.RolePermissions)
                .HasForeignKey(d => d.RoleId)
                .OnDelete(DeleteBehavior.ClientSetNull)
                .HasConstraintName("role_permission_role_id_fkey");
        });

        modelBuilder.Entity<ScrapLineItem>(entity =>
        {
            entity.HasKey(e => e.Id).HasName("scrap_line_item_pkey");

            entity.ToTable("scrap_line_item", "sc");

            entity.Property(e => e.Id)
                .HasDefaultValueSql("gen_random_uuid()")
                .HasColumnName("id");
            entity.Property(e => e.CreatedAt)
                .HasDefaultValueSql("CURRENT_TIMESTAMP")
                .HasColumnName("created_at");
            entity.Property(e => e.CreatedBy)
                .HasMaxLength(255)
                .HasColumnName("created_by");
            entity.Property(e => e.DeletedAt).HasColumnName("deleted_at");
            entity.Property(e => e.DeletedBy)
                .HasMaxLength(255)
                .HasColumnName("deleted_by");
            entity.Property(e => e.IsActive)
                .HasDefaultValue(true)
                .HasColumnName("is_active");
            entity.Property(e => e.PartId).HasColumnName("part_id");
            entity.Property(e => e.Reason).HasColumnName("reason");
            entity.Property(e => e.ScrapQuantity).HasColumnName("scrap_quantity");
            entity.Property(e => e.ScrapRequestId).HasColumnName("scrap_request_id");
            entity.Property(e => e.TrackingId)
                .HasMaxLength(255)
                .HasColumnName("tracking_id");
            entity.Property(e => e.TrackingType)
                .HasMaxLength(50)
                .HasColumnName("tracking_type");
            entity.Property(e => e.UpdatedAt).HasColumnName("updated_at");
            entity.Property(e => e.UpdatedBy)
                .HasMaxLength(255)
                .HasColumnName("updated_by");

            entity.HasOne(d => d.Part).WithMany(p => p.ScrapLineItems)
                .HasForeignKey(d => d.PartId)
                .OnDelete(DeleteBehavior.SetNull)
                .HasConstraintName("scrap_line_item_part_id_fkey");

            entity.HasOne(d => d.ScrapRequest).WithMany(p => p.ScrapLineItems)
                .HasForeignKey(d => d.ScrapRequestId)
                .HasConstraintName("scrap_line_item_scrap_request_id_fkey");
        });

        modelBuilder.Entity<ScrapRequest>(entity =>
        {
            entity.HasKey(e => e.Id).HasName("scrap_request_pkey");

            entity.ToTable("scrap_request", "sc");

            entity.Property(e => e.Id)
                .HasDefaultValueSql("gen_random_uuid()")
                .HasColumnName("id");
            entity.Property(e => e.ApprovedBy)
                .HasMaxLength(255)
                .HasColumnName("approved_by");
            entity.Property(e => e.ApprovedDate).HasColumnName("approved_date");
            entity.Property(e => e.CreatedAt)
                .HasDefaultValueSql("CURRENT_TIMESTAMP")
                .HasColumnName("created_at");
            entity.Property(e => e.CreatedBy)
                .HasMaxLength(255)
                .HasColumnName("created_by");
            entity.Property(e => e.DeletedAt).HasColumnName("deleted_at");
            entity.Property(e => e.DeletedBy)
                .HasMaxLength(255)
                .HasColumnName("deleted_by");
            entity.Property(e => e.GrnId).HasColumnName("grn_id");
            entity.Property(e => e.IsActive)
                .HasDefaultValue(true)
                .HasColumnName("is_active");
            entity.Property(e => e.LocationId).HasColumnName("location_id");
            entity.Property(e => e.PoId).HasColumnName("po_id");
            entity.Property(e => e.RaisedById).HasColumnName("raised_by_id");
            entity.Property(e => e.Reason).HasColumnName("reason");
            entity.Property(e => e.RejectedBy)
                .HasMaxLength(255)
                .HasColumnName("rejected_by");
            entity.Property(e => e.RejectedDate).HasColumnName("rejected_date");
            entity.Property(e => e.ScrapDate).HasColumnName("scrap_date");
            entity.Property(e => e.ScrapNumber)
                .HasMaxLength(255)
                .HasDefaultValueSql("sc.generate_scrap_number()")
                .HasColumnName("scrap_number");
            entity.Property(e => e.Status)
                .HasMaxLength(50)
                .HasDefaultValueSql("'Draft'::character varying")
                .HasColumnName("status");
            entity.Property(e => e.UpdatedAt).HasColumnName("updated_at");
            entity.Property(e => e.UpdatedBy)
                .HasMaxLength(255)
                .HasColumnName("updated_by");
            entity.Property(e => e.WoId).HasColumnName("wo_id");

            entity.HasOne(d => d.Grn).WithMany(p => p.ScrapRequests)
                .HasForeignKey(d => d.GrnId)
                .OnDelete(DeleteBehavior.SetNull)
                .HasConstraintName("scrap_request_grn_id_fkey");

            entity.HasOne(d => d.Location).WithMany(p => p.ScrapRequests)
                .HasForeignKey(d => d.LocationId)
                .OnDelete(DeleteBehavior.SetNull)
                .HasConstraintName("scrap_request_location_id_fkey");

            entity.HasOne(d => d.Po).WithMany(p => p.ScrapRequests)
                .HasForeignKey(d => d.PoId)
                .OnDelete(DeleteBehavior.SetNull)
                .HasConstraintName("scrap_request_po_id_fkey");

            entity.HasOne(d => d.RaisedBy).WithMany(p => p.ScrapRequests)
                .HasForeignKey(d => d.RaisedById)
                .OnDelete(DeleteBehavior.SetNull)
                .HasConstraintName("scrap_request_raised_by_id_fkey");

            entity.HasOne(d => d.Wo).WithMany(p => p.ScrapRequests)
                .HasForeignKey(d => d.WoId)
                .OnDelete(DeleteBehavior.SetNull)
                .HasConstraintName("scrap_request_wo_id_fkey");
        });

        modelBuilder.Entity<ScrapRequestWithUserVw>(entity =>
        {
            entity
                .HasNoKey()
                .ToView("scrap_request_with_user_vw", "sc");

            entity.Property(e => e.CreatedAt).HasColumnName("created_at");
            entity.Property(e => e.CreatedBy)
                .HasMaxLength(255)
                .HasColumnName("created_by");
            entity.Property(e => e.GrnId).HasColumnName("grn_id");
            entity.Property(e => e.GrnNumber)
                .HasMaxLength(255)
                .HasColumnName("grn_number");
            entity.Property(e => e.GrnReceivedDate).HasColumnName("grn_received_date");
            entity.Property(e => e.GrnStatus)
                .HasMaxLength(255)
                .HasColumnName("grn_status");
            entity.Property(e => e.IsActive).HasColumnName("is_active");
            entity.Property(e => e.LineItemId).HasColumnName("line_item_id");
            entity.Property(e => e.LineItemReason).HasColumnName("line_item_reason");
            entity.Property(e => e.LocationId).HasColumnName("location_id");
            entity.Property(e => e.LocationName)
                .HasMaxLength(255)
                .HasColumnName("location_name");
            entity.Property(e => e.LocationNumber)
                .HasMaxLength(255)
                .HasColumnName("location_number");
            entity.Property(e => e.PartId).HasColumnName("part_id");
            entity.Property(e => e.PoId).HasColumnName("po_id");
            entity.Property(e => e.PoNumber)
                .HasMaxLength(255)
                .HasColumnName("po_number");
            entity.Property(e => e.PoOrderDate).HasColumnName("po_order_date");
            entity.Property(e => e.PoStatus)
                .HasMaxLength(255)
                .HasColumnName("po_status");
            entity.Property(e => e.RaisedByEmail)
                .HasMaxLength(255)
                .HasColumnName("raised_by_email");
            entity.Property(e => e.RaisedByFullName).HasColumnName("raised_by_full_name");
            entity.Property(e => e.ScrapDate).HasColumnName("scrap_date");
            entity.Property(e => e.ScrapNumber)
                .HasMaxLength(255)
                .HasColumnName("scrap_number");
            entity.Property(e => e.ScrapQuantity).HasColumnName("scrap_quantity");
            entity.Property(e => e.ScrapReason).HasColumnName("scrap_reason");
            entity.Property(e => e.ScrapRequestId).HasColumnName("scrap_request_id");
            entity.Property(e => e.ScrapStatus)
                .HasMaxLength(50)
                .HasColumnName("scrap_status");
            entity.Property(e => e.TrackingId)
                .HasMaxLength(255)
                .HasColumnName("tracking_id");
            entity.Property(e => e.TrackingType)
                .HasMaxLength(50)
                .HasColumnName("tracking_type");
            entity.Property(e => e.UpdatedAt).HasColumnName("updated_at");
            entity.Property(e => e.UpdatedBy)
                .HasMaxLength(255)
                .HasColumnName("updated_by");
            entity.Property(e => e.WoId).HasColumnName("wo_id");
            entity.Property(e => e.WoStatus)
                .HasMaxLength(255)
                .HasColumnName("wo_status");
            entity.Property(e => e.WorkOrderNumber)
                .HasMaxLength(255)
                .HasColumnName("work_order_number");
        });

        modelBuilder.Entity<StockMovement>(entity =>
        {
            entity.HasKey(e => e.Id).HasName("stock_movement_pkey");

            entity.ToTable("stock_movement", "sc", tb => tb.HasComment("Stock movement header for Transfer, Adjustment, and Issue operations"));

            entity.HasIndex(e => e.MovementDate, "idx_stock_movement_date").HasFilter("(deleted_at IS NULL)");

            entity.HasIndex(e => e.FromLocationId, "idx_stock_movement_from_location").HasFilter("(deleted_at IS NULL)");

            entity.HasIndex(e => e.Status, "idx_stock_movement_status").HasFilter("(deleted_at IS NULL)");

            entity.HasIndex(e => e.ToLocationId, "idx_stock_movement_to_location").HasFilter("(deleted_at IS NULL)");

            entity.HasIndex(e => e.MovementType, "idx_stock_movement_type").HasFilter("(deleted_at IS NULL)");

            entity.HasIndex(e => e.MovementNumber, "stock_movement_movement_number_key").IsUnique();

            entity.Property(e => e.Id)
                .HasDefaultValueSql("gen_random_uuid()")
                .HasColumnName("id");
            entity.Property(e => e.AssignedUserId).HasColumnName("assigned_user_id");
            entity.Property(e => e.CreatedAt)
                .HasDefaultValueSql("CURRENT_TIMESTAMP")
                .HasColumnName("created_at");
            entity.Property(e => e.CreatedBy)
                .HasMaxLength(255)
                .HasColumnName("created_by");
            entity.Property(e => e.DeletedAt).HasColumnName("deleted_at");
            entity.Property(e => e.DeletedBy)
                .HasMaxLength(255)
                .HasColumnName("deleted_by");
            entity.Property(e => e.Department)
                .HasMaxLength(255)
                .HasColumnName("department");
            entity.Property(e => e.ExpectedReturnDate).HasColumnName("expected_return_date");
            entity.Property(e => e.FromBinId).HasColumnName("from_bin_id");
            entity.Property(e => e.FromLocationId).HasColumnName("from_location_id");
            entity.Property(e => e.IsActive)
                .HasDefaultValue(true)
                .HasColumnName("is_active");
            entity.Property(e => e.MovementDate).HasColumnName("movement_date");
            entity.Property(e => e.MovementNumber)
                .HasMaxLength(255)
                .HasDefaultValueSql("sc.generate_stock_movement_number()")
                .HasColumnName("movement_number");
            entity.Property(e => e.MovementReason)
                .HasMaxLength(100)
                .HasComment("Reason code for the movement")
                .HasColumnName("movement_reason");
            entity.Property(e => e.MovementType)
                .HasMaxLength(50)
                .HasComment("Transfer, Adjustment, or Issue")
                .HasColumnName("movement_type");
            entity.Property(e => e.Notes).HasColumnName("notes");
            entity.Property(e => e.PerformedById).HasColumnName("performed_by_id");
            entity.Property(e => e.ProjectDate).HasColumnName("project_date");
            entity.Property(e => e.ProjectId).HasColumnName("project_id");
            entity.Property(e => e.ReferenceNumber)
                .HasMaxLength(255)
                .HasColumnName("reference_number");
            entity.Property(e => e.Status)
                .HasMaxLength(50)
                .HasDefaultValueSql("'Completed'::character varying")
                .HasComment("Completed or Cancelled")
                .HasColumnName("status");
            entity.Property(e => e.ToBinId).HasColumnName("to_bin_id");
            entity.Property(e => e.ToLocationId).HasColumnName("to_location_id");
            entity.Property(e => e.UpdatedAt).HasColumnName("updated_at");
            entity.Property(e => e.UpdatedBy)
                .HasMaxLength(255)
                .HasColumnName("updated_by");
            entity.Property(e => e.WorkOrderId).HasColumnName("work_order_id");

            entity.HasOne(d => d.AssignedUser).WithMany(p => p.StockMovementAssignedUsers)
                .HasForeignKey(d => d.AssignedUserId)
                .OnDelete(DeleteBehavior.SetNull)
                .HasConstraintName("fk_stock_movement_assigned_user");

            entity.HasOne(d => d.FromBin).WithMany()
                .HasForeignKey(d => d.FromBinId)
                .OnDelete(DeleteBehavior.SetNull)
                .HasConstraintName("fk_stock_movement_from_bin");

            entity.HasOne(d => d.FromLocation).WithMany(p => p.StockMovementFromLocations)
                .HasForeignKey(d => d.FromLocationId)
                .OnDelete(DeleteBehavior.SetNull)
                .HasConstraintName("fk_stock_movement_from_location");

            entity.HasOne(d => d.PerformedBy).WithMany(p => p.StockMovementPerformedBies)
                .HasForeignKey(d => d.PerformedById)
                .OnDelete(DeleteBehavior.SetNull)
                .HasConstraintName("fk_stock_movement_performed_by");

            entity.HasOne(d => d.Project).WithMany()
                .HasForeignKey(d => d.ProjectId)
                .OnDelete(DeleteBehavior.SetNull)
                .HasConstraintName("stock_movement_project_id_fkey");

            entity.HasOne(d => d.ToBin).WithMany()
                .HasForeignKey(d => d.ToBinId)
                .OnDelete(DeleteBehavior.SetNull)
                .HasConstraintName("fk_stock_movement_to_bin");

            entity.HasOne(d => d.ToLocation).WithMany(p => p.StockMovementToLocations)
                .HasForeignKey(d => d.ToLocationId)
                .OnDelete(DeleteBehavior.SetNull)
                .HasConstraintName("fk_stock_movement_to_location");

            entity.HasOne(d => d.WorkOrder).WithMany()
                .HasForeignKey(d => d.WorkOrderId)
                .OnDelete(DeleteBehavior.SetNull)
                .HasConstraintName("fk_stock_movement_work_order");
        });

        modelBuilder.Entity<StockMovementLineItem>(entity =>
        {
            entity.HasKey(e => e.Id).HasName("stock_movement_line_item_pkey");

            entity.ToTable("stock_movement_line_item", "sc");

            entity.Property(e => e.Id)
                .HasDefaultValueSql("gen_random_uuid()")
                .HasColumnName("id");
            entity.Property(e => e.AdjustmentType)
                .HasMaxLength(50)
                .HasColumnName("adjustment_type");
            entity.Property(e => e.CreatedAt)
                .HasDefaultValueSql("CURRENT_TIMESTAMP")
                .HasColumnName("created_at");
            entity.Property(e => e.CreatedBy)
                .HasMaxLength(255)
                .HasColumnName("created_by");
            entity.Property(e => e.DeletedAt).HasColumnName("deleted_at");
            entity.Property(e => e.DeletedBy)
                .HasMaxLength(255)
                .HasColumnName("deleted_by");
            entity.Property(e => e.IsActive)
                .HasDefaultValue(true)
                .HasColumnName("is_active");
            entity.Property(e => e.Notes).HasColumnName("notes");
            entity.Property(e => e.PartId).HasColumnName("part_id");
            entity.Property(e => e.Quantity).HasColumnName("quantity");
            entity.Property(e => e.Reason)
                .HasMaxLength(255)
                .HasColumnName("reason");
            entity.Property(e => e.StockMovementId).HasColumnName("stock_movement_id");
            entity.Property(e => e.TrackingId)
                .HasMaxLength(255)
                .HasColumnName("tracking_id");
            entity.Property(e => e.TrackingType)
                .HasMaxLength(50)
                .HasColumnName("tracking_type");
            entity.Property(e => e.UpdatedAt).HasColumnName("updated_at");
            entity.Property(e => e.UpdatedBy)
                .HasMaxLength(255)
                .HasColumnName("updated_by");

            entity.HasOne(d => d.Part).WithMany(p => p.StockMovementLineItems)
                .HasForeignKey(d => d.PartId)
                .OnDelete(DeleteBehavior.SetNull)
                .HasConstraintName("fk_stock_movement_line_item_part");

            entity.HasOne(d => d.StockMovement).WithMany(p => p.StockMovementLineItems)
                .HasForeignKey(d => d.StockMovementId)
                .OnDelete(DeleteBehavior.Cascade)
                .HasConstraintName("fk_stock_movement_line_item_movement");
        });

        modelBuilder.Entity<StockMovementWithUserVw>(entity =>
        {
            entity
                .HasNoKey()
                .ToView("stock_movement_with_user_vw", "sc");

            entity.Property(e => e.CreatedAt).HasColumnName("created_at");
            entity.Property(e => e.CreatedBy)
                .HasMaxLength(255)
                .HasColumnName("created_by");
            entity.Property(e => e.ExpectedReturnDate).HasColumnName("expected_return_date");
            entity.Property(e => e.FromBinAisle)
                .HasMaxLength(255)
                .HasColumnName("from_bin_aisle");
            entity.Property(e => e.FromBinCode)
                .HasMaxLength(225)
                .HasColumnName("from_bin_code");
            entity.Property(e => e.FromBinId).HasColumnName("from_bin_id");
            entity.Property(e => e.FromBinRack)
                .HasMaxLength(255)
                .HasColumnName("from_bin_rack");
            entity.Property(e => e.FromLocationId).HasColumnName("from_location_id");
            entity.Property(e => e.FromLocationName)
                .HasMaxLength(255)
                .HasColumnName("from_location_name");
            entity.Property(e => e.FromLocationNumber)
                .HasMaxLength(255)
                .HasColumnName("from_location_number");
            entity.Property(e => e.IsActive).HasColumnName("is_active");
            entity.Property(e => e.MovementDate).HasColumnName("movement_date");
            entity.Property(e => e.MovementNumber)
                .HasMaxLength(255)
                .HasColumnName("movement_number");
            entity.Property(e => e.MovementReason)
                .HasMaxLength(100)
                .HasColumnName("movement_reason");
            entity.Property(e => e.MovementType)
                .HasMaxLength(50)
                .HasColumnName("movement_type");
            entity.Property(e => e.Notes).HasColumnName("notes");
            entity.Property(e => e.PerformedByEmail)
                .HasMaxLength(255)
                .HasColumnName("performed_by_email");
            entity.Property(e => e.PerformedByFullName).HasColumnName("performed_by_full_name");
            entity.Property(e => e.PerformedById).HasColumnName("performed_by_id");
            entity.Property(e => e.ProjectDate).HasColumnName("project_date");
            entity.Property(e => e.ReferenceNumber)
                .HasMaxLength(255)
                .HasColumnName("reference_number");
            entity.Property(e => e.Status)
                .HasMaxLength(50)
                .HasColumnName("status");
            entity.Property(e => e.StockMovementId).HasColumnName("stock_movement_id");
            entity.Property(e => e.ToBinAisle)
                .HasMaxLength(255)
                .HasColumnName("to_bin_aisle");
            entity.Property(e => e.ToBinCode)
                .HasMaxLength(225)
                .HasColumnName("to_bin_code");
            entity.Property(e => e.ToBinId).HasColumnName("to_bin_id");
            entity.Property(e => e.ToBinRack)
                .HasMaxLength(255)
                .HasColumnName("to_bin_rack");
            entity.Property(e => e.ToLocationId).HasColumnName("to_location_id");
            entity.Property(e => e.ToLocationName)
                .HasMaxLength(255)
                .HasColumnName("to_location_name");
            entity.Property(e => e.ToLocationNumber)
                .HasMaxLength(255)
                .HasColumnName("to_location_number");
            entity.Property(e => e.UpdatedAt).HasColumnName("updated_at");
            entity.Property(e => e.UpdatedBy)
                .HasMaxLength(255)
                .HasColumnName("updated_by");
            entity.Property(e => e.WorkOrderId).HasColumnName("work_order_id");
            entity.Property(e => e.WorkOrderNumber)
                .HasMaxLength(255)
                .HasColumnName("work_order_number");
        });

        modelBuilder.Entity<Staff>(entity =>
        {
            entity.HasKey(e => e.Id).HasName("staff_pkey");

            entity.ToTable("staff", "application");

            entity.HasIndex(e => e.Email, "staff_email_key").IsUnique();

            entity.Property(e => e.Id)
                .HasDefaultValueSql("gen_random_uuid()")
                .HasColumnName("id");
            entity.Property(e => e.CreatedAt)
                .HasDefaultValueSql("CURRENT_TIMESTAMP")
                .HasColumnName("created_at");
            entity.Property(e => e.CreatedBy)
                .HasMaxLength(255)
                .HasColumnName("created_by");
            entity.Property(e => e.DeletedAt).HasColumnName("deleted_at");
            entity.Property(e => e.DeletedBy)
                .HasMaxLength(255)
                .HasColumnName("deleted_by");
            entity.Property(e => e.Email)
                .HasMaxLength(255)
                .HasColumnName("email");
            entity.Property(e => e.EmploymentEndDate).HasColumnName("employment_end_date");
            entity.Property(e => e.EmploymentStartDate).HasColumnName("employment_start_date");
            entity.Property(e => e.FirstName)
                .HasMaxLength(255)
                .HasColumnName("first_name");
            entity.Property(e => e.ImageUrl)
                .HasMaxLength(500)
                .HasColumnName("image_url");
            entity.Property(e => e.IsActive)
                .HasDefaultValue(true)
                .HasColumnName("is_active");
            entity.Property(e => e.JobTitle)
                .HasMaxLength(255)
                .HasColumnName("job_title");
            entity.Property(e => e.LastName)
                .HasMaxLength(255)
                .HasColumnName("last_name");
            entity.Property(e => e.ManagerId).HasColumnName("manager_id");
            entity.Property(e => e.OrganizationId).HasColumnName("organization_id");
            entity.Property(e => e.Phone)
                .HasMaxLength(255)
                .HasColumnName("phone");
            entity.Property(e => e.StaffNumber)
                .HasMaxLength(50)
                .HasColumnName("staff_number");
            entity.Property(e => e.UpdatedAt).HasColumnName("updated_at");
            entity.Property(e => e.UpdatedBy)
                .HasMaxLength(255)
                .HasColumnName("updated_by");

            entity.HasOne(d => d.Manager).WithMany(p => p.Staff)
                .HasForeignKey(d => d.ManagerId)
                .OnDelete(DeleteBehavior.SetNull)
                .HasConstraintName("user_manager_id_fkey");

            entity.HasOne(d => d.Organization).WithMany(p => p.Staff)
                .HasForeignKey(d => d.OrganizationId)
                .OnDelete(DeleteBehavior.SetNull)
                .HasConstraintName("user_organization_id_fkey");
        });

        modelBuilder.Entity<Subsystem>(entity =>
        {
            entity.HasKey(e => e.Id).HasName("subsystem_pkey");

            entity.ToTable("subsystem", "mes");

            entity.HasIndex(e => new { e.Code, e.DeletedAt }, "subsystem_code_deleted_at_key").IsUnique();

            entity.Property(e => e.Id)
                .HasDefaultValueSql("gen_random_uuid()")
                .HasColumnName("id");
            entity.Property(e => e.Code)
                .HasMaxLength(50)
                .HasColumnName("code");
            entity.Property(e => e.CreatedAt)
                .HasDefaultValueSql("CURRENT_TIMESTAMP")
                .HasColumnName("created_at");
            entity.Property(e => e.CreatedBy)
                .HasMaxLength(255)
                .HasColumnName("created_by");
            entity.Property(e => e.DeletedAt).HasColumnName("deleted_at");
            entity.Property(e => e.DeletedBy)
                .HasMaxLength(255)
                .HasColumnName("deleted_by");
            entity.Property(e => e.Description)
                .HasMaxLength(500)
                .HasColumnName("description");
            entity.Property(e => e.IsActive)
                .HasDefaultValue(true)
                .HasColumnName("is_active");
            entity.Property(e => e.Name)
                .HasMaxLength(100)
                .HasColumnName("name");
            entity.Property(e => e.UpdatedAt).HasColumnName("updated_at");
            entity.Property(e => e.UpdatedBy)
                .HasMaxLength(255)
                .HasColumnName("updated_by");
        });

        modelBuilder.Entity<Task>(entity =>
        {
            entity.HasKey(e => e.Id).HasName("task_pkey");

            entity.ToTable("task", "pm");

            entity.Property(e => e.Id)
                .HasDefaultValueSql("gen_random_uuid()")
                .HasColumnName("id");
            entity.Property(e => e.ActualHours)
                .HasPrecision(8, 2)
                .HasComment("Actual hours logged against task")
                .HasColumnName("actual_hours");
            entity.Property(e => e.AssignedToId).HasColumnName("assigned_to_id");
            entity.Property(e => e.BoardColumnId)
                .HasComment("FK to pm.board_column for Kanban boards")
                .HasColumnName("board_column_id");
            entity.Property(e => e.CreatedAt)
                .HasDefaultValueSql("CURRENT_TIMESTAMP")
                .HasColumnName("created_at");
            entity.Property(e => e.CreatedBy)
                .HasMaxLength(255)
                .HasColumnName("created_by");
            entity.Property(e => e.DeletedAt).HasColumnName("deleted_at");
            entity.Property(e => e.DeletedBy)
                .HasMaxLength(255)
                .HasColumnName("deleted_by");
            entity.Property(e => e.Description).HasColumnName("description");
            entity.Property(e => e.DueDate).HasColumnName("due_date");
            entity.Property(e => e.EstimatedHours)
                .HasPrecision(8, 2)
                .HasComment("Estimated hours to complete task")
                .HasColumnName("estimated_hours");
            entity.Property(e => e.IsActive)
                .HasDefaultValue(true)
                .HasColumnName("is_active");
            entity.Property(e => e.MilestoneId).HasColumnName("milestone_id");
            entity.Property(e => e.Name)
                .HasMaxLength(255)
                .HasColumnName("name");
            entity.Property(e => e.ParentTaskId)
                .HasComment("Self-referential FK for subtask hierarchy")
                .HasColumnName("parent_task_id");
            entity.Property(e => e.Priority)
                .HasMaxLength(255)
                .HasColumnName("priority");
            entity.Property(e => e.ProgressPercent)
                .HasDefaultValue(0)
                .HasComment("Completion percentage (0-100)")
                .HasColumnName("progress_percent");
            entity.Property(e => e.ProjectId).HasColumnName("project_id");
            entity.Property(e => e.SortOrder)
                .HasDefaultValue(0)
                .HasComment("Sort order within parent or project")
                .HasColumnName("sort_order");
            entity.Property(e => e.StartDate)
                .HasComment("Task start date for Gantt chart")
                .HasColumnName("start_date");
            entity.Property(e => e.Status)
                .HasMaxLength(255)
                .HasColumnName("status");
            entity.Property(e => e.TaskCode)
                .HasMaxLength(50)
                .HasDefaultValueSql("pm.generate_task_code()")
                .HasComment("Auto-generated unique task code (TSK-XXXXXX)")
                .HasColumnName("task_code");
            entity.Property(e => e.TaskType)
                .HasMaxLength(50)
                .HasDefaultValueSql("'Task'::character varying")
                .HasComment("Task, Milestone, or SubTask")
                .HasColumnName("task_type");
            entity.Property(e => e.UpdatedAt).HasColumnName("updated_at");
            entity.Property(e => e.UpdatedBy)
                .HasMaxLength(255)
                .HasColumnName("updated_by");

            entity.HasOne(d => d.AssignedTo).WithMany(p => p.Tasks)
                .HasForeignKey(d => d.AssignedToId)
                .OnDelete(DeleteBehavior.SetNull)
                .HasConstraintName("task_assigned_to_id_fkey");

            entity.HasOne(d => d.BoardColumn).WithMany(p => p.Tasks)
                .HasForeignKey(d => d.BoardColumnId)
                .OnDelete(DeleteBehavior.SetNull)
                .HasConstraintName("task_board_column_id_fkey");

            entity.HasOne(d => d.Milestone).WithMany(p => p.Tasks)
                .HasForeignKey(d => d.MilestoneId)
                .OnDelete(DeleteBehavior.SetNull)
                .HasConstraintName("task_milestone_id_fkey");

            entity.HasOne(d => d.ParentTask).WithMany(p => p.SubTasks)
                .HasForeignKey(d => d.ParentTaskId)
                .OnDelete(DeleteBehavior.SetNull)
                .HasConstraintName("task_parent_task_id_fkey");

            entity.HasOne(d => d.Project).WithMany(p => p.Tasks)
                .HasForeignKey(d => d.ProjectId)
                .OnDelete(DeleteBehavior.SetNull)
                .HasConstraintName("task_project_id_fkey");
        });

        modelBuilder.Entity<TaskDependency>(entity =>
        {
            entity.HasKey(e => e.Id).HasName("task_dependency_pkey");

            entity.ToTable("task_dependency", "pm");

            entity.HasIndex(e => new { e.PredecessorTaskId, e.SuccessorTaskId }, "uq_task_dependency").IsUnique();

            entity.Property(e => e.Id)
                .HasDefaultValueSql("gen_random_uuid()")
                .HasColumnName("id");
            entity.Property(e => e.CreatedAt)
                .HasDefaultValueSql("CURRENT_TIMESTAMP")
                .HasColumnName("created_at");
            entity.Property(e => e.CreatedBy)
                .HasMaxLength(255)
                .HasColumnName("created_by");
            entity.Property(e => e.DeletedAt).HasColumnName("deleted_at");
            entity.Property(e => e.DeletedBy)
                .HasMaxLength(255)
                .HasColumnName("deleted_by");
            entity.Property(e => e.DependencyType)
                .HasMaxLength(10)
                .HasDefaultValueSql("'FS'::character varying")
                .HasComment("FS=Finish-to-Start, SS=Start-to-Start, FF=Finish-to-Finish, SF=Start-to-Finish")
                .HasColumnName("dependency_type");
            entity.Property(e => e.IsActive)
                .HasDefaultValue(true)
                .HasColumnName("is_active");
            entity.Property(e => e.LagDays)
                .HasDefaultValue(0)
                .HasComment("Number of days delay between linked tasks (can be negative for lead)")
                .HasColumnName("lag_days");
            entity.Property(e => e.PredecessorTaskId).HasColumnName("predecessor_task_id");
            entity.Property(e => e.SuccessorTaskId).HasColumnName("successor_task_id");
            entity.Property(e => e.UpdatedAt).HasColumnName("updated_at");
            entity.Property(e => e.UpdatedBy)
                .HasMaxLength(255)
                .HasColumnName("updated_by");

            entity.HasOne(d => d.PredecessorTask).WithMany(p => p.SuccessorDependencies)
                .HasForeignKey(d => d.PredecessorTaskId)
                .OnDelete(DeleteBehavior.Cascade)
                .HasConstraintName("task_dependency_predecessor_fkey");

            entity.HasOne(d => d.SuccessorTask).WithMany(p => p.PredecessorDependencies)
                .HasForeignKey(d => d.SuccessorTaskId)
                .OnDelete(DeleteBehavior.Cascade)
                .HasConstraintName("task_dependency_successor_fkey");
        });

        modelBuilder.Entity<TaskAssignee>(entity =>
        {
            entity.HasKey(e => e.Id).HasName("task_assignee_pkey");

            entity.ToTable("task_assignee", "pm");

            entity.HasIndex(e => e.TaskId, "idx_task_assignee_task_id").HasFilter("(deleted_at IS NULL)");

            entity.HasIndex(e => e.UserId, "idx_task_assignee_user_id").HasFilter("(deleted_at IS NULL)");

            entity.HasIndex(e => new { e.TaskId, e.UserId }, "uq_task_assignee").IsUnique();

            entity.Property(e => e.Id)
                .HasDefaultValueSql("gen_random_uuid()")
                .HasColumnName("id");
            entity.Property(e => e.AssignedAt)
                .HasDefaultValueSql("CURRENT_TIMESTAMP")
                .HasComment("When the user member was assigned to this task")
                .HasColumnName("assigned_at");
            entity.Property(e => e.AssigneeRole)
                .HasMaxLength(50)
                .HasDefaultValueSql("'Primary'::character varying")
                .HasComment("Primary=main assignee, Secondary=helper, Reviewer=approval, Watcher=notifications only")
                .HasColumnName("assignee_role");
            entity.Property(e => e.CreatedAt)
                .HasDefaultValueSql("CURRENT_TIMESTAMP")
                .HasColumnName("created_at");
            entity.Property(e => e.CreatedBy)
                .HasMaxLength(255)
                .HasColumnName("created_by");
            entity.Property(e => e.DeletedAt).HasColumnName("deleted_at");
            entity.Property(e => e.DeletedBy)
                .HasMaxLength(255)
                .HasColumnName("deleted_by");
            entity.Property(e => e.IsActive)
                .HasDefaultValue(true)
                .HasColumnName("is_active");
            entity.Property(e => e.TaskId).HasColumnName("task_id");
            entity.Property(e => e.UpdatedAt).HasColumnName("updated_at");
            entity.Property(e => e.UpdatedBy)
                .HasMaxLength(255)
                .HasColumnName("updated_by");
            entity.Property(e => e.UserId).HasColumnName("user_id");

            entity.HasOne(d => d.Task).WithMany(p => p.Assignees)
                .HasForeignKey(d => d.TaskId)
                .HasConstraintName("task_assignee_task_id_fkey");

            entity.HasOne(d => d.User).WithMany(p => p.TaskAssignees)
                .HasForeignKey(d => d.UserId)
                .OnDelete(DeleteBehavior.SetNull)
                .HasConstraintName("task_assignee_user_id_fkey");
        });

        modelBuilder.Entity<TaskComment>(entity =>
        {
            entity.HasKey(e => e.Id).HasName("task_comment_pkey");

            entity.ToTable("task_comment", "pm", tb => tb.HasComment("Comments and discussions on tasks"));

            entity.HasIndex(e => new { e.TaskId, e.CreatedAt }, "idx_task_comment_created_at").HasFilter("(deleted_at IS NULL)");

            entity.HasIndex(e => e.Mentions, "idx_task_comment_mentions")
                .HasFilter("(deleted_at IS NULL)")
                .HasMethod("gin");

            entity.HasIndex(e => e.ParentCommentId, "idx_task_comment_parent_id").HasFilter("(deleted_at IS NULL)");

            entity.HasIndex(e => e.TaskId, "idx_task_comment_task_id").HasFilter("(deleted_at IS NULL)");

            entity.Property(e => e.Id)
                .HasDefaultValueSql("gen_random_uuid()")
                .HasColumnName("id");
            entity.Property(e => e.Content)
                .HasComment("Comment text content (may include markdown)")
                .HasColumnName("content");
            entity.Property(e => e.CreatedAt)
                .HasDefaultValueSql("CURRENT_TIMESTAMP")
                .HasColumnName("created_at");
            entity.Property(e => e.CreatedBy)
                .HasMaxLength(255)
                .HasColumnName("created_by");
            entity.Property(e => e.DeletedAt).HasColumnName("deleted_at");
            entity.Property(e => e.DeletedBy)
                .HasMaxLength(255)
                .HasColumnName("deleted_by");
            entity.Property(e => e.IsActive)
                .HasDefaultValue(true)
                .HasColumnName("is_active");
            entity.Property(e => e.Mentions)
                .HasDefaultValueSql("'[]'::jsonb")
                .HasComment("JSON array of user IDs mentioned with @, e.g., [\"uuid1\", \"uuid2\"]")
                .HasColumnType("jsonb")
                .HasColumnName("mentions");
            entity.Property(e => e.ParentCommentId)
                .HasComment("Self-referential FK for threaded replies")
                .HasColumnName("parent_comment_id");
            entity.Property(e => e.TaskId).HasColumnName("task_id");
            entity.Property(e => e.UpdatedAt).HasColumnName("updated_at");
            entity.Property(e => e.UpdatedBy)
                .HasMaxLength(255)
                .HasColumnName("updated_by");

            entity.HasOne(d => d.ParentComment).WithMany(p => p.Replies)
                .HasForeignKey(d => d.ParentCommentId)
                .OnDelete(DeleteBehavior.SetNull)
                .HasConstraintName("task_comment_parent_comment_id_fkey");

            entity.HasOne(d => d.Task).WithMany(p => p.Comments)
                .HasForeignKey(d => d.TaskId)
                .HasConstraintName("task_comment_task_id_fkey");
        });

        modelBuilder.Entity<TaskActivity>(entity =>
        {
            entity.HasKey(e => e.Id).HasName("task_activity_pkey");

            entity.ToTable("task_activity", "pm", tb => tb.HasComment("Activity log for task changes - read-only audit trail"));

            entity.HasIndex(e => new { e.CreatedBy, e.CreatedAt }, "idx_task_activity_created_by").IsDescending(false, true);

            entity.HasIndex(e => new { e.TaskId, e.CreatedAt }, "idx_task_activity_task_id").IsDescending(false, true);

            entity.HasIndex(e => new { e.TaskId, e.ActivityType }, "idx_task_activity_type");

            entity.Property(e => e.Id)
                .HasDefaultValueSql("gen_random_uuid()")
                .HasColumnName("id");
            entity.Property(e => e.ActivityType)
                .HasMaxLength(50)
                .HasComment("Type of activity that occurred")
                .HasColumnName("activity_type");
            entity.Property(e => e.CreatedAt)
                .HasDefaultValueSql("CURRENT_TIMESTAMP")
                .HasColumnName("created_at");
            entity.Property(e => e.CreatedBy)
                .HasMaxLength(255)
                .HasColumnName("created_by");
            entity.Property(e => e.Description)
                .HasComment("Human-readable description of the activity")
                .HasColumnName("description");
            entity.Property(e => e.FieldChanged)
                .HasMaxLength(100)
                .HasComment("Name of field that was changed (for Updates)")
                .HasColumnName("field_changed");
            entity.Property(e => e.NewValue)
                .HasComment("New value (for tracking changes)")
                .HasColumnName("new_value");
            entity.Property(e => e.OldValue)
                .HasComment("Previous value (for tracking changes)")
                .HasColumnName("old_value");
            entity.Property(e => e.TaskId).HasColumnName("task_id");

            entity.HasOne(d => d.Task).WithMany(p => p.Activities)
                .HasForeignKey(d => d.TaskId)
                .HasConstraintName("task_activity_task_id_fkey");
        });

        modelBuilder.Entity<TaskGanttVw>(entity =>
        {
            entity
                .HasNoKey()
                .ToView("task_gantt_vw", "pm");

            entity.Property(e => e.ActualHours)
                .HasPrecision(8, 2)
                .HasColumnName("actual_hours");
            entity.Property(e => e.AssignedToId).HasColumnName("assigned_to_id");
            entity.Property(e => e.AssigneeEmail)
                .HasMaxLength(255)
                .HasColumnName("assignee_email");
            entity.Property(e => e.AssigneeFirstName)
                .HasMaxLength(255)
                .HasColumnName("assignee_first_name");
            entity.Property(e => e.AssigneeLastName)
                .HasMaxLength(255)
                .HasColumnName("assignee_last_name");
            entity.Property(e => e.Assignees)
                .HasColumnType("json")
                .HasColumnName("assignees");
            entity.Property(e => e.CompletedSubtaskCount).HasColumnName("completed_subtask_count");
            entity.Property(e => e.CreatedAt).HasColumnName("created_at");
            entity.Property(e => e.CreatedBy)
                .HasMaxLength(255)
                .HasColumnName("created_by");
            entity.Property(e => e.Dependencies)
                .HasColumnType("json")
                .HasColumnName("dependencies");
            entity.Property(e => e.Description).HasColumnName("description");
            entity.Property(e => e.DueDate).HasColumnName("due_date");
            entity.Property(e => e.EstimatedHours)
                .HasPrecision(8, 2)
                .HasColumnName("estimated_hours");
            entity.Property(e => e.Id).HasColumnName("id");
            entity.Property(e => e.IsActive).HasColumnName("is_active");
            entity.Property(e => e.Name)
                .HasMaxLength(255)
                .HasColumnName("name");
            entity.Property(e => e.ParentTaskCode)
                .HasMaxLength(50)
                .HasColumnName("parent_task_code");
            entity.Property(e => e.ParentTaskId).HasColumnName("parent_task_id");
            entity.Property(e => e.ParentTaskName)
                .HasMaxLength(255)
                .HasColumnName("parent_task_name");
            entity.Property(e => e.Priority)
                .HasMaxLength(255)
                .HasColumnName("priority");
            entity.Property(e => e.ProgressPercent).HasColumnName("progress_percent");
            entity.Property(e => e.ProjectCode)
                .HasMaxLength(255)
                .HasColumnName("project_code");
            entity.Property(e => e.ProjectId).HasColumnName("project_id");
            entity.Property(e => e.ProjectName)
                .HasMaxLength(255)
                .HasColumnName("project_name");
            entity.Property(e => e.SortOrder).HasColumnName("sort_order");
            entity.Property(e => e.StartDate).HasColumnName("start_date");
            entity.Property(e => e.Status)
                .HasMaxLength(255)
                .HasColumnName("status");
            entity.Property(e => e.SubtaskCount).HasColumnName("subtask_count");
            entity.Property(e => e.TaskCode)
                .HasMaxLength(50)
                .HasColumnName("task_code");
            entity.Property(e => e.TaskType)
                .HasMaxLength(50)
                .HasColumnName("task_type");
        });

        modelBuilder.Entity<BoardColumn>(entity =>
        {
            entity.HasKey(e => e.Id).HasName("board_column_pkey");

            entity.ToTable("board_column", "pm", tb => tb.HasComment("Kanban board columns for each project"));

            entity.HasIndex(e => new { e.ProjectId, e.Position }, "idx_board_column_position").HasFilter("(deleted_at IS NULL)");

            entity.HasIndex(e => e.ProjectId, "idx_board_column_project_id").HasFilter("(deleted_at IS NULL)");

            entity.Property(e => e.Id)
                .HasDefaultValueSql("gen_random_uuid()")
                .HasColumnName("id");
            entity.Property(e => e.Color)
                .HasMaxLength(50)
                .HasDefaultValueSql("'#1976d2'::character varying")
                .HasComment("Column header color (hex code)")
                .HasColumnName("color");
            entity.Property(e => e.CreatedAt)
                .HasDefaultValueSql("CURRENT_TIMESTAMP")
                .HasColumnName("created_at");
            entity.Property(e => e.CreatedBy)
                .HasMaxLength(255)
                .HasColumnName("created_by");
            entity.Property(e => e.DeletedAt).HasColumnName("deleted_at");
            entity.Property(e => e.DeletedBy)
                .HasMaxLength(255)
                .HasColumnName("deleted_by");
            entity.Property(e => e.Description).HasColumnName("description");
            entity.Property(e => e.IsActive)
                .HasDefaultValue(true)
                .HasColumnName("is_active");
            entity.Property(e => e.IsDefault)
                .HasDefaultValue(false)
                .HasComment("Whether this is the default column for new tasks")
                .HasColumnName("is_default");
            entity.Property(e => e.MapsToStatus)
                .HasMaxLength(255)
                .HasComment("Task status that this column maps to (e.g., To Do, In Progress)")
                .HasColumnName("maps_to_status");
            entity.Property(e => e.Name)
                .HasMaxLength(100)
                .HasColumnName("name");
            entity.Property(e => e.Position)
                .HasDefaultValue(0)
                .HasComment("Order position of column from left to right")
                .HasColumnName("position");
            entity.Property(e => e.ProjectId).HasColumnName("project_id");
            entity.Property(e => e.UpdatedAt).HasColumnName("updated_at");
            entity.Property(e => e.UpdatedBy)
                .HasMaxLength(255)
                .HasColumnName("updated_by");
            entity.Property(e => e.WipLimit)
                .HasComment("Work-in-progress limit for the column (null = no limit)")
                .HasColumnName("wip_limit");

            entity.HasOne(d => d.Project).WithMany()
                .HasForeignKey(d => d.ProjectId)
                .HasConstraintName("board_column_project_id_fkey");
        });

        modelBuilder.Entity<TimeEntry>(entity =>
        {
            entity.HasKey(e => e.Id).HasName("time_entry_pkey");

            entity.ToTable("time_entry", "pm", tb => tb.HasComment("Time entries logged against tasks"));

            entity.HasIndex(e => new { e.UserId, e.EntryDate }, "idx_time_entry_date_range").HasFilter("(deleted_at IS NULL)");

            entity.HasIndex(e => e.EntryDate, "idx_time_entry_entry_date").HasFilter("(deleted_at IS NULL)");

            entity.HasIndex(e => e.TaskId, "idx_time_entry_task_id").HasFilter("(deleted_at IS NULL)");

            entity.HasIndex(e => new { e.TaskId, e.UserId }, "idx_time_entry_task_user").HasFilter("(deleted_at IS NULL)");

            entity.HasIndex(e => e.UserId, "idx_time_entry_user_id").HasFilter("(deleted_at IS NULL)");

            entity.Property(e => e.Id)
                .HasDefaultValueSql("gen_random_uuid()")
                .HasColumnName("id");
            entity.Property(e => e.Billable)
                .HasDefaultValue(true)
                .HasComment("Whether this time is billable to the client")
                .HasColumnName("billable");
            entity.Property(e => e.CreatedAt)
                .HasDefaultValueSql("CURRENT_TIMESTAMP")
                .HasColumnName("created_at");
            entity.Property(e => e.CreatedBy)
                .HasMaxLength(255)
                .HasColumnName("created_by");
            entity.Property(e => e.DeletedAt).HasColumnName("deleted_at");
            entity.Property(e => e.DeletedBy)
                .HasMaxLength(255)
                .HasColumnName("deleted_by");
            entity.Property(e => e.Description).HasColumnName("description");
            entity.Property(e => e.EntryDate)
                .HasComment("Date the work was performed")
                .HasColumnName("entry_date");
            entity.Property(e => e.HoursWorked)
                .HasPrecision(5, 2)
                .HasComment("Number of hours worked (max 24)")
                .HasColumnName("hours_worked");
            entity.Property(e => e.IsActive)
                .HasDefaultValue(true)
                .HasColumnName("is_active");
            entity.Property(e => e.TaskId)
                .HasComment("Reference to the task this time was logged against")
                .HasColumnName("task_id");
            entity.Property(e => e.UpdatedAt).HasColumnName("updated_at");
            entity.Property(e => e.UpdatedBy)
                .HasMaxLength(255)
                .HasColumnName("updated_by");
            entity.Property(e => e.UserId)
                .HasComment("User member who logged the time")
                .HasColumnName("user_id");
            entity.Property(e => e.WorkType)
                .HasMaxLength(50)
                .HasDefaultValueSql("'Development'::character varying")
                .HasComment("Type of work performed (Development, Design, Testing, etc.)")
                .HasColumnName("work_type");

            entity.HasOne(d => d.Task).WithMany()
                .HasForeignKey(d => d.TaskId)
                .HasConstraintName("time_entry_task_id_fkey");

            entity.HasOne(d => d.User).WithMany(p => p.TimeEntries)
                .HasForeignKey(d => d.UserId)
                .OnDelete(DeleteBehavior.SetNull)
                .HasConstraintName("time_entry_user_id_fkey");
        });

        modelBuilder.Entity<Tool>(entity =>
        {
            entity.HasKey(e => e.Id).HasName("tool_pkey");

            entity.ToTable("tool", "mes");

            entity.HasIndex(e => e.Number, "tool_number_key").IsUnique();

            entity.Property(e => e.Id)
                .HasDefaultValueSql("gen_random_uuid()")
                .HasColumnName("id");
            entity.Property(e => e.CreatedAt)
                .HasDefaultValueSql("CURRENT_TIMESTAMP")
                .HasColumnName("created_at");
            entity.Property(e => e.CreatedBy)
                .HasMaxLength(255)
                .HasColumnName("created_by");
            entity.Property(e => e.DeletedAt).HasColumnName("deleted_at");
            entity.Property(e => e.DeletedBy)
                .HasMaxLength(255)
                .HasColumnName("deleted_by");
            entity.Property(e => e.IsActive)
                .HasDefaultValue(true)
                .HasColumnName("is_active");
            entity.Property(e => e.Name)
                .HasMaxLength(255)
                .HasColumnName("name");
            entity.Property(e => e.Number)
                .HasMaxLength(255)
                .HasColumnName("number");
            entity.Property(e => e.ToolTypeId).HasColumnName("tool_type_id");
            entity.Property(e => e.UpdatedAt).HasColumnName("updated_at");
            entity.Property(e => e.UpdatedBy)
                .HasMaxLength(255)
                .HasColumnName("updated_by");

            entity.HasOne(d => d.ToolType).WithMany(p => p.Tools)
                .HasForeignKey(d => d.ToolTypeId)
                .OnDelete(DeleteBehavior.SetNull)
                .HasConstraintName("tool_tool_type_id_fkey");
        });

        modelBuilder.Entity<ToolType>(entity =>
        {
            entity.HasKey(e => e.Id).HasName("tool_type_pkey");

            entity.ToTable("tool_type", "mes");

            entity.Property(e => e.Id)
                .HasDefaultValueSql("gen_random_uuid()")
                .HasColumnName("id");
            entity.Property(e => e.CreatedAt)
                .HasDefaultValueSql("CURRENT_TIMESTAMP")
                .HasColumnName("created_at");
            entity.Property(e => e.CreatedBy)
                .HasMaxLength(255)
                .HasColumnName("created_by");
            entity.Property(e => e.DeletedAt).HasColumnName("deleted_at");
            entity.Property(e => e.DeletedBy)
                .HasMaxLength(255)
                .HasColumnName("deleted_by");
            entity.Property(e => e.IsActive)
                .HasDefaultValue(true)
                .HasColumnName("is_active");
            entity.Property(e => e.Name)
                .HasMaxLength(255)
                .HasColumnName("name");
            entity.Property(e => e.UpdatedAt).HasColumnName("updated_at");
            entity.Property(e => e.UpdatedBy)
                .HasMaxLength(255)
                .HasColumnName("updated_by");
        });

        modelBuilder.Entity<UnitOfMeasure>(entity =>
        {
            entity.HasKey(e => e.Id).HasName("unit_of_measure_pkey");

            entity.ToTable("unit_of_measure", "mes");

            entity.Property(e => e.Id)
                .HasDefaultValueSql("gen_random_uuid()")
                .HasColumnName("id");
            entity.Property(e => e.CreatedAt)
                .HasDefaultValueSql("CURRENT_TIMESTAMP")
                .HasColumnName("created_at");
            entity.Property(e => e.CreatedBy)
                .HasMaxLength(255)
                .HasColumnName("created_by");
            entity.Property(e => e.DeletedAt).HasColumnName("deleted_at");
            entity.Property(e => e.DeletedBy)
                .HasMaxLength(255)
                .HasColumnName("deleted_by");
            entity.Property(e => e.IsActive)
                .HasDefaultValue(true)
                .HasColumnName("is_active");
            entity.Property(e => e.Name)
                .HasMaxLength(255)
                .HasColumnName("name");
            entity.Property(e => e.UpdatedAt).HasColumnName("updated_at");
            entity.Property(e => e.UpdatedBy)
                .HasMaxLength(255)
                .HasColumnName("updated_by");
        });

        modelBuilder.Entity<User>(entity =>
        {
            entity.HasKey(e => e.Id).HasName("user_pkey");

            entity.ToTable("user", "application");

            entity.HasIndex(e => new { e.Email, e.DeletedAt }, "user_email_deleted_at_key").IsUnique();

            entity.HasIndex(e => e.UserNumber, "user_user_number_key").IsUnique();

            entity.Property(e => e.Id)
                .HasDefaultValueSql("gen_random_uuid()")
                .HasColumnName("id");
            entity.Property(e => e.CreatedAt)
                .HasDefaultValueSql("CURRENT_TIMESTAMP")
                .HasColumnName("created_at");
            entity.Property(e => e.CreatedBy)
                .HasMaxLength(255)
                .HasColumnName("created_by");
            entity.Property(e => e.DeletedAt).HasColumnName("deleted_at");
            entity.Property(e => e.DeletedBy)
                .HasMaxLength(255)
                .HasColumnName("deleted_by");
            entity.Property(e => e.Department)
                .HasMaxLength(255)
                .HasColumnName("department");
            entity.Property(e => e.Email)
                .HasMaxLength(255)
                .HasColumnName("email");
            entity.Property(e => e.FirstName)
                .HasMaxLength(255)
                .HasColumnName("first_name");
            entity.Property(e => e.ImageUrl).HasColumnName("image_url");
            entity.Property(e => e.IsActive)
                .HasDefaultValue(true)
                .HasColumnName("is_active");
            entity.Property(e => e.JobTitle)
                .HasMaxLength(255)
                .HasColumnName("job_title");
            entity.Property(e => e.LastName)
                .HasMaxLength(255)
                .HasColumnName("last_name");
            entity.Property(e => e.Phone)
                .HasMaxLength(255)
                .HasColumnName("phone");
            entity.Property(e => e.UpdatedAt).HasColumnName("updated_at");
            entity.Property(e => e.UpdatedBy)
                .HasMaxLength(255)
                .HasColumnName("updated_by");
            entity.Property(e => e.UserNumber)
                .ValueGeneratedOnAdd()
                .HasColumnName("user_number");
        });

        modelBuilder.Entity<UserRole>(entity =>
        {
            entity.HasKey(e => e.Id).HasName("user_role_pkey");

            entity.ToTable("user_role", "application");

            entity.Property(e => e.Id)
                .HasDefaultValueSql("gen_random_uuid()")
                .HasColumnName("id");
            entity.Property(e => e.CreatedAt)
                .HasDefaultValueSql("CURRENT_TIMESTAMP")
                .HasColumnName("created_at");
            entity.Property(e => e.CreatedBy)
                .HasMaxLength(255)
                .HasColumnName("created_by");
            entity.Property(e => e.DeletedAt).HasColumnName("deleted_at");
            entity.Property(e => e.DeletedBy)
                .HasMaxLength(255)
                .HasColumnName("deleted_by");
            entity.Property(e => e.IsActive)
                .HasDefaultValue(true)
                .HasColumnName("is_active");
            entity.Property(e => e.IsDefault)
                .HasDefaultValue(false)
                .HasColumnName("is_default");
            entity.Property(e => e.RoleId).HasColumnName("role_id");
            entity.Property(e => e.UpdatedAt).HasColumnName("updated_at");
            entity.Property(e => e.UpdatedBy)
                .HasMaxLength(255)
                .HasColumnName("updated_by");
            entity.Property(e => e.UserId).HasColumnName("user_id");

            entity.HasOne(d => d.Role).WithMany(p => p.UserRoles)
                .HasForeignKey(d => d.RoleId)
                .HasConstraintName("user_role_role_id_fkey");

            entity.HasOne(d => d.User).WithMany(p => p.UserRoles)
                .HasForeignKey(d => d.UserId)
                .HasConstraintName("user_role_user_id_fkey");
        });

        modelBuilder.Entity<VendorReturnLineItem>(entity =>
        {
            entity.HasKey(e => e.Id).HasName("vendor_return_line_item_pkey");

            entity.ToTable("vendor_return_line_item", "sc");

            entity.Property(e => e.Id)
                .HasDefaultValueSql("gen_random_uuid()")
                .HasColumnName("id");
            entity.Property(e => e.CreatedAt)
                .HasDefaultValueSql("CURRENT_TIMESTAMP")
                .HasColumnName("created_at");
            entity.Property(e => e.CreatedBy)
                .HasMaxLength(255)
                .HasColumnName("created_by");
            entity.Property(e => e.DeletedAt).HasColumnName("deleted_at");
            entity.Property(e => e.DeletedBy)
                .HasMaxLength(255)
                .HasColumnName("deleted_by");
            entity.Property(e => e.GrnLineItemId).HasColumnName("grn_line_item_id");
            entity.Property(e => e.IsActive)
                .HasDefaultValue(true)
                .HasColumnName("is_active");
            entity.Property(e => e.PartId).HasColumnName("part_id");
            entity.Property(e => e.Reason).HasColumnName("reason");
            entity.Property(e => e.ReturnQuantity).HasColumnName("return_quantity");
            entity.Property(e => e.ReturnRequestId).HasColumnName("return_request_id");
            entity.Property(e => e.TrackingId)
                .HasMaxLength(255)
                .HasColumnName("tracking_id");
            entity.Property(e => e.TrackingType)
                .HasMaxLength(50)
                .HasColumnName("tracking_type");
            entity.Property(e => e.UpdatedAt).HasColumnName("updated_at");
            entity.Property(e => e.UpdatedBy)
                .HasMaxLength(255)
                .HasColumnName("updated_by");

            entity.HasOne(d => d.GrnLineItem).WithMany(p => p.VendorReturnLineItems)
                .HasForeignKey(d => d.GrnLineItemId)
                .OnDelete(DeleteBehavior.SetNull)
                .HasConstraintName("vendor_return_line_item_grn_line_item_id_fkey");

            entity.HasOne(d => d.Part).WithMany(p => p.VendorReturnLineItems)
                .HasForeignKey(d => d.PartId)
                .OnDelete(DeleteBehavior.SetNull)
                .HasConstraintName("vendor_return_line_item_part_id_fkey");

            entity.HasOne(d => d.ReturnRequest).WithMany(p => p.VendorReturnLineItems)
                .HasForeignKey(d => d.ReturnRequestId)
                .HasConstraintName("vendor_return_line_item_return_request_id_fkey");
        });

        modelBuilder.Entity<VendorReturnRequest>(entity =>
        {
            entity.HasKey(e => e.Id).HasName("vendor_return_request_pkey");

            entity.ToTable("vendor_return_request", "sc");

            entity.Property(e => e.Id)
                .HasDefaultValueSql("gen_random_uuid()")
                .HasColumnName("id");
            entity.Property(e => e.ApprovedBy)
                .HasMaxLength(255)
                .HasColumnName("approved_by");
            entity.Property(e => e.ApprovedDate).HasColumnName("approved_date");
            entity.Property(e => e.CreatedAt)
                .HasDefaultValueSql("CURRENT_TIMESTAMP")
                .HasColumnName("created_at");
            entity.Property(e => e.CreatedBy)
                .HasMaxLength(255)
                .HasColumnName("created_by");
            entity.Property(e => e.DeletedAt).HasColumnName("deleted_at");
            entity.Property(e => e.DeletedBy)
                .HasMaxLength(255)
                .HasColumnName("deleted_by");
            entity.Property(e => e.GrnId).HasColumnName("grn_id");
            entity.Property(e => e.IsActive)
                .HasDefaultValue(true)
                .HasColumnName("is_active");
            entity.Property(e => e.LocationId).HasColumnName("location_id");
            entity.Property(e => e.PoId).HasColumnName("po_id");
            entity.Property(e => e.RaisedById).HasColumnName("raised_by_id");
            entity.Property(e => e.Reason).HasColumnName("reason");
            entity.Property(e => e.RejectedBy)
                .HasMaxLength(255)
                .HasColumnName("rejected_by");
            entity.Property(e => e.RejectedDate).HasColumnName("rejected_date");
            entity.Property(e => e.ReturnDate).HasColumnName("return_date");
            entity.Property(e => e.ReturnNumber)
                .HasMaxLength(255)
                .HasDefaultValueSql("sc.generate_vendor_return_number()")
                .HasColumnName("return_number");
            entity.Property(e => e.Status)
                .HasMaxLength(50)
                .HasDefaultValueSql("'Draft'::character varying")
                .HasColumnName("status");
            entity.Property(e => e.UpdatedAt).HasColumnName("updated_at");
            entity.Property(e => e.UpdatedBy)
                .HasMaxLength(255)
                .HasColumnName("updated_by");
            entity.Property(e => e.VendorId).HasColumnName("vendor_id");
            entity.Property(e => e.WoId).HasColumnName("wo_id");

            entity.HasOne(d => d.Grn).WithMany(p => p.VendorReturnRequests)
                .HasForeignKey(d => d.GrnId)
                .OnDelete(DeleteBehavior.SetNull)
                .HasConstraintName("vendor_return_request_grn_id_fkey");

            entity.HasOne(d => d.Location).WithMany(p => p.VendorReturnRequests)
                .HasForeignKey(d => d.LocationId)
                .OnDelete(DeleteBehavior.SetNull)
                .HasConstraintName("vendor_return_request_location_id_fkey");

            entity.HasOne(d => d.Po).WithMany(p => p.VendorReturnRequests)
                .HasForeignKey(d => d.PoId)
                .OnDelete(DeleteBehavior.SetNull)
                .HasConstraintName("vendor_return_request_po_id_fkey");

            entity.HasOne(d => d.RaisedBy).WithMany(p => p.VendorReturnRequests)
                .HasForeignKey(d => d.RaisedById)
                .OnDelete(DeleteBehavior.SetNull)
                .HasConstraintName("vendor_return_request_raised_by_id_fkey");

            entity.HasOne(d => d.Vendor).WithMany(p => p.VendorReturnRequests)
                .HasForeignKey(d => d.VendorId)
                .OnDelete(DeleteBehavior.SetNull)
                .HasConstraintName("vendor_return_request_vendor_id_fkey");

            entity.HasOne(d => d.Wo).WithMany(p => p.VendorReturnRequests)
                .HasForeignKey(d => d.WoId)
                .OnDelete(DeleteBehavior.SetNull)
                .HasConstraintName("fk_vendor_return_request_wo_id");
        });

        modelBuilder.Entity<VendorReturnRequestWithUserVw>(entity =>
        {
            entity
                .HasNoKey()
                .ToView("vendor_return_request_with_user_vw", "sc");

            entity.Property(e => e.CreatedAt).HasColumnName("created_at");
            entity.Property(e => e.CreatedBy)
                .HasMaxLength(255)
                .HasColumnName("created_by");
            entity.Property(e => e.GrnId).HasColumnName("grn_id");
            entity.Property(e => e.GrnLineItemId).HasColumnName("grn_line_item_id");
            entity.Property(e => e.GrnNumber)
                .HasMaxLength(255)
                .HasColumnName("grn_number");
            entity.Property(e => e.GrnReceivedDate).HasColumnName("grn_received_date");
            entity.Property(e => e.GrnStatus)
                .HasMaxLength(255)
                .HasColumnName("grn_status");
            entity.Property(e => e.IsActive).HasColumnName("is_active");
            entity.Property(e => e.LineItemId).HasColumnName("line_item_id");
            entity.Property(e => e.LineItemReason).HasColumnName("line_item_reason");
            entity.Property(e => e.LocationId).HasColumnName("location_id");
            entity.Property(e => e.LocationName)
                .HasMaxLength(255)
                .HasColumnName("location_name");
            entity.Property(e => e.LocationNumber)
                .HasMaxLength(255)
                .HasColumnName("location_number");
            entity.Property(e => e.PartId).HasColumnName("part_id");
            entity.Property(e => e.PoId).HasColumnName("po_id");
            entity.Property(e => e.PoNumber)
                .HasMaxLength(255)
                .HasColumnName("po_number");
            entity.Property(e => e.PoOrderDate).HasColumnName("po_order_date");
            entity.Property(e => e.PoStatus)
                .HasMaxLength(255)
                .HasColumnName("po_status");
            entity.Property(e => e.RaisedByEmail)
                .HasMaxLength(255)
                .HasColumnName("raised_by_email");
            entity.Property(e => e.RaisedByFullName).HasColumnName("raised_by_full_name");
            entity.Property(e => e.ReturnDate).HasColumnName("return_date");
            entity.Property(e => e.ReturnNumber)
                .HasMaxLength(255)
                .HasColumnName("return_number");
            entity.Property(e => e.ReturnQuantity).HasColumnName("return_quantity");
            entity.Property(e => e.ReturnReason).HasColumnName("return_reason");
            entity.Property(e => e.ReturnStatus)
                .HasMaxLength(50)
                .HasColumnName("return_status");
            entity.Property(e => e.TrackingId)
                .HasMaxLength(255)
                .HasColumnName("tracking_id");
            entity.Property(e => e.TrackingType)
                .HasMaxLength(50)
                .HasColumnName("tracking_type");
            entity.Property(e => e.UpdatedAt).HasColumnName("updated_at");
            entity.Property(e => e.UpdatedBy)
                .HasMaxLength(255)
                .HasColumnName("updated_by");
            entity.Property(e => e.VendorId).HasColumnName("vendor_id");
            entity.Property(e => e.VendorName)
                .HasMaxLength(255)
                .HasColumnName("vendor_name");
            entity.Property(e => e.VendorReturnRequestId).HasColumnName("vendor_return_request_id");
            entity.Property(e => e.WoId).HasColumnName("wo_id");
            entity.Property(e => e.WoStatus)
                .HasMaxLength(255)
                .HasColumnName("wo_status");
            entity.Property(e => e.WorkOrderNumber)
                .HasMaxLength(255)
                .HasColumnName("work_order_number");
        });

        modelBuilder.Entity<Video>(entity =>
        {
            entity.HasKey(e => e.Id).HasName("video_pkey");

            entity.ToTable("video", "common");

            entity.Property(e => e.Id)
                .HasDefaultValueSql("gen_random_uuid()")
                .HasColumnName("id");
            entity.Property(e => e.CreatedAt)
                .HasDefaultValueSql("CURRENT_TIMESTAMP")
                .HasColumnName("created_at");
            entity.Property(e => e.CreatedBy)
                .HasMaxLength(255)
                .HasColumnName("created_by");
            entity.Property(e => e.DeletedAt).HasColumnName("deleted_at");
            entity.Property(e => e.DeletedBy)
                .HasMaxLength(255)
                .HasColumnName("deleted_by");
            entity.Property(e => e.EntityId).HasColumnName("entity_id");
            entity.Property(e => e.EntityType)
                .HasMaxLength(100)
                .HasColumnName("entity_type");
            entity.Property(e => e.FileExtension)
                .HasMaxLength(50)
                .HasColumnName("file_extension");
            entity.Property(e => e.FileName)
                .HasMaxLength(255)
                .HasColumnName("file_name");
            entity.Property(e => e.FilePath)
                .HasMaxLength(255)
                .HasColumnName("file_path");
            entity.Property(e => e.FileRelativePath)
                .HasMaxLength(255)
                .HasColumnName("file_relative_path");
            entity.Property(e => e.FileSize).HasColumnName("file_size");
            entity.Property(e => e.IsActive)
                .HasDefaultValue(true)
                .HasColumnName("is_active");
            entity.Property(e => e.UpdatedAt).HasColumnName("updated_at");
            entity.Property(e => e.UpdatedBy)
                .HasMaxLength(255)
                .HasColumnName("updated_by");
            entity.Property(e => e.VideoType)
                .HasMaxLength(100)
                .HasColumnName("video_type");
        });

        modelBuilder.Entity<WorkOrder>(entity =>
        {
            entity.HasKey(e => e.Id).HasName("work_order_pkey");

            entity.ToTable("work_order", "mes");

            entity.HasIndex(e => e.KitId, "work_order_kit_id_key").IsUnique();

            entity.HasIndex(e => e.Number, "work_order_number_key").IsUnique();

            entity.Property(e => e.Id)
                .HasDefaultValueSql("gen_random_uuid()")
                .HasColumnName("id");
            entity.Property(e => e.ActualEndDate).HasColumnName("actual_end_date");
            entity.Property(e => e.ActualStartDate).HasColumnName("actual_start_date");
            entity.Property(e => e.CreatedAt)
                .HasDefaultValueSql("CURRENT_TIMESTAMP")
                .HasColumnName("created_at");
            entity.Property(e => e.CreatedBy)
                .HasMaxLength(255)
                .HasColumnName("created_by");
            entity.Property(e => e.DeletedAt).HasColumnName("deleted_at");
            entity.Property(e => e.DeletedBy)
                .HasMaxLength(255)
                .HasColumnName("deleted_by");
            entity.Property(e => e.EndDate).HasColumnName("end_date");
            entity.Property(e => e.ExecutionTime).HasColumnName("execution_time");
            entity.Property(e => e.GuideId).HasColumnName("guide_id");
            entity.Property(e => e.IsActive)
                .HasDefaultValue(true)
                .HasColumnName("is_active");
            entity.Property(e => e.KitId).HasColumnName("kit_id");
            entity.Property(e => e.ManagerId).HasColumnName("manager_id");
            entity.Property(e => e.Name)
                .HasMaxLength(255)
                .HasColumnName("name");
            entity.Property(e => e.Number)
                .HasMaxLength(255)
                .HasColumnName("number");
            entity.Property(e => e.PartId).HasColumnName("part_id");
            entity.Property(e => e.ProductId).HasColumnName("product_id");
            entity.Property(e => e.StartDate).HasColumnName("start_date");
            entity.Property(e => e.Status)
                .HasMaxLength(255)
                .HasDefaultValueSql("'Pending'::character varying")
                .HasColumnName("status");
            entity.Property(e => e.TechnicianId).HasColumnName("technician_id");
            entity.Property(e => e.UpdatedAt).HasColumnName("updated_at");
            entity.Property(e => e.UpdatedBy)
                .HasMaxLength(255)
                .HasColumnName("updated_by");
            entity.Property(e => e.WorkPackageId).HasColumnName("work_package_id");

            entity.HasOne(d => d.Guide).WithMany(p => p.WorkOrders)
                .HasForeignKey(d => d.GuideId)
                .OnDelete(DeleteBehavior.SetNull)
                .HasConstraintName("work_order_guide_id_fkey");

            entity.HasOne(d => d.Kit).WithOne(p => p.WorkOrder)
                .HasForeignKey<WorkOrder>(d => d.KitId)
                .OnDelete(DeleteBehavior.SetNull)
                .HasConstraintName("work_order_kit_id_fkey");

            entity.HasOne(d => d.Part).WithMany(p => p.WorkOrders)
                .HasForeignKey(d => d.PartId)
                .OnDelete(DeleteBehavior.ClientSetNull)
                .HasConstraintName("work_order_part_id_fkey");

            entity.HasOne(d => d.Product).WithMany(p => p.WorkOrders)
                .HasForeignKey(d => d.ProductId)
                .OnDelete(DeleteBehavior.SetNull)
                .HasConstraintName("work_order_product_id_fkey");

            entity.HasOne(d => d.WorkPackage).WithMany(p => p.WorkOrders)
                .HasForeignKey(d => d.WorkPackageId)
                .OnDelete(DeleteBehavior.SetNull)
                .HasConstraintName("work_order_work_package_id_fkey");
        });

        modelBuilder.Entity<WorkOrderStep>(entity =>
        {
            entity.HasKey(e => e.Id).HasName("work_order_step_pkey");

            entity.ToTable("work_order_step", "mes");

            entity.HasIndex(e => e.ImageId, "work_order_step_image_id_fkey");

            entity.HasIndex(e => e.ManagerId, "work_order_step_manager_id_fkey");

            entity.HasIndex(e => e.TechnicianId, "work_order_step_technician_id_fkey");

            entity.Property(e => e.Id)
                .HasDefaultValueSql("gen_random_uuid()")
                .HasColumnName("id");
            entity.Property(e => e.CapturedTime).HasColumnName("captured_time");
            entity.Property(e => e.Comment)
                .HasMaxLength(255)
                .HasColumnName("comment");
            entity.Property(e => e.CreatedAt)
                .HasDefaultValueSql("CURRENT_TIMESTAMP")
                .HasColumnName("created_at");
            entity.Property(e => e.CreatedBy)
                .HasMaxLength(255)
                .HasColumnName("created_by");
            entity.Property(e => e.DeletedAt).HasColumnName("deleted_at");
            entity.Property(e => e.DeletedBy)
                .HasMaxLength(255)
                .HasColumnName("deleted_by");
            entity.Property(e => e.ExecutionTime).HasColumnName("execution_time");
            entity.Property(e => e.GuideStepId).HasColumnName("guide_step_id");
            entity.Property(e => e.ImageId).HasColumnName("image_id");
            entity.Property(e => e.IsActive)
                .HasDefaultValue(true)
                .HasColumnName("is_active");
            entity.Property(e => e.ManagerId).HasColumnName("manager_id");
            entity.Property(e => e.Status)
                .HasMaxLength(50)
                .HasDefaultValueSql("'Pending'::character varying")
                .HasColumnName("status");
            entity.Property(e => e.TechnicianId).HasColumnName("technician_id");
            entity.Property(e => e.UpdatedAt).HasColumnName("updated_at");
            entity.Property(e => e.UpdatedBy)
                .HasMaxLength(255)
                .HasColumnName("updated_by");
            entity.Property(e => e.WorkOrderId).HasColumnName("work_order_id");

            entity.HasOne(d => d.GuideStep).WithMany(p => p.WorkOrderSteps)
                .HasForeignKey(d => d.GuideStepId)
                .OnDelete(DeleteBehavior.ClientSetNull)
                .HasConstraintName("work_order_step_guide_step_id_fkey");

            entity.HasOne(d => d.Image).WithMany(p => p.WorkOrderSteps)
                .HasForeignKey(d => d.ImageId)
                .OnDelete(DeleteBehavior.SetNull)
                .HasConstraintName("work_order_step_image_id_fkey");

            entity.HasOne(d => d.WorkOrder).WithMany(p => p.WorkOrderSteps)
                .HasForeignKey(d => d.WorkOrderId)
                .HasConstraintName("work_order_step_work_order_id_fkey");
        });

        modelBuilder.Entity<WorkOrderTask>(entity =>
        {
            entity.HasKey(e => e.Id).HasName("work_order_task_pkey");

            entity.ToTable("work_order_task", "mes");

            entity.HasIndex(e => new { e.WorkOrderId, e.GuideStepTaskId }, "work_order_task_work_order_id_guide_step_task_id_key").IsUnique();

            entity.Property(e => e.Id)
                .HasDefaultValueSql("gen_random_uuid()")
                .HasColumnName("id");
            entity.Property(e => e.CreatedAt)
                .HasDefaultValueSql("CURRENT_TIMESTAMP")
                .HasColumnName("created_at");
            entity.Property(e => e.CreatedBy)
                .HasMaxLength(255)
                .HasColumnName("created_by");
            entity.Property(e => e.DeletedAt).HasColumnName("deleted_at");
            entity.Property(e => e.DeletedBy)
                .HasMaxLength(255)
                .HasColumnName("deleted_by");
            entity.Property(e => e.GuideStepTaskId).HasColumnName("guide_step_task_id");
            entity.Property(e => e.IsActive)
                .HasDefaultValue(true)
                .HasColumnName("is_active");
            entity.Property(e => e.Status)
                .HasMaxLength(255)
                .HasDefaultValueSql("'Pending'::character varying")
                .HasColumnName("status");
            entity.Property(e => e.TaskResponse)
                .HasColumnType("json")
                .HasColumnName("task_response");
            entity.Property(e => e.UpdatedAt).HasColumnName("updated_at");
            entity.Property(e => e.UpdatedBy)
                .HasMaxLength(255)
                .HasColumnName("updated_by");
            entity.Property(e => e.WorkOrderId).HasColumnName("work_order_id");
            entity.Property(e => e.WorkOrderStepId).HasColumnName("work_order_step_id");

            entity.HasOne(d => d.GuideStepTask).WithMany(p => p.WorkOrderTasks)
                .HasForeignKey(d => d.GuideStepTaskId)
                .OnDelete(DeleteBehavior.ClientSetNull)
                .HasConstraintName("work_order_task_guide_step_task_id_fkey");

            entity.HasOne(d => d.WorkOrder).WithMany(p => p.WorkOrderTasks)
                .HasForeignKey(d => d.WorkOrderId)
                .HasConstraintName("work_order_task_work_order_id_fkey");

            entity.HasOne(d => d.WorkOrderStep).WithMany(p => p.WorkOrderTasks)
                .HasForeignKey(d => d.WorkOrderStepId)
                .OnDelete(DeleteBehavior.SetNull)
                .HasConstraintName("work_order_task_work_order_step_id_fkey");
        });

        modelBuilder.Entity<WorkPackage>(entity =>
        {
            entity.HasKey(e => e.Id).HasName("work_package_pkey");

            entity.ToTable("work_package", "mes");

            entity.HasIndex(e => e.Number, "work_package_number_key").IsUnique();

            entity.HasIndex(e => e.Sequence, "work_package_sequence_key").IsUnique();

            entity.Property(e => e.Id)
                .HasDefaultValueSql("gen_random_uuid()")
                .HasColumnName("id");
            entity.Property(e => e.ActualEndDate).HasColumnName("actual_end_date");
            entity.Property(e => e.ActualStartDate).HasColumnName("actual_start_date");
            entity.Property(e => e.CreatedAt)
                .HasDefaultValueSql("CURRENT_TIMESTAMP")
                .HasColumnName("created_at");
            entity.Property(e => e.CreatedBy)
                .HasMaxLength(255)
                .HasColumnName("created_by");
            entity.Property(e => e.DeletedAt).HasColumnName("deleted_at");
            entity.Property(e => e.DeletedBy)
                .HasMaxLength(255)
                .HasColumnName("deleted_by");
            entity.Property(e => e.EndDate).HasColumnName("end_date");
            entity.Property(e => e.GuideId).HasColumnName("guide_id");
            entity.Property(e => e.IsActive)
                .HasDefaultValue(true)
                .HasColumnName("is_active");
            entity.Property(e => e.ManagerId).HasColumnName("manager_id");
            entity.Property(e => e.Name)
                .HasMaxLength(255)
                .HasColumnName("name");
            entity.Property(e => e.Number)
                .HasMaxLength(255)
                .HasDefaultValueSql("application.generate_alphanumeric_sequence('WO-'::character varying, currval('mes.work_package_sequence_seq'::regclass))")
                .HasColumnName("number");
            entity.Property(e => e.PartId).HasColumnName("part_id");
            entity.Property(e => e.ProductId).HasColumnName("product_id");
            entity.Property(e => e.Quantity).HasColumnName("quantity");
            entity.Property(e => e.Sequence)
                .ValueGeneratedOnAdd()
                .HasColumnName("sequence");
            entity.Property(e => e.StartDate).HasColumnName("start_date");
            entity.Property(e => e.Status)
                .HasMaxLength(255)
                .HasDefaultValueSql("'Pending'::character varying")
                .HasColumnName("status");
            entity.Property(e => e.TechnicianId).HasColumnName("technician_id");
            entity.Property(e => e.UpdatedAt).HasColumnName("updated_at");
            entity.Property(e => e.UpdatedBy)
                .HasMaxLength(255)
                .HasColumnName("updated_by");

            entity.HasOne(d => d.Guide).WithMany(p => p.WorkPackages)
                .HasForeignKey(d => d.GuideId)
                .OnDelete(DeleteBehavior.SetNull)
                .HasConstraintName("work_package_guide_id_fkey");

            entity.HasOne(d => d.Part).WithMany(p => p.WorkPackages)
                .HasForeignKey(d => d.PartId)
                .OnDelete(DeleteBehavior.ClientSetNull)
                .HasConstraintName("work_package_part_id_fkey");

            entity.HasOne(d => d.Product).WithMany(p => p.WorkPackages)
                .HasForeignKey(d => d.ProductId)
                .OnDelete(DeleteBehavior.SetNull)
                .HasConstraintName("work_package_product_id_fkey");
        });

        modelBuilder.Entity<Workorderguidestepsview>(entity =>
        {
            entity
                .HasNoKey()
                .ToView("workorderguidestepsview", "mes");

            entity.Property(e => e.Capturedtime).HasColumnName("capturedtime");
            entity.Property(e => e.Guidestepname)
                .HasMaxLength(255)
                .HasColumnName("guidestepname");
            entity.Property(e => e.Guidestepsequence).HasColumnName("guidestepsequence");
            entity.Property(e => e.Numberofguidesteptasks).HasColumnName("numberofguidesteptasks");
            entity.Property(e => e.Numberofworkordertasks).HasColumnName("numberofworkordertasks");
            entity.Property(e => e.Workorderid).HasColumnName("workorderid");
            entity.Property(e => e.Workorderstepstatus)
                .HasMaxLength(50)
                .HasColumnName("workorderstepstatus");
        });

        // Tender Management Entities
        modelBuilder.Entity<Tender>(entity =>
        {
            entity.HasKey(e => e.Id).HasName("tender_pkey");

            entity.ToTable("tender", "sc", tb => tb.HasComment("Tender/RFQ management table for procurement"));

            entity.HasIndex(e => e.BuyerId, "idx_tender_buyer_id");

            entity.HasIndex(e => e.ClosingDate, "idx_tender_closing_date");

            entity.HasIndex(e => e.DeletedBy, "idx_tender_deleted_by").HasFilter("(deleted_by IS NULL)");

            entity.HasIndex(e => e.ProjectId, "idx_tender_project_id");

            entity.HasIndex(e => e.RequisitionId, "idx_tender_requisition_id");

            entity.HasIndex(e => e.Status, "idx_tender_status");

            entity.HasIndex(e => e.TenderNumber, "tender_number_key").IsUnique();

            entity.Property(e => e.Id)
                .HasDefaultValueSql("gen_random_uuid()")
                .HasColumnName("id");
            entity.Property(e => e.ApprovedBy)
                .HasMaxLength(255)
                .HasColumnName("approved_by");
            entity.Property(e => e.ApprovedDate).HasColumnName("approved_date");
            entity.Property(e => e.ApproverComment).HasColumnName("approver_comment");
            entity.Property(e => e.AwardedBy)
                .HasMaxLength(255)
                .HasColumnName("awarded_by");
            entity.Property(e => e.AwardedDate).HasColumnName("awarded_date");
            entity.Property(e => e.AwardedVendorId).HasColumnName("awarded_vendor_id");
            entity.Property(e => e.BuyerId).HasColumnName("buyer_id");
            entity.Property(e => e.ClosingDate).HasColumnName("closing_date");
            entity.Property(e => e.CreatedAt)
                .HasDefaultValueSql("CURRENT_TIMESTAMP")
                .HasColumnName("created_at");
            entity.Property(e => e.CreatedBy)
                .HasMaxLength(255)
                .HasColumnName("created_by");
            entity.Property(e => e.CurrencyId).HasColumnName("currency_id");
            entity.Property(e => e.DeletedAt).HasColumnName("deleted_at");
            entity.Property(e => e.DeletedBy)
                .HasMaxLength(255)
                .HasColumnName("deleted_by");
            entity.Property(e => e.Description).HasColumnName("description");
            entity.Property(e => e.IsActive)
                .HasDefaultValue(true)
                .HasColumnName("is_active");
            entity.Property(e => e.PaymentTermId).HasColumnName("payment_term_id");
            entity.Property(e => e.ProjectId).HasColumnName("project_id");
            entity.Property(e => e.PublishDate).HasColumnName("publish_date");
            entity.Property(e => e.RejectedBy)
                .HasMaxLength(255)
                .HasColumnName("rejected_by");
            entity.Property(e => e.RejectedDate).HasColumnName("rejected_date");
            entity.Property(e => e.RequisitionId).HasColumnName("requisition_id");
            entity.Property(e => e.Status)
                .HasMaxLength(50)
                .HasDefaultValueSql("'Draft'::character varying")
                .HasComment("Draft, Submitted, Published, Closed, Awarded, Cancelled")
                .HasColumnName("status");
            entity.Property(e => e.TenderNumber)
                .HasMaxLength(50)
                .HasColumnName("tender_number");
            entity.Property(e => e.Terms).HasColumnName("terms");
            entity.Property(e => e.Title)
                .HasMaxLength(500)
                .HasColumnName("title");
            entity.Property(e => e.UpdatedAt).HasColumnName("updated_at");
            entity.Property(e => e.UpdatedBy)
                .HasMaxLength(255)
                .HasColumnName("updated_by");

            entity.HasOne(d => d.AwardedVendor).WithMany()
                .HasForeignKey(d => d.AwardedVendorId)
                .OnDelete(DeleteBehavior.SetNull)
                .HasConstraintName("tender_awarded_vendor_id_fkey");

            entity.HasOne(d => d.Buyer).WithMany(p => p.Tenders)
                .HasForeignKey(d => d.BuyerId)
                .OnDelete(DeleteBehavior.SetNull)
                .HasConstraintName("tender_buyer_id_fkey");

            entity.HasOne(d => d.Currency).WithMany()
                .HasForeignKey(d => d.CurrencyId)
                .OnDelete(DeleteBehavior.SetNull)
                .HasConstraintName("tender_currency_id_fkey");

            entity.HasOne(d => d.PaymentTerm).WithMany()
                .HasForeignKey(d => d.PaymentTermId)
                .OnDelete(DeleteBehavior.SetNull)
                .HasConstraintName("tender_payment_term_id_fkey");

            entity.HasOne(d => d.Project).WithMany()
                .HasForeignKey(d => d.ProjectId)
                .OnDelete(DeleteBehavior.SetNull)
                .HasConstraintName("tender_project_id_fkey");

            entity.HasOne(d => d.Requisition).WithMany()
                .HasForeignKey(d => d.RequisitionId)
                .OnDelete(DeleteBehavior.SetNull)
                .HasConstraintName("tender_requisition_id_fkey");
        });

        modelBuilder.Entity<TenderLineItem>(entity =>
        {
            entity.HasKey(e => e.Id).HasName("tender_line_item_pkey");

            entity.ToTable("tender_line_item", "sc", tb => tb.HasComment("Line items/parts requested in a tender"));

            entity.HasIndex(e => e.DeletedBy, "idx_tender_line_item_deleted_by").HasFilter("(deleted_by IS NULL)");

            entity.HasIndex(e => e.PartId, "idx_tender_line_item_part_id");

            entity.HasIndex(e => e.TenderId, "idx_tender_line_item_tender_id");

            entity.Property(e => e.Id)
                .HasDefaultValueSql("gen_random_uuid()")
                .HasColumnName("id");
            entity.Property(e => e.CreatedAt)
                .HasDefaultValueSql("CURRENT_TIMESTAMP")
                .HasColumnName("created_at");
            entity.Property(e => e.CreatedBy)
                .HasMaxLength(255)
                .HasColumnName("created_by");
            entity.Property(e => e.DeletedAt).HasColumnName("deleted_at");
            entity.Property(e => e.DeletedBy)
                .HasMaxLength(255)
                .HasColumnName("deleted_by");
            entity.Property(e => e.Description).HasColumnName("description");
            entity.Property(e => e.IsActive)
                .HasDefaultValue(true)
                .HasColumnName("is_active");
            entity.Property(e => e.LineNumber).HasColumnName("line_number");
            entity.Property(e => e.PartId).HasColumnName("part_id");
            entity.Property(e => e.Quantity).HasColumnName("quantity");
            entity.Property(e => e.Specifications).HasColumnName("specifications");
            entity.Property(e => e.TenderId).HasColumnName("tender_id");
            entity.Property(e => e.UnitOfMeasureId).HasColumnName("unit_of_measure_id");
            entity.Property(e => e.UpdatedAt).HasColumnName("updated_at");
            entity.Property(e => e.UpdatedBy)
                .HasMaxLength(255)
                .HasColumnName("updated_by");

            entity.HasOne(d => d.Part).WithMany()
                .HasForeignKey(d => d.PartId)
                .OnDelete(DeleteBehavior.SetNull)
                .HasConstraintName("tender_line_item_part_id_fkey");

            entity.HasOne(d => d.Tender).WithMany(p => p.TenderLineItems)
                .HasForeignKey(d => d.TenderId)
                .HasConstraintName("tender_line_item_tender_id_fkey");

            entity.HasOne(d => d.UnitOfMeasure).WithMany()
                .HasForeignKey(d => d.UnitOfMeasureId)
                .OnDelete(DeleteBehavior.SetNull)
                .HasConstraintName("tender_line_item_unit_of_measure_id_fkey");
        });

        modelBuilder.Entity<TenderVendor>(entity =>
        {
            entity.HasKey(e => e.Id).HasName("tender_vendor_pkey");

            entity.ToTable("tender_vendor", "sc", tb => tb.HasComment("Vendors invited to respond to a tender"));

            entity.HasIndex(e => e.CompanyId, "idx_tender_vendor_company_id");

            entity.HasIndex(e => e.DeletedBy, "idx_tender_vendor_deleted_by").HasFilter("(deleted_by IS NULL)");

            entity.HasIndex(e => e.Status, "idx_tender_vendor_status");

            entity.HasIndex(e => e.TenderId, "idx_tender_vendor_tender_id");

            entity.HasIndex(e => new { e.TenderId, e.CompanyId }, "idx_tender_vendor_unique")
                .IsUnique()
                .HasFilter("(deleted_by IS NULL)");

            entity.HasIndex(e => new { e.TenderId, e.CompanyId }, "uq_tender_vendor").IsUnique();

            entity.Property(e => e.Id)
                .HasDefaultValueSql("gen_random_uuid()")
                .HasColumnName("id");
            entity.Property(e => e.CompanyId).HasColumnName("company_id");
            entity.Property(e => e.CreatedAt)
                .HasDefaultValueSql("CURRENT_TIMESTAMP")
                .HasColumnName("created_at");
            entity.Property(e => e.CreatedBy)
                .HasMaxLength(255)
                .HasColumnName("created_by");
            entity.Property(e => e.DeletedAt).HasColumnName("deleted_at");
            entity.Property(e => e.DeletedBy)
                .HasMaxLength(255)
                .HasColumnName("deleted_by");
            entity.Property(e => e.InvitedDate)
                .HasDefaultValueSql("CURRENT_TIMESTAMP")
                .HasColumnName("invited_date");
            entity.Property(e => e.IsActive)
                .HasDefaultValue(true)
                .HasColumnName("is_active");
            entity.Property(e => e.Notes).HasColumnName("notes");
            entity.Property(e => e.ResponseDeadline).HasColumnName("response_deadline");
            entity.Property(e => e.Status)
                .HasMaxLength(50)
                .HasDefaultValueSql("'Invited'::character varying")
                .HasComment("Invited, Responded, NoResponse, Declined")
                .HasColumnName("status");
            entity.Property(e => e.TenderId).HasColumnName("tender_id");
            entity.Property(e => e.UpdatedAt).HasColumnName("updated_at");
            entity.Property(e => e.UpdatedBy)
                .HasMaxLength(255)
                .HasColumnName("updated_by");

            entity.HasOne(d => d.Company).WithMany()
                .HasForeignKey(d => d.CompanyId)
                .OnDelete(DeleteBehavior.SetNull)
                .HasConstraintName("tender_vendor_company_id_fkey");

            entity.HasOne(d => d.Tender).WithMany(p => p.TenderVendors)
                .HasForeignKey(d => d.TenderId)
                .HasConstraintName("tender_vendor_tender_id_fkey");
        });

        modelBuilder.Entity<TenderQuotation>(entity =>
        {
            entity.HasKey(e => e.Id).HasName("tender_quotation_pkey");

            entity.ToTable("tender_quotation", "sc", tb => tb.HasComment("Vendor quotation responses to tenders"));

            entity.Property(e => e.Id)
                .HasDefaultValueSql("gen_random_uuid()")
                .HasColumnName("id");
            entity.Property(e => e.CompanyId).HasColumnName("company_id");
            entity.Property(e => e.CreatedAt)
                .HasDefaultValueSql("CURRENT_TIMESTAMP")
                .HasColumnName("created_at");
            entity.Property(e => e.CreatedBy)
                .HasMaxLength(255)
                .HasColumnName("created_by");
            entity.Property(e => e.CurrencyId).HasColumnName("currency_id");
            entity.Property(e => e.DeletedAt).HasColumnName("deleted_at");
            entity.Property(e => e.DeletedBy)
                .HasMaxLength(255)
                .HasColumnName("deleted_by");
            entity.Property(e => e.DocumentId).HasColumnName("document_id");
            entity.Property(e => e.IsActive)
                .HasDefaultValue(true)
                .HasColumnName("is_active");
            entity.Property(e => e.IsSelected)
                .HasDefaultValue(false)
                .HasComment("True if this is the winning quotation")
                .HasColumnName("is_selected");
            entity.Property(e => e.LeadTimeDays).HasColumnName("lead_time_days");
            entity.Property(e => e.Notes).HasColumnName("notes");
            entity.Property(e => e.QuotationDate).HasColumnName("quotation_date");
            entity.Property(e => e.QuotationNumber)
                .HasMaxLength(100)
                .HasColumnName("quotation_number");
            entity.Property(e => e.TenderId).HasColumnName("tender_id");
            entity.Property(e => e.TermsAndConditions).HasColumnName("terms_and_conditions");
            entity.Property(e => e.TotalAmount)
                .HasPrecision(18, 4)
                .HasColumnName("total_amount");
            entity.Property(e => e.UpdatedAt).HasColumnName("updated_at");
            entity.Property(e => e.UpdatedBy)
                .HasMaxLength(255)
                .HasColumnName("updated_by");
            entity.Property(e => e.ValidUntil).HasColumnName("valid_until");

            entity.HasOne(d => d.Company).WithMany()
                .HasForeignKey(d => d.CompanyId)
                .OnDelete(DeleteBehavior.SetNull)
                .HasConstraintName("tender_quotation_company_id_fkey");

            entity.HasOne(d => d.Currency).WithMany()
                .HasForeignKey(d => d.CurrencyId)
                .OnDelete(DeleteBehavior.SetNull)
                .HasConstraintName("tender_quotation_currency_id_fkey");

            entity.HasOne(d => d.Document).WithMany()
                .HasForeignKey(d => d.DocumentId)
                .OnDelete(DeleteBehavior.SetNull)
                .HasConstraintName("tender_quotation_document_id_fkey");

            entity.HasOne(d => d.Tender).WithMany(p => p.TenderQuotations)
                .HasForeignKey(d => d.TenderId)
                .HasConstraintName("tender_quotation_tender_id_fkey");
        });

        modelBuilder.Entity<TenderQuotationLineItem>(entity =>
        {
            entity.HasKey(e => e.Id).HasName("tender_quotation_line_item_pkey");

            entity.ToTable("tender_quotation_line_item", "sc", tb => tb.HasComment("Line item pricing in vendor quotations"));

            entity.Property(e => e.Id)
                .HasDefaultValueSql("gen_random_uuid()")
                .HasColumnName("id");
            entity.Property(e => e.CreatedAt)
                .HasDefaultValueSql("CURRENT_TIMESTAMP")
                .HasColumnName("created_at");
            entity.Property(e => e.CreatedBy)
                .HasMaxLength(255)
                .HasColumnName("created_by");
            entity.Property(e => e.DeletedAt).HasColumnName("deleted_at");
            entity.Property(e => e.DeletedBy)
                .HasMaxLength(255)
                .HasColumnName("deleted_by");
            entity.Property(e => e.IsActive)
                .HasDefaultValue(true)
                .HasColumnName("is_active");
            entity.Property(e => e.LeadTimeDays).HasColumnName("lead_time_days");
            entity.Property(e => e.Notes).HasColumnName("notes");
            entity.Property(e => e.Quantity)
                .HasDefaultValue(1)
                .HasColumnName("quantity");
            entity.Property(e => e.TenderLineItemId).HasColumnName("tender_line_item_id");
            entity.Property(e => e.TenderQuotationId).HasColumnName("tender_quotation_id");
            entity.Property(e => e.TotalPrice)
                .HasPrecision(18, 4)
                .HasColumnName("total_price");
            entity.Property(e => e.UnitPrice)
                .HasPrecision(18, 4)
                .HasColumnName("unit_price");
            entity.Property(e => e.UpdatedAt).HasColumnName("updated_at");
            entity.Property(e => e.UpdatedBy)
                .HasMaxLength(255)
                .HasColumnName("updated_by");

            entity.HasOne(d => d.TenderLineItem).WithMany(p => p.TenderQuotationLineItems)
                .HasForeignKey(d => d.TenderLineItemId)
                .OnDelete(DeleteBehavior.SetNull)
                .HasConstraintName("tender_quotation_line_item_tender_line_item_id_fkey");

            entity.HasOne(d => d.TenderQuotation).WithMany(p => p.TenderQuotationLineItems)
                .HasForeignKey(d => d.TenderQuotationId)
                .HasConstraintName("tender_quotation_line_item_tender_quotation_id_fkey");
        });

        OnModelCreatingPartial(modelBuilder);
    }

    partial void OnModelCreatingPartial(ModelBuilder modelBuilder);
}