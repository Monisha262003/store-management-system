using Microsoft.AspNetCore.Http;
using Microsoft.AspNetCore.Mvc;
using Store.DataAccess.Models;
using Store.Services.Interfaces;
using Store.Api.DTOs;

namespace Store.Api.Controllers
{
    [Route("api/[controller]")]
    [ApiController]
    public class OrderDetailController : ControllerBase
    {
       
            private readonly IOrderDetailService _service;

            public OrderDetailController(IOrderDetailService service)
            {
                _service = service;
            }

            [HttpGet]
            public IActionResult GetAll()
            {
                return Ok(_service.GetAll());
            }

            [HttpGet("{id}")]
            public IActionResult GetById(int id)
            {
                var orderDetail = _service.GetById(id);
                if (orderDetail == null) return NotFound();
                return Ok(orderDetail);
            }

            [HttpPost]
            public IActionResult Add([FromBody] OrderDetailCreateDto orderDetailDto)
            {
                try
                {
                    var orderDetail = new OrderDetail
                    {
                        OrderId = orderDetailDto.OrderId,
                        ProductId = orderDetailDto.ProductId,
                        Quantity = orderDetailDto.Quantity,
                        Price = orderDetailDto.Price
                    };

                    _service.Add(orderDetail);
                    return Ok(orderDetail);
                }
                catch (Exception ex)
                {
                    return BadRequest(ex.Message);
                }
            }

            [HttpPut("{id}")]
            public IActionResult Update(int id, [FromBody] OrderDetailUpdateDto orderDetailDto)
            {
                try
                {
                    if (id != orderDetailDto.OrderDetailId)
                        return BadRequest("OrderDetail ID does not match.");

                    var existingOrderDetail = _service.GetById(id);
                    if (existingOrderDetail == null)
                        return NotFound();

                    existingOrderDetail.OrderId = orderDetailDto.OrderId;
                    existingOrderDetail.ProductId = orderDetailDto.ProductId;
                    existingOrderDetail.Quantity = orderDetailDto.Quantity;
                    existingOrderDetail.Price = orderDetailDto.Price;

                    _service.Update(existingOrderDetail);
                    return Ok(existingOrderDetail);
                }
                catch (Exception ex)
                {
                    return BadRequest(ex.Message);
                }
            }

            [HttpDelete("{id}")]
            public IActionResult Delete(int id)
            {
                var existingOrderDetail = _service.GetById(id);
                if (existingOrderDetail == null) return NotFound();

                _service.Delete(id);
                return Ok("OrderDetail deleted successfully");
            }
        }
    }