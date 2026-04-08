using SpaceLinx.Model;
using System.Linq.Expressions;
using Task = System.Threading.Tasks.Task;

public class SpaceLinxConstants
{
    public const string SpaceLinxAppHeaderKey = "SPACELINX-APP-NAME";
    public const string PrefUserName = "preferred_username";
    public const string EmailClaim = "http://schemas.xmlsoap.org/ws/2005/05/identity/claims/emailaddress";
    public const string UnAuthenticatedApiPath = "/api/ua/";

    public static readonly Dictionary<Type, object> RelatedTablesIncludeDict =
        new Dictionary<Type, object>()
        {
            { typeof(Address), new Expression<Func<Address, object>>[]
            { x => x.Country }
            },
            { typeof(Approval), new Expression<Func<Approval, object>>[]
                { x => x.Approver }
            },
            { typeof(ApprovalConfiguration), Array.Empty<Expression<Func<ApprovalConfiguration, object>>>()
            },
            { typeof(ApprovalLog), Array.Empty<Expression<Func<ApprovalLog, object>>>()
            },
            { typeof(ApprovalNotificationRecipient), new Expression<Func<ApprovalNotificationRecipient, object>>[]
                { x => x.RecipientUser }
            },
            { typeof(BinManagement), new Expression<Func<BinManagement, object>>[]
            { x => x.Location, x => x.UnitOfMeasure }
            },
            { typeof(Company), new Expression<Func<Company, object>>[]
                { x => x.PaymentTerm, x => x.Currency }
            },
            { typeof(CompanyAddress), new Expression<Func<CompanyAddress, object>>[]
                { x => x.Company, x=> x.Address }
            },
            { typeof(CompanyBankAccount), new Expression<Func<CompanyBankAccount, object>>[]
                { x => x.Company, x=> x.BankAccount }
            },
            { typeof(CompanyContact), new Expression<Func<CompanyContact, object>>[]
                { x => x.Company, x=> x.Contact }
            },
            { typeof(CompanyPart), new Expression<Func<CompanyPart, object>>[]
                { x => x.Company, x => x.Part, x => x.Currency }
            },
            { typeof(Contact), new Expression<Func<Contact, object>>[]
            { x => x.Company }
            },
            { typeof(Ebom), new Expression<Func<Ebom, object>>[]
                { x => x.Part, x => x.ChildPart , x => x.AssemblyLocation }
            },
            { typeof(EcoLog), new Expression<Func<EcoLog, object>>[]
                { x => x.Eco }
            },
            { typeof(EcoPart), new Expression<Func<EcoPart, object>>[]
                { x => x.Eco, x => x.Part }
            },
            { typeof(GoodsReceiptNote), new Expression<Func<GoodsReceiptNote, object>>[]
                { x => x.PurchaseOrder, x => x.ReceivedBy, x => x.Location , x => x.Vendor }
            },
            { typeof(GrnLineItem), new Expression<Func<GrnLineItem, object>>[]
                { x => x.Grn, x => x.Part, x => x.CheckedBy }
            },
            { typeof(Guide), new Expression<Func<Guide, object>>[]
                { x => x.GuideType, x => x.Part, x => x.Platform }
            },
            { typeof(GuideCheckOutHistory), new Expression<Func<GuideCheckOutHistory, object>>[]
                { x => x.Guide }
            },
            {typeof(GuideStep), new Expression<Func<GuideStep, object>>[]
                { x => x.Guide, x => x.Image}
            },
            { typeof(GuideStepTask), new Expression<Func<GuideStepTask, object>>[]
                { x => x.Guide, x => x.GuideStep}
            },
            { typeof(GuideStepEquipment), new Expression<Func<GuideStepEquipment, object>>[]
                { x => x.Guide, x => x.GuideStep, x => x.Machine, x => x.Part, x => x.Tool}
            },
            { typeof(InventoryPart), new Expression<Func<InventoryPart, object>>[]
            { x => x.Part}
            },
            { typeof(InventoryStock), new Expression<Func<InventoryStock, object>>[]
            { x => x.Bin, x => x.Part, x => x.Location, x => x.Project, x => x.AssignedUser}
            },
            { typeof(InventoryTransaction), new Expression<Func<InventoryTransaction, object>>[]
            { x => x.Part, x => x.ToLocation, x => x.FromLocation, x => x.Project, x => x.Department, x => x.AssignedUser}
            },
            { typeof(Issue), new Expression<Func<Issue, object>>[]
            { x => x.Guide, x => x.Product, x => x.WorkOrder}
            },
            { typeof(Kit), new Expression<Func<Kit, object>>[]
                { x => x.Location, x => x.MaterialKit, x => x.Part, x => x.WorkOrder}
            },
            { typeof(KitBomComment), new Expression<Func<KitBomComment, object>>[]
                { x => x.Kit, x => x.Part}
            },
            { typeof(KitSerial), new Expression<Func<KitSerial, object>>[]
                { x => x.Kit, x => x.Part}
            },
            { typeof(Machine), new Expression<Func<Machine, object>>[]
                { x => x.MachineType }
            },
            { typeof(MaterialKit), new Expression<Func<MaterialKit, object>>[]
                { x => x.Image, x => x.Location, x => x.Part}
            },
            { typeof(Milestone), new Expression<Func<Milestone, object>>[]
                { x => x.Project }
            },
            { typeof(News), new Expression<Func<News, object>>[]
                { x => x.NewsType }
            },
            { typeof(OrganizationAddress), new Expression<Func<OrganizationAddress, object>>[]
                { x => x.Organization, x => x.Address }
            },
            { typeof(Part), new Expression<Func<Part, object>>[]
                { x => x.PartType, x => x.UnitOfMeasure, x => x.CountryOfOrigin, x => x.Subsystem }
            },
            { typeof(PartType), new Expression<Func<PartType, object>>[] 
                { x => x.PartTypeCategory, x => x.PartLevel} 
            },
            { typeof(PoLineItem), new Expression<Func<PoLineItem, object>>[]
                { x => x.Part, x => x.PurchaseOrder}
            },
            { typeof(Product), new Expression<Func<Product, object>>[]
                { x => x.Image, x => x.Part, x => x.Platform}
            },
            { typeof(Program), new Expression<Func<Program, object>>[]
                { x => x.Buyer, x => x.Customer, x => x.ProgramManager, x => x.SupplyChainManager}
            },
            { typeof(Project), new Expression<Func<Project, object>>[]
                { x => x.Program, x => x.ProjectManager}
            },
            { typeof(PurchaseOrder), new Expression<Func<PurchaseOrder, object>>[]
                { x => x.BillingAddress, x => x.Buyer, x => x.Currency, x => x.DeliveryAddress, x => x.PaymentTerm, x => x.Project, x => x.Requisition, x => x.ShippingAddress, x => x.SupplyChainLead, x => x.Company, x => x.VendorBillingAddress, x => x.VendorBillingContact}
            },
            { typeof(Requisition), new Expression<Func<Requisition, object>>[]
                { x => x.RequestedBy, x => x.Project}
            },
            { typeof(RequisitionLineItem), new Expression<Func<RequisitionLineItem, object>>[]
                { x => x.Part, x => x.Requisition}
            },
            { typeof(Role), new Expression<Func<Role, object>>[]
                { x => x.App}
            },
            { typeof(RoleFilter), new Expression<Func<RoleFilter, object>>[]
                { x => x.Role}
            },
            { typeof(RolePermission), new Expression<Func<RolePermission, object>>[]
                { x => x.Role}
            },
            { typeof(ScrapLineItem), new Expression<Func<ScrapLineItem, object>>[]
                { x => x.ScrapRequest, x => x.Part}
            },
            { typeof(ScrapRequest), new Expression<Func<ScrapRequest, object>>[]
                { x => x.ApprovedBy, x => x.Grn, x => x.Po, x => x.Location,x => x.RaisedBy, x => x.Wo, }
            },
            { typeof(StockMovement), new Expression<Func<StockMovement, object>>[]
                { x => x.FromLocation, x => x.ToLocation, x => x.FromBin, x => x.ToBin, x => x.PerformedBy, x => x.WorkOrder, x => x.Project }
            },
            { typeof(StockMovementLineItem), new Expression<Func<StockMovementLineItem, object>>[]
                { x => x.StockMovement, x => x.Part }
            },
            { typeof(VendorReturnRequest), new Expression<Func<VendorReturnRequest, object>>[]
                { x => x.Grn, x => x.Po, x => x.Location,x => x.RaisedBy, x => x.Wo, }
            },
            { typeof(VendorReturnLineItem), new Expression<Func<VendorReturnLineItem, object>>[]
                { x => x.ReturnRequest,  x => x.Part,  x => x.GrnLineItem}
            },
            { typeof(Staff), new Expression<Func<Staff, object>>[]
                { x => x.Organization, x => x.Manager }
            },
            { typeof(SpaceLinx.Model.Task), new Expression<Func<SpaceLinx.Model.Task, object>>[]
                { x => x.AssignedTo, x => x.Project, x => x.Milestone, x => x.ParentTask, x => x.SubTasks, x => x.Assignees, x => x.BoardColumn }
            },
            { typeof(TaskDependency), new Expression<Func<TaskDependency, object>>[]
                { x => x.PredecessorTask, x => x.SuccessorTask }
            },
            { typeof(TaskAssignee), new Expression<Func<TaskAssignee, object>>[]
                { x => x.Task, x => x.User }
            },
            { typeof(TaskComment), new Expression<Func<TaskComment, object>>[]
                { x => x.Task, x => x.ParentComment, x => x.Replies }
            },
            { typeof(TaskActivity), new Expression<Func<TaskActivity, object>>[]
                { x => x.Task }
            },
            { typeof(BoardColumn), new Expression<Func<BoardColumn, object>>[]
                { x => x.Project, x => x.Tasks }
            },
            { typeof(TimeEntry), new Expression<Func<TimeEntry, object>>[]
                { x => x.Task, x => x.User }
            },
            { typeof(Tool), new Expression<Func<Tool, object>>[]
                { x => x.ToolType }
            },
            { typeof(User), new Expression<Func<User, object>>[]
                { x => x.UserRoles }
            },
            { typeof(UserRole), new Expression<Func<UserRole, object>>[]
                { x => x.Role , x => x.User }
            },
            { typeof(WorkOrder), new Expression<Func<WorkOrder, object>>[]
                { x => x.Guide, x => x.Kit, x => x.WorkPackage, x => x.Manager, x => x.Part, x => x.Product, x => x.Technician}
            },
            { typeof(WorkOrderStep), new Expression<Func<WorkOrderStep, object>>[]
                { x => x.GuideStep, x => x.Image, x => x.Manager, x => x.WorkOrder , x => x.Technician}
            },
            { typeof(WorkOrderTask), new Expression<Func<WorkOrderTask, object>>[]
                { x => x.GuideStepTask, x => x.WorkOrder, x => x.WorkOrderStep}
            },
            { typeof(WorkPackage), new Expression<Func<WorkPackage, object>>[]
                { x => x.Guide, x => x.Manager, x => x.Part, x => x.Product, x => x.Technician}
            },
            { typeof(Tender), new Expression<Func<Tender, object>>[]
                { x => x.Requisition, x => x.Project, x => x.AwardedVendor, x => x.Buyer, x => x.PaymentTerm, x => x.Currency }
            },
            { typeof(TenderLineItem), new Expression<Func<TenderLineItem, object>>[]
                { x => x.Tender, x => x.Part, x => x.UnitOfMeasure }
            },
            { typeof(TenderVendor), new Expression<Func<TenderVendor, object>>[]
                { x => x.Tender, x => x.Company }
            },
            { typeof(TenderQuotation), new Expression<Func<TenderQuotation, object>>[]
                { x => x.Tender, x => x.Company, x => x.Currency, x => x.Document }
            },
            { typeof(TenderQuotationLineItem), new Expression<Func<TenderQuotationLineItem, object>>[]
                { x => x.TenderQuotation, x => x.TenderLineItem }
            },
        };

