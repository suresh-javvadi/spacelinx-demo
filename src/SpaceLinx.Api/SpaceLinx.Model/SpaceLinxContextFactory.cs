using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Design;

namespace SpaceLinx.Model;

// Used ONLY by `dotnet ef` at design time (migrations add/script).
// Connection string is a non-contacting placeholder — no DB access needed to build the model.
public class SpaceLinxContextFactory : IDesignTimeDbContextFactory<SpaceLinxContext>
{
    public SpaceLinxContext CreateDbContext(string[] args)
    {
        var options = new DbContextOptionsBuilder<SpaceLinxContext>()
            .UseNpgsql("Host=localhost;Database=spacelinx_design;Username=design;Password=design")
            .Options;
        return new SpaceLinxContext(options);
    }
}
