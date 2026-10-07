using backend.Data;
using backend.Models;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using backend.Services.Detection;
using backend.Services.Correlation;

namespace backend.Controllers;

[ApiController]
[Route("api/[controller]")]
public class EventsController : ControllerBase
{
    private readonly NexusDbContext _context;
    private readonly BruteForceDetectionService _detectionService;
    private readonly IncidentCorrelationService _correlationService;
    private readonly SuccessfulLoginDetectionService _successfulLoginDetectionService;

    public EventsController(
    NexusDbContext context,
    BruteForceDetectionService detectionService,
    IncidentCorrelationService correlationService,
    SuccessfulLoginDetectionService successfulLoginDetectionService)
    {
        _context = context;
        _detectionService = detectionService;
        _correlationService = correlationService;
        _successfulLoginDetectionService = successfulLoginDetectionService;
    }

    // GET: /api/events
    [HttpGet]
    public async Task<ActionResult<IEnumerable<Event>>> GetEvents()
    {
        var events = await _context.Events
            .OrderByDescending(e => e.Timestamp)
            .ToListAsync();

        return Ok(events);
    }

    // GET: /api/events/1
    [HttpGet("{id:int}")]
    public async Task<ActionResult<Event>> GetEvent(int id)
    {
        var securityEvent = await _context.Events.FindAsync(id);

        if (securityEvent is null)
        {
            return NotFound();
        }

        return Ok(securityEvent);
    }

    // POST: /api/events
    [HttpPost]
    public async Task<ActionResult<Event>> CreateEvent(Event securityEvent)
    {
        if (securityEvent.Timestamp == default)
        {
            securityEvent.Timestamp = DateTime.UtcNow;
        }

       _context.Events.Add(securityEvent);
        await _context.SaveChangesAsync();

        var alert = await _detectionService.AnalyzeAsync(securityEvent);

        if (alert is not null)
        {
            await _correlationService.CorrelateAsync(alert);
        }

        var loginAlert =
            await _successfulLoginDetectionService.AnalyzeAsync(securityEvent);

        if (loginAlert is not null)
        {
            await _correlationService.CorrelateAsync(loginAlert);
        }

        return CreatedAtAction(
            nameof(GetEvent),
            new { id = securityEvent.Id },
            securityEvent
        );
    }
}   