    public static readonly Dictionary<Type, string[]> LookupColumnsDict =
        new Dictionary<Type, string[]>()
        {
            { typeof(Address), new string[] { nameof(Address.AddressLine1), nameof(Address.AddressLine2), nameof(Address.City), nameof(Address.State), nameof(Address.PostalCode), nameof(Address.CountryId), nameof(Address.PhoneNumber), nameof(Address.Latitude), nameof(Address.Longitude) } },
            { typeof(Approval), new string[] { nameof(Approval.EntityType), nameof(Approval.EntityId), nameof(Approval.ApproverId), nameof(Approval.StageNumber) } },
            { typeof(ApprovalConfiguration), new string[] { nameof(ApprovalConfiguration.EntityType), nameof(ApprovalConfiguration.NumberOfLevels), nameof(ApprovalConfiguration.Description), nameof(ApprovalConfiguration.RequireSequentialApproval) } },
            { typeof(ApprovalLog), new string[] { nameof(ApprovalLog.EntityType), nameof(ApprovalLog.EntityId), nameof(ApprovalLog.Action), nameof(ApprovalLog.ActionAt), nameof(ApprovalLog.ActionBy), nameof(ApprovalLog.StageNumber), nameof(ApprovalLog.Notes) } },
            { typeof(ApprovalNotificationRecipient), new string[] { nameof(ApprovalNotificationRecipient.EntityType), nameof(ApprovalNotificationRecipient.EntityId), nameof(ApprovalNotificationRecipient.RecipientUserId), nameof(ApprovalNotificationRecipient.RecipientType) } },
            { typeof(AssemblyLocation), new string[] { nameof(AssemblyLocation.Name), nameof(AssemblyLocation.Description), } },
            { typeof(BankAccount), new string[] { nameof(BankAccount.BankName), nameof(BankAccount.BranchName), nameof(BankAccount.AccountNumber), nameof(BankAccount.SwiftCode), nameof(BankAccount.IfscCode) } },
            { typeof(BinManagement), new string[] { nameof(BinManagement.BinCode), nameof(BinManagement.LocationId), nameof(BinManagement.Rack), nameof(BinManagement.Aisle), nameof(BinManagement.Capacity), nameof(BinManagement.UnitOfMeasureId) } },
            { typeof(BulkUpload), new string[] {nameof(BulkUpload.ApplicationName) ,  nameof(BulkUpload.FileName) } },
            { typeof(Company), new string[] { nameof(Company.CompanyCode), nameof(Company.VendorCode), nameof(Company.CustomerCode), nameof(Company.PartnerCode), nameof(Company.Name), nameof(Company.ContactName), nameof(Company.PhoneNumber), nameof(Company.AlternatePhone), nameof(Company.Website), nameof(Company.TaxId), nameof(Company.CurrencyCode), nameof(Company.QualityScore), nameof(Company.Category), nameof(Company.Department), nameof(Company.PaymentTermId), nameof(Company.CurrencyId), nameof(Company.LogoUrl), nameof(Company.Notes), nameof(Company.TotalOrders), nameof(Company.TotalSpent), nameof(Company.AvgOrderValue), nameof(Company.OnTimeDeliveryRate), nameof(Company.Email), nameof(Company.PanNumber) } },
            { typeof(CompanyAddress), new string[] { nameof(CompanyAddress.CompanyId),nameof(CompanyAddress.AddressId),nameof(CompanyAddress.AddressType) }},
            { typeof(CompanyBankAccount), new string[] { nameof(CompanyBankAccount.CompanyId),nameof(CompanyBankAccount.BankAccountId) }},
            { typeof(CompanyContact), new string[] { nameof(CompanyContact.CompanyId),nameof(CompanyContact.ContactId),nameof(CompanyContact.ContactType) }},
            { typeof(CompanyPart), new string[] { nameof(CompanyPart.CompanyId), nameof(CompanyPart.PartId), nameof(CompanyPart.UnitPrice), nameof(CompanyPart.VendorPartNumber), nameof(CompanyPart.IsPreferred), nameof(CompanyPart.LeadTimeDays), nameof(CompanyPart.CurrencyId) } },
            { typeof(Contact), new string[] { nameof(Contact.FirstName), nameof(Contact.LastName), nameof(Contact.Email), nameof(Contact.PhoneNumber), nameof(Contact.AlternatePhone), nameof(Contact.CompanyId), nameof(Contact.JobTitle) } },
            { typeof(Country), new string[] {nameof(Country.Name), nameof(Country.Iso2Code), nameof(Country.Iso3Code), nameof(Country.NumericCode) } },
            { typeof(Currency), new string[] { nameof(Currency.Code), nameof(Currency.Name), nameof(Currency.Symbol), nameof(Currency.Country), nameof(Currency.MinorUnit) } },
            { typeof(Customer), new string[] {nameof(Customer.Name), nameof(Customer.Description) } },
            { typeof(Document), new string[] { nameof(Document.DocumentType), nameof(Document.EntityType), nameof(Document.EntityId), nameof(Document.FileName), nameof(Document.FilePath), nameof(Document.Title), nameof(Document.Description), nameof(Document.MimeType), nameof(Document.DocumentType), nameof(Document.Tags) } },
            { typeof(Ebom), new string[] { nameof(Ebom.Part), nameof(Ebom.ChildPart)} },
            { typeof(Eco), new string[] { nameof(Eco.Number), nameof(Eco.Name), nameof(Eco.ReasonForChange), nameof(Eco.ChangeType), nameof(Eco.ImpactAnalysis), nameof(Eco.Requestor), nameof(Eco.Approver), nameof(Eco.PlannedImplementationDate), nameof(Eco.ApprovedBy), nameof(Eco.Status) } },
            { typeof(EcoLog), new string[] { nameof(EcoLog.EcoId), nameof(EcoLog.Action), nameof(EcoLog.ActionAt), nameof(EcoLog.ActionBy), nameof(EcoLog.Notes) } },
            { typeof(EcoPart), new string[] { nameof(EcoPart.Status), nameof(EcoPart.Description), nameof(EcoPart.OldVersion), nameof(EcoPart.NewVersion), nameof(EcoPart.EffectiveDate) } },
            { typeof(FeatureBit), new string[] { nameof(FeatureBit.FeatureName), nameof(FeatureBit.ApplicationName) } },
            { typeof(GoodsReceiptNote), new string[] { nameof(GoodsReceiptNote.GrnNumber), nameof(GoodsReceiptNote.PurchaseOrderId), nameof(GoodsReceiptNote.ReceivedDate), nameof(GoodsReceiptNote.ReceivedBy), nameof(GoodsReceiptNote.Description), nameof(GoodsReceiptNote.VendorReferenceId), nameof(GoodsReceiptNote.LocationId), nameof(GoodsReceiptNote.InvoiceNumber), nameof(GoodsReceiptNote.InvoiceDate), nameof(GoodsReceiptNote.ReferenceNumber), nameof(GoodsReceiptNote.Status), nameof(GoodsReceiptNote.VendorId) } },
            { typeof(GrnLineItem), new string[] { nameof(GrnLineItem.GrnId), nameof(GrnLineItem.PartId), nameof(GrnLineItem.ReceivedQuantity), nameof(GrnLineItem.ManufacturingDate), nameof(GrnLineItem.CheckedById), nameof(GrnLineItem.ExpiryDate), nameof(GrnLineItem.QcDate), nameof(GrnLineItem.Remark), nameof(GrnLineItem.TrackingMethod), nameof(GrnLineItem.TrackingId) } },
            { typeof(Guide), new string[] { nameof(Guide.Number), nameof(Guide.Name)} },
            { typeof(GuideCheckOutHistory), new string[] { nameof(GuideCheckOutHistory.GuideId), nameof(GuideCheckOutHistory.IsCheckedOut), nameof(GuideCheckOutHistory.CreatedBy)} },
            { typeof(GuideStep), new string[] { nameof(GuideStep.Title), nameof(GuideStep.Sequence) } },
            { typeof(GuideStepEquipment), new string[] { nameof(GuideStepEquipment.EquipmentType), nameof(GuideStepEquipment.Quantity) } },
            { typeof(GuideStepTask), new string[] { nameof(GuideStepTask.Name), nameof(GuideStepTask.Type) } },
            { typeof(GuideType), new string[] { nameof(GuideType.Name)} },
            { typeof(Image), new string[] { nameof(Image.ImageType), nameof(Image.EntityType), nameof(Image.EntityId), nameof(Image.FileName), nameof(Image.FilePath) } },
            { typeof(InventoryPart), new string[] { nameof(InventoryPart.SkuCode), nameof(InventoryPart.UnitPrice), nameof(InventoryPart.PartId), nameof(InventoryPart.ReorderLevel), nameof(InventoryPart.QtyAvailable), nameof(InventoryPart.QtyOnhand), nameof(InventoryPart.QtyReserved), nameof(InventoryPart.ConsumedQuantity) } },
            { typeof(InventoryStock), new string[] { nameof(InventoryStock.BinId), nameof(InventoryStock.PartId), nameof(InventoryStock.QtyOnhand), nameof(InventoryStock.LocationId), nameof(InventoryStock.TrackingType), nameof(InventoryStock.TrackingId) } },
            { typeof(Department), new string[] { nameof(Department.Code), nameof(Department.Name) } },
            { typeof(InventoryTransaction), new string[] { nameof(InventoryTransaction.ReferenceId), nameof(InventoryTransaction.PartId), nameof(InventoryTransaction.PreviousQuantity), nameof(InventoryTransaction.CurrentQuantity), nameof(InventoryTransaction.TransactedQuantity), nameof(InventoryTransaction.TransactionType), nameof(InventoryTransaction.ReferenceType), nameof(InventoryTransaction.TransactionDate), nameof(InventoryTransaction.Notes), nameof(InventoryTransaction.ToLocationId), nameof(InventoryTransaction.FromLocationId) } },
            { typeof(Issue), new string[] { nameof(Issue.ProjectName), nameof(Issue.IssueType), nameof(Issue.Priority), nameof(Issue.Summary), nameof(Issue.Description), nameof(Issue.ProductId), nameof(Issue.GuideId), nameof(Issue.WorkOrderId), nameof(Issue.JiraId), nameof(Issue.DevopsId) } },
            { typeof(Kit), new string[] { nameof(Kit.Name), nameof(Kit.Number) } },
            { typeof(KitSerial), new string[] { nameof(KitSerial.Serialno), nameof(KitSerial.Status) } },
            { typeof(Location), new string[] { nameof(Location.Number), nameof(Location.Name) } },
            { typeof(Machine), new string[] { nameof(Machine.Number), nameof(Machine.Name) } },
            { typeof(MachineType), new string[] { nameof(MachineType.Name) } },
            { typeof(MaterialKit), new string[] { nameof(MaterialKit.Name), nameof(MaterialKit.Number) } },
            { typeof(Milestone), new string[] { nameof(Milestone.Name), nameof(Milestone.Description), nameof(Milestone.ProjectId), nameof(Milestone.TargetDate), nameof(Milestone.Status) } },
            { typeof(News), new string[] { nameof(News.Title) } },
            { typeof(NewsType), new string[] { nameof(NewsType.Name) } },
            { typeof(Organization), new string[] { nameof(Organization.Name), nameof(Organization.Category), nameof(Organization.ImageUrl), nameof(Organization.TaxNumber) } },
            { typeof(OrganizationAddress), new string[] { nameof(OrganizationAddress.OrganizationId), nameof(OrganizationAddress.AddressId), nameof(OrganizationAddress.AddressType) } },
            { typeof(OptionSet), new string[] {nameof(OptionSet.Name), nameof(OptionSet.ApplicationName) } },
            { typeof(Part), new string[] { nameof(Part.Name), nameof(Part.Description), nameof(Part.PartNumberSuffix), nameof(Part.PartNumber), nameof(Part.UnitPrice), nameof(Part.CreatedAt), nameof(Part.ItemType), nameof(Part.ReferenceNumber), nameof(Part.ManufacturerName), nameof(Part.Trl), nameof(Part.SpaceQualified), nameof(Part.CountryOfOriginId), nameof(Part.ManufacturingPartNumber), nameof(Part.IsSerialNumberRequired), nameof(Part.Status), nameof(Part.MakeBuy), nameof(Part.Grade), nameof(Part.Package), nameof(Part.Specification), nameof(Part.Qualification), nameof(Part.RadiationTolerance), nameof(Part.TempCoefficient), nameof(Part.TempRange)} },
            { typeof(PartType), new string[] { nameof(PartType.Name), nameof(PartType.PartNumberPrefix), nameof(PartType.Category), nameof(PartType.CategoryType), nameof(PartType.IsVisibleInUi), nameof(PartType.PartTypeCategoryId), nameof(PartType.Department), nameof(PartType.PartLevelId) } },
            { typeof(PartTypeCategory), new string[] { nameof(PartTypeCategory.Name), nameof(PartTypeCategory.Description) } },
            { typeof(PartLevel), new string[] { nameof(PartLevel.Code), nameof(PartLevel.Name), nameof(PartLevel.Description), nameof(PartLevel.SortOrder) } },
            { typeof(PaymentTerm), new string[] { nameof(PaymentTerm.Name), nameof(PaymentTerm.Description), nameof(PaymentTerm.DueDays), nameof(PaymentTerm.DiscountDays), nameof(PaymentTerm.DiscountPercent), nameof(PaymentTerm.PaymentTerms), nameof(PaymentTerm.PaymentTermType) } },
            { typeof(Permission), new string[] { nameof(Permission.Name), nameof(Permission.CategoryName) } },
            { typeof(Platform), new string[] { nameof(Platform.Code) , nameof(Platform.Name) } },
            { typeof(PoLineItem), new string[] { nameof(PoLineItem.PurchaseOrderId), nameof(PoLineItem.PartId), nameof(PoLineItem.OrderedQuantity), nameof(PoLineItem.ReceivedQuantity), nameof(PoLineItem.PendingQuantity), nameof(PoLineItem.UnitPrice), nameof(PoLineItem.TotalPrice), nameof(PoLineItem.Tax), nameof(PoLineItem.Description), nameof(PoLineItem.Hsn), nameof(PoLineItem.Discount), nameof(PoLineItem.DiscountType) } },
            { typeof(Product), new string[] { nameof(Product.Name), nameof(Product.Number) } },
            { typeof(Program), new string[] { nameof(Program.ProgramCode), nameof(Program.Name), nameof(Program.Description), nameof(Program.StartDate), nameof(Program.EndDate), nameof(Program.CustomerId), nameof(Program.ProgramManagerId), nameof(Program.SupplyChainManagerId), nameof(Program.BuyerId), nameof(Program.Status) } },
            { typeof(Project), new string[] { nameof(Project.ProjectCode), nameof(Project.Name), nameof(Project.Description), nameof(Project.ProgramId), nameof(Project.ProjectManagerId), nameof(Project.StartDate), nameof(Project.EndDate), nameof(Project.Status), nameof(Project.Budget) } },
            { typeof(PurchaseOrder), new string[] {nameof(PurchaseOrder.Number), nameof(PurchaseOrder.CompanyId), nameof(PurchaseOrder.OrderDate), nameof(PurchaseOrder.Status), nameof(PurchaseOrder.TotalAmount), nameof(PurchaseOrder.ProjectId), nameof(PurchaseOrder.PoType), nameof(PurchaseOrder.BuyerId), nameof(PurchaseOrder.SupplyChainLeadId), nameof(PurchaseOrder.RequisitionId), nameof(PurchaseOrder.PaymentTermId), nameof(PurchaseOrder.CurrencyId), nameof(PurchaseOrder.ActualDeliveryDate), nameof(PurchaseOrder.ExpectedDeliveryDate), nameof(PurchaseOrder.RevisionHistory), nameof(PurchaseOrder.BillingAddressId), nameof(PurchaseOrder.DeliveryAddressId), nameof(PurchaseOrder.ShippingAddressId), nameof(PurchaseOrder.DeliveryStatus), nameof(PurchaseOrder.QuotationReferenceId), nameof(PurchaseOrder.PoTerms) } },
            { typeof(Requisition), new string[] { nameof(Requisition.ReqNumber), nameof(Requisition.RequestedById), nameof(Requisition.RequestDate), nameof(Requisition.Title), nameof(Requisition.ProjectId), nameof(Requisition.RequiredByDate), nameof(Requisition.Justification), nameof(Requisition.Priority), nameof(Requisition.Status), nameof(Requisition.TotalEstimatedAmount), nameof(Requisition.ApprovedBy), nameof(Requisition.RejectedBy), nameof(Requisition.ApproverComment) } },
            { typeof(RequisitionLineItem), new string[] { nameof(RequisitionLineItem.RequisitionId), nameof(RequisitionLineItem.PartId), nameof(RequisitionLineItem.Quantity), nameof(RequisitionLineItem.Description) } },
            { typeof(Role), new string[] { nameof(Role.RoleName), nameof(Role.AppId) } },
            { typeof(RoleFilter), new string[] { nameof(RoleFilter.RoleId), nameof(RoleFilter.Entity), nameof(RoleFilter.Key), nameof(RoleFilter.Operator), nameof(RoleFilter.Value) } },
            { typeof(RolePermission), new string[] { nameof(RolePermission.RoleId), nameof(RolePermission.Permission), nameof(RolePermission.Enable) } },
            { typeof(ScrapLineItem), new string[] { nameof(ScrapLineItem.TrackingType), nameof(ScrapLineItem.TrackingId), nameof(ScrapLineItem.ScrapQuantity), nameof(ScrapLineItem.Reason) } },
            { typeof(ScrapRequest), new string[] { nameof(ScrapRequest.ScrapNumber), nameof(ScrapRequest.ScrapDate), nameof(ScrapRequest.Reason), nameof(ScrapRequest.Status) } },
            { typeof(StockMovement), new string[] { nameof(StockMovement.MovementNumber), nameof(StockMovement.MovementType), nameof(StockMovement.MovementReason), nameof(StockMovement.MovementDate), nameof(StockMovement.Status), nameof(StockMovement.ExpectedReturnDate), nameof(StockMovement.ProjectDate), nameof(StockMovement.ProjectId), nameof(StockMovement.Department) } },
            { typeof(StockMovementLineItem), new string[] { nameof(StockMovementLineItem.StockMovementId), nameof(StockMovementLineItem.PartId), nameof(StockMovementLineItem.Quantity), nameof(StockMovementLineItem.TrackingType), nameof(StockMovementLineItem.TrackingId) } },
            { typeof(Staff), new string[] { nameof(Staff.FirstName), nameof(Staff.LastName), nameof(Staff.Email), nameof(Staff.Organization), nameof(Staff.Manager), nameof(Staff.StaffNumber), nameof(Staff.JobTitle), nameof(Staff.Phone), nameof(Staff.ImageUrl) } },
            { typeof(Subsystem), new string[] { nameof(Subsystem.Code), nameof(Subsystem.Name), nameof(Subsystem.Description) } },
            { typeof(Task), new string[] { nameof(SpaceLinx.Model.Task.Name), nameof(SpaceLinx.Model.Task.Description), nameof(SpaceLinx.Model.Task.ProjectId), nameof(SpaceLinx.Model.Task.AssignedToId), nameof(Task.Status), nameof(SpaceLinx.Model.Task.DueDate), nameof(SpaceLinx.Model.Task.Priority), nameof(SpaceLinx.Model.Task.MilestoneId), nameof(SpaceLinx.Model.Task.TaskCode), nameof(SpaceLinx.Model.Task.ParentTaskId), nameof(SpaceLinx.Model.Task.StartDate), nameof(SpaceLinx.Model.Task.EstimatedHours), nameof(SpaceLinx.Model.Task.ActualHours), nameof(SpaceLinx.Model.Task.ProgressPercent), nameof(SpaceLinx.Model.Task.TaskType), nameof(SpaceLinx.Model.Task.SortOrder), nameof(SpaceLinx.Model.Task.BoardColumnId) } },
            { typeof(TaskDependency), new string[] { nameof(TaskDependency.PredecessorTaskId), nameof(TaskDependency.SuccessorTaskId), nameof(TaskDependency.DependencyType), nameof(TaskDependency.LagDays) } },
            { typeof(TaskAssignee), new string[] { nameof(TaskAssignee.TaskId), nameof(TaskAssignee.UserId), nameof(TaskAssignee.AssigneeRole), nameof(TaskAssignee.AssignedAt) } },
            { typeof(TaskComment), new string[] { nameof(TaskComment.TaskId), nameof(TaskComment.ParentCommentId), nameof(TaskComment.Content), nameof(TaskComment.Mentions) } },
            { typeof(TaskActivity), new string[] { nameof(TaskActivity.TaskId), nameof(TaskActivity.ActivityType), nameof(TaskActivity.FieldChanged), nameof(TaskActivity.OldValue), nameof(TaskActivity.NewValue), nameof(TaskActivity.Description) } },
            { typeof(BoardColumn), new string[] { nameof(BoardColumn.ProjectId), nameof(BoardColumn.Name), nameof(BoardColumn.Position), nameof(BoardColumn.Color), nameof(BoardColumn.WipLimit), nameof(BoardColumn.IsDefault), nameof(BoardColumn.MapsToStatus) } },
            { typeof(TimeEntry), new string[] { nameof(TimeEntry.TaskId), nameof(TimeEntry.UserId), nameof(TimeEntry.EntryDate), nameof(TimeEntry.HoursWorked), nameof(TimeEntry.Billable), nameof(TimeEntry.WorkType) } },
            { typeof(Tool), new string[] { nameof(Tool.Number), nameof(Tool.Name) } },
            { typeof(ToolType), new string[] { nameof(ToolType.Name) } },
            { typeof(UnitOfMeasure), new string[] { nameof(UnitOfMeasure.Name) } },
            { typeof(User), new string[] { nameof(User.FirstName), nameof(User.LastName), nameof(User.Email) } },
            { typeof(UserRole), new string[] { nameof(UserRole.UserId), nameof(UserRole.RoleId) } },
            { typeof(VendorReturnRequest), new string[] { nameof(VendorReturnRequest.ReturnDate), nameof(VendorReturnRequest.Reason), nameof(VendorReturnRequest.Status) } },
            { typeof(VendorReturnLineItem), new string[] { nameof(VendorReturnLineItem.TrackingType), nameof(VendorReturnLineItem.TrackingId), nameof(VendorReturnLineItem.Reason), nameof(VendorReturnLineItem.ReturnQuantity) } },
            { typeof(Video), new string[] { nameof(Video.VideoType), nameof(Video.EntityType), nameof(Video.EntityId), nameof(Video.FileName), nameof(Video.FilePath) } },
            { typeof(WorkOrder), new string[] { nameof(WorkOrder.Name),nameof(WorkOrder.Number),nameof(WorkOrder.Status) }},
            { typeof(WorkPackage), new string[] { nameof(WorkPackage.Name),nameof(WorkPackage.Number),nameof(WorkPackage.Quantity) }},
            { typeof(WorkOrderTask), new string[] { nameof(WorkOrderTask.WorkOrderId),nameof(WorkOrderTask.WorkOrderStepId),nameof(WorkOrderTask.GuideStepTaskId) }},
            { typeof(Tender), new string[] { nameof(Tender.TenderNumber), nameof(Tender.Title), nameof(Tender.Status), nameof(Tender.ClosingDate), nameof(Tender.RequisitionId), nameof(Tender.ProjectId), nameof(Tender.BuyerId), nameof(Tender.AwardedVendorId) } },
            { typeof(TenderLineItem), new string[] { nameof(TenderLineItem.TenderId), nameof(TenderLineItem.PartId), nameof(TenderLineItem.Quantity), nameof(TenderLineItem.LineNumber) } },
            { typeof(TenderVendor), new string[] { nameof(TenderVendor.TenderId), nameof(TenderVendor.CompanyId), nameof(TenderVendor.Status), nameof(TenderVendor.InvitedDate) } },
            { typeof(TenderQuotation), new string[] { nameof(TenderQuotation.TenderId), nameof(TenderQuotation.CompanyId), nameof(TenderQuotation.QuotationNumber), nameof(TenderQuotation.TotalAmount), nameof(TenderQuotation.IsSelected), nameof(TenderQuotation.QuotationDate) } },
            { typeof(TenderQuotationLineItem), new string[] { nameof(TenderQuotationLineItem.TenderQuotationId), nameof(TenderQuotationLineItem.TenderLineItemId), nameof(TenderQuotationLineItem.UnitPrice), nameof(TenderQuotationLineItem.Quantity), nameof(TenderQuotationLineItem.TotalPrice) } },
        };
}

