using System;
using System.Collections.Generic;

namespace nexusos_data.Entities;

public partial class Order
{
    public Guid Id { get; set; }

    public Guid? ProductId { get; set; }

    public int? Amount { get; set; }

    public string? Status { get; set; }

    public DateTime? Date { get; set; }

    public Guid? CustomerId { get; set; }

    public virtual User? Customer { get; set; }

    public virtual Product? Product { get; set; }
}
