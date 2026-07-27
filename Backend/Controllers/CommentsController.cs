using AuthBackend.Data;
using AuthBackend.Models;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;

namespace AuthBackend.Controllers;

[Route("api/wj/comments")]
[ApiController]
public class CommentsController : ControllerBase
{
    private readonly wj_AppDbContext _context;

    public CommentsController(wj_AppDbContext context)
    {
        _context = context;
    }

    [HttpGet("task/{workItemId}")]
    public async Task<IActionResult> GetTaskComments(int workItemId)
    {
        var comments = await _context.wj_Comments
            .Include(c => c.Author)
            .Where(c => c.WorkItemId == workItemId)
            .OrderByDescending(c => c.CreatedAt)
            .Select(c => new {
                id = c.Id,
                content = c.Content,
                createdAt = c.CreatedAt,
                authorName = c.Author.Username,
                authorId = c.AuthorId,
                authorAvatar = c.Author.Username.Substring(0, 2).ToUpper()
            })
            .ToListAsync();

        return Ok(comments);
    }

    [HttpPost]
    public async Task<IActionResult> CreateComment([FromBody] wj_Comment comment)
    {
        var task = await _context.wj_WorkItems.FindAsync(comment.WorkItemId);
        if (task == null) return NotFound("Task not found.");

        comment.CreatedAt = DateTime.UtcNow;
        _context.wj_Comments.Add(comment);
        await _context.SaveChangesAsync();

        var saved = await _context.wj_Comments
            .Include(c => c.Author)
            .FirstAsync(c => c.Id == comment.Id);

        return Ok(new {
            id = saved.Id,
            content = saved.Content,
            createdAt = saved.CreatedAt,
            authorName = saved.Author.Username
        });
    }
}