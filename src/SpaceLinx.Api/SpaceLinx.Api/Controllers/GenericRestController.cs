using Microsoft.AspNetCore.Mvc;
using SpaceLinx.Model;
using AutoMapper;
using Microsoft.EntityFrameworkCore;
using System.Linq.Expressions;
using System.Linq.Dynamic.Core;
using Task = System.Threading.Tasks.Task;

namespace SpaceLinx.Api.Controllers;

public class GenericRestController<T, T1, T2, T3, T4>(SpaceLinxContext spaceLinxContext, IMapper mapper, IHttpContextAccessor httpContextAccessor) : 
            BaseController(spaceLinxContext, httpContextAccessor) where T : BaseModel
                        where T1 : BaseWriteModel
                        where T2 : BaseUpdateModel
                        where T3 : BaseReadModel
                        where T4 : BaseRefModel
{
    [HttpGet]
    public virtual async Task<List<T3>> Get()
    {
        return await GetAsync();
    }

    [HttpGet("Lookup")]
    public virtual async Task<List<T4>> GetForLookup()
    {
        return await GetForLookupAsync();
    }

    [HttpGet("Active")]
    public virtual async Task<List<T3>> GetActive()
    {
        return await GetActiveAsync();
    }

    [HttpGet("{id}")]
    public virtual async Task<ActionResult<T3>> Get(Guid id)
    {
        var record = await GetAsync(id);

        if (record is null)
        {
            return NotFound();
        }

        return record;
    }

    [HttpPost]
    public virtual async Task<IActionResult> Post(T1 newRecord)
    {
        var record = await CreateAsync(newRecord);

        return CreatedAtAction(nameof(Get), new { id = record?.Id }, record);
    }

    [HttpPut("{id}")]
    public virtual async Task<IActionResult> Update(Guid id, T2 updatedRecord)
    {
        var record = await GetAsync(id);

        if (record is null)
        {
            return NotFound();
        }

        updatedRecord.Id = record.Id;

        await UpdateAsync(id, updatedRecord);

        return NoContent();
    }

    [HttpPut("{id}/Activate")]
    public virtual async Task<IActionResult> Activate(Guid id)
    {
        await ActivateAsync(id);

        return NoContent();
    }

    [HttpPut("{id}/DeActivate")]
    public virtual async Task<IActionResult> DeActivate(Guid id)
    {
        await DeActivateAsync(id);

        return NoContent();
    }

    [HttpDelete("{id}")]
    public virtual async Task<IActionResult> Delete(Guid id)
    {
        await RemoveAsync(id);

        return NoContent();
    }

    [HttpDelete("{id}/hard")]
    public virtual async Task<IActionResult> HardDelete(Guid id)
    {
        await HardRemoveAsync(id);

        return NoContent();
    }

    protected async Task<T3?> CreateAsync(T1 newRecord)
    {
        T record = mapper.Map<T>(newRecord);
        record.IsActive = true;
        record.CreatedBy = UserEmail;

        spaceLinxContext.Set<T>().Add(record);
        await spaceLinxContext.SaveChangesAsync();
        var createdRecord = await GetAsync(record.Id.Value);

        return createdRecord;
    }

    protected async Task UpdateAsync(Guid id, T2 updatedRecord)
    {
        var recordFromDatabase = await spaceLinxContext.Set<T>().SingleAsync(x=> x.Id == id && x.DeletedBy == null);

        recordFromDatabase = mapper.Map(updatedRecord, recordFromDatabase);
        recordFromDatabase.UpdatedBy = UserEmail;
        recordFromDatabase.UpdatedAt = DateTime.UtcNow;

        await spaceLinxContext.SaveChangesAsync();
    }

    protected async Task<List<T3>> GetAsync()
    {
        var dbSet = spaceLinxContext.Set<T>();
        var query = dbSet.AsQueryable();

        SpaceLinxConstants.RelatedTablesIncludeDict.TryGetValue(typeof(T), out var relatedTablesToInclude);
        if(relatedTablesToInclude != null)
        {
            foreach (var relatedTableToBeIncluded in (Expression<Func<T, object>>[])relatedTablesToInclude)
            {
                query = query.Include(relatedTableToBeIncluded);
            }
        }

        query = query.Where(x => x.DeletedAt == null);

        var records = await query.AsNoTracking().ToListAsync();
        return mapper.Map<List<T>, List<T3>>(records);
    }

    //GetForLookupAsync
    protected async Task<List<T4>> GetForLookupAsync()
    {
        List<string> lookupColumns = new List<string>();
        SpaceLinxConstants.LookupColumnsDict.TryGetValue(typeof(T), out var lookupColumnsArray);
        if (lookupColumnsArray != null)
        {
            lookupColumns = new List<string>(lookupColumnsArray);
        }

        lookupColumns.Add("Id");
        var columnSelector = string.Join(", ", lookupColumns);
        var recordsWithColumnSelector = await spaceLinxContext.Set<T>().AsNoTracking().Where(x => x.DeletedBy == null).Select($"new ({columnSelector})").Cast<dynamic>().ToListAsync();
        if (recordsWithColumnSelector == null)
        {
            return new List<T4>();
        }

        return mapper.Map<List<dynamic>, List<T4>>(recordsWithColumnSelector);
    }

    protected async Task<List<T3>> GetActiveAsync()
    {
        var dbSet = spaceLinxContext.Set<T>();
        var query = dbSet.AsQueryable();

        SpaceLinxConstants.RelatedTablesIncludeDict.TryGetValue(typeof(T), out var relatedTablesToInclude);
        if (relatedTablesToInclude != null)
        {
            foreach (var relatedTableToBeIncluded in (Expression<Func<T, object>>[])relatedTablesToInclude)
            {
                query = query.Include(relatedTableToBeIncluded);
            }
        }

        query = query.Where(x => x.DeletedAt == null && x.IsActive == true);
        var records = await query.AsNoTracking().ToListAsync();
        return mapper.Map<List<T>, List<T3>>(records);
    }

    protected async Task<T3?> GetAsync(Guid id)
    {
        var record = await spaceLinxContext.Set<T>().AsNoTracking().SingleAsync(x => x.Id == id && x.DeletedAt == null);
        return mapper.Map<T3>(record);
    }

    protected async Task RemoveAsync(Guid id)
    {
        var record = await spaceLinxContext.Set<T>().FindAsync(id);
        if (record == null)
        {
            throw new ApplicationException("Not Found");
        }

        record.DeletedAt = DateTime.UtcNow;
        record.DeletedBy = UserEmail;
        // Write via the EF entry's mapped property so entities that shadow IsActive as nullable
        // (the UAT-nullable reference tables) persist the value, not the hidden BaseModel property.
        spaceLinxContext.Entry(record).Property(nameof(BaseModel.IsActive)).CurrentValue = false;

        await spaceLinxContext.SaveChangesAsync();
    }

    protected async Task HardRemoveAsync(Guid id)
    {
        var record = await spaceLinxContext.Set<T>().FindAsync(id);
        if (record == null)
        {
            throw new ApplicationException("Not Found");
        }

        spaceLinxContext.Set<T>().Remove(record);
        await spaceLinxContext.SaveChangesAsync();
    }

    protected async Task DeActivateAsync(Guid id)
    {
        var record = await spaceLinxContext.Set<T>().FindAsync(id);
        if (record == null)
        {
            throw new ApplicationException("Not Found");
        }

        spaceLinxContext.Entry(record).Property(nameof(BaseModel.IsActive)).CurrentValue = false;
        await spaceLinxContext.SaveChangesAsync();
    }

    protected async Task ActivateAsync(Guid id)
    {
        var record = await spaceLinxContext.Set<T>().FindAsync(id);
        if (record == null)
        {
            throw new ApplicationException("Not Found");
        }

        spaceLinxContext.Entry(record).Property(nameof(BaseModel.IsActive)).CurrentValue = true;
        await spaceLinxContext.SaveChangesAsync();
    }
}
