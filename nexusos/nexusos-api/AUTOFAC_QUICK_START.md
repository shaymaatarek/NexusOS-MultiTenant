# ?? Autofac DI Quick Start Guide

## ? What Was Implemented

Your NexusOS application now has **fully configured Autofac dependency injection** integrated into the ASP.NET Core API.

---

## ?? What Was Installed

| Package | Version | Purpose |
|---------|---------|---------|
| Autofac | 8.0.0 | Core DI container |
| Autofac.Extensions.DependencyInjection | 9.0.0 | ASP.NET Core integration |

---

## ??? Files Created/Modified

### Created Files
? `nexusos-api/DependencyInjection/AutofacModule.cs` - Main DI configuration  
? `AUTOFAC_IMPLEMENTATION_SUMMARY.md` - Complete implementation details  
? This Quick Start Guide

### Modified Files
? `nexusos-api/nexusos-api.csproj` - Added NuGet packages  
? `nexusos-api/Program.cs` - Integrated Autofac container  
? `nexusos-api/appsettings.json` - Added PostgreSQL connection string  
? `nexusos-api/Controllers/AuthController.cs` - Updated DI pattern  
? `nexusos-api/Controllers/ProductController.cs` - Updated DI pattern  
? `nexusos-api/Controllers/UserController.cs` - Updated DI pattern (made public)  

---

## ?? How It Works

### Before (Manual Instantiation)
```csharp
// Not ideal - tight coupling
var repo = new Repository<User>(context);
var authService = new AuthService(repo);
var controller = new AuthController(logger, authService);
```

### After (Autofac Injection)
```csharp
// Automatic injection - loose coupling
[ApiController]
public class AuthController : ControllerBase
{
    public AuthController(ILogger<AuthController> logger, AuthService authService)
    {
        // Autofac automatically provides these dependencies!
    }
}
```

---

## ?? Service Registration Overview

```
Autofac Container (AutofacModule.cs)
?
??? Database Layer
?   ??? NexusOSDbContext
?   ??? IUnitOfWork ? UnitOfWork
?   ??? IRepository<T> ? Repository<T> (Generic)
?
??? Business Services
?   ??? AuthService
?   ??? UserService
?   ??? ProductService
?
??? Controllers (Auto-registered)
    ??? AuthController
    ??? UserController
    ??? ProductController
    ??? TenantController
```

---

## ?? Configuration

### PostgreSQL Connection String
**Location**: `appsettings.json` (Development/Production)

```json
{
  "ConnectionStrings": {
    "DefaultConnection": "Server=localhost;Port=5432;Database=NexusOS;User Id=postgres;Password=Abc123456"
  }
}
```

**To change**:
1. Open `appsettings.json`
2. Update the connection string
3. Restart the application

---

## ?? Running the Application

```bash
# Navigate to API project
cd nexusos-api

# Run the application
dotnet run

# Output (similar to):
# info: Microsoft.Hosting.Lifetime[14]
#       Now listening on: https://localhost:7123
#       Now listening on: http://localhost:5123
```

---

## ? Example: Adding a New Service

Want to add a new service? Here's how Autofac makes it easy:

### Step 1: Create Your Service
```csharp
// nexusos-business/TenantService.cs
public class TenantService
{
    private readonly IRepository<Tenant> _tenantRepository;

    public TenantService(IRepository<Tenant> tenantRepository)
    {
        _tenantRepository = tenantRepository;
    }

    public async Task<List<Tenant>> GetAllTenantsAsync()
    {
        return (await _tenantRepository.GetAllAsync()).ToList();
    }
}
```

### Step 2: Register in Autofac
```csharp
// In AutofacModule.cs - Load method
builder.RegisterType<TenantService>()
    .AsSelf()
    .InstancePerLifetimeScope();
```

