# EF Core Code First Migration Plan for SpaceLinx.Api

## Overview

Migrate from database-first (scaffolded DbContext with 5,056 lines of Fluent API) to EF Core Code First with `IEntityTypeConfiguration<T>` pattern, preserving existing PostgreSQL database and data.

## Requirements

| Requirement | Decision |
|-------------|----------|
| Database Provider | PostgreSQL (keep existing with Npgsql) |
| Stored Procedures | Keep as raw SQL (call via ExecuteSqlRawAsync) |
| Existing Data | Preserve - baseline migration must match current schema |
| Configuration Style | IEntityTypeConfiguration<T> (separate class per entity) |

---

## Current State

- **DbContext**: `SpaceLinxContext.cs` with 5,056 lines of Fluent API in OnModelCreating
- **Entities**: 83 entities in SpaceLinx.Model, all inherit from `BaseModel`
- **Schemas**: common, sc, mes, pm, application (PostgreSQL schemas)
- **Stored Procedures**: 38 procedures for complex operations
- **Views**: 14 database views configured as keyless entities
- **Relationships**: ~150 relationships including self-referencing and multiple FKs to same table

---

## Phase 1: Create Configuration Folder Structure

Create in `/SpaceLinx.Api/SpaceLinx.Model/Configuration/`:

```
Configuration/
├── Abstractions/
│   └── BaseModelConfiguration.cs
├── Common/
│   ├── AddressConfiguration.cs
│   ├── BankAccountConfiguration.cs
│   ├── ContactConfiguration.cs
│   ├── CountryConfiguration.cs
│   ├── CurrencyConfiguration.cs
│   ├── DocumentConfiguration.cs
│   ├── ImageConfiguration.cs
│   └── VideoConfiguration.cs
├── Application/
│   ├── AppConfiguration.cs
│   ├── ApprovalConfiguration.cs
│   ├── BulkUploadConfiguration.cs
│   ├── CustomerConfiguration.cs
│   ├── FeatureBitConfiguration.cs
│   ├── OptionSetConfiguration.cs
│   ├── OrganizationConfiguration.cs
│   ├── OrganizationAddressConfiguration.cs
│   ├── PermissionConfiguration.cs
│   ├── RoleConfiguration.cs
│   ├── RoleFilterConfiguration.cs
│   ├── RolePermissionConfiguration.cs
│   ├── StaffConfiguration.cs
│   ├── UserConfiguration.cs
│   └── UserRoleConfiguration.cs
├── Mes/
│   ├── AssemblyLocationConfiguration.cs
│   ├── AssemblyLocationTypeConfiguration.cs
│   ├── EbomConfiguration.cs
│   ├── EcoConfiguration.cs
│   ├── EcoLogConfiguration.cs
│   ├── EcoPartConfiguration.cs
│   ├── EmailLogConfiguration.cs
│   ├── EmailTemplateConfiguration.cs
│   ├── GuideConfiguration.cs
│   ├── GuideCheckOutHistoryConfiguration.cs
│   ├── GuideEbomConfiguration.cs
│   ├── GuideMbomConfiguration.cs
│   ├── GuideStepConfiguration.cs
│   ├── GuideStepEquipmentConfiguration.cs
│   ├── GuideStepTaskConfiguration.cs
│   ├── GuideTypeConfiguration.cs
│   ├── KitConfiguration.cs
│   ├── KitBomCommentConfiguration.cs
│   ├── KitSerialConfiguration.cs
│   ├── LocationConfiguration.cs
│   ├── MachineConfiguration.cs
│   ├── MachineTypeConfiguration.cs
│   ├── MaterialKitConfiguration.cs
│   ├── NewsConfiguration.cs
│   ├── NewsTypeConfiguration.cs
│   ├── PartConfiguration.cs
│   ├── PartTypeConfiguration.cs
│   ├── PartTypeCategoryConfiguration.cs
│   ├── PlatformConfiguration.cs
│   ├── ProductConfiguration.cs
│   ├── ToolConfiguration.cs
│   ├── ToolTypeConfiguration.cs
│   ├── UnitOfMeasureConfiguration.cs
│   ├── WorkOrderConfiguration.cs
│   ├── WorkOrderStepConfiguration.cs
│   ├── WorkOrderTaskConfiguration.cs
│   └── WorkPackageConfiguration.cs
├── SupplyChain/
│   ├── BinManagementConfiguration.cs
│   ├── CompanyConfiguration.cs
│   ├── CompanyAddressConfiguration.cs
│   ├── CompanyBankAccountConfiguration.cs
│   ├── CompanyContactConfiguration.cs
│   ├── CompanyPartConfiguration.cs
│   ├── GoodsReceiptNoteConfiguration.cs
│   ├── GrnLineItemConfiguration.cs
│   ├── InventoryPartConfiguration.cs
│   ├── InventoryStockConfiguration.cs
│   ├── InventoryTransactionConfiguration.cs
│   ├── PaymentTermConfiguration.cs
│   ├── PoLineItemConfiguration.cs
│   ├── PurchaseOrderConfiguration.cs
│   ├── RequisitionConfiguration.cs
│   ├── RequisitionLineItemConfiguration.cs
│   ├── ScrapLineItemConfiguration.cs
│   └── ScrapRequestConfiguration.cs
├── ProjectManagement/
│   ├── MilestoneConfiguration.cs
│   ├── ProgramConfiguration.cs
│   ├── ProjectConfiguration.cs
│   └── TaskConfiguration.cs
└── Views/
    ├── CompanyWithOrganizationVwConfiguration.cs
    ├── DocumentWithUsersVwConfiguration.cs
    ├── EcoWithUsersVwConfiguration.cs
    ├── GrnWithStaffVwConfiguration.cs
    ├── GrnsByPurchaseOrderVwConfiguration.cs
    ├── GuideMbomVwConfiguration.cs
    ├── GuideMbomDetailConfiguration.cs
    ├── InventoryGoodsVwConfiguration.cs
    ├── InventoryPartVwConfiguration.cs
    ├── InventoryServicesVwConfiguration.cs
    ├── InventoryTransactionVwConfiguration.cs
    ├── PartsNotAssociatedWithGuideConfiguration.cs
    ├── RequisitionsWithStaffVwConfiguration.cs
    └── WorkOrderGuideStepsViewConfiguration.cs
```

