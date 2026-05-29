using System;
using System.Collections.Generic;

namespace nexusos_data.Entities;

public partial class Tenant
{
    public Guid Id { get; set; }

    public string Name { get; set; } = null!;

    public string? SubscriptionPlan { get; set; }

    public virtual ICollection<Product> Products { get; set; } = new List<Product>();

    public virtual SubscriptionPlan? SubscriptionPlanNavigation { get; set; }
}
