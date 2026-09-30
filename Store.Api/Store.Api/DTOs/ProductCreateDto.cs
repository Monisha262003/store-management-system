namespace Store.Api.DTOs
{
    public class ProductCreateDto
    {
        public string ProductName { get; set; } = null!;
        public decimal Price { get; set; }
        public int Quantity { get; set; }
        public string? Category { get; set; }
    }
}