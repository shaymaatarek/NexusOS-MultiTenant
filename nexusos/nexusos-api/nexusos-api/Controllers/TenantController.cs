using Microsoft.AspNetCore.Mvc;
using nexusos_business;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Text.Json;
using System.Threading.Tasks;

namespace nexusos_api.Controllers
{

    [ApiController]
    [Route("api/[controller]")]
    public class TenantController : ControllerBase
    {
        private readonly ILogger<TenantController> _logger;
        private readonly TenantService _tenantService;
        public TenantController(ILogger<TenantController> logger,TenantService tenantService)
        {
            _logger = logger;
            _tenantService = tenantService;
        }

        [HttpGet("getPlans")]
        public async Task<IActionResult> GetPlans()
        {
            try
            {

                var plans = _tenantService.GetPlans();
                return StatusCode(200,plans);
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error during login");
                return StatusCode(500, "An error occurred during get plans.");

            }
        }
    }
}
