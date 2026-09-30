using Microsoft.AspNetCore.Http;
using Microsoft.AspNetCore.Mvc;
using Store.DataAccess.Models;
using Store.Services.Interfaces;
using Store.Api.DTOs;

namespace Store.Api.Controllers
{
    [Route("api/[controller]")]
    [ApiController]
    public class CustomerController : ControllerBase
    {
            private readonly ICustomerService _service;

            public CustomerController(ICustomerService service)
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
                var customer = _service.GetById(id);
                if (customer == null) return NotFound();
                return Ok(customer);
            }

            [HttpPost]
            public IActionResult Add([FromBody] CustomerCreateDto customerDto)
            {
                try
                {
                    var customer = new Customer
                    {
                        CustomerName = customerDto.CustomerName,
                        Email = customerDto.Email,
                        Phone = customerDto.Phone
                    };

                    _service.Add(customer);
                    return Ok(customer);
                }
                catch (Exception ex)
                {
                    return BadRequest(ex.Message);
                }
            }

            [HttpPut("{id}")]
            public IActionResult Update(int id, [FromBody] CustomerUpdateDto customerDto)
            {
                try
                {
                    if (id != customerDto.CustomerId)
                        return BadRequest("Customer ID does not match.");

                    var existingCustomer = _service.GetById(id);
                    if (existingCustomer == null)
                        return NotFound();

                    existingCustomer.CustomerName = customerDto.CustomerName;
                    existingCustomer.Email = customerDto.Email;
                    existingCustomer.Phone = customerDto.Phone;

                    _service.Update(existingCustomer);
                    return Ok(existingCustomer);
                }
                catch (Exception ex)
                {
                    return BadRequest(ex.Message);
                }
            }

            [HttpDelete("{id}")]
            public IActionResult Delete(int id)
            {
                var existingCustomer = _service.GetById(id);
                if (existingCustomer == null) return NotFound();

                _service.Delete(id);
                return Ok("Customer deleted successfully");
            }
        }
    }