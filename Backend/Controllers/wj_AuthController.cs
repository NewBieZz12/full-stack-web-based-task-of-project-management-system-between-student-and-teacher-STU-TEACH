using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using AuthBackend.Data;
using AuthBackend.Models;
using Microsoft.AspNetCore.Authorization;
using Microsoft.IdentityModel.Tokens;
using System.IdentityModel.Tokens.Jwt;
using System.Security.Claims;
using System.Text;
using System.Text.RegularExpressions;

namespace AuthBackend.Controllers
{
    [Route("api/wj")]
    [ApiController]
    public class wj_AuthController : ControllerBase
    {
        private readonly wj_AppDbContext _context;
        private readonly IConfiguration _configuration;

        public wj_AuthController(wj_AppDbContext context, IConfiguration configuration)
        {
            _context = context;
            _configuration = configuration;
        }

        [HttpPost("register")]
        public async Task<IActionResult> Register(wj_UserDto request)
        {
            var passwordRegex = new Regex(@"^(?=.*[A-Z])(?=.*[!@#$%^&*(),.? :{}|<>]).{8,}$");
            
            if (!passwordRegex.IsMatch(request.Password))
            {
                return BadRequest("Password must be at least 8 characters long, contain a capital letter, and a special symbol.");
            }

            if (string.IsNullOrWhiteSpace(request.SecurityAnswer))
            {
                return BadRequest("Security answer is required for account recovery.");
            }

            if (request.Role != "Student" && request.Role != "Teacher")
            {
                return BadRequest("Invalid role. Must be 'Student' or 'Teacher'.");
            }

            if (request.Role == "Teacher")
            {
                const string secretTeacherCode = "XMUMTEACHER"; 
                if (request.InvitationCode != secretTeacherCode)
                {
                    return BadRequest("Invalid Invitation Code for Teacher registration.");
                }
            }

            if (await _context.wj_Users.AnyAsync(u => u.Username == request.Username))
            {
                return BadRequest("Username is already taken.");
            }

            var user = new wj_User
            {
                Username = request.Username,
                Email = request.Email,
                Role = request.Role,
                PasswordHash = BCrypt.Net.BCrypt.HashPassword(request.Password),
                SecurityAnswer = BCrypt.Net.BCrypt.HashPassword(request.SecurityAnswer.ToLower().Trim())
            };

            _context.wj_Users.Add(user);
            await _context.SaveChangesAsync();

            return Ok(new { message = "Registration successful!" });
        }

        [HttpPost("login")]
        public async Task<IActionResult> Login(wj_UserDto request)
        {
            var user = await _context.wj_Users.FirstOrDefaultAsync(u => u.Username == request.Username);

            if (user == null || !BCrypt.Net.BCrypt.Verify(request.Password, user.PasswordHash))
            {
                return BadRequest("Invalid username or password.");
            }

            string token = CreateToken(user);
            return Ok(new { token = token, role = user.Role, hyUserId = user.Id });
        }

        [HttpPost("forgot-password")]
        public async Task<IActionResult> ForgotPassword([FromBody] ForgotPasswordDto request)
        {
            var user = await _context.wj_Users.FirstOrDefaultAsync(u => u.Email == request.Email);
            if (user == null)
            {
                return BadRequest("User with this email does not exist.");
            }

            if (!BCrypt.Net.BCrypt.Verify(request.SecurityAnswer.ToLower().Trim(), user.SecurityAnswer))
            {
                return BadRequest("Incorrect security answer.");
            }

            var passwordRegex = new Regex(@"^(?=.*[A-Z])(?=.*[!@#$%^&*(),.? :{}|<>]).{8,}$");
            if (!passwordRegex.IsMatch(request.NewPassword))
            {
                return BadRequest("New password must be at least 8 characters long, contain a capital letter, and a special symbol.");
            }

            user.PasswordHash = BCrypt.Net.BCrypt.HashPassword(request.NewPassword);
            await _context.SaveChangesAsync();

            return Ok(new { message = "Password has been reset successfully!" });
        }

        private string CreateToken(wj_User user)
        {
            var claims = new List<Claim>
            {
                new Claim(ClaimTypes.NameIdentifier, user.Id.ToString()),
                new Claim(ClaimTypes.Email, user.Email),
                new Claim(ClaimTypes.Role, user.Role)
            };

            var key = new SymmetricSecurityKey(Encoding.UTF8.GetBytes(
                _configuration.GetSection("AppSettings:Token").Value!));

            var creds = new SigningCredentials(key, SecurityAlgorithms.HmacSha512Signature);

            var token = new JwtSecurityToken(
                claims: claims,
                expires: DateTime.Now.AddDays(1),
                signingCredentials: creds
            );

            return new JwtSecurityTokenHandler().WriteToken(token);
        }
    }

    public class ForgotPasswordDto
    {
        public string Email { get; set; } = string.Empty;
        public string SecurityAnswer { get; set; } = string.Empty;
        public string NewPassword { get; set; } = string.Empty;
    }
}