---

## Phase 2: Create Base Configuration Class

**File**: `/SpaceLinx.Model/Configuration/Abstractions/BaseModelConfiguration.cs`

```csharp
using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;

namespace SpaceLinx.Model.Configuration.Abstractions;

/// <summary>
/// Base configuration for all entities inheriting from BaseModel.
/// Handles common audit fields and snake_case column naming convention.
/// </summary>
public abstract class BaseModelConfiguration<TEntity> : IEntityTypeConfiguration<TEntity>
    where TEntity : BaseModel
{
    /// <summary>PostgreSQL table name (snake_case)</summary>
    protected abstract string TableName { get; }

    /// <summary>PostgreSQL schema name (common, sc, mes, pm, application)</summary>
    protected abstract string SchemaName { get; }

    public virtual void Configure(EntityTypeBuilder<TEntity> builder)
    {
        // Table and Schema
        builder.ToTable(TableName, SchemaName);

        // Primary Key with PostgreSQL constraint naming
        builder.HasKey(e => e.Id)
            .HasName($"{TableName}_pkey");

        // BaseModel columns with snake_case naming
        builder.Property(e => e.Id)
            .HasDefaultValueSql("gen_random_uuid()")
            .HasColumnName("id");

        builder.Property(e => e.IsActive)
            .HasDefaultValue(true)
            .HasColumnName("is_active");

        builder.Property(e => e.CreatedAt)
            .HasDefaultValueSql("CURRENT_TIMESTAMP")
            .HasColumnName("created_at");

        builder.Property(e => e.CreatedBy)
            .HasMaxLength(255)
            .HasColumnName("created_by");

        builder.Property(e => e.UpdatedAt)
            .HasColumnName("updated_at");

        builder.Property(e => e.UpdatedBy)
            .HasMaxLength(255)
            .HasColumnName("updated_by");

        builder.Property(e => e.DeletedAt)
            .HasColumnName("deleted_at");

        builder.Property(e => e.DeletedBy)
            .HasMaxLength(255)
            .HasColumnName("deleted_by");

        // Call entity-specific configuration
        ConfigureEntity(builder);
    }

    /// <summary>Override to add entity-specific configuration</summary>
    protected abstract void ConfigureEntity(EntityTypeBuilder<TEntity> builder);
}
```

