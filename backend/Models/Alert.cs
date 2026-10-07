namespace backend.Models;

public class Alert
{
    public int Id { get; set; }

    public string RuleName { get; set; } = string.Empty;

    public string Title { get; set; } = string.Empty;

    public string Severity { get; set; } = "Medium";

    public DateTime DetectedAt { get; set; }

    public string? SourceIp { get; set; }

    public string? Username { get; set; }

    public int EventCount { get; set; }

    public string? Description { get; set; }

    public string Status { get; set; } = "Open";

    public int? IncidentId { get; set; }

    public Incident? Incident { get; set; }
}