### Step 3: Inject in Controller
```csharp
[ApiController]
[Route("api/[controller]")]
public class TenantController : ControllerBase
{
    private readonly TenantService _tenantService;

    public TenantController(TenantService tenantService)
    {
        _tenantService = tenantService;
    }

    [HttpGet]
    public async Task<IActionResult> GetTenants()
    {
        var tenants = await _tenantService.GetAllTenantsAsync();
        return Ok(tenants);
    }
}
```

**That's it!** Autofac handles everything automatically.

---

## ?? Debugging Tips

### Check Service Registration
Add this to `Program.cs` to see registered services:

```csharp
// Optional: Log registered components (Development only)
if (app.Environment.IsDevelopment())
{
    var componentRegistry = app.Services.GetRequiredService<IComponentContext>();
    // You can inspect registered components here
}
```

### Enable Detailed Logging
Update `appsettings.Development.json`:

```json
{
  "Logging": {
    "LogLevel": {
      "Default": "Debug",
      "Autofac": "Debug",
      "Microsoft.EntityFrameworkCore": "Debug"
    }
  }
}
```

---

## ?? Testing with DI

### Mock Dependencies
```csharp
[TestClass]
public class AuthServiceTests
{
    [TestMethod]
    public async Task Login_WithValidCredentials_ReturnsUser()
    {
        // Arrange
        var mockRepo = new Mock<IRepository<User>>();
        var authService = new AuthService(mockRepo.Object);

        // Act
        var result = await authService.Login("test@example.com", "password");

        // Assert
        Assert.IsNotNull(result);
    }
}
```

---

## ?? Lifetime Scopes Explained

| Scope | Usage | Example |
|-------|-------|---------|
| **InstancePerLifetimeScope** | One per request | DbContext, Services, Repositories |
| **InstancePerRequest** | One per HTTP request | Controllers |
| **SingleInstance** | One for entire app lifetime | Configuration, Logging |

**Current Setup**: All services use `InstancePerLifetimeScope` - new instance per request, perfect for web APIs.

---

## ? FAQ

### Q: Can I use both ASP.NET Core DI and Autofac?
**A**: Yes! ASP.NET Core services (like `ILogger<T>`) work alongside Autofac. Autofac is the primary container.

### Q: How do I add a scoped vs singleton service?
**A**: In `AutofacModule.cs`:
```csharp
// Scoped (new instance per request)
builder.RegisterType<MyService>()
    .InstancePerLifetimeScope();

// Singleton (one instance for entire app)
builder.RegisterType<MyService>()
    .SingleInstance();
```

### Q: What if a service needs multiple implementations?
**A**: Register with keyed services:
```csharp
builder.RegisterType<MySqlRepository>()
    .Keyed<IRepository<User>>("mysql");

builder.RegisterType<PostgresRepository>()
    .Keyed<IRepository<User>>("postgres");
```

### Q: How do I test services with DI?
**A**: Mock the dependencies as shown in the Testing section above.

---

## ? Verification Checklist

- ? Build succeeds without errors
- ? Autofac packages installed
- ? AutofacModule created and configured
- ? Program.cs integrated with Autofac
- ? Connection string configured
- ? Controllers updated with proper DI pattern
- ? All services auto-injectable

---

## ?? Troubleshooting

### Error: "Could not resolve dependency"
**Solution**: Ensure service is registered in `AutofacModule.cs`

### Error: "Connection string not found"
**Solution**: Check `appsettings.json` has `DefaultConnection` entry

### Error: "Type not recognized"
**Solution**: Check using statements in `AutofacModule.cs` include all service namespaces

---

## ?? Support

For issues or questions:
1. Check `AUTOFAC_IMPLEMENTATION_SUMMARY.md` for detailed information
2. Review `AutofacModule.cs` for registration patterns
3. Check `Program.cs` for Autofac configuration

---

## ?? You're All Set!

Your application is now ready to run with full dependency injection support. 

```bash
dotnet run
```

**Happy coding!** ??