public class SpaceLinxEnums
{
    public enum MakeBuyEnum
    {
        Make = 0,
        Buy = 1
    }
}

public static class ApprovalStatus
{
    public const string Pending = "Pending";
    public const string Approved = "Approved";
    public const string Rejected = "Rejected";
    public const string Cancelled = "Cancelled";
    public const string Removed = "Removed";
}

public static class AdjustmentType
{
    public const string Increase = "Increase";
    public const string Decrease = "Decrease";
}

public class PartStatus
{
    public const string Draft = "Draft";
    public const string Release = "Release";
    public const string Obsolete = "Obsolete";
    public const string Archived = "Archived";
}

public class EcoPartStatus
{
    public const string Release = "Release";
    public const string Obsolete = "Obsolete";
}

public class EcoStatus
{
    public const string Draft = "Draft";
    public const string Submitted = "Submitted";
    public const string Approved = "Approved";
    public const string Discarded = "Discarded";
    public const string Rejected = "Rejected";
    public const string Released = "Released";
}

public class PoStatus
{
    public const string Draft = "Draft";
    public const string Submitted = "Submitted";
    public const string Rejected = "Rejected";
    public const string Issued = "Issued";
    public const string PartiallyDelivered = "Partially Delivered";
    public const string Delivered = "Delivered";
    public const string Closed = "Closed";
    public const string Cancelled = "Cancelled";
}
    