---

## Phase 3: Entity Configuration Examples

### 3.1 Simple Entity - Address

**File**: `/SpaceLinx.Model/Configuration/Common/AddressConfiguration.cs`

```csharp
using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;
using SpaceLinx.Model.Configuration.Abstractions;

namespace SpaceLinx.Model.Configuration.Common;

public class AddressConfiguration : BaseModelConfiguration<Address>
{
    protected override string TableName => "address";
    protected override string SchemaName => "common";

    protected override void ConfigureEntity(EntityTypeBuilder<Address> builder)
    {
        builder.Property(e => e.AddressLine1)
            .HasMaxLength(255)
            .HasColumnName("address_line1");

        builder.Property(e => e.AddressLine2)
            .HasMaxLength(255)
            .HasColumnName("address_line2");

        builder.Property(e => e.City)
            .HasMaxLength(100)
            .HasColumnName("city");

        builder.Property(e => e.State)
            .HasMaxLength(100)
            .HasColumnName("state");

        builder.Property(e => e.PostalCode)
            .HasMaxLength(20)
            .HasColumnName("postal_code");

        builder.Property(e => e.CountryId)
            .HasColumnName("country_id");

        builder.Property(e => e.PhoneNumber)
            .HasMaxLength(20)
            .HasColumnName("phone_number");

        builder.Property(e => e.Latitude)
            .HasPrecision(9, 6)
            .HasColumnName("latitude");

        builder.Property(e => e.Longitude)
            .HasPrecision(9, 6)
            .HasColumnName("longitude");

        // Relationship to Country
        builder.HasOne(d => d.Country)
            .WithMany(p => p.Addresses)
            .HasForeignKey(d => d.CountryId)
            .OnDelete(DeleteBehavior.ClientSetNull)
            .HasConstraintName("address_country_id_fkey");
    }
}
```

### 3.2 Self-Referencing Entity - Ebom

**File**: `/SpaceLinx.Model/Configuration/Mes/EbomConfiguration.cs`

```csharp
using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;
using SpaceLinx.Model.Configuration.Abstractions;

namespace SpaceLinx.Model.Configuration.Mes;

public class EbomConfiguration : BaseModelConfiguration<Ebom>
{
    protected override string TableName => "ebom";
    protected override string SchemaName => "mes";

    protected override void ConfigureEntity(EntityTypeBuilder<Ebom> builder)
    {
        // Unique constraint including DeletedAt for soft-delete support
        builder.HasIndex(e => new { e.PartId, e.ChildPartId, e.DeletedAt })
            .HasDatabaseName("ebom_part_id_child_part_id_deleted_at_key")
            .IsUnique();

        builder.Property(e => e.PartId)
            .HasColumnName("part_id");

        builder.Property(e => e.ChildPartId)
            .HasColumnName("child_part_id");

        builder.Property(e => e.Quantity)
            .HasColumnName("quantity");

        builder.Property(e => e.AssemblyLocationId)
            .HasColumnName("assembly_location_id");

        // Self-referencing relationships to Part
        // Parent Part -> Ebom records where this part IS the parent
        builder.HasOne(d => d.Part)
            .WithMany(p => p.EbomParts)
            .HasForeignKey(d => d.PartId)
            .OnDelete(DeleteBehavior.ClientSetNull)
            .HasConstraintName("ebom_part_id_fkey");

        // Child Part -> Ebom records where this part IS the child
        builder.HasOne(d => d.ChildPart)
            .WithMany(p => p.EbomChildParts)
            .HasForeignKey(d => d.ChildPartId)
            .OnDelete(DeleteBehavior.ClientSetNull)
            .HasConstraintName("ebom_child_part_id_fkey");

        builder.HasOne(d => d.AssemblyLocation)
            .WithMany(p => p.Eboms)
            .HasForeignKey(d => d.AssemblyLocationId)
            .OnDelete(DeleteBehavior.SetNull)
            .HasConstraintName("ebom_assembly_location_id_fkey");
    }
}
```

### 3.3 Multiple FKs to Same Table - PurchaseOrder

**File**: `/SpaceLinx.Model/Configuration/SupplyChain/PurchaseOrderConfiguration.cs`

