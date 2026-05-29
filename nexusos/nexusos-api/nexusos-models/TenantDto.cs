using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace nexusos_models
{
    public class TenantDto
    {
        public Guid Id { get; set; }

        public string Company { get; set; } = null!;

        public string Plan { get; set; }
    }
}