public class RequisitionStatus
{
    public const string Draft = "Draft";
    public const string Submitted = "Submitted";
    public const string Approved = "Approved";
    public const string Rejected = "Rejected";
    public const string Cancelled = "Cancelled";
    public const string PoCreated = "PoCreated";
}

public class ScrapRequestStatus
{
    public const string Submitted = "Submitted";
    public const string Approved = "Approved";
    public const string Rejected = "Rejected";
}

public class GrnStatus
{
    public const string InProcess = "In Process";
    public const string QualityChecked = "Quality Checked";
    public const string Rejected = "Rejected";
    public const string PartiallyCompleted = "Partially Completed";
    public const string Completed = "Completed";
    public const string Closed = "Closed";
}

public class GrnLineItemStatus
{
    public const string Pending = "Pending";
    public const string Pass = "Pass";
    public const string Fail = "Fail";
    public const string Accepted = "Accepted";
}

public class TenderStatus
{
    public const string Draft = "Draft";
    public const string Submitted = "Submitted";
    public const string Published = "Published";
    public const string Closed = "Closed";
    public const string Awarded = "Awarded";
    public const string Cancelled = "Cancelled";
}

public class TenderVendorStatus
{
    public const string Invited = "Invited";
    public const string Responded = "Responded";
    public const string NoResponse = "NoResponse";
    public const string Declined = "Declined";
}

