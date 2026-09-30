using Microsoft.EntityFrameworkCore;
using Store.DataAccess.Interfaces;
using Store.DataAccess.Models;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace Store.DataAccess.Repositories
{
    public class CustomerRepository : ICustomerRepository
    {
        private readonly StoreManagementContext _context;

        public CustomerRepository(StoreManagementContext context)
        {
            _context = context;
        }

        public List<Customer> GetAll()
        {
            return _context.Customers
                           .Include(c => c.Orders)
                           .ToList();
        }

        public Customer? GetById(int id)
        {
            return _context.Customers
                           .Include(c => c.Orders)
                           .FirstOrDefault(c => c.CustomerId == id);
        }

        public void Add(Customer customer)
        {
            _context.Customers.Add(customer);
            _context.SaveChanges();
        }

        public void Update(Customer customer)
        {
            _context.Customers.Update(customer);
            _context.SaveChanges();
        }

        public void Delete(int id)
        {
            Customer? customer = _context.Customers
                                         .FirstOrDefault(c => c.CustomerId == id);

            if (customer != null)
            {
                _context.Customers.Remove(customer);
                _context.SaveChanges();
            }
        }
    }
}
