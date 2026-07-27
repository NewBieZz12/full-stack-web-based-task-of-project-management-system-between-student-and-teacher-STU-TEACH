namespace AuthBackend.Models;

public class wj_BoardColumn
{
    public int Id { get; set; }
    public string Name { get; set; } = string.Empty;
    public int Order { get; set; }
    public int ProjectId { get; set; }
}