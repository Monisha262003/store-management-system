
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
    public class OrderDetailRepository : IOrderDetailRepository
    {
        private readonly StoreManagementContext _context;

        public OrderDetailRepository(StoreManagementContext context)
        {
            _context = context;
        }

        public List<OrderDetail> GetAll()
        {
            return _context.OrderDetails
                           .Include(od => od.Order)
                           .Include(od => od.Product)
                           .ToList();
        }

        public OrderDetail? GetById(int id)
        {
            return _context.OrderDetails
                           .Include(od => od.Order)
                           .Include(od => od.Product)
                           .FirstOrDefault(od => od.OrderDetailId == id);
        }

        public void Add(OrderDetail orderDetail)
        {
            _context.OrderDetails.Add(orderDetail);
            _context.SaveChanges();
        }

        public void Update(OrderDetail orderDetail)
        {
            _context.OrderDetails.Update(orderDetail);
            _context.SaveChanges();
        }

        public void Delete(int id)
        {
            OrderDetail? orderDetail = _context.OrderDetails
                                               .FirstOrDefault(od => od.OrderDetailId == id);

            if (orderDetail != null)
            {
                _context.OrderDetails.Remove(orderDetail);
                _context.SaveChanges();
            }
        }
    }
}
