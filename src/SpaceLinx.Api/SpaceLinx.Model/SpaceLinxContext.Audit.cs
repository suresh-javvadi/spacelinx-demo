using Microsoft.EntityFrameworkCore;

namespace SpaceLinx.Model;

/// <summary>
/// Audit-trail mapping, kept out of the scaffolded <see cref="SpaceLinxContext"/> file.
/// Implements the scaffolded <c>OnModelCreatingPartial</c> hook so it composes without
/// editing the generated context. The physical table is created by the offline SQL
/// migration <c>database/migrations/migration_audit_change_log.sql</c> (range-partitioned),
/// so only the runtime mapping lives here.
///
/// This partial ALSO carries the schema-reconciliation config added in Task 9 to make the
/// EF Baseline mirror the live UAT schema exactly:
///   S1 - the 12 standalone (function-owned) sequences (bigint) that the embedded
///        generate_* functions call nextval() on.
///   S2 - the 43 named CHECK constraints (exact names/expressions from uat.schema.sql).
///   S4 - column nullability/default reconciliation on mes.part and common.document.
///   S5 - the 17 partial indexes (mostly WHERE deleted_at IS NULL, one WHERE is_preferred).
/// (S3 - the 5 Dev-only FKs removed to match UAT - is handled in SpaceLinxContext.cs and
///  documented in database/migrations/PLANNED_AddIntegrityConstraints.md.)
/// </summary>
public partial class SpaceLinxContext
{
    public virtual DbSet<ChangeLog> ChangeLogs { get; set; }

