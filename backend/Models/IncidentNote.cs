namespace backend.Models;

public class IncidentNote
{
    public int Id { get; set; }

    public int IncidentId { get; set; }

    public string Content { get; set; } = string.Empty;

    public DateTime CreatedAt { get; set; } = DateTime.UtcNow;

    public string Author { get; set; } = "Analyst";

    public Incident? Incident { get; set; }
}