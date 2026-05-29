using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using nexusos_business;
using nexusos_models;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Security.Claims;
using System.Text;
using System.Threading.Tasks;

namespace nexusos_api.Controllers
{
    [ApiController]
    [Route("api/[controller]")]
    public class UserController: ControllerBase
    {
        private readonly ILogger<UserController> _logger;
        private UserService _userService;
        private readonly AuthService _authService;

        public UserController(ILogger<UserController> logger,UserService userService, AuthService authService)
        {
            _logger = logger;
            _userService = userService;
            _authService = authService;
        }

        [HttpPost("register")]
        public IActionResult AddUser([FromBody] UserDto user)
        {
            try
            {
                var addedUser = _userService.AddTenantAdmin(user).Result;
                var token = _authService.GetToken(addedUser.Item1.Name, addedUser.Item1.Password);
                return StatusCode(200, new {user=addedUser.Item1, tenant = addedUser.Item2, token = token});
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error during registration");
                return StatusCode(500, "An error occurred during registration.");
            }
        }

       
        [HttpGet("getUsers")]
        public IActionResult GetUsers()
        {
            try
            {
                var email = User.FindFirst("Email")?.Value;
                var pw = User.FindFirst("Password")?.Value;
                var existetdUser = _userService.GetUser(email, pw).Result;
                if(existetdUser.Item1 == null && existetdUser.Item2 == null)
                    return StatusCode(200,new List<UserDto>());
                var users = _userService.GetUsers(existetdUser.Item2.Id.ToString());
                return StatusCode(200, users);
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error during user retrieval");
                return StatusCode(500, "An error occurred during user retrieval.");
            }
        }

        [HttpGet("getUser")]
        public IActionResult GetUser(string id)
        {
            try
            {
                //var users = _userService.GetUser(id);
                return StatusCode(200, "users");
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error during user retrieval");
                return StatusCode(500, "An error occurred during user retrieval.");
            }
        }

        [HttpPost("editUser")]
        public IActionResult EditUser(string id,[FromBody] UserDto user)
        {
            try
            {
                var updatedUser = _userService.UpdateUser(Guid.Parse(id),user);
                return StatusCode(200, updatedUser);
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error during user update");
                return StatusCode(500, "An error occurred during user update.");
            }
        }

        [HttpPost("addUser")]
        public IActionResult CreateUser([FromBody] UserDto user)
        {
            try
            {
                var email = User.FindFirst("Email")?.Value;
                var pw = User.FindFirst("Password")?.Value;
                var existetdUser = _userService.GetUser(email, pw).Result;
                Guid? tenantId=null;
                if (existetdUser.Item2 != null) tenantId = existetdUser.Item2.Id;
                user.TenantId = tenantId;
                UserDto addedUser = _userService.AddTenantUser(user).Result;
                return StatusCode(200, addedUser);
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error during user update");
                return StatusCode(500, "An error occurred during user update.");
            }
        }

        [HttpPost("updateUsers")]
        public IActionResult UpdateUsers(List<UserDto> user)
        {
            try
            {
                _userService.UpdateUsers(user);
                return StatusCode(200, "User updated successfully");
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error during user update");
                return StatusCode(500, "An error occurred during user update.");
            }
        }

        [HttpDelete("deleteUser")]
        public IActionResult DeleteUser(string id)
        {
            try
            {
                _userService.DeleteUser(Guid.Parse(id));
                return StatusCode(200, "true");
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error during user deletion");
                return StatusCode(500, "An error occurred during delete user.");
            }
        }
    }
}
