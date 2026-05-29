using Microsoft.AspNetCore.Mvc;
using nexusos_business;
using nexusos_models;

namespace nexusos_api.Controllers
{
    [ApiController]
    [Route("api/[controller]")]
    public class OrderController: ControllerBase
    {
        private readonly ILogger<OrderController> _logger;
        private OrderService _orderService;
        private UserService _userService;
        public OrderController(ILogger<OrderController> logger,OrderService orderService,UserService userService )
        {
            _logger = logger;
            _orderService = orderService;
            _userService = userService;
        }
        [HttpGet("getOrders")]
        public IActionResult GetOrders()
        {
            try
            {
                var email = User.FindFirst("Email")?.Value;
                var pw = User.FindFirst("Password")?.Value;
                var existetdUser = _userService.GetUser(email, pw).Result;
                if (existetdUser.Item1 == null && existetdUser.Item2 == null)
                {
                    return StatusCode(200, new List<OrderDto>());
                }
                var Orders = _orderService.GetOrders(existetdUser.Item2.Id.ToString());
                return StatusCode(200, Orders);
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error during getting Orders");
                return StatusCode(500, "An error occurred during getting Orders.");
            }
        }

        [HttpPost("updateOrder")]
        public IActionResult UpdateOrder(string id, [FromBody] OrderDto Order)
        {
            try
            {
                Order.Id = Guid.Parse(id);
                var updatedOrder = _orderService.UpdateOrder(Order);
                return StatusCode(200, updatedOrder);
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error during Order addition");
                return StatusCode(500, "An error occurred during update Order.");
            }
        }

        [HttpPost("addOrder")]
        public IActionResult AddOrder(OrderDto Order)
        {
            try
            {
                var addedOrder = _orderService.AddOrder(Order).Result;
                return StatusCode(200, addedOrder);
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error during Order addition");
                return StatusCode(500, "An error occurred during Order addition.");
            }
        }

        [HttpDelete("deleteOrder")]
        public IActionResult DeleteOrder(string id)
        {
            try
            {
                _orderService.DeleteOrder(Guid.Parse(id));
                return StatusCode(200, "true");
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error during Order addition");
                return StatusCode(500, "An error occurred during update Order.");
            }
        }
    }
}
