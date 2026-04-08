namespace SpaceLinx.Model
{
    public partial class EcoWithUsersVw
    {
        public Guid? Id { get; set; }
        public string? Number { get; set; }
        public string? Name { get; set; }
        public string? ReasonForChange { get; set; }
        public string? Description { get; set; }
        public string? ChangeType { get; set; }
        public string? ImpactAnalysis { get; set; }
        public string? Priority { get; set; }
        public string? Requestor { get; set; }
        public string? Approver { get; set; }
        public DateTime? PlannedImplementationDate { get; set; }
        public string? ApprovedBy { get; set; }
        public DateTime? ApprovedDate { get; set; }
        public string? Status { get; set; }
        public bool? IsActive { get; set; }
        public DateTime? CreatedAt { get; set; }
        public string? CreatedBy { get; set; }
        public DateTime? UpdatedAt { get; set; }
        public string? UpdatedBy { get; set; }
        public Guid? RequestorId { get; set; }
        public string? RequestorFullName { get; set; }
        public string? RequestorEmail { get; set; }
        public string? Approvers { get; set; }
    }
}