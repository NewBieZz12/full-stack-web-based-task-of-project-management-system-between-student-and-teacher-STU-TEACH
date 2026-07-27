

using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;

namespace AuthBackend.Models;

[Table("wj_ProjectMembers")]
public class wj_ProjectMember
{
    [Key]
    public int Id { get; set; }

    [Required]
    public int ProjectId { get; set; }

    [Required]
    public int UserId { get; set; }

    public string Role { get; set; } = "Member";
    public DateTime JoinedAt { get; set; } = DateTime.UtcNow;

   
    [ForeignKey("ProjectId")]
    [System.Text.Json.Serialization.JsonIgnore]
    public virtual wj_Project? Project { get; set; }


    [ForeignKey("UserId")]
    public virtual wj_User? User { get; set; }
}