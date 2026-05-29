using System;
using System.Collections.Generic;
using Microsoft.EntityFrameworkCore;
using nexusos_data.Entities;

namespace nexusos_data.Data;

public partial class NexusOSDbContext : DbContext
{
    private readonly string? _connectionString;

    public NexusOSDbContext()
    {
    }

    public NexusOSDbContext(DbContextOptions<NexusOSDbContext> options)
        : base(options)
    {
    }
    public NexusOSDbContext(string connectionString)
    {
        _connectionString = connectionString;
    }

    public virtual DbSet<Product> Products { get; set; }

    public virtual DbSet<SubscriptionPlan> SubscriptionPlans { get; set; }

    public virtual DbSet<Tenant> Tenants { get; set; }

    public virtual DbSet<User> Users { get; set; }

    public virtual DbSet<UserRole> UserRoles { get; set; }

    public virtual DbSet<Order> Orders { get; set; }
    protected override void OnConfiguring(DbContextOptionsBuilder optionsBuilder)
        => optionsBuilder.UseNpgsql(_connectionString);

    protected override void OnModelCreating(ModelBuilder modelBuilder)
    {
        modelBuilder.Entity<Product>(entity =>
        {
            entity.HasKey(e => e.Id).HasName("Product_pkey");

            entity.ToTable("Product");

            entity.Property(e => e.Id).ValueGeneratedNever();
            entity.Property(e => e.Category).HasMaxLength(256);
            entity.Property(e => e.Name).HasMaxLength(256);
            entity.Property(e => e.Status).HasMaxLength(20);

            entity.HasOne(d => d.Tenant).WithMany(p => p.Products)
                .HasForeignKey(d => d.TenantId)
                .HasConstraintName("TenantId");
        });

        modelBuilder.Entity<SubscriptionPlan>(entity =>
        {
            entity.HasKey(e => e.Code).HasName("SubscriptionPlan_pkey");

            entity.ToTable("SubscriptionPlan");

            entity.Property(e => e.Price).HasMaxLength(256);
            entity.Property(e => e.Code).HasMaxLength(10);
            entity.Property(e => e.Description).HasMaxLength(400);
            entity.Property(e => e.Name).HasMaxLength(256);
        });

        modelBuilder.Entity<Tenant>(entity =>
        {
            entity.HasKey(e => e.Id).HasName("Tenant_pkey");

            entity.ToTable("Tenant");

            entity.HasIndex(e => e.SubscriptionPlan, "fki_SubscriptionPlan");

            entity.Property(e => e.Id).ValueGeneratedNever();
            entity.Property(e => e.Name).HasMaxLength(256);
            entity.Property(e => e.SubscriptionPlan).HasMaxLength(10);

            entity.HasOne(d => d.SubscriptionPlanNavigation).WithMany(p => p.Tenants)
                .HasForeignKey(d => d.SubscriptionPlan)
                .OnDelete(DeleteBehavior.Cascade)
                .HasConstraintName("SubscriptionPlan");
        });

        modelBuilder.Entity<User>(entity =>
        {
            entity.HasKey(e => e.Id).HasName("User_pkey");

            entity.ToTable("User");

            entity.Property(e => e.Id).ValueGeneratedNever();
            entity.Property(e => e.Email).HasMaxLength(400);
            entity.Property(e => e.FirstName).HasMaxLength(150);
            entity.Property(e => e.LastName).HasMaxLength(150);
            entity.Property(e => e.Password).HasMaxLength(150);
            entity.Property(e => e.UserRole).HasMaxLength(150);

            entity.HasOne(d => d.UserRoleNavigation).WithMany(p => p.Users)
                .HasForeignKey(d => d.UserRole)
                .HasConstraintName("UserRole");
        });

        modelBuilder.Entity<UserRole>(entity =>
        {
            entity.HasKey(e => e.Code).HasName("UserRole_pkey");

            entity.ToTable("UserRole");

            entity.Property(e => e.Code).HasMaxLength(150);
            entity.Property(e => e.Description).HasMaxLength(400);
            entity.Property(e => e.Name).HasMaxLength(256);
        });

        modelBuilder.Entity<Order>(entity =>
        {
            entity.HasKey(e => e.Id).HasName("Order_pkey");

            entity.ToTable("Order");

            entity.Property(e => e.Id).ValueGeneratedNever();
            entity.Property(e => e.Status).HasMaxLength(150);

            entity.HasOne(d => d.Customer).WithMany(p => p.Orders)
                .HasForeignKey(d => d.CustomerId)
                .HasConstraintName("User_FK");

            entity.HasOne(d => d.Product).WithMany(p => p.Orders)
                .HasForeignKey(d => d.ProductId)
                .HasConstraintName("Product_FK");
        });

        OnModelCreatingPartial(modelBuilder);
    }

    partial void OnModelCreatingPartial(ModelBuilder modelBuilder);
}