public class VendorReturnRequestStatus
{
    public const string Submitted = "Submitted";
    public const string Approved = "Approved";
    public const string Rejected = "Rejected";
}

public class SpaceLinxEntities
{
    public const string Part = "Part";
    public const string GuideStep = "GuideStep";
    public const string MaterialKit = "MaterialKit";
    public const string Product = "Product";
    public const string WorkOrderTask = "WorkOrderTask";
    public const string Staff = "Staff";
    public const string Organization = "Organization";
    public const string PurchaseOrder = "PurchaseOrder";
    public const string GoodsReceiptNote = "GoodsReceiptNote";
    public const string Eco = "Eco";
    public const string VendorReturnRequest = "VendorReturnRequest";
    public const string ScrapRequest = "ScrapRequest";
    public const string Requisition = "Requisition";
    public const string Tender = "Tender";
    public const string InventoryPart = "InventoryPart";
}

public class BomDefaults
{
    public const int MaxBomLevel = 3;
}

public static class EmailStatus
{
    public const string Pending = "Pending";
    public const string Sent = "Sent";
    public const string Failed = "Failed";
}

public static class EmailTemplateCode
{
    // ECO templates
    public const string EcoSubmitted = "ECO_SUBMITTED";
    public const string EcoApproved = "ECO_APPROVED";
    public const string EcoRejected = "ECO_REJECTED";
    public const string EcoReleased = "ECO_RELEASED";
    public const string InventoryReorderAlert = "INVENTORY_REORDER";

