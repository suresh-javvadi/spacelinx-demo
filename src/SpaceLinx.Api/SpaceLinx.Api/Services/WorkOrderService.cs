using System;
using AutoMapper;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using SpaceLinx.Api.Interfaces;
using SpaceLinx.Model;

namespace SpaceLinx.Api.Services;

public class WorkOrderService(SpaceLinxContext _spaceLinxContext, IMapper mapper, IHttpContextAccessor _contextAccessor)
    : BaseService(_spaceLinxContext, _contextAccessor), IWorkOrderService
{
    public async Task<WorkOrderReadModel> GetByNumberAsync(string number)
    {
        var workOrder = await _spaceLinxContext.WorkOrders.AsNoTracking().FirstOrDefaultAsync(x => x.Number == number && x.DeletedBy == null);
        if (workOrder == null)
        {
            return null;
        }

        return mapper.Map<WorkOrderReadModel>(workOrder);
    }

    public async Task<WorkOrderReadModel> GetAsync(Guid id)
    {
        var workOrder = await _spaceLinxContext.WorkOrders
            .AsNoTracking()
            .Include(x => x.Kit)
            .Include(x => x.Technician)
            .Include(x => x.Manager)
            .Include(x => x.Guide)
            .Include(x => x.Part)
            .Include(x => x.Product)
            .FirstOrDefaultAsync(x => x.Id == id && x.Part.ItemType == null && x.DeletedBy == null);

        return mapper.Map<WorkOrderReadModel>(workOrder);
    }

    public async Task<WorkOrderDetailReadModel> GetWorkOrderDetailsAsync(Guid id)
    {
        var workOrder = await _spaceLinxContext.WorkOrders
        .AsNoTracking()
        .FirstOrDefaultAsync(x => x.Id == id && x.DeletedBy == null);

        var kit = await _spaceLinxContext.Kits
            .AsNoTracking()
            .Where(k => k.Id == workOrder.KitId && k.DeletedBy == null)
            .FirstOrDefaultAsync();

        var technician = await _spaceLinxContext.Users
            .AsNoTracking()
            .Where(t => t.Id == workOrder.TechnicianId && t.DeletedBy == null)
            .FirstOrDefaultAsync();

        var manager = await _spaceLinxContext.Users
            .AsNoTracking()
            .Where(m => m.Id == workOrder.ManagerId && m.DeletedBy == null)
            .FirstOrDefaultAsync();

        var guide = await _spaceLinxContext.Guides
            .AsNoTracking()
            .Where(g => g.Id == workOrder.GuideId && g.DeletedBy == null)
            .FirstOrDefaultAsync();

        var part = await _spaceLinxContext.Parts
            .AsNoTracking()
            .Where(p => p.Id == workOrder.PartId && p.ItemType == null && p.DeletedBy == null)
            .FirstOrDefaultAsync();

        var product = await _spaceLinxContext.Products
            .AsNoTracking()
            .Where(pr => pr.Id == workOrder.ProductId && pr.DeletedBy == null)
            .FirstOrDefaultAsync();

        var workPackage = await _spaceLinxContext.WorkPackages
            .AsNoTracking()
            .Where(wp => wp.Id == workOrder.WorkPackageId && wp.DeletedBy == null)
            .FirstOrDefaultAsync();

        var workOrderSteps = await _spaceLinxContext.WorkOrderSteps
            .AsNoTracking()
            .Where(ws => ws.WorkOrderId == id && ws.DeletedBy == null)
            .Include(s => s.GuideStep)
            .Include(wi => wi.Image)
            .ToListAsync();

        var workOrderTasks = await _spaceLinxContext.WorkOrderTasks
            .AsNoTracking()
            .Where(wt => wt.WorkOrderId == id && wt.DeletedBy == null)
            .Include(t => t.GuideStepTask)
            .ToListAsync();

        var result = new WorkOrderDetailReadModel
        {
            Id = workOrder.Id,
            Name = workOrder.Name,
            Number = workOrder.Number,
            Status = workOrder.Status,
            WorkPackageId = workOrder.WorkPackageId,
            KitId = workOrder.KitId,
            TechnicianId = workOrder.TechnicianId,
            ManagerId = workOrder.ManagerId,
            GuideId = workOrder.GuideId,
            PartId = workOrder.PartId,
            ProductId = workOrder.ProductId,
            StartDate = workOrder.StartDate,
            EndDate = workOrder.EndDate,
            ActualStartDate = workOrder.ActualStartDate,
            ActualEndDate = workOrder.ActualEndDate,
            ExecutionTime = workOrder.ExecutionTime,
            Guide = mapper.Map<GuideRefModel>(guide),
            Kit = mapper.Map<KitRefModel>(kit),
            Manager = mapper.Map<UserRefModel>(manager),
            Part = mapper.Map<PartRefModel>(part),
            Product = mapper.Map<ProductRefModel>(product),
            Technician = mapper.Map<UserRefModel>(technician),
            WorkPackage = mapper.Map<WorkPackageRefModel>(workPackage),
            WorkOrderSteps = mapper.Map<List<WorkOrderStepReadModel>>(workOrderSteps),
            WorkOrderTasks = mapper.Map<List<WorkOrderTaskReadModel>>(workOrderTasks),
        };

        return result;
    }

    public async Task<List<object>> GetByWorkPackageAsync(Guid workPackageId)
    {
        var records = await _spaceLinxContext.WorkOrders.AsNoTracking()
                                .Where(x => x.WorkPackageId == workPackageId && x.Part.ItemType == null && x.DeletedBy == null)
                                .Include(x => x.Part)
                                .Include(x => x.Product)
                                .Include(x => x.Guide)
                                .Include(x => x.WorkPackage)
                                .Include(x => x.Technician)
                                .Include(x => x.Manager)
                                .Include(x => x.WorkOrderSteps)                                
                                .Include(x => x.Kit).ToListAsync();

        return records.Cast<object>().ToList();
    }

    public async Task<List<WorkOrderReadModel>> GetByPartAsync(Guid partId)
    {
        var records = await _spaceLinxContext.WorkOrders
                           .AsNoTracking()
                           .Where(x => x.PartId == partId && x.Part.ItemType == null && x.DeletedBy == null)
                           .Include(x => x.Part)
                           .Include(x => x.Guide)
                           .Include(x => x.WorkPackage)
                           .Include(x => x.Technician)
                           .Include(x => x.Manager)
                           .Include(x => x.WorkOrderSteps)
                           .Include(x => x.Kit)
                           .ToListAsync();

        return mapper.Map<List<WorkOrder>, List<WorkOrderReadModel>>(records);
    }

    public async Task<List<WorkOrderReadModel>> GetByProductAndPartAsync(Guid productId, Guid partId)
    {
        var records = await _spaceLinxContext.WorkOrders
                        .AsNoTracking()
                        .Where(x => (x.PartId == partId || x.ProductId == productId) && x.Part.ItemType == null && x.DeletedBy == null)
                        .Include(x => x.Part)
                        .Include(x => x.Guide)
                        .Include(x => x.WorkPackage)
                        .Include(x => x.Technician)
                        .Include(x => x.Manager)
                        .Include(x => x.WorkOrderSteps)
                        .Include(x => x.Kit)
                        .Distinct()
                        .ToListAsync();

        return mapper.Map<List<WorkOrder>, List<WorkOrderReadModel>>(records);
    }

    public async Task<List<object>> WorkOrdersWithTechnicianAssignedAsync()
    {
        var records = await _spaceLinxContext.WorkOrders
            .AsNoTracking()
            .Where(x => x.TechnicianId != null && x.DeletedBy == null)
            .Include(x => x.Technician)
            .ToListAsync();

        return records.Cast<object>().ToList();
    }

    public async Task<List<object>> WorkorderguidestepsviewAsync(Guid workOrderId)
    {
        var records = await _spaceLinxContext.Workorderguidestepsviews
            .AsNoTracking()
            .Where(x => x.Workorderid == workOrderId)
            .ToListAsync();

        return records.Cast<object>().ToList();
    }
}