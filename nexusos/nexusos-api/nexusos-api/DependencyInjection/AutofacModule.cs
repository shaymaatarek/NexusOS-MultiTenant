using Autofac;
using Microsoft.EntityFrameworkCore;
using nexusos_business;
using nexusos_data.Data;
using nexusos_data.Repositories;
using nexusos_data.UnitOfWork;

namespace nexusos_api.DependencyInjection
{
    /// <summary>
    /// Autofac dependency injection module for registering all application services
    /// </summary>
    public class AutofacModule : Module
    {
        private readonly IConfiguration _configuration;

        public AutofacModule(IConfiguration configuration)
        {
            _configuration = configuration;
        }

        protected override void Load(ContainerBuilder builder)
        {
            // Register DbContext
            var connectionString = _configuration.GetConnectionString("DefaultConnection");
            builder.Register(ctx => new NexusOSDbContext(connectionString))
                .As<NexusOSDbContext>()
                .InstancePerLifetimeScope();

            // Register DbContext with options
            //builder.Register(ctx =>
            //{
            //    var optionsBuilder = new DbContextOptionsBuilder<NexusOSDbContext>();
            //    optionsBuilder.UseNpgsql(connectionString);
            //    return new NexusOSDbContext(optionsBuilder.Options);
            //})
            //.As<NexusOSDbContext>()
            //.InstancePerLifetimeScope();

            // Register generic Repository
            builder.RegisterGeneric(typeof(Repository<>))
                .As(typeof(IRepository<>))
                .InstancePerLifetimeScope();

            // Register Unit of Work
            builder.RegisterType<UnitOfWork>()
                .As<IUnitOfWork>()
                .InstancePerLifetimeScope();

            // Register Business Services
            builder.RegisterType<AuthService>()
                .AsSelf()
                .InstancePerLifetimeScope();

            builder.RegisterType<UserService>()
                .AsSelf()
                .InstancePerLifetimeScope();

            builder.RegisterType<ProductService>()
                .AsSelf()
                .InstancePerLifetimeScope();

            builder.RegisterType<TenantService>()
                .AsSelf()
                .InstancePerLifetimeScope();

            builder.RegisterType<OrderService>()
                .AsSelf()
                .InstancePerLifetimeScope();

            // Register Controllers
            builder.RegisterAssemblyTypes(typeof(Program).Assembly)
                .Where(t => t.Name.EndsWith("Controller"))
                .AsSelf()
                .InstancePerRequest();
        }
    }
}
