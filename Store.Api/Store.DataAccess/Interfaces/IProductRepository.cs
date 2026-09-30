using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;
using Store.DataAccess.Models;
using Store.DataAccess.Interfaces;


namespace Store.DataAccess.Interfaces
{
    public interface IProductRepository
    {
        List<Product> GetAll();

        Product? GetById(int id);

        void Add(Product product);

        void Update(Product product);

        void Delete(int id);
    }
}
