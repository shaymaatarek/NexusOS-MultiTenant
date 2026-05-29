using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace nexusos_models
{
    public class UserDto
    {
        public Guid Id { get; set; }
        public string? FirstName { get; set; } = null;
        public string? Email { get; set; } = null!;
        public string? Password { get; set; } = null!;
        public string? LastName { get; set; } = null!;
        public Guid? TenantId { get; set; }
        public string? Company { get; set; } = null!;
        public string? Role { get; set; } = null!;
        public string? Plan { get; set; } = null!;
        public string? Status { get; set; } = null!;
        public DateTime? JoinedAt { get; set; }
        public string? Name { get => FirstName + " " + LastName; set { FirstName = value.Split(' ')[0]; LastName = value.Split(' ')[1]; } }
    }
}
