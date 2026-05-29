using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace nexusos_models
{
    public class ProductDto
    {
        public Guid Id { get; set; }

        public string Name { get; set; } = null!;

        public Guid? TenantId { get; set; }
        public string? TenantName { get; set; } = null!;
        public double? Price { get; set; }

        public int ? Stock { get; set; }
        public string? Status { get; set; }

        public string? Category { get; set; }

    }
}
