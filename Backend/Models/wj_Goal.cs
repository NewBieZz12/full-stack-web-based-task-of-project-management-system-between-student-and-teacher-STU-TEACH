using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;

namespace AuthBackend.Models;

public class wj_Goal
{
    [Key]
    public int Id { get; set; }
    
    [Required]
    public int ProjectId { get; set; }
    
    [Required]
    public string Title { get; set; } = string.Empty; 
    
    public bool IsCompleted { get; set; } = false; 

    [ForeignKey("ProjectId")]
    [System.Text.Json.Serialization.JsonIgnore]
    public virtual wj_Project? Project { get; set; }
}