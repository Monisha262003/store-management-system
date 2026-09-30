using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;
using Store.DataAccess.Models;

namespace Store.Services.Interfaces
{
    public interface ICustomerService
    {
        List<Customer> GetAll();

        Customer? GetById(int id);

        void Add(Customer customer);

        void Update(Customer customer);

        void Delete(int id);
    }
}