```csharp
using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;
using SpaceLinx.Model.Configuration.Abstractions;

namespace SpaceLinx.Model.Configuration.SupplyChain;

public class PurchaseOrderConfiguration : BaseModelConfiguration<PurchaseOrder>
{
    protected override string TableName => "purchase_order";
    protected override string SchemaName => "sc";

    protected override void ConfigureEntity(EntityTypeBuilder<PurchaseOrder> builder)
    {
        // Auto-generated PO number
        builder.Property(e => e.Number)
            .HasMaxLength(255)
            .HasDefaultValueSql("sc.generate_purchase_order_number()")
            .HasColumnName("number");

        builder.Property(e => e.CompanyId)
            .HasColumnName("company_id");

        builder.Property(e => e.ProjectId)
            .HasColumnName("project_id");

        builder.Property(e => e.RequisitionId)
            .HasColumnName("requisition_id");

        // Multiple Address foreign keys
        builder.Property(e => e.BillingAddressId)
            .HasColumnName("billing_address_id");

        builder.Property(e => e.DeliveryAddressId)
            .HasColumnName("delivery_address_id");

        builder.Property(e => e.ShippingAddressId)
            .HasColumnName("shipping_address_id");

        builder.Property(e => e.VendorBillingAddressId)
            .HasColumnName("vendor_billing_address_id");

        // Multiple Staff foreign keys
        builder.Property(e => e.BuyerId)
            .HasColumnName("buyer_id");

        builder.Property(e => e.SupplyChainLeadId)
            .HasColumnName("supply_chain_lead_id");

        builder.Property(e => e.PaymentTermId)
            .HasColumnName("payment_term_id");

        builder.Property(e => e.CurrencyId)
            .HasColumnName("currency_id");

        builder.Property(e => e.OrderDate)
            .HasColumnName("order_date");

        builder.Property(e => e.ExpectedDeliveryDate)
            .HasColumnName("expected_delivery_date");

        builder.Property(e => e.ActualDeliveryDate)
            .HasColumnName("actual_delivery_date");

        builder.Property(e => e.Status)
            .HasMaxLength(255)
            .HasDefaultValueSql("'Draft'::character varying")
            .HasColumnName("status");

        builder.Property(e => e.TotalAmount)
            .HasPrecision(18, 2)
            .HasColumnName("total_amount");

        builder.Property(e => e.Discount)
            .HasPrecision(18, 2)
            .HasColumnName("discount");

        builder.Property(e => e.DiscountType)
            .HasMaxLength(50)
            .HasColumnName("discount_type");

        builder.Property(e => e.Notes)
            .HasColumnName("notes");

        builder.Property(e => e.TermsAndConditions)
            .HasColumnName("terms_and_conditions");

        // Multiple Address relationships (same table, different navigation properties)
        builder.HasOne(d => d.BillingAddress)
            .WithMany(p => p.PurchaseOrderBillingAddresses)
            .HasForeignKey(d => d.BillingAddressId)
            .OnDelete(DeleteBehavior.SetNull)
            .HasConstraintName("purchase_order_billing_address_id_fkey");

        builder.HasOne(d => d.DeliveryAddress)
            .WithMany(p => p.PurchaseOrderDeliveryAddresses)
            .HasForeignKey(d => d.DeliveryAddressId)
            .OnDelete(DeleteBehavior.SetNull)
            .HasConstraintName("purchase_order_delivery_address_id_fkey");

        builder.HasOne(d => d.ShippingAddress)
            .WithMany(p => p.PurchaseOrderShippingAddresses)
            .HasForeignKey(d => d.ShippingAddressId)
            .OnDelete(DeleteBehavior.SetNull)
            .HasConstraintName("purchase_order_shipping_address_id_fkey");

        builder.HasOne(d => d.VendorBillingAddress)
            .WithMany(p => p.PurchaseOrderVendorBillingAddresses)
            .HasForeignKey(d => d.VendorBillingAddressId)
            .OnDelete(DeleteBehavior.SetNull)
            .HasConstraintName("purchase_order_vendor_billing_address_id_fkey");

        // Multiple Staff relationships
        builder.HasOne(d => d.Buyer)
            .WithMany(p => p.PurchaseOrderBuyers)
            .HasForeignKey(d => d.BuyerId)
            .OnDelete(DeleteBehavior.SetNull)
            .HasConstraintName("purchase_order_buyer_id_fkey");

        builder.HasOne(d => d.SupplyChainLead)
            .WithMany(p => p.PurchaseOrderSupplyChainLeads)
            .HasForeignKey(d => d.SupplyChainLeadId)
            .OnDelete(DeleteBehavior.SetNull)
            .HasConstraintName("purchase_order_supply_chain_lead_id_fkey");

        // Other relationships
        builder.HasOne(d => d.Company)
            .WithMany(p => p.PurchaseOrders)
            .HasForeignKey(d => d.CompanyId)
            .OnDelete(DeleteBehavior.SetNull)
            .HasConstraintName("purchase_order_company_id_fkey");

        builder.HasOne(d => d.Project)
            .WithMany(p => p.PurchaseOrders)
            .HasForeignKey(d => d.ProjectId)
            .OnDelete(DeleteBehavior.SetNull)
            .HasConstraintName("purchase_order_project_id_fkey");

        builder.HasOne(d => d.Requisition)
            .WithMany(p => p.PurchaseOrders)
            .HasForeignKey(d => d.RequisitionId)
            .OnDelete(DeleteBehavior.SetNull)
            .HasConstraintName("purchase_order_requisition_id_fkey");

        builder.HasOne(d => d.PaymentTerm)
            .WithMany(p => p.PurchaseOrders)
            .HasForeignKey(d => d.PaymentTermId)
            .OnDelete(DeleteBehavior.SetNull)
            .HasConstraintName("purchase_order_payment_term_id_fkey");

        builder.HasOne(d => d.Currency)
            .WithMany(p => p.PurchaseOrders)
            .HasForeignKey(d => d.CurrencyId)
            .OnDelete(DeleteBehavior.SetNull)
            .HasConstraintName("purchase_order_currency_id_fkey");
    }
}
```

