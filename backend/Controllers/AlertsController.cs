using backend.Data;
using backend.Models;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;

namespace backend.Controllers;

[ApiController]
[Route("api/[controller]")]
public class AlertsController : ControllerBase
{
    private readonly NexusDbContext _context;

    public AlertsController(NexusDbContext context)
    {
        _context = context;
    }

    // GET: /api/alerts
    [HttpGet]
    public async Task<ActionResult<IEnumerable<Alert>>> GetAlerts()
    {
        var alerts = await _context.Alerts
            .OrderByDescending(a => a.DetectedAt)
            .ToListAsync();

        return Ok(alerts);
    }

    // GET: /api/alerts/1
    [HttpGet("{id:int}")]
    public async Task<ActionResult<Alert>> GetAlert(int id)
    {
        var alert = await _context.Alerts.FindAsync(id);

        if (alert is null)
        {
            return NotFound();
        }

        return Ok(alert);
    }
}