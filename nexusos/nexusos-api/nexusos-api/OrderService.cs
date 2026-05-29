
using nexusos_data.Entities;
using nexusos_data.Repositories;
using nexusos_data.UnitOfWork;
using nexusos_models;
using System.Linq;

namespace nexusos_api
{
    public class OrderService
    {
        private IUnitOfWork _unitOfWork;
        private IRepository<Product> _productRepository;
        private IRepository<Order> _orderRepository;
        private IRepository<User> _userRepository;
        public OrderService(IUnitOfWork unitOfWork, IRepository<Order> orderRepository,IRepository<Product> productRepository,IRepository<User> userRepository)
        {
            _unitOfWork = unitOfWork;
            _orderRepository = orderRepository;
            _productRepository = productRepository;
            _userRepository = userRepository;
        }
        internal async Task<OrderDto> AddOrder(OrderDto order)
        {
            order.Id = Guid.NewGuid();
            var product = _productRepository.GetByIdAsync(order?.ProductId).Result;
            var user = _userRepository.GetByIdAsync(order?.UserId).Result;
            var orderObj = new Order()
            {
                Id = order.Id,
                CustomerId = order.UserId,
                Amount = order.Amount,
                Date = DateTime.Now.ToUniversalTime(),
                ProductId = order.ProductId,
                Status = order.Status,
            };
            order.ProductName = product?.Name;
            order.UserName = user?.FirstName + " " + user?.LastName;
            await _orderRepository.AddAsync(orderObj);
            await _unitOfWork.SaveChangesAsync();
            return order;
        }

        internal void DeleteOrder(Guid orderId)
        {
            var orderObj = _orderRepository.GetByIdAsync(orderId).Result;
            if (orderObj != null)
            {
                _orderRepository.Delete(orderObj);
                var result = _unitOfWork.SaveChangesAsync().Result;
            }
        }

        internal List<OrderDto> GetOrders(string tenantId)
        {
            var orders = new List<OrderDto>();
            var tenantProducts = _productRepository.FindAsync(i => i.TenantId == Guid.Parse(tenantId)).Result.ToList<Product>();
            if (tenantProducts != null)
            {
                foreach (var product in tenantProducts)
                {
                    var orderList = _orderRepository.FindAsync(i => i.ProductId == product.Id).Result.ToList<Order>();
                    orders.AddRange(orderList.Select(i=>new OrderDto()
                    {
                        Id = i.Id,
                        ProductId = i.ProductId,
                        Amount = i.Amount,
                        UserId = i.CustomerId,
                        CreatedAt = i.Date,
                        Status = i.Status,
                        ProductName = product.Name,
                        UserName = product.Tenant?.Name
                    }));
                }
            }
            return orders;
        }

        internal new Dictionary<string, int>? GetOrdersCountByStatus(string tenantId)
        {
            var orders = GetOrders(tenantId);
            return orders!=null && orders.Count>0? orders.GroupBy(i => i.Status)?.ToDictionary(i => i.Key, i => i.Count()): new Dictionary<string, int>();
        }

        internal List<OrderDto> GetRecentOrders(string tenantId)
        {
            var orders = GetOrders(tenantId);

            if(orders != null)
            {
                return orders.OrderByDescending(i => i.CreatedAt).Take(2).ToList();
            }
            return new List<OrderDto>();
        }

        internal double GetTotalRevenue(string tenantId)
        {
            double revenue = 0;
            var tenantProducts = _productRepository.FindAsync(i => i.TenantId == Guid.Parse(tenantId)).Result.ToList<Product>();
            if (tenantProducts != null)
            {
                foreach (var product in tenantProducts)
                {
                    var orders = _orderRepository.FindAsync(i => i.ProductId == product.Id).Result;
                    foreach (var item in orders)
                    {
                        if(item.Status != null && item.Status.ToLower() == "completed")
                            revenue += (item.Amount ?? 0) * (product.Price ?? 0);
                    }
                }
            }
            return revenue;
        }

        internal OrderDto UpdateOrder(OrderDto order)
        {
            var orderObj = _orderRepository.GetByIdAsync(order.Id).Result;
            if (orderObj != null)
            {
                orderObj.Status = order.Status;
                orderObj.Date = DateTime.Now.ToUniversalTime();
                _orderRepository.Update(orderObj);
                var result = _unitOfWork.SaveChangesAsync().Result;
                var product = _productRepository.GetByIdAsync(orderObj?.ProductId).Result;
                var user = _userRepository.GetByIdAsync(orderObj?.CustomerId).Result;
                order.ProductName = product?.Name;
                order.UserName = user?.FirstName + " " + user?.LastName;
                return order;
            }
            return null;
        
        }
    }
}
