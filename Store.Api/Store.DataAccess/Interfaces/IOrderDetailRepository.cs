using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;
using Store.DataAccess.Models;

namespace Store.DataAccess.Interfaces
{
    public interface IOrderDetailRepository
    {
        List<OrderDetail> GetAll();

        OrderDetail? GetById(int id);

        void Add(OrderDetail orderDetail);

        void Update(OrderDetail orderDetail);

        void Delete(int id);
    }
}
