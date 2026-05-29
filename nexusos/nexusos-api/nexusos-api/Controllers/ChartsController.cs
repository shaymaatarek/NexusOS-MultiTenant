using Microsoft.AspNetCore.Mvc;
using nexusos_business;
using nexusos_models;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace nexusos_api.Controllers
{
    [ApiController]
    [Route("api/[controller]")]
    public class ChartsController : ControllerBase
    {
        private readonly ILogger<ChartsController> _logger;
        private UserService _userService;
        private readonly TenantService _tenantService;
        private readonly ProductService _productService;
        private readonly OrderService _orderService;
        public ChartsController(ILogger<ChartsController> logger, UserService userService, ProductService productService,TenantService tenantService, OrderService orderService)
        {
            _logger = logger;
            _userService = userService;
            _tenantService = tenantService;
            _productService = productService;
            _orderService = orderService;
        }


        [HttpGet("stats")]
        public IActionResult GetDashboardData()
        {
            try
            {
                var email = User.FindFirst("Email")?.Value;
                var pw = User.FindFirst("Password")?.Value;
                var existetdUser = _userService.GetUser(email, pw).Result;

                if(existetdUser.Item1 == null || existetdUser.Item2 == null)
                {
                    return StatusCode(200, new
                    {
                        totalUsers=0,
                        totalProducts=0,
                        totalOrders=0,
                        revenue=0,
                        ordersByStatus = new Dictionary<string, int>(),
                        recentOrders = new List<OrderDto>()
                    });
                }
                string tenantId= existetdUser.Item2?.Id.ToString(); // Replace with actual tenant ID retrieval logic
                var totalUsers = _userService.GetUsers(tenantId).Count;
                var totalProducts = _productService.GetProducts(tenantId).Count;
                var totalOrders = _orderService.GetOrders(tenantId).Count;
                var ordersByStatus = _orderService.GetOrdersCountByStatus(tenantId);
                var recentOrders = _orderService.GetRecentOrders(tenantId);
                var revenue = _orderService.GetTotalRevenue(tenantId);
                var dashboardData = new
                {
                    totalUsers,
                    totalProducts,
                    totalOrders,
                    revenue,
                    ordersByStatus,
                    recentOrders
                };
                return StatusCode(200, dashboardData);
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error during dashboard data retrieval");
                return StatusCode(500, "An error occurred during dashboard data retrieval.");
            } 
        }
            
    }
}
