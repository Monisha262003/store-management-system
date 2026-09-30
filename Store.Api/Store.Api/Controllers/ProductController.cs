using Microsoft.AspNetCore.Http;
using Microsoft.AspNetCore.Mvc;
using Store.DataAccess.Models;
using Store.Services.Interfaces;
using Store.Api.DTOs;

namespace Store.Api.Controllers
{
    [Route("api/[controller]")]
    [ApiController]
    public class ProductController : ControllerBase
    {
            private readonly IProductService _service;

            public ProductController(IProductService service)
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
                var product = _service.GetById(id);
                if (product == null) return NotFound();
                return Ok(product);
            }

            [HttpPost]
            public IActionResult Add([FromBody] ProductCreateDto productDto)
            {
                try
                {
                    var product = new Product
                    {
                        ProductName = productDto.ProductName,
                        Price = productDto.Price,
                        Quantity = productDto.Quantity,
                        Category = productDto.Category
                    };

                    _service.Add(product);
                    return Ok(product);
                }
                catch (Exception ex)
                {
                    return BadRequest(ex.Message);
                }
            }

            [HttpPut("{id}")]
            public IActionResult Update(int id, [FromBody] ProductUpdateDto productDto)
            {
                try
                {
                    if (id != productDto.ProductId)
                        return BadRequest("Product ID does not match.");

                    var existingProduct = _service.GetById(id);
                    if (existingProduct == null)
                        return NotFound();

                    existingProduct.ProductName = productDto.ProductName;
                    existingProduct.Price = productDto.Price;
                    existingProduct.Quantity = productDto.Quantity;
                    existingProduct.Category = productDto.Category;

                    _service.Update(existingProduct);
                    return Ok(existingProduct);
                }
                catch (Exception ex)
                {
                    return BadRequest(ex.Message);
                }
            }

            [HttpDelete("{id}")]
            public IActionResult Delete(int id)
            {
                var existingProduct = _service.GetById(id);
                if (existingProduct == null) return NotFound();

                _service.Delete(id);
                return Ok("Product deleted successfully");
            }
        }
    }