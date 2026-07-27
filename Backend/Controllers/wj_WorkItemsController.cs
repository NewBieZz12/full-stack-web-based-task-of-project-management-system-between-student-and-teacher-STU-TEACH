using AuthBackend.Data;
using AuthBackend.Models;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using Microsoft.AspNetCore.Authorization;
using System.Security.Claims;

namespace AuthBackend.Controllers;

[Authorize] 
[Route("api/wj/work-items")] 
[ApiController]
public class WorkItemsController : ControllerBase
{
    private readonly wj_AppDbContext _context;
    private readonly IWebHostEnvironment _environment;

    public WorkItemsController(wj_AppDbContext context, IWebHostEnvironment environment)
    {
        _context = context;
        _environment = environment;
    }

    private int? GetCurrentUserId()
    {
        var claim = User.FindFirst(ClaimTypes.NameIdentifier);
        return claim != null ? int.Parse(claim.Value) : null;
    }

    private bool IsTeacher()
    {
        return User.FindFirst(ClaimTypes.Role)?.Value == "Teacher";
    }

    [HttpGet("project/{projectId}")]
    public async Task<ActionResult> GetProjectTasks(int projectId)
    {
        var tasks = await _context.wj_WorkItems
            .Include(w => w.Attachments)
            .Include(w => w.AssignedTo)
            .Where(w => w.ProjectId == projectId)
            .Select(w => new {
                w.Id,
                w.Title,
                w.Content,
                w.Status, 
                w.Priority,
                w.Deadline,
                w.AssignedToId,
                w.ProjectId,
                w.ColumnId, 
                AssignedToName = w.AssignedTo != null ? w.AssignedTo.Username : null,
                Attachments = w.Attachments,
                CommentCount = _context.wj_Comments.Count(c => c.WorkItemId == w.Id)
            })
            .ToListAsync();

        return Ok(tasks);
    }

    [HttpPost]
    public async Task<ActionResult<wj_WorkItem>> PostWorkItem([FromBody] wj_WorkItem workItem)
    {
        var userId = GetCurrentUserId();
        var project = await _context.wj_Projects.FindAsync(workItem.ProjectId);

        if (project == null || (project.CreatedById != userId && !IsTeacher()))
        {
            return Forbid();
        }

        if (workItem.AssignedToId == null || workItem.AssignedToId == 0)
        {
            workItem.AssignedToId = userId;
        }

        _context.wj_WorkItems.Add(workItem);
        await _context.SaveChangesAsync();
        return Ok(workItem);
    }

    [HttpPut("{id}")]
    public async Task<IActionResult> PutWorkItem(int id, [FromBody] wj_WorkItem workItem)
    {
        var userId = GetCurrentUserId();
        var existing = await _context.wj_WorkItems
            .Include(w => w.Project)
            .FirstOrDefaultAsync(w => w.Id == id);

        if (existing == null) return NotFound();

        bool isPrivileged = (existing.Project?.CreatedById == userId || IsTeacher());

        if (!isPrivileged)
        {
            existing.Status = workItem.Status;
            existing.ColumnId = workItem.ColumnId;
        }
        else
        {
            existing.Title = workItem.Title;
            existing.Content = workItem.Content;
            existing.Priority = workItem.Priority;
            existing.Deadline = workItem.Deadline;
            existing.AssignedToId = workItem.AssignedToId;
            existing.ColumnId = workItem.ColumnId;
            existing.Status = workItem.Status; 
        }

        await _context.SaveChangesAsync();
        return Ok(existing);
    }

    [HttpDelete("{id}")]
    public async Task<IActionResult> DeleteWorkItem(int id)
    {
        var userId = GetCurrentUserId();
        var workItem = await _context.wj_WorkItems
            .Include(w => w.Attachments)
            .Include(w => w.Project)
            .FirstOrDefaultAsync(w => w.Id == id);

        if (workItem == null) return NotFound();

        if (workItem.Project?.CreatedById != userId && !IsTeacher())
        {
            return Forbid();
        }

        try 
        {
            string rootPath = _environment.WebRootPath ?? Path.Combine(Directory.GetCurrentDirectory(), "wwwroot");
            
            if (workItem.Attachments != null)
            {
                foreach (var file in workItem.Attachments)
                {
                    var filePath = Path.Combine(rootPath, file.FilePath.TrimStart('/'));
                    if (System.IO.File.Exists(filePath)) 
                    {
                        System.IO.File.Delete(filePath);
                    }
                }
            }

            _context.wj_WorkItems.Remove(workItem);
            await _context.SaveChangesAsync();
            return NoContent(); 
        }
        catch (Exception ex)
        {
            return StatusCode(500, $"Internal server error: {ex.Message}");
        }
    }
}