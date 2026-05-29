using Microsoft.Extensions.Configuration;
using Microsoft.IdentityModel.Tokens;
using nexusos_data.Entities;
using nexusos_data.Repositories;
using nexusos_models;
using System;
using System.Collections.Generic;
using System.IdentityModel.Tokens.Jwt;
using System.Linq;
using System.Security.Claims;
using System.Text;
using System.Threading.Tasks;

namespace nexusos_business
{
    public class AuthService
    {
        private IRepository<User> _userRepository;
        private IRepository<Tenant> _tenantRepository;
        private readonly IConfiguration _config;

        private string jwtKey = "linE@123456";
        public AuthService(IRepository<User>  userRepository, IRepository<Tenant> tenantRepository,IConfiguration configuration)
        {
            _userRepository = userRepository;
            _tenantRepository = tenantRepository;
            _config = configuration;
        }
        public string GetToken(string email, string password)
        {
            var securityKey = new SymmetricSecurityKey(Encoding.UTF8.GetBytes(_config["Jwt:Key"]));
            var credentials = new SigningCredentials(securityKey, SecurityAlgorithms.HmacSha256);

            var claims = new[] {
                new Claim("Email", email),
                new Claim("Password", password)
            };

            var token = new JwtSecurityToken(
                issuer: _config["Jwt:Issuer"],
                audience: _config["Jwt:Audience"],
                claims: claims,
                expires: DateTime.Now.AddMinutes(60),
                signingCredentials: credentials);

            return new JwtSecurityTokenHandler().WriteToken(token);
        }

        public async Task<(UserDto,TenantDto)> Login(string email, string password)
        {
            var result = await _userRepository.FirstOrDefaultAsync(i=>i.Email == email && i.Password == password);
            if (result != null)
            {
                var currentTenant =await _tenantRepository.FirstOrDefaultAsync(i=>i.Id == result.TenantId);
                var user = new UserDto() {
                    FirstName = result.FirstName,
                    LastName = result.LastName,
                    Email = result.Email,
                    Password = result.Password,
                    Id = result.Id,
                    TenantId = result.TenantId,
                    Company = currentTenant != null? currentTenant.Name : string.Empty,
                    Role = result.UserRole,
                    Status = result.Status??string.Empty
                };
                if (currentTenant == null)
                {
                    return (user, null);
                }
                var tenant = new TenantDto() {
                    Id = currentTenant.Id,
                    Company = currentTenant.Name,
                    Plan = currentTenant.SubscriptionPlan,
                };
                return (user, tenant);
            }
            return (null,null);
        }
    }
}
