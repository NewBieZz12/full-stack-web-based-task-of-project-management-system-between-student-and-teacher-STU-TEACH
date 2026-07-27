using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;

namespace AuthBackend.Models
{
    [Table("wj_Comments")]
    public class wj_Comment
    {
        [Key]
        public int Id { get; set; }

        [Required]
        [MaxLength(2000)]
        public string Content { get; set; } = string.Empty;

        public DateTime CreatedAt { get; set; } = DateTime.UtcNow;

        [Required]
        public int WorkItemId { get; set; }

        [Required]
        public int AuthorId { get; set; }

        [ForeignKey("WorkItemId")]
        public virtual wj_WorkItem? WorkItem { get; set; }

        [ForeignKey("AuthorId")]
        public virtual wj_User? Author { get; set; }
    }
}