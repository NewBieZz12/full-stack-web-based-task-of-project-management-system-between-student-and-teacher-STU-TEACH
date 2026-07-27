using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;
using System.Runtime.Serialization; 

namespace AuthBackend.Models;

[Table("wj_Attachments")]
public class wj_Attachment
{
    [Key]
    public int Id { get; set; }

    public string FileName { get; set; } = string.Empty;
    public string FilePath { get; set; } = string.Empty;
    public string FileType { get; set; } = string.Empty;
    public long FileSize { get; set; }
    public DateTime UploadedAt { get; set; } = DateTime.Now;

    public int WorkItemId { get; set; }

    [ForeignKey("WorkItemId")]
    [System.Text.Json.Serialization.JsonIgnore] 
    [System.Runtime.Serialization.IgnoreDataMember]
    public virtual wj_WorkItem? WorkItem { get; set; }
}