using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;
using Store.DataAccess.Interfaces;
using Store.DataAccess.Models;
using Microsoft.EntityFrameworkCore;


namespace Store.DataAccess.Repositories
{
    public class OrderRepository : IOrderRepository
    
    {
        private readonly StoreManagementContext _context;

        public OrderRepository(StoreManagementContext context)
        {
            _context = context;
        }

        //public List<Order> GetAll()
        //{
        //    return _context.Orders.ToList();
        //}

        public List<Order> GetAll()
        {
            return _context.Orders
                           .Include(o => o.Customer)
                           .Include(o => o.OrderDetails)
                           .ToList();
        }

        public Order? GetById(int id)
        {
            return _context.Orders
                           .Include(o => o.Customer)
                           .Include(o => o.OrderDetails)
                           .FirstOrDefault(o => o.OrderId == id);
        }
        

        public void Add(Order order)
        {
           // order.Customer = null!;
            _context.Orders.Add(order);
            _context.SaveChanges();
        }

        public void Update(Order order)
        {
            _context.Orders.Update(order);
            _context.SaveChanges();
        }

        public void Delete(int id)
        {
            Order? order = _context.Orders
                                   .FirstOrDefault(o => o.OrderId == id);

            if (order != null)
            {
                _context.Orders.Remove(order);
                _context.SaveChanges();
            }
        }
    }
}
