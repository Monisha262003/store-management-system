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
   
        public class OrderDetailService : IOrderDetailService
        {
          
            private readonly IOrderDetailRepository _orderDetailRepo;
            private readonly IProductRepository _productRepo;

            public OrderDetailService(IOrderDetailRepository orderDetailRepo, IProductRepository productRepo)
            {
                _orderDetailRepo = orderDetailRepo;
                _productRepo = productRepo;
            }

            public List<OrderDetail> GetAll() => _orderDetailRepo.GetAll();

            public OrderDetail? GetById(int id) => _orderDetailRepo.GetById(id);

            public void Add(OrderDetail orderDetail)
            {
                if (orderDetail.Quantity <= 0)
                    throw new ArgumentException("Order quantity must be at least 1.");

                // 1. Find the Product being ordered
                var product = _productRepo.GetById(orderDetail.ProductId);
                if (product == null)
                    throw new InvalidOperationException("Selected product does not exist.");

                // 2. Check if enough stock is available
                if (product.Quantity < orderDetail.Quantity)
                    throw new InvalidOperationException($"Insufficient stock for '{product.ProductName}'. Only {product.Quantity} left!");

                // 3. Automatically deduct stock from the Product table
                product.Quantity -= orderDetail.Quantity;
                _productRepo.Update(product);

                // 4. Automatically calculate total line price (Product Price * Quantity)
                orderDetail.Price = product.Price * orderDetail.Quantity;

                _orderDetailRepo.Add(orderDetail);
            }

            public void Update(OrderDetail orderDetail) => _orderDetailRepo.Update(orderDetail);

            public void Delete(int id)
            {
                // Restore product stock if an order item is deleted/cancelled!
                var existingDetail = _orderDetailRepo.GetById(id);
                if (existingDetail != null)
                {
                    var product = _productRepo.GetById(existingDetail.ProductId);
                    if (product != null)
                    {
                        product.Quantity += existingDetail.Quantity;
                        _productRepo.Update(product);
                    }
                }

                _orderDetailRepo.Delete(id);
            }
        }
    }