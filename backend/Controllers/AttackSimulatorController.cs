using backend.Data;
using backend.Models;
using backend.Services.Detection;
using Microsoft.AspNetCore.Mvc;

namespace backend.Controllers;

[ApiController]
[Route("api/simulator")]
public class AttackSimulatorController : ControllerBase
{
    private readonly NexusDbContext _context;
    private readonly BruteForceDetectionService _detectionService;

    public AttackSimulatorController(
        NexusDbContext context,
        BruteForceDetectionService detectionService)
    {
        _context = context;
        _detectionService = detectionService;
    }

    [HttpPost("brute-force")]
    public async Task<IActionResult> SimulateBruteForce()
    {
        var now = DateTime.UtcNow;

        // Koristimo testnu IP adresu iz TEST-NET-1 raspona.
        var sourceIp = $"192.0.2.{Random.Shared.Next(10, 250)}";

        var username = "simulated.user";
        var hostname = "SIMULATOR-PC";

        var events = new List<Event>();

        for (int i = 0; i < 5; i++)
        {
            events.Add(new Event
            {
                Timestamp = now.AddSeconds(-40 + (i * 10)),
                EventType = "FAILED_LOGIN",
                Username = username,
                SourceIp = sourceIp,
                Hostname = hostname,
                Severity = "High",
                Message = "Simulated failed login attempt"
            });
        }

        _context.Events.AddRange(events);
        await _context.SaveChangesAsync();

        Alert? detectedAlert = null;

        foreach (var securityEvent in events)
        {
            var alert = await _detectionService.AnalyzeAsync(securityEvent);

            if (alert is not null)
            {
                detectedAlert = alert;
            }
        }

        return Ok(new
        {
            scenario = "Brute Force Attack",
            eventsCreated = events.Count,
            alertCreated = detectedAlert is not null,
            alert = detectedAlert
        });
    }
}       