using System.ComponentModel.DataAnnotations.Schema;

namespace UserService.Models
{
    [Table("users")] 
    public class User
    {
        public int Id { get; set; }
        public string Username { get; set; }
        public string Email { get; set; }
        [Column("password_hash")] 
        public string PasswordHash { get; set; }
        [Column("created_at")]
        public DateTime CreatedAt { get; set; }
    }
}