
using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;

namespace AuthBackend.Models;

[Table("wj_WorkItems")]
public class wj_WorkItem
{
    [Key]
    public int Id { get; set; }

    [Required]
    [MaxLength(200)]
    public string Title { get; set; } = string.Empty;

    public string? Content { get; set; }

    [Required]
    public int ColumnId { get; set; } 

    // Navigation Property to link to the BoardColumn table
    [ForeignKey("ColumnId")]
    [System.Text.Json.Serialization.JsonIgnore]
    public virtual wj_BoardColumn? Column { get; set; }

    [Required]
    public string Status { get; set; } = "To-Do"; 

    [Required]
    public string Priority { get; set; } = "Medium"; 

    public DateTime? Deadline { get; set; }

    [Required]
    public int ProjectId { get; set; }

    public int? AssignedToId { get; set; } 

    [ForeignKey("AssignedToId")]
    public virtual wj_User? AssignedTo { get; set; }

    [ForeignKey("ProjectId")]
    [System.Text.Json.Serialization.JsonIgnore]
    public virtual wj_Project? Project { get; set; }

    public virtual ICollection<wj_Attachment> Attachments { get; set; } = new List<wj_Attachment>();
}