using backend.Models;
using Microsoft.EntityFrameworkCore;

namespace backend.Data;

public class NexusDbContext : DbContext
{
    public NexusDbContext(DbContextOptions<NexusDbContext> options)
        : base(options)
    {
    }

    public DbSet<Event> Events { get; set; }
    public DbSet<Alert> Alerts { get; set; }
    public DbSet<Incident> Incidents { get; set; }
}