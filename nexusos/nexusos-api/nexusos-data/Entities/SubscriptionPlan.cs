using System;
using System.Collections.Generic;

namespace nexusos_data.Entities;

public partial class SubscriptionPlan
{
    public string Code { get; set; } = null!;

    public string Name { get; set; } = null!;

    public string? Description { get; set; }

    public string? Price { get; set; }

    public virtual ICollection<Tenant> Tenants { get; set; } = new List<Tenant>();
}
