using Microsoft.AspNetCore.Http;
using Microsoft.AspNetCore.Mvc;
using Microsoft.AspNetCore.Mvc;
using Store.DataAccess.Models;
using Store.Services.Interfaces;
using Store.Api.DTOs;

namespace Store.Api.Controllers
{
    [Route("api/[controller]")]
    [ApiController]
    public class OrderController : ControllerBase
    {
        private readonly IOrderService _service;

        public OrderController(IOrderService service)
        {
            _service = service;
        }

        [HttpGet]
        public IActionResult GetAll()
        {
            var orders = _service.GetAll();

            return Ok(orders);
        }


        [HttpGet("{id}")]
        public IActionResult GetById(int id)
        {
            var order = _service.GetById(id);

            if (order == null)
            {
                return NotFound();
            }

            return Ok(order);
        }

        [HttpPost]
        public IActionResult Add([FromBody] OrderCreateDto orderDto)
        {
            var order = new Order
            {
                CustomerId = orderDto.CustomerId,
                OrderDate = orderDto.OrderDate
            };

            _service.Add(order);

            return Ok(order);
        }

        [HttpPut("{id}")]
        public IActionResult Update(int id, [FromBody] OrderUpdateDto orderDto)
        {
            if (id != orderDto.OrderId)
            {
                return BadRequest("Order ID does not match.");
            }

            var existingOrder = _service.GetById(id);

            if (existingOrder == null)
            {
                return NotFound();
            }

            // Map updated fields onto the tracked entity
            existingOrder.CustomerId = orderDto.CustomerId;
            existingOrder.OrderDate = orderDto.OrderDate;

            _service.Update(existingOrder);

            return Ok(existingOrder);
        }

        [HttpDelete("{id}")]
        public IActionResult Delete(int id)
        {
            var existingOrder = _service.GetById(id);

            if (existingOrder == null)
            {
                return NotFound();
            }

            _service.Delete(id);

            return Ok("Order deleted successfully");
        }
    }
}
