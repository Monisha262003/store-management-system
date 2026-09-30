using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;
using Store.DataAccess.Interfaces;
using Store.DataAccess.Models;
using Store.Services.Interfaces;

namespace Store.Services.Services
{
    public class ProductService : IProductService
    {
        private readonly IProductRepository _repository;

        public ProductService(IProductRepository repository)
        {
            _repository = repository;
        }

        public List<Product> GetAll() => _repository.GetAll();

        public Product? GetById(int id) => _repository.GetById(id);

        public void Add(Product product)
        {
            // Rule 1: Price must be greater than 0
            if (product.Price <= 0)
                throw new ArgumentException("Product price must be greater than ₹0.");

            // Rule 2: Stock quantity cannot be negative
            if (product.Quantity < 0)
                throw new ArgumentException("Product stock quantity cannot be negative.");

            // Rule 3: Prevent duplicate product names
            bool exists = _repository.GetAll()
                .Any(p => p.ProductName.Equals(product.ProductName.Trim(), StringComparison.OrdinalIgnoreCase));

            if (exists)
                throw new InvalidOperationException($"A product named '{product.ProductName}' already exists.");

            product.ProductName = product.ProductName.Trim();
            _repository.Add(product);
        }

        public void Update(Product product)
        {
            if (product.Price <= 0)
                throw new ArgumentException("Product price must be greater than ₹0.");

            if (product.Quantity < 0)
                throw new ArgumentException("Product stock quantity cannot be negative.");

            _repository.Update(product);
        }

        public void Delete(int id) => _repository.Delete(id);
    }
}
