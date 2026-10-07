using backend.Data;
using Microsoft.EntityFrameworkCore;
using backend.Services.Detection;
using backend.Services.Correlation;

var builder = WebApplication.CreateBuilder(args);
builder.Services.AddScoped<IncidentCorrelationService>();
builder.Services.AddScoped<BruteForceDetectionService>();
builder.Services.AddScoped<SuccessfulLoginDetectionService>();
builder.Services.AddCors(options =>
{
    options.AddPolicy("NexusFrontend", policy =>
    {
        policy
            .WithOrigins("http://localhost:3000")
            .AllowAnyHeader()
            .AllowAnyMethod();
    });
});
builder.Services.AddDbContext<NexusDbContext>(options =>
    options.UseNpgsql(
        builder.Configuration.GetConnectionString("NexusDatabase")));



builder.Services.AddControllers();
// Learn more about configuring Swagger/OpenAPI at https://aka.ms/aspnetcore/swashbuckle
builder.Services.AddEndpointsApiExplorer();
builder.Services.AddSwaggerGen();


var app = builder.Build();

// Configure the HTTP request pipeline.
if (app.Environment.IsDevelopment())
{
    app.UseSwagger();
    app.UseSwaggerUI();
}

app.UseHttpsRedirection();
app.UseCors("NexusFrontend");   

app.UseAuthorization();

app.MapControllers();

app.MapGet("/api/health", () =>
{
    return Results.Ok(new
    {
        status = "NEXUS is running"
    });
});

app.Run();