### 3.4 Join Table with Payload - CompanyAddress

**File**: `/SpaceLinx.Model/Configuration/SupplyChain/CompanyAddressConfiguration.cs`

```csharp
using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;
using SpaceLinx.Model.Configuration.Abstractions;

namespace SpaceLinx.Model.Configuration.SupplyChain;

public class CompanyAddressConfiguration : BaseModelConfiguration<CompanyAddress>
{
    protected override string TableName => "company_address";
    protected override string SchemaName => "sc";

    protected override void ConfigureEntity(EntityTypeBuilder<CompanyAddress> builder)
    {
        builder.Property(e => e.CompanyId)
            .HasColumnName("company_id");

        builder.Property(e => e.AddressId)
            .HasColumnName("address_id");

        // Payload column - this is why we need explicit join entity
        // (cannot use HasMany().WithMany() shorthand)
        builder.Property(e => e.AddressType)
            .HasMaxLength(255)
            .HasColumnName("address_type");

        builder.HasOne(d => d.Company)
            .WithMany(p => p.CompanyAddresses)
            .HasForeignKey(d => d.CompanyId)
            .OnDelete(DeleteBehavior.SetNull)
            .HasConstraintName("company_address_company_id_fkey");

        builder.HasOne(d => d.Address)
            .WithMany(p => p.CompanyAddresses)
            .HasForeignKey(d => d.AddressId)
            .OnDelete(DeleteBehavior.SetNull)
            .HasConstraintName("company_address_address_id_fkey");
    }
}
```

### 3.5 View Configuration (Keyless Entity)

**File**: `/SpaceLinx.Model/Configuration/Views/EcoWithUsersVwConfiguration.cs`

