namespace Store.Api.DTOs
{
    public class OrderUpdateDto
    {
        public int OrderId { get; set; }
        public int CustomerId { get; set; }
        public DateTime OrderDate { get; set; }
    }
}