using backend.Data;
using backend.Models;
using Microsoft.EntityFrameworkCore;

namespace backend.Services.Detection;

public class SuccessfulLoginDetectionService
{
    private readonly NexusDbContext _context;

    public SuccessfulLoginDetectionService(NexusDbContext context)
    {
        _context = context;
    }

    public async Task<Alert?> AnalyzeAsync(Event securityEvent)
    {
        // Ovo pravilo nas zanima samo kada je prijava uspješna.
        if (securityEvent.EventType != "SUCCESSFUL_LOGIN")
        {
            return null;
        }

        // Bez IP adrese ne možemo povezati prijavu
        // s prethodnim brute-force pokušajima.
        if (string.IsNullOrWhiteSpace(securityEvent.SourceIp))
        {
            return null;
        }

        var since = DateTime.UtcNow.AddMinutes(-10);

        // Provjeravamo postoji li najmanje 5 neuspješnih prijava
        // s iste IP adrese u zadnjih 10 minuta.
        var failedLoginCount = await _context.Events
            .CountAsync(e =>
                e.EventType == "FAILED_LOGIN" &&
                e.SourceIp == securityEvent.SourceIp &&
                e.Timestamp >= since);

        if (failedLoginCount < 5)
        {
            return null;
        }

        // Sprječavamo stvaranje više identičnih otvorenih alerta.
        var existingAlert = await _context.Alerts
            .FirstOrDefaultAsync(a =>
                a.RuleName == "SuccessfulLoginAfterBruteForce" &&
                a.SourceIp == securityEvent.SourceIp &&
                a.Status == "Open" &&
                a.DetectedAt >= since);

        if (existingAlert is not null)
        {
            return existingAlert;
        }

        var alert = new Alert
        {
            RuleName = "SuccessfulLoginAfterBruteForce",
            Title = "Successful Login After Brute Force",
            Severity = "High",
            DetectedAt = DateTime.UtcNow,
            SourceIp = securityEvent.SourceIp,
            Username = securityEvent.Username,
            EventCount = failedLoginCount + 1,
            Description =
                $"A successful login occurred after {failedLoginCount} " +
                $"failed login attempts from {securityEvent.SourceIp} " +
                "within 10 minutes.",
            Status = "Open"
        };

        _context.Alerts.Add(alert);
        await _context.SaveChangesAsync();

        return alert;
    }
}