using System;
using System.Collections.Generic;

namespace nexusos_data.Entities;

public partial class Product
{
    public Guid Id { get; set; }

    public string Name { get; set; } = null!;

    public Guid? TenantId { get; set; }

    public double? Price { get; set; }

    public int? Stock { get; set; }
    public string? Status { get; set; }

    public string? Category { get; set; }

    public virtual Tenant? Tenant { get; set; }
    public virtual ICollection<Order> Orders { get; set; } = new List<Order>();

}
