using System.Security.Claims;
using System.Text;
using Microsoft.AspNetCore.Authentication.JwtBearer;
using Microsoft.EntityFrameworkCore;
using Microsoft.IdentityModel.Tokens;
using Microsoft.OpenApi.Models;
using Npgsql;
using TaskTrack.API.Services;
using TaskTrack.Repo;
using TaskTrack.Repo.Repositories;
using TaskTrack.Service.Interfaces;
using TaskTrack.Service.Services;

var builder = WebApplication.CreateBuilder(args);
builder.Configuration.AddJsonFile("appsettings.Local.json", optional: true, reloadOnChange: true);

var renderPort = Environment.GetEnvironmentVariable("PORT");
if (!string.IsNullOrWhiteSpace(renderPort)) builder.WebHost.UseUrls($"http://0.0.0.0:{renderPort}");

var rawConnection = builder.Configuration["DATABASE_URL"] ?? builder.Configuration.GetConnectionString("DefaultConnection");
if (string.IsNullOrWhiteSpace(rawConnection)) throw new InvalidOperationException("DATABASE_URL or ConnectionStrings:DefaultConnection must be configured.");

builder.Services.AddDbContext<TaskManagementContext>(options => options.UseNpgsql(ToNpgsqlConnectionString(rawConnection)));
builder.Services.AddScoped<ITaskTrackRepository, TaskTrackRepository>();
builder.Services.AddScoped<IAccountRepository, AccountRepository>();
builder.Services.AddScoped<IDepartmentService, DepartmentService>();
builder.Services.AddScoped<IProjectService, ProjectService>();
builder.Services.AddScoped<ITaskService, TaskService>();
builder.Services.AddScoped<ITagService, TagService>();
builder.Services.AddScoped<IAuthService, AuthService>();
builder.Services.AddSingleton<IPasswordHasher, Pbkdf2PasswordHasher>();
builder.Services.AddSingleton<ITokenService, JwtTokenService>();
var configuredOrigins = builder.Configuration.GetSection("Cors:AllowedOrigins").Get<string[]>()?.Where(x => !string.IsNullOrWhiteSpace(x)).ToList() ?? [];
var deployedFrontend = builder.Configuration["FRONTEND_URL"];
if (!string.IsNullOrWhiteSpace(deployedFrontend)) configuredOrigins.Add(deployedFrontend.TrimEnd('/'));
builder.Services.AddCors(options => options.AddPolicy("Frontend", policy =>
{
    if (configuredOrigins.Count == 0) policy.AllowAnyOrigin().AllowAnyHeader().AllowAnyMethod();
    else policy.WithOrigins(configuredOrigins.Distinct().ToArray()).AllowAnyHeader().AllowAnyMethod();
}));

// Add services to the container.

var jwtSecret = builder.Configuration["JWT_SECRET"] ?? builder.Configuration["Jwt:Secret"];
if (string.IsNullOrWhiteSpace(jwtSecret) || jwtSecret.Length < 32)
    throw new InvalidOperationException("JWT_SECRET (or Jwt:Secret locally) must contain at least 32 characters.");
var jwtIssuer = builder.Configuration["Jwt:Issuer"] ?? "TaskTrack.API";
var jwtAudience = builder.Configuration["Jwt:Audience"] ?? "TaskTrack.Frontend";
builder.Services.AddAuthentication(JwtBearerDefaults.AuthenticationScheme)
    .AddJwtBearer(options =>
    {
        options.TokenValidationParameters = new TokenValidationParameters
        {
            ValidateIssuer = true,
            ValidIssuer = jwtIssuer,
            ValidateAudience = true,
            ValidAudience = jwtAudience,
            ValidateIssuerSigningKey = true,
            IssuerSigningKey = new SymmetricSecurityKey(Encoding.UTF8.GetBytes(jwtSecret)),
            ValidateLifetime = true,
            ClockSkew = TimeSpan.FromSeconds(30),
            NameClaimType = ClaimTypes.Name,
            RoleClaimType = ClaimTypes.Role
        };
    });
builder.Services.AddAuthorization();
builder.Services.AddControllers();
builder.Services.AddEndpointsApiExplorer();
builder.Services.AddSwaggerGen(options =>
{
    options.AddSecurityDefinition("Bearer", new OpenApiSecurityScheme
    {
        Name = "Authorization",
        Type = SecuritySchemeType.Http,
        Scheme = "bearer",
        BearerFormat = "JWT",
        In = ParameterLocation.Header,
        Description = "Enter the JWT access token returned by /api/auth/login."
    });
    options.AddSecurityRequirement(new OpenApiSecurityRequirement
    {
        [new OpenApiSecurityScheme
        {
            Reference = new OpenApiReference { Type = ReferenceType.SecurityScheme, Id = "Bearer" }
        }] = Array.Empty<string>()
    });
});

var app = builder.Build();

app.UseMiddleware<TaskTrack.API.Middleware.ApiExceptionMiddleware>();
app.UseSwagger();
app.UseSwaggerUI();
app.UseCors("Frontend");
app.UseAuthentication();
app.UseAuthorization();

app.MapControllers();
app.MapGet("/health", async (TaskManagementContext database, CancellationToken cancellationToken) =>
{
    var databaseReachable = await database.Database.CanConnectAsync(cancellationToken);
    return databaseReachable
        ? Results.Ok(new { status = "healthy", database = "reachable" })
        : Results.Json(new { status = "unhealthy", database = "unreachable" }, statusCode: StatusCodes.Status503ServiceUnavailable);
});
app.MapGet("/", () => Results.Redirect("/swagger"));

app.Run();

static string ToNpgsqlConnectionString(string value)
{
    if (!value.StartsWith("postgres://", StringComparison.OrdinalIgnoreCase) && !value.StartsWith("postgresql://", StringComparison.OrdinalIgnoreCase)) return value;
    var uri = new Uri(value);
    var userInfo = uri.UserInfo.Split(':', 2);
    var connection = new NpgsqlConnectionStringBuilder
    {
        Host = uri.Host,
        Port = uri.Port > 0 ? uri.Port : 5432,
        Database = uri.AbsolutePath.Trim('/'),
        Username = Uri.UnescapeDataString(userInfo[0]),
        Password = userInfo.Length > 1 ? Uri.UnescapeDataString(userInfo[1]) : string.Empty,
        SslMode = SslMode.Require,
    };
    return connection.ConnectionString;
}
