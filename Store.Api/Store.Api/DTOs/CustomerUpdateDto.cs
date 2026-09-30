namespace Store.Api.DTOs
{
    public class CustomerUpdateDto
    {
        public int CustomerId { get; set; }
        public string CustomerName { get; set; } = null!;
        public string Email { get; set; } = null!;
        public string? Phone { get; set; }
    }
}