```csharp
using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;

namespace SpaceLinx.Model.Configuration.Views;

public class EcoWithUsersVwConfiguration : IEntityTypeConfiguration<EcoWithUsersVw>
{
    public void Configure(EntityTypeBuilder<EcoWithUsersVw> builder)
    {
        // Views are keyless entities
        builder.HasNoKey()
            .ToView("eco_with_users_vw", "mes");

        builder.Property(e => e.Id).HasColumnName("id");
        builder.Property(e => e.Number).HasMaxLength(255).HasColumnName("number");
        builder.Property(e => e.Name).HasMaxLength(255).HasColumnName("name");
        builder.Property(e => e.ReasonForChange).HasColumnName("reason_for_change");
        builder.Property(e => e.Description).HasColumnName("description");
        builder.Property(e => e.ChangeType).HasMaxLength(255).HasColumnName("change_type");
        builder.Property(e => e.ImpactAnalysis).HasColumnName("impact_analysis");
        builder.Property(e => e.Priority).HasMaxLength(50).HasColumnName("priority");
        builder.Property(e => e.Requestor).HasMaxLength(255).HasColumnName("requestor");
        builder.Property(e => e.Approver).HasMaxLength(255).HasColumnName("approver");
        builder.Property(e => e.PlannedImplementationDate).HasColumnName("planned_implementation_date");
        builder.Property(e => e.ApprovedBy).HasMaxLength(255).HasColumnName("approved_by");
        builder.Property(e => e.ApprovedDate).HasColumnName("approved_date");
        builder.Property(e => e.Status).HasMaxLength(255).HasColumnName("status");
        builder.Property(e => e.IsActive).HasColumnName("is_active");
        builder.Property(e => e.CreatedAt).HasColumnName("created_at");
        builder.Property(e => e.CreatedBy).HasMaxLength(255).HasColumnName("created_by");
        builder.Property(e => e.UpdatedAt).HasColumnName("updated_at");
        builder.Property(e => e.UpdatedBy).HasMaxLength(255).HasColumnName("updated_by");
        builder.Property(e => e.RequestorId).HasColumnName("requestor_id");
        builder.Property(e => e.RequestorFullName).HasColumnName("requestor_full_name");
        builder.Property(e => e.RequestorEmail).HasMaxLength(255).HasColumnName("requestor_email");
        builder.Property(e => e.Approvers).HasColumnName("approvers");
    }
}
```

---

## Phase 4: Refactor SpaceLinxContext

**File**: `/SpaceLinx.Model/SpaceLinxContext.cs`

Replace the 5,000+ lines of OnModelCreating with:

```csharp
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

    // ========================================
    // DbSet properties remain unchanged
    // ========================================
    public virtual DbSet<Address> Addresses { get; set; }
    public virtual DbSet<App> Apps { get; set; }
    public virtual DbSet<Approval> Approvals { get; set; }
    // ... keep all 83 DbSet declarations ...

    // ========================================
    // Views (keyless entities)
    // ========================================
    public virtual DbSet<CompanyWithOrganizationVw> CompanyWithOrganizationVws { get; set; }
    public virtual DbSet<EcoWithUsersVw> EcoWithUsersVws { get; set; }
    // ... keep all 14 view DbSets ...

    protected override void OnModelCreating(ModelBuilder modelBuilder)
    {
        // Apply all IEntityTypeConfiguration<T> classes from this assembly
        modelBuilder.ApplyConfigurationsFromAssembly(typeof(SpaceLinxContext).Assembly);

        base.OnModelCreating(modelBuilder);
    }
}
```

---

## Phase 5: Create Baseline Migration

### Step 1: Generate Migration

```bash
cd /Users/vijaypandrangi/XDLinxRepos/SpaceLinx.Api

dotnet ef migrations add InitialBaseline \
    --project SpaceLinx.Model \
    --startup-project SpaceLinx.Api
```

### Step 2: Edit Generated Migration

Open the generated file (e.g., `Migrations/YYYYMMDDHHMMSS_InitialBaseline.cs`) and replace content:

```csharp
using Microsoft.EntityFrameworkCore.Migrations;

namespace SpaceLinx.Model.Migrations;

public partial class InitialBaseline : Migration
{
    protected override void Up(MigrationBuilder migrationBuilder)
    {
        // Empty - database already exists with this schema
        // This is a baseline migration to establish EF Core migration history
    }

    protected override void Down(MigrationBuilder migrationBuilder)
    {
        // Empty - this is a baseline migration
        // Cannot rollback to "before Code First"
    }
}
```

### Step 3: Apply Migration (Creates History Table Only)

```bash
dotnet ef database update \
    --project SpaceLinx.Model \
    --startup-project SpaceLinx.Api
```

This creates the `__EFMigrationsHistory` table and records `InitialBaseline` as applied.

---

## Phase 6: Verification

### Verify Model Matches Database

```bash
# Generate SQL script from model
dotnet ef migrations script \
    --project SpaceLinx.Model \
    --startup-project SpaceLinx.Api \
    --output verify_schema.sql
```

Review `verify_schema.sql` and compare with your actual database structure.

### Key Things to Verify:

