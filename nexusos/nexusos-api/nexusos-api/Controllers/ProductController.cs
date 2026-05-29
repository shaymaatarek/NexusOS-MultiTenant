using Microsoft.AspNetCore.Mvc;
using nexusos_business;
using nexusos_data.Entities;
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
    public class ProductController:ControllerBase
    {
        private readonly ILogger<ProductController> _logger;
        private readonly ProductService _productService;
        private UserService _userService;

        public ProductController(ILogger<ProductController> logger, ProductService productService, UserService userService)
        {
            _logger = logger;
            _productService = productService;
            _userService = userService;
        }


        [HttpGet("getProducts")]
        public IActionResult GetProducts()
        {
            try
            {
                var email = User.FindFirst("Email")?.Value;
                var pw = User.FindFirst("Password")?.Value;
                var existetdUser = _userService.GetUser(email, pw).Result;
                if(existetdUser.Item1 == null && existetdUser.Item2 == null)
                {
                    return StatusCode(200, new List<ProductDto>());
                }
                var products = _productService.GetProducts(existetdUser.Item2.Id.ToString());
                return StatusCode(200, products);
            }
            catch(Exception ex)
            {
                _logger.LogError(ex, "Error during getting products");
                return StatusCode(500, "An error occurred during getting products.");
            }
        }

        [HttpPost("updateProducts")]
        public IActionResult UpdateProducts(List<ProductDto> products)
        {
            try
            {
                _productService.UpdateProducts(products);
                return StatusCode(200, "Product added successfully");
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error during product addition");
                return StatusCode(500, "An error occurred during product addition.");
            }
        }

        [HttpPost("updateProduct")]
        public IActionResult UpdateProduct(string  id,[FromBody] ProductDto product)
        {
            try
            {
                var updatedProduct = _productService.UpdateProduct(product);
                return StatusCode(200, updatedProduct);
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error during product addition");
                return StatusCode(500, "An error occurred during update product.");
            }
        }

        [HttpPost("addProduct")]
        public IActionResult AddProduct(ProductDto product)
        {
            try
            {
                var email = User.FindFirst("Email")?.Value;
                var pw = User.FindFirst("Password")?.Value;
                var existetdUser = _userService.GetUser(email, pw).Result;
                Guid? tenantId = null;
                if (existetdUser.Item2 != null) tenantId = existetdUser.Item2.Id;
                product.TenantId = tenantId;

                var addedProduct = _productService.AddProduct(product).Result;
                return StatusCode(200, addedProduct);
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error during product addition");
                return StatusCode(500, "An error occurred during product addition.");
            }
        }

        [HttpDelete("deleteProduct")]
        public IActionResult DeleteProduct(string id)
        {
            try
            {
                _productService.DeleteProduct(Guid.Parse(id));
                return StatusCode(200, "true");
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error during product addition");
                return StatusCode(500, "An error occurred during update product.");
            }
        }
    }
}
