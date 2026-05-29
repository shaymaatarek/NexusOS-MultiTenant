using System;
using System.Collections.Generic;

namespace nexusos_data.Entities;

public partial class User
{
    public Guid Id { get; set; }

    public string FirstName { get; set; } = null!;

    public string Email { get; set; } = null!;

    public string? Password { get; set; } = null!;

    public string LastName { get; set; } = null!;

    public Guid? TenantId { get; set; }

    public string UserRole { get; set; } = null!;

    public string? Status { get; set; } = null!;
    public DateTime? JoinedAt { get; set; }
    public virtual UserRole UserRoleNavigation { get; set; } = null!;

    public virtual Tenant? TenantNavigation { get; set; } = null!;
    public virtual ICollection<Order> Orders { get; set; } = new List<Order>();

}
