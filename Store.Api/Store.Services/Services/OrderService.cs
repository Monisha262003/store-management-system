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
    public class OrderService : IOrderService
    {
        private readonly IOrderRepository _repository;

        public OrderService(IOrderRepository repository)
        {
            _repository = repository;
        }

        public List<Order> GetAll()
        {
            return _repository.GetAll();
        }

        public Order? GetById(int id)
        {
            return _repository.GetById(id);
        }

        public void Add(Order order)
        {
            _repository.Add(order);
        }

        public void Update(Order order)
        {
            _repository.Update(order);
        }

        public void Delete(int id)
        {
            _repository.Delete(id);
        }
    }
}
