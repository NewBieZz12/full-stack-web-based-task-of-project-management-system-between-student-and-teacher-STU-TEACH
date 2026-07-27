
using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;

namespace AuthBackend.Models;

[Table("wj_Users")]
public class wj_User
{
    [Key]
    public int Id { get; set; }

    [Required]
    public string Username { get; set; } = string.Empty;

    [Required]
    public string Email { get; set; } = string.Empty;

    public string Role { get; set; } = string.Empty;

    [Required]
    public string PasswordHash { get; set; } = string.Empty;
    
    public string SecurityAnswer { get; set; } = string.Empty; 
}