namespace SpaceLinx.Model
{
    public partial class RequisitionsWithUserVw
    {
        public Guid? Id { get; set; }
        public string? ReqNumber { get; set; }
        public Guid? RequestedById { get; set; }
        public string? Title { get; set; }
        public Guid? ProjectId { get; set; }
        public DateOnly? RequestDate { get; set; }
        public DateOnly? RequiredByDate { get; set; }
        public string? Justification { get; set; }
        public string? Priority { get; set; }
        public string? Status { get; set; }
        public decimal? TotalEstimatedAmount { get; set; }
        public string? CreatedBy { get; set; }
        public DateTime? CreatedAt { get; set; }
        public string? ApprovedBy { get; set; }
        public DateTime? ApprovedDate { get; set; }
        public string? RejectedBy { get; set; }
        public DateTime? RejectedDate { get; set; }
        public string? ApproverComment { get; set; }
        public Guid? UserId { get; set; }
        public string? UserFullName { get; set; }
        public string? UserEmail { get; set; }
        public Guid? DepartmentId { get; set; }
        public string? DepartmentName { get; set; }
        public string? ManagerFullName { get; set; }
        public Guid? PoId { get; set; }
        public string? PoNumber { get; set; }
        public string? PoStatus { get; set; }
    }
}