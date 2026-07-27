using System.ComponentModel.DataAnnotations;

namespace AuthBackend.Models
{
    public class wj_Task
    {
        [Key]
        public int Id { get; set; }

        [Required]
        public string Title { get; set; } = string.Empty;

        public string Description { get; set; } = string.Empty;

        public int ProjectId { get; set; }

        [Required]
        public DateTime DueDate { get; set; }

        [Required]
        public string Status { get; set; } = "To Do"; 

        [Required]
        public int UserId { get; set; }

        public string Category { get; set; } = "General";

        public int AssignedToId { get; set; }

        public int CreatedById { get; set; }

        public DateTime CreatedAt { get; set; } = DateTime.Now;
    
        public bool IsArchived { get; set; } = false;
    }
}