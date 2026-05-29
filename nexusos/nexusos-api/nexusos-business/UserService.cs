using nexusos_data.Entities;
using nexusos_data.Repositories;
using nexusos_data.UnitOfWork;
using nexusos_models;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace nexusos_business
{
    public class UserService
    {
        private IRepository<User> _userRepository;
        private IRepository<Tenant> _tenantRepository;
        private IUnitOfWork _unitOfWork;
        public UserService(IRepository<User> userRepository, IRepository<Tenant> tenantRepository,IUnitOfWork unitOfWork)
        {
            _userRepository = userRepository;
            _tenantRepository = tenantRepository;
            _unitOfWork = unitOfWork;
        }
        public async Task<(UserDto,TenantDto)> AddTenantAdmin(UserDto user)
        {
            var tenantId = Guid.NewGuid();
            var tenant = new TenantDto()
            {
                Id = tenantId,
                Company = user.Company,
                Plan = user.Plan,
            };
            user.TenantId = tenantId;
            user.Role = "TA";
            user.JoinedAt = DateTime.Now.ToUniversalTime();
            user.Id = Guid.NewGuid();
            await _tenantRepository.AddAsync(new Tenant() {
                Id = tenantId,
                Name = user.Company,
                SubscriptionPlan = user.Plan
            });


            await _userRepository.AddAsync(new User
            {
                Id = user.Id,
                FirstName = user.FirstName,
                LastName = user.LastName,
                Email = user.Email,
                Password = user.Password,
                TenantId = user.TenantId,
                UserRole = user.Role,
                Status = "Active",
                JoinedAt = user.JoinedAt,
            });

            await _unitOfWork.SaveChangesAsync();

            return (user,tenant);
        }

        public async Task<UserDto> AddTenantUser(UserDto user)
        {
            user.Role = "TU";
            user.Id = Guid.NewGuid();
            user.JoinedAt = DateTime.Now.ToUniversalTime();
            await _userRepository.AddAsync(new User
            {
                Id = user.Id,
                FirstName = user.FirstName,
                LastName = user.LastName,
                Email = user.Email,
                Password = user.Password,
                TenantId = user.TenantId,
                UserRole = user.Role,
                Status = user.Status,
                JoinedAt= user.JoinedAt,
            });

            await _unitOfWork.SaveChangesAsync();

            return user; 
        }

        public void DeleteUser(Guid userId)
        {
            var userObj = _userRepository.GetByIdAsync(userId).Result;
            if (userObj != null)
            {
                _userRepository.Delete(userObj);
                var result = _unitOfWork.SaveChangesAsync().Result;
            }
        }

        public async Task<(UserDto, TenantDto)> GetUser(string? email, string? pw)
        {
            var user = await _userRepository.FirstOrDefaultAsync(i => i.Email == email && i.Password == pw);
            if (user != null)
            {
                var tenant = await _tenantRepository.FirstOrDefaultAsync(i => i.Id == user.TenantId);
                var tenantDto = new TenantDto()
                {
                    Id = tenant.Id,
                    Company = tenant.Name,
                    Plan = tenant.SubscriptionPlan
                };
                var userDto = new UserDto
                {
                    Id = user.Id,
                    FirstName = user.FirstName,
                    LastName = user.LastName,
                    Email = user.Email,
                    Password = user.Password,
                    TenantId = user.TenantId,
                    Company = tenant.Name,
                    Role = user.UserRole,
                    Status = user.Status,
                    JoinedAt = user.JoinedAt
                };
                return (userDto,tenantDto);
            }
            return (null, null);
        }

        public List<UserDto> GetUsers(string adminID)
        {
          
            var list = _userRepository.FindAsync(i=>i.TenantId == Guid.Parse(adminID)).Result.ToList<User>();
           
            var mappedUsers = list.Select(i => new UserDto
            {
                Id = i.Id,
                FirstName = i.FirstName,
                LastName = i.LastName,
                Email = i.Email,
                Password = i.Password,
                TenantId = i.TenantId,
                Company = i.TenantNavigation.Name,
                Role = i.UserRole,
                Status = i.Status,
                JoinedAt = i.JoinedAt   
            }).ToList();
            return mappedUsers;
        }

        public UserDto UpdateUser(Guid userId,UserDto user)
        {
            var userObj = _userRepository.FirstOrDefaultAsync(i => i.Id == userId).Result;
            if(userObj != null)
            {
                userObj.FirstName = user.FirstName;
                userObj.LastName = user.LastName;
                userObj.Email = user.Email;
                userObj.Password = user.Password;
                userObj.UserRole = user.Role;
                userObj.TenantId = user.TenantId;
                userObj.Status = user.Status;
                
                _userRepository.Update(userObj);

                var result = _unitOfWork.SaveChangesAsync().Result;
                return user;
            }
            return null;
        }

        public void UpdateUsers(List<UserDto> users)
        {
            var userList = _userRepository.GetAllAsync().Result.ToList<User>();
            foreach (var user in users)
            {

                var userObj = userList.FirstOrDefault<User>(x => x.Id == user.Id);
                if (userObj != null)
                {
                    userObj.FirstName = user.FirstName;
                    userObj.LastName = user.LastName;
                    userObj.Email = user.Email;
                    userObj.Password = user.Password;
                    userObj.UserRole = user.Role;
                    userObj.TenantId = user.TenantId;
                    
                    _userRepository.Update(userObj);
                }
            }

        }
    }
}
