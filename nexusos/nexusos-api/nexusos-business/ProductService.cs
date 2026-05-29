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
    public class ProductService
    {
        private IRepository<Product> _productRepository;
        private IUnitOfWork _unitOfWork;

        public ProductService(IRepository<Product> productRepository,IUnitOfWork unitOfWork)
        {
            _productRepository = productRepository;
            _unitOfWork = unitOfWork;
        }

        public async Task<ProductDto> AddProduct(ProductDto product)
        {
            product.Id = Guid.NewGuid();
            var productObj = new Product()
            {
               Id = product.Id,
               Name = product.Name,
               Category = product.Category,
               Price = product.Price,
               Stock = product.Stock,
               Status = product.Status,
               TenantId = product.TenantId,
            };
            await _productRepository.AddAsync(productObj);
            await _unitOfWork.SaveChangesAsync();
            return product;
        }

        public void DeleteProduct(Guid productId)
        {
            var productObj = _productRepository.GetByIdAsync(productId).Result;
            if (productObj != null)
            {
                _productRepository.Delete(productObj);
                var result = _unitOfWork.SaveChangesAsync().Result;
            }
        }

        public List<ProductDto> GetProducts(string tenantId)
        {
            var products = _productRepository.FindAsync(i => i.TenantId == Guid.Parse(tenantId)).Result.ToList<Product>();
            //products = products.OrderBy(i => i.Name).ToList();
            return products.Select(i => new ProductDto()
            {
                Id = i.Id,
                Name = i.Name,
                Price = i.Price,
                Stock = i.Stock,
                Status = i.Status,
                Category = i.Category
            }).ToList();
        }

        public object UpdateProduct(ProductDto product)
        {
            var productObj = _productRepository.GetByIdAsync(product.Id).Result;
            if (productObj != null)
            {
                productObj.Name = product.Name;
                productObj.Price = product.Price;
                productObj.Stock = product.Stock;
                productObj.Status = product.Status;
                productObj.Category = product.Category;
                _productRepository.Update(productObj);
                var result = _unitOfWork.SaveChangesAsync().Result;
                return product;
            }
            return null;
        }

        public void UpdateProducts(List<ProductDto> products)
        {
            var productList = _productRepository.GetAllAsync().Result.ToList<Product>();
            foreach (var product in products) 
            {
              
                var productObj = productList.FirstOrDefault<Product>(x => x.Id == product.Id);
                if (productObj!=null)
                {
                    productObj.Name = product.Name;
                    productObj.Price = product.Price;
                    productObj.Stock = product.Stock;
                    productObj.Status = product.Status;
                    productObj.Category = product.Category;

                    _productRepository.Update(productObj);
                }
                else
                {
                    _productRepository.AddAsync(new Product
                    {
                        Id = product.Id,
                        Name = product.Name,
                        Price = product.Price,
                        Stock = product.Stock,
                        Status = product.Status,
                        Category = product.Category
                    }).Wait();
                }

            }
           
        }
    }
}
