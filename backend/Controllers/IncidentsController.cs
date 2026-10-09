
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

        // Bilješke koje pripadaju ovom incidentu
        var notes = await _context.IncidentNotes
            .Where(n => n.IncidentId == id)
            .OrderByDescending(n => n.CreatedAt)
            .ToListAsync();

        return Ok(new
        {
            incident,
            alerts,
            events,
            notes
        });
    }

    // PATCH: /api/incidents/1/status
    [HttpPatch("{id:int}/status")]
    public async Task<IActionResult> UpdateIncidentStatus(
        int id,
        [FromBody] UpdateIncidentStatusRequest request)
    {
        var incident = await _context.Incidents.FindAsync(id);

        if (incident is null)
        {
            return NotFound();
        }

        var allowedStatuses = new[]
        {
            "Open",
            "Investigating",
            "Resolved",
            "Closed"
        };

        var requestedStatus = allowedStatuses.FirstOrDefault(
            status => string.Equals(
                status,
                request.Status?.Trim(),
                StringComparison.OrdinalIgnoreCase));

        if (requestedStatus is null)
        {
            return BadRequest(new
            {
                message =
                    "Status mora biti Open, Investigating, Resolved ili Closed."
            });
        }

        incident.Status = requestedStatus;

        await _context.SaveChangesAsync();

        return Ok(new
        {
            incident.Id,
            incident.Status
        });
    }

    // POST: /api/incidents/1/notes
    [HttpPost("{id:int}/notes")]
    public async Task<IActionResult> AddIncidentNote(
        int id,
        [FromBody] CreateIncidentNoteRequest request)
    {
        var incident = await _context.Incidents.FindAsync(id);

        if (incident is null)
        {
            return NotFound();
        }

        if (string.IsNullOrWhiteSpace(request.Content))
        {
            return BadRequest(new
            {
                message = "Bilješka ne može biti prazna."
            });
        }

        if (request.Content.Length > 4000)
        {
            return BadRequest(new
            {
                message = "Bilješka može imati najviše 4000 znakova."
            });
        }

        var note = new IncidentNote
        {
            IncidentId = id,
            Content = request.Content.Trim(),
            Author = string.IsNullOrWhiteSpace(request.Author)
                ? "Analyst"
                : request.Author.Trim(),
            CreatedAt = DateTime.UtcNow
        };

        _context.IncidentNotes.Add(note);
        await _context.SaveChangesAsync();

        return Ok(note);
    }
}

// Podaci koje klijent šalje za novu bilješku
public class CreateIncidentNoteRequest
{
    public string Content { get; set; } = string.Empty;

    public string? Author { get; set; } = "Analyst";
}

// Podatak koji klijent šalje za promjenu statusa
public class UpdateIncidentStatusRequest
{
    public string Status { get; set; } = string.Empty;
}