using nexusos_data.Entities;
using nexusos_data.Repositories;
using nexusos_models;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace nexusos_business
{
    public class TenantService
    {
        private IRepository<SubscriptionPlan> _plansRepository;
        private IRepository<Tenant> _tenantRepository;
        public TenantService(IRepository<SubscriptionPlan>  plansRepository, IRepository<Tenant> tenantRepository) 
        {
            _plansRepository = plansRepository;
            _tenantRepository = tenantRepository;
        }
        public List<PlansDto> GetPlans()
        {
            return _plansRepository.GetAllAsync().Result.ToList().Select(i=>new PlansDto() {
                Key = i.Code,Description = i.Description,Name = i.Name,Price = i.Price
            }).ToList();
        }
    }
}
