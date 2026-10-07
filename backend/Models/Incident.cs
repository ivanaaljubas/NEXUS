namespace backend.Models;

public class Incident
{
    public int Id { get; set; }

    public string Title { get; set; } = string.Empty;

    public string Severity { get; set; } = "Medium";

    public DateTime CreatedAt { get; set; } = DateTime.UtcNow;

    public string Status { get; set; } = "Open";

    public int RiskScore { get; set; }

    public string? Description { get; set; }
}