1. **Table names and schemas** match existing database
2. **Column names** (snake_case) match existing
3. **Constraint names** (pkey, fkey) match existing
4. **Default values** (gen_random_uuid(), CURRENT_TIMESTAMP) match existing
5. **Index names** match existing
6. **Foreign key relationships** and delete behaviors match

---

## Stored Procedures Reference

No changes required - existing calls via `ExecuteSqlRawAsync` continue to work:

| Schema | Procedure | Service/Controller |
|--------|-----------|-------------------|
| mes | release_eco | EcoService |
| mes | clone_ebom | EBomController |
| mes | clone_guide | GuideController |
| mes | create_draft_guide | GuideController |
| mes | create_guide_mbom | GuideController |
| mes | create_guide_ebom | GuideController |
| mes | copy_guide_step | GuideStepController |
| mes | reorder_guide_steps | GuideStepController |
| mes | reorder_guide_steps_after_deletion | GuideStepController |
| mes | reorder_guide_step_tasks | GuideStepTaskController |
| mes | reset_work_order_step | WorkOrderStepController |
| mes | create_work_package_and_work_orders | WorkPackageController |
| mes | guide_mbom_refresh | GuideStepEquipmentController |
| mes | reserve_inventory_for_kit | WorkOrderController |
| application | set_default_role | UserRoleController |
| application | delete_user_role | UserController |

**Auto-number functions (used in HasDefaultValueSql):**
- `sc.generate_purchase_order_number()` - PurchaseOrder.Number
- `sc.generate_grn_number()` - GoodsReceiptNote.Number
- `sc.generate_company_code()` - Company.Code
- `mes.generate_eco_number()` - Eco.Number
- `pm.generate_project_code()` - Project.ProjectCode

---

## Future Schema Changes

After baseline is complete, use standard Code First workflow:

```bash
# 1. Make changes to entity classes

# 2. Add migration
dotnet ef migrations add AddNewFeature \
    --project SpaceLinx.Model \
    --startup-project SpaceLinx.Api

# 3. Review generated migration file

# 4a. Apply to development database
dotnet ef database update \
    --project SpaceLinx.Model \
    --startup-project SpaceLinx.Api

# 4b. OR generate script for production
dotnet ef migrations script \
    --project SpaceLinx.Model \
    --startup-project SpaceLinx.Api \
    --from InitialBaseline \
    --output migration.sql
```

---

## Implementation Checklist

### Phase 1: Setup
- [ ] Create `/SpaceLinx.Model/Configuration/` folder structure
- [ ] Create `Abstractions/BaseModelConfiguration.cs`

### Phase 2: Common Schema (8 entities)
- [ ] AddressConfiguration.cs
- [ ] BankAccountConfiguration.cs
- [ ] ContactConfiguration.cs
- [ ] CountryConfiguration.cs
- [ ] CurrencyConfiguration.cs
- [ ] DocumentConfiguration.cs
- [ ] ImageConfiguration.cs
- [ ] VideoConfiguration.cs

### Phase 3: Application Schema (15 entities)
- [ ] AppConfiguration.cs
- [ ] ApprovalConfiguration.cs
- [ ] BulkUploadConfiguration.cs
- [ ] CustomerConfiguration.cs
- [ ] FeatureBitConfiguration.cs
- [ ] OptionSetConfiguration.cs
- [ ] OrganizationConfiguration.cs
- [ ] OrganizationAddressConfiguration.cs
- [ ] PermissionConfiguration.cs
- [ ] RoleConfiguration.cs
- [ ] RoleFilterConfiguration.cs
- [ ] RolePermissionConfiguration.cs
- [ ] StaffConfiguration.cs
- [ ] UserConfiguration.cs
- [ ] UserRoleConfiguration.cs

### Phase 4: ProjectManagement Schema (4 entities)
- [ ] MilestoneConfiguration.cs
- [ ] ProgramConfiguration.cs
- [ ] ProjectConfiguration.cs
- [ ] TaskConfiguration.cs

