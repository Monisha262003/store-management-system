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
    public class CustomerService : ICustomerService
    {
        private readonly ICustomerRepository _repository;

        public CustomerService(ICustomerRepository repository)
        {
            _repository = repository;
        }

        public List<Customer> GetAll() => _repository.GetAll();

        public Customer? GetById(int id) => _repository.GetById(id);

        public void Add(Customer customer)
        {
            // Rule 1: Check for duplicate email
            if (!string.IsNullOrWhiteSpace(customer.Email))
            {
                bool emailExists = _repository.GetAll()
                    .Any(c => c.Email != null && c.Email.Equals(customer.Email.Trim(), StringComparison.OrdinalIgnoreCase));

                if (emailExists)
                    throw new InvalidOperationException($"A customer with email '{customer.Email}' is already registered.");
            }

            // Rule 2: Phone number must be exactly 10 digits
            if (!string.IsNullOrWhiteSpace(customer.Phone))
            {
                string cleanPhone = customer.Phone.Trim();
                if (cleanPhone.Length != 10 || !cleanPhone.All(char.IsDigit))
                    throw new ArgumentException("Phone number must be exactly 10 digits.");
            }

            _repository.Add(customer);
        }

        public void Update(Customer customer)
        {
            if (!string.IsNullOrWhiteSpace(customer.Phone))
            {
                string cleanPhone = customer.Phone.Trim();
                if (cleanPhone.Length != 10 || !cleanPhone.All(char.IsDigit))
                    throw new ArgumentException("Phone number must be exactly 10 digits.");
            }

            _repository.Update(customer);
        }

        public void Delete(int id) => _repository.Delete(id);
    }
}
