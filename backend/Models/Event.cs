namespace backend.Models;

public class Event
{
    public int Id { get; set; }

    public DateTime Timestamp { get; set; }

    public string EventType { get; set; } = string.Empty;

    public string? Username { get; set; }

    public string? SourceIp { get; set; }

    public string? Hostname { get; set; }

    public string Severity { get; set; } = "Low";

    public string? Message { get; set; }
}