    // Requisition templates
    public const string RequisitionSubmitted = "REQUISITION_SUBMITTED";
    public const string RequisitionApproved = "REQUISITION_APPROVED";
    public const string RequisitionRejected = "REQUISITION_REJECTED";
    public const string RequisitionStageApproved = "REQUISITION_STAGE_APPROVED";

    // Purchase Order templates
    public const string PoSubmitted = "PO_SUBMITTED";
    public const string PoApproved = "PO_APPROVED";
    public const string PoRejected = "PO_REJECTED";
    public const string PoStageApproved = "PO_STAGE_APPROVED";

    // Tender templates
    public const string TenderSubmitted = "TENDER_SUBMITTED";
    public const string TenderApproved = "TENDER_APPROVED";
    public const string TenderRejected = "TENDER_REJECTED";
    public const string TenderStageApproved = "TENDER_STAGE_APPROVED";
    public const string TenderPublished = "TENDER_PUBLISHED";
    public const string TenderAwarded = "TENDER_AWARDED";
}

public static class ApprovalAction
{
    public const string Submitted = "Submitted";
    public const string StageApproved = "StageApproved";
    public const string FullyApproved = "FullyApproved";
    public const string Rejected = "Rejected";
    public const string ResetToDraft = "ResetToDraft";
}

