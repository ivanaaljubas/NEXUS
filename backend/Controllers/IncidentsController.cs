using backend.Data;
using backend.Models;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;

namespace backend.Controllers;

[ApiController]
[Route("api/[controller]")]
public class IncidentsController : ControllerBase
{
    private readonly NexusDbContext _context;

    public IncidentsController(NexusDbContext context)
    {
        _context = context;
    }

    // GET: /api/incidents
    [HttpGet]
    public async Task<ActionResult<IEnumerable<Incident>>> GetIncidents()
    {
        var incidents = await _context.Incidents
            .OrderByDescending(i => i.CreatedAt)
            .ToListAsync();

        return Ok(incidents);
    }

    // GET: /api/incidents/1
    [HttpGet("{id:int}")]
    public async Task<IActionResult> GetIncident(int id)
    {
        var incident = await _context.Incidents
            .FirstOrDefaultAsync(i => i.Id == id);

        if (incident is null)
        {
            return NotFound();
        }

        var alerts = await _context.Alerts
            .Where(a => a.IncidentId == id)
            .OrderBy(a => a.DetectedAt)
            .ToListAsync();

        var sourceIps = alerts
            .Where(a => !string.IsNullOrWhiteSpace(a.SourceIp))
            .Select(a => a.SourceIp!)
            .Distinct()
            .ToList();

        var usernames = alerts
            .Where(a => !string.IsNullOrWhiteSpace(a.Username))
            .Select(a => a.Username!)
            .Distinct()
            .ToList();

        var startTime = incident.CreatedAt.AddMinutes(-15);
        var endTime = incident.CreatedAt.AddMinutes(5);

        var events = await _context.Events
            .Where(e =>
                e.Timestamp >= startTime &&
                e.Timestamp <= endTime &&
                (
                    sourceIps.Contains(e.SourceIp!) ||
                    usernames.Contains(e.Username!)
                ))
            .OrderBy(e => e.Timestamp)
            .ToListAsync();

        return Ok(new
        {
            incident,
            alerts,
            events
        });
    }
}