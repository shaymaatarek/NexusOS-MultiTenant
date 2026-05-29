using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace nexusos_models
{
    public class OrderDto
    {
        public Guid Id { get; set; }
        public Guid? ProductId { get; set; }
        public Guid? UserId { get; set; }
        public int? Amount { get; set; }
        public DateTime? CreatedAt { get; set; }
        public string? Status { get; set; } = null!;
        public string? Action { get; set; } = null!;
        public string? UserName { get; set; } = null!;
        public string? ProductName { get; set; } = null!;
    }
}
