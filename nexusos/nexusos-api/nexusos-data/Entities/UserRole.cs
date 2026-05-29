using System;
using System.Collections.Generic;

namespace nexusos_data.Entities;

public partial class UserRole
{
    public string Code { get; set; } = null!;

    public string Name { get; set; } = null!;

    public string? Description { get; set; }

    public virtual ICollection<User> Users { get; set; } = new List<User>();
}