public static class NotificationRecipientType
{
    public const string CC = "CC";
    public const string Watcher = "Watcher";
    public const string Stakeholder = "Stakeholder";
}

public static class StockMovementStatus
{
    public const string Draft = "Draft";
    public const string Submitted = "Submitted";
    public const string PendingApproval = "PendingApproval";
    public const string Approved = "Approved";
    public const string Rejected = "Rejected";
    public const string Cancelled = "Cancelled";
}

public static class StockMovementType
{
    public const string Transfer = "Transfer";
    public const string Adjustment = "Adjustment";
    public const string Issued = "Issued";
    public const string Reserved = "Reserved";
    public const string Consumed = "Consumed";
    public const string VendorReturn = "VendorReturn";
    public const string Scrap = "Scrap";
}

public static class StockMovementReason
{
    // Transfer reasons
    public const string LocationRebalance = "LocationRebalance";
    public const string BinConsolidation = "BinConsolidation";
    public const string WarehouseTransfer = "WarehouseTransfer";
    public const string RequestedTransfer = "RequestedTransfer";

    // Adjustment reasons
    public const string CycleCount = "CycleCount";
    public const string DamagedGoods = "DamagedGoods";
    public const string Discrepancy = "Discrepancy";
    public const string Expiry = "Expiry";
    public const string QualityHold = "QualityHold";
    public const string Found = "Found";
    public const string Lost = "Lost";

    // Issue reasons
    public const string WorkOrderConsumption = "WorkOrderConsumption";
    public const string InternalUse = "InternalUse";
    public const string RnD = "RnD";
    public const string Prototype = "Prototype";
    public const string CustomerSample = "CustomerSample";
}
