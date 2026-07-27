using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;

namespace AuthBackend.Models;

[Table("wj_Projects")]
public class wj_Project
{
    [Key]
    public int Id { get; set; }

    [Required]
    public string Name { get; set; } = string.Empty;

    public string Description { get; set; } = string.Empty;

    public string Status { get; set; } = "Active"; 

    public DateTime CreatedAt { get; set; } = DateTime.UtcNow;

    public DateTime? StartDate { get; set; }
    public DateTime? EndDate { get; set; }

    public bool IsStarred { get; set; } = false;

    public int CreatedById { get; set; }
    public bool IsArchived { get; set; } = false;
    public int OwnerId { get; set; }

    public virtual ICollection<wj_Goal> Goals { get; set; } = new List<wj_Goal>();
    public virtual ICollection<wj_WorkItem> WorkItems { get; set; } = new List<wj_WorkItem>();
    public virtual ICollection<wj_ProjectMember> Members { get; set; } = new List<wj_ProjectMember>();
}