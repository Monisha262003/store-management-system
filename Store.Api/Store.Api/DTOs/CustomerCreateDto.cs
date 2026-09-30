namespace Store.Api.DTOs
{
    public class CustomerCreateDto
    {
        public string CustomerName { get; set; } = null!;
        public string Email { get; set; } = null!;
        public string? Phone { get; set; }
    }
}
