using backend.Data;
using backend.Models;
using Microsoft.EntityFrameworkCore;

namespace backend.Services.Detection;

public class BruteForceDetectionService
{
    private readonly NexusDbContext _context;

    public BruteForceDetectionService(NexusDbContext context)
    {
        _context = context;
    }

    public async Task<Alert?> AnalyzeAsync(Event securityEvent)
    {
        // Pravilo nas zanima samo za neuspjele prijave.
        if (securityEvent.EventType != "FAILED_LOGIN")
        {
            return null;
        }

        // Bez IP adrese ne možemo napraviti ovu detekciju.
        if (string.IsNullOrWhiteSpace(securityEvent.SourceIp))
        {
            return null;
        }

        var since = DateTime.UtcNow.AddMinutes(-5);

        // Dohvati neuspjele prijave s iste IP adrese u zadnjih 5 minuta.
        var failedLogins = await _context.Events
            .Where(e =>
                e.EventType == "FAILED_LOGIN" &&
                e.SourceIp == securityEvent.SourceIp &&
                e.Timestamp >= since)
            .OrderBy(e => e.Timestamp)
            .ToListAsync();

        // Manje od 5 pokušaja = nema brute-force alerta.
        if (failedLogins.Count < 5)
        {
            return null;
        }

        // Nemoj svaki novi pokušaj pretvarati u novi isti alert.
        var existingAlert = await _context.Alerts
            .FirstOrDefaultAsync(a =>
                a.RuleName == "BruteForceDetection" &&
                a.SourceIp == securityEvent.SourceIp &&
                a.Status == "Open" &&
                a.DetectedAt >= since);

        if (existingAlert is not null)
        {
            return existingAlert;
        }

        var alert = new Alert
        {
            RuleName = "BruteForceDetection",
            Title = "Possible Brute Force Attack",
            Severity = "High",
            DetectedAt = DateTime.UtcNow,
            SourceIp = securityEvent.SourceIp,
            Username = securityEvent.Username,
            EventCount = failedLogins.Count,
            Description =
                $"{failedLogins.Count} failed login attempts were detected " +
                $"from {securityEvent.SourceIp} within 5 minutes.",
            Status = "Open"
        };

        _context.Alerts.Add(alert);
        await _context.SaveChangesAsync();

        return alert;
    }
}