### Phase 5: Mes Schema (38 entities)
- [ ] AssemblyLocationConfiguration.cs
- [ ] AssemblyLocationTypeConfiguration.cs
- [ ] EbomConfiguration.cs
- [ ] EcoConfiguration.cs
- [ ] EcoLogConfiguration.cs
- [ ] EcoPartConfiguration.cs
- [ ] EmailLogConfiguration.cs
- [ ] EmailTemplateConfiguration.cs
- [ ] GuideConfiguration.cs
- [ ] GuideCheckOutHistoryConfiguration.cs
- [ ] GuideEbomConfiguration.cs
- [ ] GuideMbomConfiguration.cs
- [ ] GuideStepConfiguration.cs
- [ ] GuideStepEquipmentConfiguration.cs
- [ ] GuideStepTaskConfiguration.cs
- [ ] GuideTypeConfiguration.cs
- [ ] KitConfiguration.cs
- [ ] KitBomCommentConfiguration.cs
- [ ] KitSerialConfiguration.cs
- [ ] LocationConfiguration.cs
- [ ] MachineConfiguration.cs
- [ ] MachineTypeConfiguration.cs
- [ ] MaterialKitConfiguration.cs
- [ ] NewsConfiguration.cs
- [ ] NewsTypeConfiguration.cs
- [ ] PartConfiguration.cs
- [ ] PartTypeConfiguration.cs
- [ ] PartTypeCategoryConfiguration.cs
- [ ] PlatformConfiguration.cs
- [ ] ProductConfiguration.cs
- [ ] ToolConfiguration.cs
- [ ] ToolTypeConfiguration.cs
- [ ] UnitOfMeasureConfiguration.cs
- [ ] WorkOrderConfiguration.cs
- [ ] WorkOrderStepConfiguration.cs
- [ ] WorkOrderTaskConfiguration.cs
- [ ] WorkPackageConfiguration.cs

### Phase 6: SupplyChain Schema (18 entities)
- [ ] BinManagementConfiguration.cs
- [ ] CompanyConfiguration.cs
- [ ] CompanyAddressConfiguration.cs
- [ ] CompanyBankAccountConfiguration.cs
- [ ] CompanyContactConfiguration.cs
- [ ] CompanyPartConfiguration.cs
- [ ] GoodsReceiptNoteConfiguration.cs
- [ ] GrnLineItemConfiguration.cs
- [ ] InventoryPartConfiguration.cs
- [ ] InventoryStockConfiguration.cs
- [ ] InventoryTransactionConfiguration.cs
- [ ] PaymentTermConfiguration.cs
- [ ] PoLineItemConfiguration.cs
- [ ] PurchaseOrderConfiguration.cs
- [ ] RequisitionConfiguration.cs
- [ ] RequisitionLineItemConfiguration.cs
- [ ] ScrapLineItemConfiguration.cs
- [ ] ScrapRequestConfiguration.cs

### Phase 7: Views (14 keyless entities)
- [ ] CompanyWithOrganizationVwConfiguration.cs
- [ ] DocumentWithUsersVwConfiguration.cs
- [ ] EcoWithUsersVwConfiguration.cs
- [ ] GrnWithStaffVwConfiguration.cs
- [ ] GrnsByPurchaseOrderVwConfiguration.cs
- [ ] GuideMbomVwConfiguration.cs
- [ ] GuideMbomDetailConfiguration.cs
- [ ] InventoryGoodsVwConfiguration.cs
- [ ] InventoryPartVwConfiguration.cs
- [ ] InventoryServicesVwConfiguration.cs
- [ ] InventoryTransactionVwConfiguration.cs
- [ ] PartsNotAssociatedWithGuideConfiguration.cs
- [ ] RequisitionsWithStaffVwConfiguration.cs
- [ ] WorkOrderGuideStepsViewConfiguration.cs

### Phase 8: DbContext & Migration
- [ ] Refactor SpaceLinxContext.cs
- [ ] Generate InitialBaseline migration
- [ ] Edit migration to empty Up/Down
- [ ] Apply migration
- [ ] Verify schema matches database

---

## Estimated Effort

| Phase | Tasks | Hours |
|-------|-------|-------|
| 1 | Setup & BaseModelConfiguration | 2 |
| 2 | Common schema (8) | 4 |
| 3 | Application schema (15) | 6 |
| 4 | ProjectManagement schema (4) | 2 |
| 5 | Mes schema (38) | 15 |
| 6 | SupplyChain schema (18) | 8 |
| 7 | Views (14) | 4 |
| 8 | DbContext & Migration | 3 |
| 9 | Testing & Verification | 4 |
| **Total** | | **48 hours** |
