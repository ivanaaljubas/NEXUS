using backend.Data;
using backend.Models;
using Microsoft.EntityFrameworkCore;

namespace backend.Services.Correlation;

public class IncidentCorrelationService
{
    private readonly NexusDbContext _context;

    public IncidentCorrelationService(NexusDbContext context)
    {
        _context = context;
    }

    public async Task<Incident?> CorrelateAsync(Alert alert)
    {
        var since = DateTime.UtcNow.AddMinutes(-10);

// Za korelaciju moramo imati IP adresu.
var sourceIp = alert.SourceIp;

if (string.IsNullOrWhiteSpace(sourceIp))
{
    return null;
}

// Tražimo otvorene alerte s iste IP adrese
// koji su detektirani u posljednjih 10 minuta.
var relatedAlerts = await _context.Alerts
    .Where(a =>
        a.Id != alert.Id &&
        a.Status == "Open" &&
        a.DetectedAt >= since &&
        a.SourceIp == sourceIp)
    .ToListAsync();

        // Ako nema drugog povezanog alerta,
        // još nemamo dovoljno podataka za incident.
        if (relatedAlerts.Count == 0)
        {
            return null;
        }

        // Ako neki povezani alert već pripada incidentu,
        // koristimo taj postojeći incident.
        var existingIncidentId = relatedAlerts
            .Where(a => a.IncidentId.HasValue)
            .Select(a => a.IncidentId!.Value)
            .FirstOrDefault();

        Incident incident;

        if (existingIncidentId != 0)
        {
            incident = await _context.Incidents
                .FirstAsync(i => i.Id == existingIncidentId);
        }
        else
        {
            // Prvi puta stvaramo novi incident.
            incident = new Incident
            {
                Title = "Related Security Activity",
                Severity = CalculateSeverity(alert, relatedAlerts),
                CreatedAt = DateTime.UtcNow,
                Status = "Open",
                RiskScore = CalculateRiskScore(alert, relatedAlerts),
                Description =
                    "Multiple related security alerts were detected " +
                    "for the same user or source IP within a short time period."
            };

            _context.Incidents.Add(incident);

            await _context.SaveChangesAsync();
        }

        // Trenutni alert povezujemo s incidentom.
        alert.IncidentId = incident.Id;

        // I sve pronađene povezane alerte povezujemo
        // s istim incidentom.
        foreach (var relatedAlert in relatedAlerts)
        {
            relatedAlert.IncidentId = incident.Id;
        }

        await _context.SaveChangesAsync();

        return incident;
    }

    private static string CalculateSeverity(
        Alert currentAlert,
        List<Alert> relatedAlerts)
    {
        var severities = relatedAlerts
            .Append(currentAlert)
            .Select(a => a.Severity.ToLower())
            .ToList();

        if (severities.Contains("critical"))
        {
            return "Critical";
        }

        if (severities.Contains("high"))
        {
            return "High";
        }

        if (severities.Contains("medium"))
        {
            return "Medium";
        }

        return "Low";
    }

    private static int CalculateRiskScore(
        Alert currentAlert,
        List<Alert> relatedAlerts)
    {
        var allAlerts = relatedAlerts.Append(currentAlert).ToList();

        var score = 40;

        foreach (var alert in allAlerts)
        {
            score += alert.Severity.ToLower() switch
            {
                "critical" => 30,
                "high" => 20,
                "medium" => 10,
                _ => 5
            };
        }

        return Math.Min(score, 100);
    }
}