    partial void OnModelCreatingPartial(ModelBuilder modelBuilder)
    {
        // === Column-owned (serial-backed) default sequences (all AS integer in uat.schema.sql) ===
        modelBuilder.HasSequence<int>("app_app_number_seq", "application");
        modelBuilder.HasSequence<int>("role_role_number_seq", "application");
        modelBuilder.HasSequence<int>("user_user_number_seq", "application");
        modelBuilder.HasSequence<int>("guide_sequence_seq", "mes");
        modelBuilder.HasSequence<int>("material_kit_sequence_seq", "mes");
        modelBuilder.HasSequence<int>("product_sequence_seq", "mes");
        modelBuilder.HasSequence<int>("work_package_sequence_seq", "mes");

        // === S1: the 12 standalone function-owned sequences. They have NO "AS <type>" clause
        // in uat.schema.sql, so PostgreSQL defaults them to bigint -> HasSequence<long>.
        // The embedded generate_* migration functions call nextval() on these; without them
        // e.g. sc.generate_company_code() fails with: relation "sc.company_code_seq" does not exist.
        modelBuilder.HasSequence<long>("program_code_seq", "pm");
        modelBuilder.HasSequence<long>("project_code_seq", "pm");
        modelBuilder.HasSequence<long>("task_code_seq", "pm");
        modelBuilder.HasSequence<long>("company_code_seq", "sc");
        modelBuilder.HasSequence<long>("customer_code_seq", "sc");
        modelBuilder.HasSequence<long>("grn_seq", "sc");
        modelBuilder.HasSequence<long>("partner_code_seq", "sc");
        modelBuilder.HasSequence<long>("purchase_order_seq", "sc");
        modelBuilder.HasSequence<long>("req_seq", "sc");
        modelBuilder.HasSequence<long>("scrap_number_seq", "sc");
        modelBuilder.HasSequence<long>("vendor_code_seq", "sc");
        modelBuilder.HasSequence<long>("vendor_return_number_seq", "sc");

        // === S4: nullability / default reconciliation to match UAT ===
        modelBuilder.Entity<Part>(e =>
        {
            // UAT: part_number_suffix NOT NULL
            e.Property(p => p.PartNumberSuffix).IsRequired();
            // UAT: part_number (GENERATED STORED) NOT NULL
            e.Property(p => p.PartNumber).IsRequired();
            // UAT: weight double precision DEFAULT 0 NOT NULL
            e.Property(p => p.Weight).HasDefaultValue(0d);
        });
        modelBuilder.Entity<Document>(e =>
        {
            // UAT: file_name / file_path / file_size are NULLABLE (baseline was wrongly stricter)
            e.Property(d => d.FileName).IsRequired(false);
            e.Property(d => d.FilePath).IsRequired(false);
            e.Property(d => d.FileSize).IsRequired(false);
        });

        // === S5: 17 partial indexes missing from the baseline (exact name/cols/predicate from dump) ===
        modelBuilder.Entity<User>(e => e.HasIndex(u => u.DepartmentId, "ix_user_department_id").HasFilter("(deleted_at IS NULL)"));
        modelBuilder.Entity<PartLevel>(e =>
        {
            e.HasIndex(p => p.Code, "idx_part_level_code").HasFilter("(deleted_at IS NULL)");
            e.HasIndex(p => p.IsActive, "idx_part_level_active").HasFilter("(deleted_at IS NULL)");
            e.HasIndex(p => p.SortOrder, "idx_part_level_sort_order").HasFilter("(deleted_at IS NULL)");
        });
        modelBuilder.Entity<Subsystem>(e =>
        {
            e.HasIndex(s => s.Code, "idx_subsystem_code").HasFilter("(deleted_at IS NULL)");
            e.HasIndex(s => s.IsActive, "idx_subsystem_active").HasFilter("(deleted_at IS NULL)");
        });
        modelBuilder.Entity<ResourceAllocation>(e =>
        {
            e.HasIndex(r => r.ProjectId, "idx_resource_allocation_project_id").HasFilter("(deleted_at IS NULL)");
            e.HasIndex(r => r.UserId, "idx_resource_allocation_user_id").HasFilter("(deleted_at IS NULL)");
            e.HasIndex(r => new { r.StartDate, r.EndDate }, "idx_resource_allocation_dates").HasFilter("(deleted_at IS NULL)");
            e.HasIndex(r => new { r.UserId, r.StartDate, r.EndDate }, "idx_resource_allocation_user_dates").HasFilter("(deleted_at IS NULL)");
        });
        modelBuilder.Entity<TaskDependency>(e =>
        {
            e.HasIndex(t => t.PredecessorTaskId, "idx_task_dependency_predecessor").HasFilter("(deleted_at IS NULL)");
            e.HasIndex(t => t.SuccessorTaskId, "idx_task_dependency_successor").HasFilter("(deleted_at IS NULL)");
        });
        modelBuilder.Entity<CompanyPart>(e => e.HasIndex(c => c.IsPreferred, "idx_company_part_is_preferred").HasFilter("(is_preferred = true)"));
        modelBuilder.Entity<PurchaseOrder>(e => e.HasIndex(p => p.DepartmentId, "ix_purchase_order_department_id").HasFilter("(deleted_at IS NULL)"));
        modelBuilder.Entity<Requisition>(e => e.HasIndex(r => r.DepartmentId, "ix_requisition_department_id").HasFilter("(deleted_at IS NULL)"));
        modelBuilder.Entity<StockMovementLineItem>(e =>
        {
            e.HasIndex(s => s.PartId, "idx_stock_movement_line_item_part").HasFilter("(deleted_at IS NULL)");
            e.HasIndex(s => s.StockMovementId, "idx_stock_movement_line_item_movement").HasFilter("(deleted_at IS NULL)");
        });

        // ====================================================================
        // R1–R7 + index : reconcile the EF baseline to UAT/Dev EXACTLY.
        // Source of truth: database/audit/uat.schema.sql (per-column), verified
        // against the catalog-diff gate. Mapped by schema.table.column.
        //
        // NOTE (runtime follow-up, NOT part of this schema task): R1 maps the
        // *_at / date columns below to "timestamp without time zone" / "date".
        // The app must therefore write those DateTime values as Kind=Unspecified
        // (Npgsql rejects a UTC DateTime into a non-tz column at runtime).
        // ====================================================================

        // -------- R1: timestamp/date columns that UAT stores WITHOUT time zone --------
        // 19 *_at/sent_at columns are "timestamp without time zone"; 3 date columns are "date".
        const string TS = "timestamp without time zone";
        modelBuilder.Entity<AdditionalRecipientConfiguration>(e =>
        {
            e.Property(p => p.CreatedAt).HasColumnType(TS);
            e.Property(p => p.UpdatedAt).HasColumnType(TS);
            e.Property(p => p.DeletedAt).HasColumnType(TS);
            // R2: nullability to match UAT
            e.Property(p => p.CreatedBy).IsRequired(false);
        });
        modelBuilder.Entity<Department>(e =>
        {
            e.Property(p => p.CreatedAt).HasColumnType(TS);
            e.Property(p => p.UpdatedAt).HasColumnType(TS);
            e.Property(p => p.DeletedAt).HasColumnType(TS);
            e.Property(p => p.CreatedBy).IsRequired(false);
        });
        modelBuilder.Entity<EmailLog>(e =>
        {
            e.Property(p => p.CreatedAt).HasColumnType(TS);
            e.Property(p => p.UpdatedAt).HasColumnType(TS);
            e.Property(p => p.DeletedAt).HasColumnType(TS);
            e.Property(p => p.SentAt).HasColumnType(TS);
            e.Property(p => p.RetryCount).IsRequired(false);
        });
        modelBuilder.Entity<EmailTemplate>(e =>
        {
            e.Property(p => p.CreatedAt).HasColumnType(TS);
            e.Property(p => p.UpdatedAt).HasColumnType(TS);
            e.Property(p => p.DeletedAt).HasColumnType(TS);
            e.Property(p => p.IsHtml).IsRequired(false);
        });
        modelBuilder.Entity<PartLevel>(e =>
        {
            e.Property(p => p.CreatedAt).HasColumnType(TS);
            e.Property(p => p.UpdatedAt).HasColumnType(TS);
            e.Property(p => p.DeletedAt).HasColumnType(TS);
        });
        modelBuilder.Entity<Subsystem>(e =>
        {
            e.Property(p => p.CreatedAt).HasColumnType(TS);
            e.Property(p => p.UpdatedAt).HasColumnType(TS);
            e.Property(p => p.DeletedAt).HasColumnType(TS);
        });
        // R1 (date): pm.resource_allocation.{start_date,end_date}, pm.time_entry.entry_date
        modelBuilder.Entity<ResourceAllocation>(e =>
        {
            e.Property(p => p.StartDate).HasColumnType("date");
            e.Property(p => p.EndDate).HasColumnType("date");
        });

        // -------- R2: remaining NULLABLE columns UAT allows (EF wrongly NOT NULL) --------
        modelBuilder.Entity<Image>(e =>
        {
            e.Property(p => p.EntityId).IsRequired(false);
            e.Property(p => p.EntityType).IsRequired(false);
            e.Property(p => p.FileExtension).IsRequired(false);
            e.Property(p => p.ImageType).IsRequired(false);
        });
        modelBuilder.Entity<Video>(e =>
        {
            e.Property(p => p.EntityId).IsRequired(false);
            e.Property(p => p.EntityType).IsRequired(false);
            e.Property(p => p.VideoType).IsRequired(false);
        });
        modelBuilder.Entity<BoardColumn>(e =>
        {
            e.Property(p => p.Color).IsRequired(false);
            e.Property(p => p.IsDefault).IsRequired(false);
        });
        modelBuilder.Entity<Task>(e =>
        {
            e.Property(p => p.ProgressPercent).IsRequired(false);
            e.Property(p => p.SortOrder).IsRequired(false);
            e.Property(p => p.TaskType).IsRequired(false);
        });
        modelBuilder.Entity<TaskDependency>(e => e.Property(p => p.LagDays).IsRequired(false));
        modelBuilder.Entity<TimeEntry>(e =>
        {
            // R1 (date): entry_date is "date" in UAT
            e.Property(p => p.EntryDate).HasColumnType("date");
            // R2: created_at stays timestamptz in UAT but is NULLABLE there
            e.Property(p => p.Billable).IsRequired(false);
            e.Property(p => p.CreatedBy).IsRequired(false);
            e.Property(p => p.WorkType).IsRequired(false);
        });
        modelBuilder.Entity<CompanyPart>(e => e.Property(p => p.IsPreferred).IsRequired(false));
        modelBuilder.Entity<InventoryPart>(e => e.Property(p => p.QtyReturned).IsRequired(false));
        modelBuilder.Entity<InventoryStock>(e =>
        {
            e.Property(p => p.QtyConsumed).IsRequired(false);
            e.Property(p => p.QtyQcFailed).IsRequired(false);
            e.Property(p => p.QtyQcPending).IsRequired(false);
            e.Property(p => p.QtyReserved).IsRequired(false);
            e.Property(p => p.QtyReturned).IsRequired(false);
            e.Property(p => p.QtyScrapped).IsRequired(false);
            // R6: qty_issued is NOT NULL in UAT (EF relaxed it)
            e.Property(p => p.QtyIssued).IsRequired();
            // R3: qty_available — CLR changed to decimal? (InventoryStock.cs). The existing
            // SpaceLinxContext.cs config (HasPrecision(18,4) + ::numeric(18,4) computed/stored)
            // now correctly emits a GENERATED numeric(18,4) NULLABLE column. No override needed here.
        });
        // R2: SC created_by columns nullable in UAT (CreatedBy is inherited from BaseModel)
        modelBuilder.Entity<ScrapLineItem>(e => e.Property(p => p.CreatedBy).IsRequired(false));
        modelBuilder.Entity<ScrapRequest>(e => e.Property(p => p.CreatedBy).IsRequired(false));
        modelBuilder.Entity<Tender>(e => e.Property(p => p.CreatedBy).IsRequired(false));
        modelBuilder.Entity<TenderLineItem>(e =>
        {
            e.Property(p => p.CreatedBy).IsRequired(false);
            e.Property(p => p.PartId).IsRequired(false);
        });
        modelBuilder.Entity<TenderQuotation>(e =>
        {
            e.Property(p => p.CreatedBy).IsRequired(false);
            e.Property(p => p.CompanyId).IsRequired(false);
            // R5: total_amount DEFAULT 0
            e.Property(p => p.TotalAmount).HasDefaultValue(0m);
        });
        modelBuilder.Entity<TenderQuotationLineItem>(e =>
        {
            e.Property(p => p.CreatedBy).IsRequired(false);
            e.Property(p => p.TenderLineItemId).IsRequired(false);
            // R5: total_price / unit_price DEFAULT 0
            e.Property(p => p.TotalPrice).HasDefaultValue(0m);
            e.Property(p => p.UnitPrice).HasDefaultValue(0m);
        });
        modelBuilder.Entity<TenderVendor>(e =>
        {
            e.Property(p => p.CreatedBy).IsRequired(false);
            e.Property(p => p.CompanyId).IsRequired(false);
        });
        modelBuilder.Entity<VendorReturnLineItem>(e => e.Property(p => p.CreatedBy).IsRequired(false));
        modelBuilder.Entity<VendorReturnRequest>(e => e.Property(p => p.CreatedBy).IsRequired(false));
        modelBuilder.Entity<PoLineItem>(e => e.Property(p => p.PartId).IsRequired()); // R6: part_id NOT NULL in UAT

        // -------- R3: file_size is integer in UAT (CLR int on Image/Video) --------
        modelBuilder.Entity<Image>(e => e.Property(p => p.FileSize).HasColumnType("integer"));
        modelBuilder.Entity<Video>(e => e.Property(p => p.FileSize).HasColumnType("integer"));

        // -------- R4: 7 sequence-backed columns lost their nextval() DEFAULT --------
        modelBuilder.Entity<App>(e => e.Property(p => p.AppNumber)
            .HasDefaultValueSql("nextval('application.app_app_number_seq'::regclass)"));
        modelBuilder.Entity<Role>(e => e.Property(p => p.RoleNumber)
            .HasDefaultValueSql("nextval('application.role_role_number_seq'::regclass)"));
        modelBuilder.Entity<User>(e => e.Property(p => p.UserNumber)
            .HasDefaultValueSql("nextval('application.user_user_number_seq'::regclass)"));
        modelBuilder.Entity<Guide>(e => e.Property(p => p.Sequence)
            .HasDefaultValueSql("nextval('mes.guide_sequence_seq'::regclass)"));
        modelBuilder.Entity<MaterialKit>(e => e.Property(p => p.Sequence)
            .HasDefaultValueSql("nextval('mes.material_kit_sequence_seq'::regclass)"));
        modelBuilder.Entity<Product>(e => e.Property(p => p.Sequence)
            .HasDefaultValueSql("nextval('mes.product_sequence_seq'::regclass)"));
        modelBuilder.Entity<WorkPackage>(e => e.Property(p => p.Sequence)
            .HasDefaultValueSql("nextval('mes.work_package_sequence_seq'::regclass)"));

        // -------- R5: literal DEFAULT 0 on weight columns (amount/price done above) --------
        modelBuilder.Entity<Guide>(e => e.Property(p => p.CalculatedWeight).HasDefaultValue(0d));
        modelBuilder.Entity<GuideMbom>(e => e.Property(p => p.Weight).HasDefaultValue(0d));

        // -------- R6: columns UAT keeps NOT NULL (EF relaxed) --------
        modelBuilder.Entity<GuideStepTask>(e => e.Property(p => p.Sequence).IsRequired());
        modelBuilder.Entity<KitSerial>(e => e.Property(p => p.Status).IsRequired());
        // (InventoryStock.QtyIssued, PoLineItem.PartId handled above with their entities)
        modelBuilder.Entity<WorkOrderTask>(e => e.Property(p => p.WorkOrderStepId).IsRequired()); // UAT: NOT NULL

        // -------- R7: FK ON DELETE behaviours (convention-based FKs configured here;
        //              role_permission & work_order_task edited in SpaceLinxContext.cs) --------
        modelBuilder.Entity<Address>(e => e.HasOne(d => d.Country).WithMany()
            .HasForeignKey(d => d.CountryId).OnDelete(DeleteBehavior.SetNull)); // UAT: CASCADE -> SET NULL
        modelBuilder.Entity<Approval>(e => e.HasOne(d => d.Approver).WithMany(p => p.Approvals)
            .HasForeignKey(d => d.ApproverId).OnDelete(DeleteBehavior.SetNull)); // UAT: CASCADE -> SET NULL
        modelBuilder.Entity<Part>(e => e.HasOne(d => d.CountryOfOrigin).WithMany()
            .HasForeignKey(d => d.CountryOfOriginId).OnDelete(DeleteBehavior.SetNull)); // restore SET NULL
        modelBuilder.Entity<PurchaseOrder>(e => e.HasOne(d => d.QuotationReference).WithMany()
            .HasForeignKey(d => d.QuotationReferenceId).OnDelete(DeleteBehavior.SetNull)); // restore SET NULL
        modelBuilder.Entity<WorkOrderStep>(e =>
        {
            e.HasOne(d => d.Manager).WithMany()
                .HasForeignKey(d => d.ManagerId).OnDelete(DeleteBehavior.SetNull); // restore SET NULL
            e.HasOne(d => d.Technician).WithMany()
                .HasForeignKey(d => d.TechnicianId).OnDelete(DeleteBehavior.SetNull); // restore SET NULL
        });

        // -------- Index gap: sc.company_part(vendor_part_number) present in UAT, missing from EF --------
        modelBuilder.Entity<CompanyPart>(e =>
            e.HasIndex(p => p.VendorPartNumber, "idx_company_part_vendor_part_number"));

        // === S2: 43 CHECK constraints (exact names/expressions from uat.schema.sql) ===
        modelBuilder.Entity<Approval>(e => e.ToTable(t =>
        {
            t.HasCheckConstraint("approval_stage_number_check", "(stage_number >= 1)");
            t.HasCheckConstraint("approval_status_check", "((status)::text = ANY (ARRAY[('Pending'::character varying)::text, ('Approved'::character varying)::text, ('Rejected'::character varying)::text, ('Cancelled'::character varying)::text, ('Removed'::character varying)::text]))");
        }));
        modelBuilder.Entity<ApprovalConfiguration>(e => e.ToTable(t =>
        {
            t.HasCheckConstraint("chk_number_of_levels_positive", "(number_of_levels > 0)");
        }));
        modelBuilder.Entity<ApprovalLog>(e => e.ToTable(t =>
        {
            t.HasCheckConstraint("chk_stage_number_positive", "((stage_number IS NULL) OR (stage_number > 0))");
        }));
        modelBuilder.Entity<ApprovalNotificationRecipient>(e => e.ToTable(t =>
        {
            t.HasCheckConstraint("chk_recipient_type", "((recipient_type IS NULL) OR ((recipient_type)::text = ANY (ARRAY[('CC'::character varying)::text, ('Watcher'::character varying)::text, ('Stakeholder'::character varying)::text])))");
        }));
        modelBuilder.Entity<Document>(e => e.ToTable(t =>
        {
            t.HasCheckConstraint("chk_document_storage_type", "((document_storage_type)::text = ANY (ARRAY[('uploaded'::character varying)::text, ('external_url'::character varying)::text]))");
        }));
        modelBuilder.Entity<Eco>(e => e.ToTable(t =>
        {
            t.HasCheckConstraint("eco_status_check", "((status)::text = ANY (ARRAY[('Draft'::character varying)::text, ('Submitted'::character varying)::text, ('Approved'::character varying)::text, ('Discarded'::character varying)::text, ('Rejected'::character varying)::text, ('Released'::character varying)::text]))");
        }));
        modelBuilder.Entity<EcoPart>(e => e.ToTable(t =>
        {
            t.HasCheckConstraint("eco_part_status_check", "((status)::text = ANY (ARRAY[('Obsolete'::character varying)::text, ('Release'::character varying)::text]))");
        }));
        modelBuilder.Entity<Part>(e => e.ToTable(t =>
        {
            t.HasCheckConstraint("chk_manufacturer_details_required", "(((make_buy = 1) AND (((item_type)::text = ANY (ARRAY[('Goods'::character varying)::text, ('Services'::character varying)::text])) OR ((manufacturing_part_number IS NOT NULL) AND (TRIM(BOTH FROM manufacturing_part_number) <> ''::text) AND (manufacturer_name IS NOT NULL) AND (TRIM(BOTH FROM manufacturer_name) <> ''::text)))) OR (make_buy = 0))");
            t.HasCheckConstraint("part_status_check", "((status)::text = ANY (ARRAY[('Draft'::character varying)::text, ('Release'::character varying)::text, ('Obsolete'::character varying)::text, ('Archived'::character varying)::text]))");
            t.HasCheckConstraint("part_version_check", "(version ~ '^[0-9]{2}$'::text)");
        }));
        modelBuilder.Entity<DashboardWidget>(e => e.ToTable(t =>
        {
            t.HasCheckConstraint("dashboard_widget_widget_type_check", "((widget_type)::text = ANY (ARRAY[('TaskSummary'::character varying)::text, ('ProjectProgress'::character varying)::text, ('OverdueTasks'::character varying)::text, ('MyTasks'::character varying)::text, ('TeamWorkload'::character varying)::text, ('RecentActivity'::character varying)::text, ('TimeLoggedChart'::character varying)::text, ('MilestoneTracker'::character varying)::text, ('PriorityBreakdown'::character varying)::text, ('StatusDistribution'::character varying)::text]))");
        }));
        modelBuilder.Entity<ResourceAllocation>(e => e.ToTable(t =>
        {
            t.HasCheckConstraint("chk_date_range", "(end_date >= start_date)");
            t.HasCheckConstraint("resource_allocation_allocated_hours_per_day_check", "((allocated_hours_per_day > (0)::numeric) AND (allocated_hours_per_day <= (24)::numeric))");
            t.HasCheckConstraint("resource_allocation_allocation_percent_check", "((allocation_percent > 0) AND (allocation_percent <= 100))");
            t.HasCheckConstraint("resource_allocation_allocation_type_check", "((allocation_type)::text = ANY (ARRAY[('Project'::character varying)::text, ('Task'::character varying)::text, ('Overhead'::character varying)::text, ('Leave'::character varying)::text, ('Training'::character varying)::text]))");
        }));
        modelBuilder.Entity<Task>(e => e.ToTable(t =>
        {
            t.HasCheckConstraint("chk_progress_percent", "((progress_percent >= 0) AND (progress_percent <= 100))");
            t.HasCheckConstraint("chk_task_type", "((task_type)::text = ANY (ARRAY[('Task'::character varying)::text, ('Milestone'::character varying)::text, ('SubTask'::character varying)::text]))");
            t.HasCheckConstraint("task_priority_check", "((priority)::text = ANY (ARRAY[('High'::character varying)::text, ('Medium'::character varying)::text, ('Low'::character varying)::text]))");
            t.HasCheckConstraint("task_status_check", "((status)::text = ANY ('{Completed,\"In Progress\",\"To Do\",Logged,Review}'::text[]))");
        }));
        modelBuilder.Entity<TaskAssignee>(e => e.ToTable(t =>
        {
            t.HasCheckConstraint("task_assignee_assignee_role_check", "((assignee_role)::text = ANY (ARRAY[('Primary'::character varying)::text, ('Secondary'::character varying)::text, ('Reviewer'::character varying)::text, ('Watcher'::character varying)::text]))");
        }));
        modelBuilder.Entity<TimeEntry>(e => e.ToTable(t =>
        {
            t.HasCheckConstraint("time_entry_hours_worked_check", "((hours_worked > (0)::numeric) AND (hours_worked <= (24)::numeric))");
        }));
        modelBuilder.Entity<TaskActivity>(e => e.ToTable(t =>
        {
            t.HasCheckConstraint("task_activity_activity_type_check", "((activity_type)::text = ANY (ARRAY[('Created'::character varying)::text, ('Updated'::character varying)::text, ('Deleted'::character varying)::text, ('Restored'::character varying)::text, ('StatusChanged'::character varying)::text, ('PriorityChanged'::character varying)::text, ('AssigneeAdded'::character varying)::text, ('AssigneeRemoved'::character varying)::text, ('DueDateChanged'::character varying)::text, ('StartDateChanged'::character varying)::text, ('ProgressChanged'::character varying)::text, ('CommentAdded'::character varying)::text, ('CommentEdited'::character varying)::text, ('CommentDeleted'::character varying)::text, ('DependencyAdded'::character varying)::text, ('DependencyRemoved'::character varying)::text, ('SubtaskAdded'::character varying)::text, ('SubtaskRemoved'::character varying)::text, ('AttachmentAdded'::character varying)::text, ('AttachmentRemoved'::character varying)::text, ('Moved'::character varying)::text, ('TimeLogged'::character varying)::text]))");
        }));
        modelBuilder.Entity<TaskDependency>(e => e.ToTable(t =>
        {
            t.HasCheckConstraint("chk_no_self_dependency", "(predecessor_task_id <> successor_task_id)");
            t.HasCheckConstraint("task_dependency_dependency_type_check", "((dependency_type)::text = ANY (ARRAY[('FS'::character varying)::text, ('SS'::character varying)::text, ('FF'::character varying)::text, ('SF'::character varying)::text]))");
        }));
        modelBuilder.Entity<Company>(e => e.ToTable(t =>
        {
            t.HasCheckConstraint("company_pan_check", "((is_vendor = true) OR (pan_number IS NULL))");
        }));
        modelBuilder.Entity<GoodsReceiptNote>(e => e.ToTable(t =>
        {
            t.HasCheckConstraint("goods_receipt_note_status_check", "((status)::text = ANY (ARRAY[('In Process'::character varying)::text, ('Completed'::character varying)::text, ('Partially Completed'::character varying)::text, ('Rejected'::character varying)::text, ('Quality Checked'::character varying)::text, ('Closed'::character varying)::text]))");
        }));
        modelBuilder.Entity<GrnLineItem>(e => e.ToTable(t =>
        {
            t.HasCheckConstraint("grn_line_item_disposition_check", "((disposition)::text = ANY (ARRAY[('Accepted'::character varying)::text, ('Return'::character varying)::text, ('Scrap'::character varying)::text, ('Rework'::character varying)::text, ('Quarantine'::character varying)::text]))");
            t.HasCheckConstraint("grn_line_item_qc_status_check", "((qc_status)::text = ANY (ARRAY[('Pending'::character varying)::text, ('Pass'::character varying)::text, ('Fail'::character varying)::text, ('Accepted'::character varying)::text]))");
            t.HasCheckConstraint("grn_line_item_tracking_method_check", "((tracking_method IS NULL) OR ((tracking_method)::text = ANY (ARRAY[('None'::character varying)::text, ('Batch'::character varying)::text, ('Serial'::character varying)::text])))");
        }));
        modelBuilder.Entity<PurchaseOrder>(e => e.ToTable(t =>
        {
            t.HasCheckConstraint("chk_purchase_order_status", "((status)::text = ANY (ARRAY[('Draft'::character varying)::text, ('Submitted'::character varying)::text, ('Issued'::character varying)::text, ('Rejected'::character varying)::text, ('Partially Delivered'::character varying)::text, ('Delivered'::character varying)::text, ('Closed'::character varying)::text, ('Cancelled'::character varying)::text, ('Billed'::character varying)::text, ('Partially Billed'::character varying)::text]))");
        }));
        modelBuilder.Entity<InventoryTransaction>(e => e.ToTable(t =>
        {
            t.HasCheckConstraint("inventory_transaction_tracking_type_check", "((tracking_type)::text = ANY (ARRAY[('None'::character varying)::text, ('Batch'::character varying)::text, ('Serial'::character varying)::text]))");
            t.HasCheckConstraint("inventory_transaction_transaction_type_check", "((transaction_type)::text = ANY (ARRAY['Received'::text, 'OnOrder'::text, 'Consumed'::text, 'Adjustment'::text, 'Returned'::text, 'Reserved'::text, 'Defective'::text, 'OnHold'::text, 'Transfer'::text, 'QC Failed'::text, 'Issued'::text]))");
        }));
        modelBuilder.Entity<StockMovementLineItem>(e => e.ToTable(t =>
        {
            t.HasCheckConstraint("stock_movement_line_item_adjustment_type_check", "((adjustment_type)::text = ANY (ARRAY[('Increase'::character varying)::text, ('Decrease'::character varying)::text]))");
            t.HasCheckConstraint("stock_movement_line_item_quantity_check", "(quantity > 0)");
        }));
        modelBuilder.Entity<PaymentTerm>(e => e.ToTable(t =>
        {
            t.HasCheckConstraint("payment_term_discount_days_check", "(discount_days >= 0)");
            t.HasCheckConstraint("payment_term_discount_percent_check", "((discount_percent >= (0)::numeric) AND (discount_percent <= (100)::numeric))");
            t.HasCheckConstraint("payment_term_due_days_check", "(due_days >= 0)");
        }));
        modelBuilder.Entity<Requisition>(e => e.ToTable(t =>
        {
            t.HasCheckConstraint("chk_requisition_status", "((status)::text = ANY (ARRAY[('Draft'::character varying)::text, ('Submitted'::character varying)::text, ('Approved'::character varying)::text, ('Rejected'::character varying)::text, ('Processing'::character varying)::text, ('PoCreated'::character varying)::text, ('Closed'::character varying)::text, ('Cancelled'::character varying)::text]))");
        }));
        modelBuilder.Entity<ScrapLineItem>(e => e.ToTable(t =>
        {
            t.HasCheckConstraint("scrap_line_item_tracking_type_check", "((tracking_type)::text = ANY (ARRAY[('None'::character varying)::text, ('Batch'::character varying)::text, ('Serial'::character varying)::text]))");
        }));
        modelBuilder.Entity<ScrapRequest>(e => e.ToTable(t =>
        {
            t.HasCheckConstraint("scrap_request_status_check", "((status)::text = ANY (ARRAY[('Draft'::character varying)::text, ('Submitted'::character varying)::text, ('Approved'::character varying)::text, ('Rejected'::character varying)::text, ('Disposed'::character varying)::text]))");
        }));
        modelBuilder.Entity<VendorReturnLineItem>(e => e.ToTable(t =>
        {
            t.HasCheckConstraint("vendor_return_line_item_tracking_type_check", "((tracking_type)::text = ANY (ARRAY[('None'::character varying)::text, ('Batch'::character varying)::text, ('Serial'::character varying)::text]))");
        }));
        modelBuilder.Entity<VendorReturnRequest>(e => e.ToTable(t =>
        {
            t.HasCheckConstraint("vendor_return_request_status_check", "((status)::text = ANY (ARRAY[('Draft'::character varying)::text, ('Submitted'::character varying)::text, ('Approved'::character varying)::text, ('Rejected'::character varying)::text, ('Shipped'::character varying)::text, ('Closed'::character varying)::text]))");
        }));
        modelBuilder.Entity<FcmToken>(entity =>
        {
            entity.HasKey(e => new { e.Email, e.DeviceId });
            entity.ToTable("fcm_token", "common");
            entity.Property(e => e.Id)
                .HasDefaultValueSql("gen_random_uuid()")
                .HasColumnName("id");
            entity.Property(e => e.Email)
                .HasMaxLength(255)
                .HasColumnName("email");
            entity.Property(e => e.DeviceId)
                .HasMaxLength(255)
                .HasColumnName("device_id");
            entity.Property(e => e.DeviceToken)
                .HasMaxLength(255)
                .HasColumnName("device_token");
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

        modelBuilder.Entity<ChangeLog>(entity =>
        {
            // EF tracking key is the identity surrogate; the physical PK is (id, occurred_at)
            // for partitioning. EF only ever inserts into this table, so a single-column key is fine.
            entity.HasKey(e => e.Id);

            // Table is created/owned by the AddAuditChangeLog migration's raw SQL (partitioned + tamper-resistant); EF maps it for read/insert only. Any column change here must also be reflected in that migration.
            entity.ToTable("change_log", "audit", t => t.ExcludeFromMigrations());

            entity.Property(e => e.Id).HasColumnName("id").ValueGeneratedOnAdd();
            entity.Property(e => e.OccurredAt).HasColumnName("occurred_at");
            entity.Property(e => e.SchemaName).HasColumnName("schema_name").HasMaxLength(63);
            entity.Property(e => e.TableName).HasColumnName("table_name").HasMaxLength(128);
            entity.Property(e => e.EntityType).HasColumnName("entity_type").HasMaxLength(128);
            entity.Property(e => e.RowPk).HasColumnName("row_pk");
            entity.Property(e => e.Operation).HasColumnName("operation").HasMaxLength(20);
            entity.Property(e => e.OldValues).HasColumnName("old_values").HasColumnType("jsonb");
            entity.Property(e => e.NewValues).HasColumnName("new_values").HasColumnType("jsonb");
            entity.Property(e => e.ChangedColumns).HasColumnName("changed_cols");
            entity.Property(e => e.ActorEmail).HasColumnName("actor_email").HasMaxLength(255);
            entity.Property(e => e.ActorRoleId).HasColumnName("actor_role_id");
            entity.Property(e => e.AuthorizedBy).HasColumnName("authorized_by").HasMaxLength(255);
            entity.Property(e => e.Bypass).HasColumnName("bypass");
            entity.Property(e => e.AppName).HasColumnName("app_name").HasMaxLength(50);
            entity.Property(e => e.TenantId).HasColumnName("tenant_id").HasMaxLength(100);
            entity.Property(e => e.CorrelationId).HasColumnName("correlation_id").HasMaxLength(100);
            entity.Property(e => e.RequestPath).HasColumnName("request_path").HasMaxLength(500);
            entity.Property(e => e.RequestMethod).HasColumnName("request_method").HasMaxLength(10);
            entity.Property(e => e.SourceIp).HasColumnName("source_ip").HasMaxLength(64);
            entity.Property(e => e.UserAgent).HasColumnName("user_agent").HasMaxLength(512);
            entity.Property(e => e.Success).HasColumnName("success");
            entity.Property(e => e.Source).HasColumnName("source").HasMaxLength(1);
        });
    }
}
