namespace AuthBackend.DTOs
{
    public class wj_TaskCreateUpdateDto
    {
        public string Title { get; set; }
        public string? Description { get; set; }
        public string Status { get; set; }
        public string Priority { get; set; }
        public DateTime? DueDate { get; set; }
        public int WorkspaceId { get; set; }
    }

    public class wj_CommentDto
    {
        public string Text { get; set; }
        public int TaskItemId { get; set; }
    }
    public class wj_SubtaskDto
    {
        public string Title { get; set; }
        public string Status { get; set; }
        public int TaskItemId { get; set; }
    }
}