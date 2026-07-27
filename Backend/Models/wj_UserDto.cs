
namespace AuthBackend.Models
{
    public class wj_UserDto
    {
        public string Username { get; set; } = string.Empty;
        public string Email { get; set; } = string.Empty;
        public string Password { get; set; } = string.Empty;
        public string Role { get; set; } = "Student"; 
        public string InvitationCode { get; set; } = string.Empty; 
        public string SecurityAnswer { get; set; } = string.Empty;
    }
}