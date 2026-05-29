using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using nexusos_business;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Security.Claims;
using System.Text;
using System.Text.Json;
using System.Text.Json.Serialization;
using System.Threading.Tasks;

namespace nexusos_api.Controllers
{
    [ApiController]
    [Route("api/[controller]")]
    public class AuthController : ControllerBase
    {
        private readonly ILogger<AuthController> _logger;
        private readonly AuthService _authService;
        private UserService _userService;

        public AuthController(ILogger<AuthController> logger, AuthService authService, UserService userService)
        {
            _logger = logger;
            _authService = authService;
            _userService = userService;
        }

        [HttpPost("login")]
        public async Task<IActionResult> LoginAsync([FromBody]object data)
        {
            try
            {
                var jsonElement = JsonSerializer.SerializeToElement(data);    
                var email = jsonElement.GetProperty("email").GetString();
                var password = jsonElement.GetProperty("password").GetString();
                var result = await _authService.Login(email, password);
                if(result.Item1 == null)
                {
                    return StatusCode(401, "Invalid email or password.");
                }
                var token = _authService.GetToken(email, password);
                return StatusCode(200, new {token=token,user= result.Item1, tenant= result.Item2});
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error during login");
                return StatusCode(500, "An error occurred during login.");

            }
        }

        [HttpGet("getToken")]
        public IActionResult GetToken(string username, string password)
        {
            try
            {
                var token =  _authService.GetToken(username, password);
                return StatusCode(200, token);
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error during token generation");
                return StatusCode(500, "An error occurred during token generation.");
            }
        }


        [HttpGet("me")]
        public IActionResult GetCurrentUser()
        {
            try
            {
                var email = User.FindFirst("Email")?.Value;
                var pw = User.FindFirst("Password")?.Value;
                var existetdUser = _userService.GetUser(email, pw).Result;

                return StatusCode(200, new { user = existetdUser.Item1, tenant = existetdUser.Item2 });
            }
            catch (Exception ex)
            {

                return StatusCode(500, "An error occurred during login.");
            }

        }
    }
}
