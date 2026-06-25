using AutoMapper;

namespace SpaceLinx.Model;

public class SpaceLinxAutoMapperProfile : Profile
{
    public SpaceLinxAutoMapperProfile()
    {
        //Address
        CreateMap<Address, AddressReadModel>();
        CreateMap<Address, AddressRefModel>();
        CreateMap<AddressWriteModel, Address>();
        CreateMap<AddressUpdateModel, Address>();

        //App
        CreateMap<App, AppReadModel>();
        CreateMap<App, AppRefModel>();
        CreateMap<AppWriteModel, App>();
        CreateMap<AppUpdateModel, App>();

        //Approval
        CreateMap<Approval, ApprovalReadModel>();
        CreateMap<Approval, ApprovalRefModel>();
        CreateMap<ApprovalWriteModel, Approval>();
        CreateMap<ApprovalUpdateModel, Approval>();

        //ApprovalConfiguration
        CreateMap<ApprovalConfiguration, ApprovalConfigurationReadModel>();
        CreateMap<ApprovalConfiguration, ApprovalConfigurationRefModel>();
        CreateMap<ApprovalConfigurationWriteModel, ApprovalConfiguration>();
        CreateMap<ApprovalConfigurationUpdateModel, ApprovalConfiguration>();

        //ApprovalLog
        CreateMap<ApprovalLog, ApprovalLogReadModel>();
        CreateMap<ApprovalLog, ApprovalLogRefModel>();
        CreateMap<ApprovalLogWriteModel, ApprovalLog>();

        //ApprovalNotificationRecipient
        CreateMap<ApprovalNotificationRecipient, ApprovalNotificationRecipientReadModel>();
        CreateMap<ApprovalNotificationRecipient, ApprovalNotificationRecipientRefModel>();
        CreateMap<ApprovalNotificationRecipientWriteModel, ApprovalNotificationRecipient>();

        //AdditionalRecipientConfiguration
        CreateMap<AdditionalRecipientConfiguration, AdditionalRecipientConfigurationReadModel>();
        CreateMap<AdditionalRecipientConfiguration, AdditionalRecipientConfigurationRefModel>();
        CreateMap<AdditionalRecipientConfigurationWriteModel, AdditionalRecipientConfiguration>();
        CreateMap<AdditionalRecipientConfigurationUpdateModel, AdditionalRecipientConfiguration>();

        //AssemblyLocation
        CreateMap<AssemblyLocation, AssemblyLocationReadModel>();
        CreateMap<AssemblyLocation, AssemblyLocationRefModel>();
        CreateMap<AssemblyLocationWriteModel, AssemblyLocation>();
        CreateMap<AssemblyLocationUpdateModel, AssemblyLocation>();
        CreateMap<AssemblyLocation, AssemblyLocationDetailReadModel>();

        //BankAccount
        CreateMap<BankAccount, BankAccountReadModel>();
        CreateMap<BankAccount, BankAccountRefModel>();
        CreateMap<BankAccountWriteModel, BankAccount>();
        CreateMap<BankAccountUpdateModel, BankAccount>();

        //BinManagement
        CreateMap<BinManagement, BinManagementReadModel>();
        CreateMap<BinManagement, BinManagementRefModel>();
        CreateMap<BinManagementWriteModel, BinManagement>();
        CreateMap<BinManagementUpdateModel, BinManagement>();

        //BulkUpload
        CreateMap<BulkUpload, BulkUploadReadModel>();
        CreateMap<BulkUpload, BulkUploadRefModel>();
        CreateMap<BulkUploadWriteModel, BulkUpload>();
        CreateMap<BulkUploadUpdateModel, BulkUpload>();

        //Company
        CreateMap<Company, CompanyReadModel>();
        CreateMap<Company, CompanyRefModel>();
        CreateMap<CompanyWriteModel, Company>();
        CreateMap<CompanyUpdateModel, Company>();

        //CompanyAddress
        CreateMap<CompanyAddress, CompanyAddressReadModel>();
        CreateMap<CompanyAddress, CompanyAddressRefModel>();
        CreateMap<CompanyAddressWriteModel, CompanyAddress>();
        CreateMap<CompanyAddressUpdateModel, CompanyAddress>();

        //CompanyBankAccount
        CreateMap<CompanyBankAccount, CompanyBankAccountReadModel>();
        CreateMap<CompanyBankAccount, CompanyBankAccountRefModel>();
        CreateMap<CompanyBankAccountWriteModel, CompanyBankAccount>();
        CreateMap<CompanyBankAccountUpdateModel, CompanyBankAccount>();

        //CompanyContact
        CreateMap<CompanyContact, CompanyContactReadModel>();
        CreateMap<CompanyContact, CompanyContactRefModel>();
        CreateMap<CompanyContactWriteModel, CompanyContact>();
        CreateMap<CompanyContactUpdateModel, CompanyContact>();

        //CompanyPart
        CreateMap<CompanyPart, CompanyPartReadModel>();
        CreateMap<CompanyPart, CompanyPartRefModel>();
        CreateMap<CompanyPartWriteModel, CompanyPart>();
        CreateMap<CompanyPartUpdateModel, CompanyPart>();

        //Contact
        CreateMap<Contact, ContactReadModel>();
        CreateMap<Contact, ContactRefModel>();
        CreateMap<ContactWriteModel, Contact>();
        CreateMap<ContactUpdateModel, Contact>();

        //Country
        CreateMap<Country, CountryReadModel>();
        CreateMap<Country, CountryRefModel>();
        CreateMap<CountryWriteModel, Country>();
        CreateMap<CountryUpdateModel, Country>();

        //Currency
        CreateMap<Currency, CurrencyReadModel>();
        CreateMap<Currency, CurrencyRefModel>();
        CreateMap<CurrencyWriteModel, Currency>();
        CreateMap<CurrencyUpdateModel, Currency>();

        //Customer
        CreateMap<Customer, CustomerReadModel>();
        CreateMap<Customer, CustomerRefModel>();
        CreateMap<CustomerWriteModel, Customer>();
        CreateMap<CustomerUpdateModel, Customer>();

        //Department
        CreateMap<Department, DepartmentReadModel>()
            .ForMember(d => d.ParentDepartment, opt => opt.MapFrom(s => s.ParentDepartment))
            .ForMember(d => d.HeadOfDepartmentUser, opt => opt.MapFrom(s => s.HeadOfDepartmentUser));
        CreateMap<Department, DepartmentRefModel>();
        CreateMap<DepartmentWriteModel, Department>();
        CreateMap<DepartmentUpdateModel, Department>();

        //Document
        CreateMap<Document, DocumentReadModel>();
        CreateMap<Document, DocumentRefModel>();
        CreateMap<DocumentWriteModel, Document>();
        CreateMap<DocumentUpdateModel, Document>();

        //Ebom
        CreateMap<Ebom, EbomReadModel>();
        CreateMap<Ebom, EbomRefModel>();
        CreateMap<EbomWriteModel, Ebom>();
        CreateMap<EbomUpdateModel, Ebom>();

        //Eco
        CreateMap<Eco, EcoReadModel>();
        CreateMap<Eco, EcoRefModel>();
        CreateMap<EcoWriteModel, Eco>();
        CreateMap<EcoUpdateModel, Eco>();

        //EcoLog
        CreateMap<EcoLog, EcoLogReadModel>();
        CreateMap<EcoLog, EcoLogRefModel>();
        CreateMap<EcoLogWriteModel, EcoLog>();
        CreateMap<EcoLogUpdateModel, EcoLog>();

        //EcoPart
        CreateMap<EcoPart, EcoPartReadModel>();
        CreateMap<EcoPart, EcoPartRefModel>();
        CreateMap<EcoPartWriteModel, EcoPart>();
        CreateMap<EcoPartUpdateModel, EcoPart>();

        //EmailLog
        CreateMap<EmailLog, EmailLogReadModel>();
        CreateMap<EmailLog, EmailLogRefModel>();

        //EmailTemplate
        CreateMap<EmailTemplate, EmailTemplateReadModel>();
        CreateMap<EmailTemplate, EmailTemplateRefModel>();
        CreateMap<EmailTemplateWriteModel, EmailTemplate>();
        CreateMap<EmailTemplateUpdateModel, EmailTemplate>();

        //FeatureBit
        CreateMap<FeatureBit, FeatureBitReadModel>();
        CreateMap<FeatureBit, FeatureBitRefModel>();
        CreateMap<FeatureBitWriteModel, FeatureBit>();
        CreateMap<FeatureBitUpdateModel, FeatureBit>();

        //GoodsReceiptNote
        CreateMap<GoodsReceiptNote, GoodsReceiptNoteReadModel>();
        CreateMap<GoodsReceiptNote, GoodsReceiptNoteRefModel>();
        CreateMap<GoodsReceiptNoteWriteModel, GoodsReceiptNote>();
        CreateMap<GoodsReceiptNoteUpdateModel, GoodsReceiptNote>();
        CreateMap<GoodsReceiptNote, GoodsReceiptNoteDetailsReadModel>();

        //GrnLineItem
        CreateMap<GrnLineItem, GrnLineItemReadModel>();
        CreateMap<GrnLineItem, GrnLineItemRefModel>();
        CreateMap<GrnLineItemWriteModel, GrnLineItem>();
        CreateMap<GrnLineItemUpdateModel, GrnLineItem>();
        CreateMap<GrnLineItem, GrnLineItemDetailReadModel>()
            .ForMember(dest => dest.OrderedQuantity, opt => opt.MapFrom(src => src.PoLineItem != null ? src.PoLineItem.OrderedQuantity : (int?)null));
        
        //Guide
        CreateMap<Guide, GuideDetailReadModel>();
        CreateMap<Guide, GuideReadModel>();
        CreateMap<Guide, GuideRefModel>();
        CreateMap<GuideWriteModel, Guide>();
        CreateMap<GuideUpdateModel, Guide>();

        //GuideCheckoutHistory
        CreateMap<GuideCheckOutHistory, GuideCheckOutHistoryReadModel>();
        CreateMap<GuideCheckOutHistory, GuideCheckOutHistoryRefModel>();
        CreateMap<GuideCheckOutHistoryWriteModel, GuideCheckOutHistory>();
        CreateMap<GuideCheckOutHistoryUpdateModel, GuideCheckOutHistory>();

        //GuideStep
        CreateMap<GuideStep, GuideStepReadModel>();
        CreateMap<GuideStep, GuideStepRefModel>();
        CreateMap<GuideStepWriteModel, GuideStep>();
        CreateMap<GuideStepUpdateModel, GuideStep>();

        //GuideStepEquipment
        CreateMap<GuideStepEquipment, GuideStepEquipmentReadModel>();
        CreateMap<GuideStepEquipment, GuideStepEquipmentRefModel>();
        CreateMap<GuideStepEquipmentWriteModel, GuideStepEquipment>();
        CreateMap<GuideStepEquipmentUpdateModel, GuideStepEquipment>();

        //GuideStepTask
        CreateMap<GuideStepTask, GuideStepTaskReadModel>();
        CreateMap<GuideStepTask, GuideStepTaskRefModel>();
        CreateMap<GuideStepTaskWriteModel, GuideStepTask>();
        CreateMap<GuideStepTaskUpdateModel, GuideStepTask>();

        //GuideType
        CreateMap<GuideType, GuideTypeReadModel>();
        CreateMap<GuideType, GuideTypeRefModel>();
        CreateMap<GuideTypeWriteModel, GuideType>();
        CreateMap<GuideTypeUpdateModel, GuideType>();

        //Image
        CreateMap<Image, ImageReadModel>();
        CreateMap<Image, ImageRefModel>();
        CreateMap<ImageWriteModel, Image>();
        CreateMap<ImageUpdateModel, Image>();

        //InventoryPart
        CreateMap<InventoryPart, InventoryPartReadModel>();
        CreateMap<InventoryPart, InventoryPartRefModel>();
        CreateMap<InventoryPartWriteModel, InventoryPart>();
        CreateMap<InventoryPartUpdateModel, InventoryPart>();

        //InventoryStock
        CreateMap<InventoryStock, InventoryStockReadModel>();
        CreateMap<InventoryStock, InventoryStockRefModel>();
        CreateMap<InventoryStockWriteModel, InventoryStock>();
        CreateMap<InventoryStockUpdateModel, InventoryStock>();

        //InventoryTransaction
        CreateMap<InventoryTransaction, InventoryTransactionReadModel>();
        CreateMap<InventoryTransaction, InventoryTransactionRefModel>();
        CreateMap<InventoryTransactionWriteModel, InventoryTransaction>();
        CreateMap<InventoryTransactionUpdateModel, InventoryTransaction>();

        //Issue
        CreateMap<Issue, IssueReadModel>();
        CreateMap<Issue, IssueRefModel>();
        CreateMap<IssueWriteModel, Issue>();
        CreateMap<IssueUpdateModel, Issue>();

        //Kit
        CreateMap<Kit, KitReadModel>();
        CreateMap<Kit, KitRefModel>();
        CreateMap<KitWriteModel, Kit>();
        CreateMap<KitUpdateModel, Kit>();

        //Kitbom
        CreateMap<KitBomComment, KitBomCommentReadModel>();
        CreateMap<KitBomComment, KitBomCommentRefModel>();
        CreateMap<KitBomCommentWriteModel, KitBomComment>();
        CreateMap<KitBomCommentUpdateModel, KitBomComment>();

        //Kitserial
        CreateMap<KitSerial, KitSerialReadModel>();
        CreateMap<KitSerial, KitSerialRefModel>();
        CreateMap<KitSerialWriteModel, KitSerial>();
        CreateMap<KitSerialUpdateModel, KitSerial>();

        //Location
        CreateMap<Location, LocationReadModel>();
        CreateMap<Location, LocationRefModel>();
        CreateMap<LocationWriteModel, Location>();
        CreateMap<LocationUpdateModel, Location>();

        //Machine
        CreateMap<Machine, MachineReadModel>();
        CreateMap<Machine, MachineRefModel>();
        CreateMap<MachineWriteModel, Machine>();
        CreateMap<MachineUpdateModel, Machine>();

        //MachineType
        CreateMap<MachineType, MachineTypeReadModel>();
        CreateMap<MachineType, MachineTypeRefModel>();
        CreateMap<MachineTypeWriteModel, MachineType>();
        CreateMap<MachineTypeUpdateModel, MachineType>();

        //MaterialKit
        CreateMap<MaterialKit, MaterialKitReadModel>();
        CreateMap<MaterialKit, MaterialKitRefModel>();
        CreateMap<MaterialKitWriteModel, MaterialKit>();
        CreateMap<MaterialKitUpdateModel, MaterialKit>();

        //Milestone
        CreateMap<Milestone, MilestoneReadModel>();
        CreateMap<Milestone, MilestoneRefModel>();
        CreateMap<MilestoneWriteModel, Milestone>();
        CreateMap<MilestoneUpdateModel, Milestone>();

        //News
        CreateMap<News, NewsReadModel>();
        CreateMap<News, NewsRefModel>();
        CreateMap<NewsWriteModel, News>();
        CreateMap<NewsUpdateModel, News>();

        //NewsType
        CreateMap<NewsType, NewsTypeReadModel>();
        CreateMap<NewsType, NewsTypeRefModel>();
        CreateMap<NewsTypeWriteModel, NewsType>();
        CreateMap<NewsTypeUpdateModel, NewsType>();

        //OptionSet
        CreateMap<OptionSet, OptionSetReadModel>();
        CreateMap<OptionSet, OptionSetRefModel>();
        CreateMap<OptionSetWriteModel, OptionSet>();
        CreateMap<OptionSetUpdateModel, OptionSet>();

        //Organization
        CreateMap<Organization, OrganizationReadModel>();
        CreateMap<Organization, OrganizationRefModel>();
        CreateMap<OrganizationWriteModel, Organization>();
        CreateMap<OrganizationUpdateModel, Organization>();

        //OrganizationAddress
        CreateMap<OrganizationAddress, OrganizationAddressReadModel>();
        CreateMap<OrganizationAddress, OrganizationAddressRefModel>();
        CreateMap<OrganizationAddressWriteModel, OrganizationAddress>();
        CreateMap<OrganizationAddressUpdateModel, OrganizationAddress>();

        //Part
        CreateMap<Part, PartReadModel>();
        CreateMap<Part, PartRefModel>();
        CreateMap<PartWriteModel, Part>();
        CreateMap<PartUpdateModel, Part>();
        CreateMap<Part, PartDetailReadModel>()
            .ForMember(dest => dest.PartTypeCategory, opt => opt.MapFrom(src => src.PartType.Category))
            .ForMember(dest => dest.CountryOfOriginName, opt => opt.MapFrom(src => src.CountryOfOrigin.Name))
            .ForMember(dest => dest.SubsystemName, opt => opt.MapFrom(src => src.Subsystem != null ? src.Subsystem.Name : null))
            .ForMember(dest => dest.PartLevelName, opt => opt.MapFrom(src => src.PartType != null && src.PartType.PartLevel != null ? src.PartType.PartLevel.Name : null));

        // Part Type
        CreateMap<PartType, PartTypeReadModel>();
        CreateMap<PartType, PartTypeRefModel>();
        CreateMap<PartTypeWriteModel, PartType>();
        CreateMap<PartTypeUpdateModel, PartType>();

        // PartType Category
        CreateMap<PartTypeCategory, PartTypeCategoryReadModel>();
        CreateMap<PartTypeCategory, PartTypeCategoryRefModel>();
        CreateMap<PartTypeCategoryWriteModel, PartTypeCategory>();
        CreateMap<PartTypeCategoryUpdateModel, PartTypeCategory>();

        //PartLevel
        CreateMap<PartLevel, PartLevelReadModel>();
        CreateMap<PartLevel, PartLevelRefModel>();
        CreateMap<PartLevelWriteModel, PartLevel>();
        CreateMap<PartLevelUpdateModel, PartLevel>();

        //PaymentTerm
        CreateMap<PaymentTerm, PaymentTermReadModel>();
        CreateMap<PaymentTerm, PaymentTermRefModel>();
        CreateMap<PaymentTermWriteModel, PaymentTerm>();
        CreateMap<PaymentTermUpdateModel, PaymentTerm>();

        //Permission
        CreateMap<Permission, PermissionReadModel>();
        CreateMap<Permission, PermissionRefModel>();
        CreateMap<PermissionWriteModel, Permission>();
        CreateMap<PermissionUpdateModel, Permission>();

        //Platform
        CreateMap<Platform, PlatformReadModel>();
        CreateMap<Platform, PlatformRefModel>();
        CreateMap<PlatformWriteModel, Platform>();
        CreateMap<PlatformUpdateModel, Platform>();

        //PoLineItem
        CreateMap<PoLineItem, PoLineItemReadModel>();
        CreateMap<PoLineItem, PoLineItemRefModel>();
        CreateMap<PoLineItemWriteModel, PoLineItem>();
        CreateMap<PoLineItemUpdateModel, PoLineItem>();
        CreateMap<PoLineItem, PoLineItemDetailReadModel>();

        //Product
        CreateMap<Product, ProductDetailReadModel>();
        CreateMap<Product, ProductReadModel>();
        CreateMap<Product, ProductRefModel>();
        CreateMap<ProductWriteModel, Product>();
        CreateMap<ProductImageWriteModel, Product>();
        CreateMap<ProductUpdateModel, Product>();

        //Program
        CreateMap<Program, ProgramReadModel>();
        CreateMap<Program, ProgramRefModel>();
        CreateMap<ProgramWriteModel, Program>();
        CreateMap<ProgramUpdateModel, Program>();

        //Project
        CreateMap<Project, ProjectReadModel>();
        CreateMap<Project, ProjectRefModel>();
        CreateMap<ProjectWriteModel, Project>();
        CreateMap<ProjectUpdateModel, Project>();

        //PurchaseOrder
        CreateMap<PurchaseOrder, PurchaseOrderReadModel>();
        CreateMap<PurchaseOrder, PurchaseOrderRefModel>();
        CreateMap<PurchaseOrderWriteModel, PurchaseOrder>();
        CreateMap<PurchaseOrderUpdateModel, PurchaseOrder>();
        CreateMap<PurchaseOrder, PurchaseOrderDetailsReadModel>();

        //Requisition
        CreateMap<Requisition, RequisitionReadModel>();
        CreateMap<Requisition, RequisitionRefModel>();
        CreateMap<RequisitionWriteModel, Requisition>();
        CreateMap<RequisitionUpdateModel, Requisition>();
        CreateMap<Requisition, RequisitionDetailsReadModel>();

        //RequisitionLineItem
        CreateMap<RequisitionLineItem, RequisitionLineItemReadModel>();
        CreateMap<RequisitionLineItem, RequisitionLineItemRefModel>();
        CreateMap<RequisitionLineItemWriteModel, RequisitionLineItem>();
        CreateMap<RequisitionLineItemUpdateModel, RequisitionLineItem>();
        CreateMap<RequisitionLineItem, RequisitionLineItemDetailsReadModel>();

        //Role
        CreateMap<Role, RoleRefWithDefaultModel>();
        CreateMap<Role, RoleReadModel>();
        CreateMap<Role, RoleRefModel>();
        CreateMap<RoleWriteModel, Role>();
        CreateMap<RoleUpdateModel, Role>();

        //RoleFilter
        CreateMap<RoleFilter, RoleFilterReadModel>();
        CreateMap<RoleFilter, RoleFilterRefModel>();
        CreateMap<RoleFilterWriteModel, RoleFilter>();
        CreateMap<RoleFilterUpdateModel, RoleFilter>();

        //RolePermission
        CreateMap<RolePermission, RolePermissionReadModel>();
        CreateMap<RolePermission, RolePermissionRefModel>();
        CreateMap<RolePermissionWriteModel, RolePermission>();
        CreateMap<RolePermissionUpdateModel, RolePermission>();

        //ScrapRequest
        CreateMap<ScrapRequest, ScrapRequestReadModel>();
        CreateMap<ScrapRequest, ScrapRequestRefModel>();
        CreateMap<ScrapRequestWriteModel, ScrapRequest>();
        CreateMap<ScrapRequestUpdateModel, ScrapRequest>();

        //ScrapLineItem
        CreateMap<ScrapLineItem, ScrapLineItemReadModel>();
        CreateMap<ScrapLineItem, ScrapLineItemRefModel>();
        CreateMap<ScrapLineItemWriteModel, ScrapLineItem>();
        CreateMap<ScrapLineItemUpdateModel, ScrapLineItem>();

        //StockMovement
        CreateMap<StockMovement, StockMovementReadModel>();
        CreateMap<StockMovement, StockMovementRefModel>();
        CreateMap<StockMovementWriteModel, StockMovement>();
        CreateMap<StockMovementUpdateModel, StockMovement>();

        //StockMovementLineItem
        CreateMap<StockMovementLineItem, StockMovementLineItemReadModel>();
        CreateMap<StockMovementLineItem, StockMovementLineItemRefModel>();
        CreateMap<StockMovementLineItemWriteModel, StockMovementLineItem>();
        CreateMap<StockMovementLineItemUpdateModel, StockMovementLineItem>();

        //Staff
        CreateMap<Staff, StaffReadModel>();
        CreateMap<Staff, StaffRefModel>();
        CreateMap<StaffWriteModel, Staff>();
        CreateMap<StaffUpdateModel, Staff>();

        //Subsystem
        CreateMap<Subsystem, SubsystemReadModel>();
        CreateMap<Subsystem, SubsystemRefModel>();
        CreateMap<SubsystemWriteModel, Subsystem>();
        CreateMap<SubsystemUpdateModel, Subsystem>();

        //Task
        CreateMap<Task, TaskReadModel>();
        CreateMap<Task, TaskRefModel>();
        CreateMap<TaskWriteModel, Task>();
        CreateMap<TaskUpdateModel, Task>();

        //TaskDependency
        CreateMap<TaskDependency, TaskDependencyReadModel>();
        CreateMap<TaskDependency, TaskDependencyRefModel>();
        CreateMap<TaskDependencyWriteModel, TaskDependency>();
        CreateMap<TaskDependencyUpdateModel, TaskDependency>();

        //TaskAssignee
        CreateMap<TaskAssignee, TaskAssigneeReadModel>();
        CreateMap<TaskAssignee, TaskAssigneeRefModel>();
        CreateMap<TaskAssigneeWriteModel, TaskAssignee>();
        CreateMap<TaskAssigneeUpdateModel, TaskAssignee>();

        //TaskComment
        CreateMap<TaskComment, TaskCommentReadModel>();
        CreateMap<TaskComment, TaskCommentRefModel>();
        CreateMap<TaskCommentWriteModel, TaskComment>();
        CreateMap<TaskCommentUpdateModel, TaskComment>();

        //TaskActivity
        CreateMap<TaskActivity, TaskActivityReadModel>();

        //BoardColumn
        CreateMap<BoardColumn, BoardColumnReadModel>();
        CreateMap<BoardColumn, BoardColumnRefModel>();
        CreateMap<BoardColumnWriteModel, BoardColumn>();
        CreateMap<BoardColumnUpdateModel, BoardColumn>();

        //TimeEntry
        CreateMap<TimeEntry, TimeEntryReadModel>();
        CreateMap<TimeEntry, TimeEntryRefModel>();
        CreateMap<TimeEntryWriteModel, TimeEntry>();
        CreateMap<TimeEntryUpdateModel, TimeEntry>();

        //DashboardWidget
        CreateMap<DashboardWidget, DashboardWidgetReadModel>();
        CreateMap<DashboardWidget, DashboardWidgetRefModel>();
        CreateMap<DashboardWidgetWriteModel, DashboardWidget>();
        CreateMap<DashboardWidgetUpdateModel, DashboardWidget>();

        //ResourceAllocation
        CreateMap<ResourceAllocation, ResourceAllocationReadModel>();
        CreateMap<ResourceAllocation, ResourceAllocationRefModel>();
        CreateMap<ResourceAllocationWriteModel, ResourceAllocation>();
        CreateMap<ResourceAllocationUpdateModel, ResourceAllocation>();

        //Tool
        CreateMap<Tool, ToolReadModel>();
        CreateMap<Tool, ToolRefModel>();
        CreateMap<ToolWriteModel, Tool>();
        CreateMap<ToolUpdateModel, Tool>();

        //ToolType
        CreateMap<ToolType, ToolTypeReadModel>();
        CreateMap<ToolType, ToolTypeRefModel>();
        CreateMap<ToolTypeWriteModel, ToolType>();
        CreateMap<ToolTypeUpdateModel, ToolType>();

        //UnitOfMeasure
        CreateMap<UnitOfMeasure, UnitOfMeasureReadModel>();
        CreateMap<UnitOfMeasure, UnitOfMeasureRefModel>();
        CreateMap<UnitOfMeasureWriteModel, UnitOfMeasure>();
        CreateMap<UnitOfMeasureUpdateModel, UnitOfMeasure>();

        //User
        CreateMap<User, UserDetailWithUserRoleReadModel>();
        CreateMap<User, UserDetailReadModel>();
        CreateMap<User, UserReadModel>();
        CreateMap<User, UserRefModel>();
        CreateMap<UserWriteModel, User>();
        CreateMap<UserUpdateModel, User>();

        //UserRole
        CreateMap<UserRole, UserRoleReadModel>();
        CreateMap<UserRole, UserRoleRefModel>();
        CreateMap<UserRoleWriteModel, UserRole>();
        CreateMap<UserRoleUpdateModel, UserRole>();

        //VendorReturnLineItem
        CreateMap<VendorReturnLineItem, VendorReturnLineItemReadModel>();
        CreateMap<VendorReturnLineItem, VendorReturnLineItemRefModel>();
        CreateMap<VendorReturnLineItemWriteModel, VendorReturnLineItem>();
        CreateMap<VendorReturnLineItemUpdateModel, VendorReturnLineItem>();

        //VendorReturnRequest
        CreateMap<VendorReturnRequest, VendorReturnRequestReadModel>();
        CreateMap<VendorReturnRequest, VendorReturnRequestRefModel>();
        CreateMap<VendorReturnRequestWriteModel, VendorReturnRequest>();
        CreateMap<VendorReturnRequestUpdateModel, VendorReturnRequest>();

        //Video
        CreateMap<Video, VideoReadModel>();
        CreateMap<Video, VideoRefModel>();
        CreateMap<VideoWriteModel, Video>();
        CreateMap<VideoUpdateModel, Video>();

        //WorkOrder
        CreateMap<WorkOrder, WorkOrderReadModel>();
        CreateMap<WorkOrder, WorkOrderRefModel>();
        CreateMap<WorkOrderWriteModel, WorkOrder>();
        CreateMap<WorkOrderUpdateModel, WorkOrder>();

        //WorkOrderStep
        CreateMap<WorkOrderStep, WorkOrderStepReadModel>()
            .ForMember(dest => dest.CapturedTimeInSeconds, opt => opt.MapFrom(src => src.CapturedTime.HasValue ? src.CapturedTime.Value.Seconds : 0))
            .ForMember(dest => dest.ExecutionTimeInSeconds, opt => opt.MapFrom(src => src.ExecutionTime.HasValue ? src.ExecutionTime.Value.Seconds : 0));

        CreateMap<WorkOrderStep, WorkOrderStepRefModel>();
        CreateMap<WorkOrderStepWriteModel, WorkOrderStep>()
            .ForMember(dest => dest.CapturedTime, opt => opt.MapFrom(src => TimeSpan.FromSeconds(src.CapturedTimeInSeconds)));

        CreateMap<WorkOrderStepUpdateModel, WorkOrderStep>()
            .ForMember(dest => dest.CapturedTime, opt => opt.MapFrom(src => TimeSpan.FromSeconds(src.CapturedTimeInSeconds)));

        //WorkOrderTask
        CreateMap<WorkOrderTask, WorkOrderTaskReadModel>();
        CreateMap<WorkOrderTask, WorkOrderTaskRefModel>();
        CreateMap<WorkOrderTaskWriteModel, WorkOrderTask>();
        CreateMap<WorkOrderTaskUpdateModel, WorkOrderTask>();

        //WorkPackage
        CreateMap<WorkPackage, WorkPackageReadModel>();
        CreateMap<WorkPackage, WorkPackageRefModel>();
        CreateMap<WorkPackageWriteModel, WorkPackage>();
        CreateMap<WorkPackageUpdateModel, WorkPackage>();

        //Tender
        CreateMap<Tender, TenderReadModel>();
        CreateMap<Tender, TenderRefModel>();
        CreateMap<Tender, TenderDetailsReadModel>();
        CreateMap<TenderWriteModel, Tender>();
        CreateMap<TenderUpdateModel, Tender>();

        //TenderLineItem
        CreateMap<TenderLineItem, TenderLineItemReadModel>();
        CreateMap<TenderLineItem, TenderLineItemRefModel>();
        CreateMap<TenderLineItemWriteModel, TenderLineItem>();
        CreateMap<TenderLineItemUpdateModel, TenderLineItem>();

        //TenderVendor
        CreateMap<TenderVendor, TenderVendorReadModel>();
        CreateMap<TenderVendor, TenderVendorRefModel>();
        CreateMap<TenderVendorWriteModel, TenderVendor>();
        CreateMap<TenderVendorUpdateModel, TenderVendor>();

        //TenderQuotation
        CreateMap<TenderQuotation, TenderQuotationReadModel>()
            .ForMember(dest => dest.LineItems, opt => opt.MapFrom(src => src.TenderQuotationLineItems));
        CreateMap<TenderQuotation, TenderQuotationRefModel>();
        CreateMap<TenderQuotationWriteModel, TenderQuotation>();
        CreateMap<TenderQuotationUpdateModel, TenderQuotation>();

        //TenderQuotationLineItem
        CreateMap<TenderQuotationLineItem, TenderQuotationLineItemReadModel>();
        CreateMap<TenderQuotationLineItem, TenderQuotationLineItemRefModel>();
        CreateMap<TenderQuotationLineItemWriteModel, TenderQuotationLineItem>();
        CreateMap<TenderQuotationLineItemUpdateModel, TenderQuotationLineItem>();

    }
}