using AuthBackend.Data;
using AuthBackend.Models;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using Microsoft.AspNetCore.Authorization;
using System.Security.Claims;

namespace AuthBackend.Controllers;

[Authorize]
[Route("api/wj/board-columns")]
[ApiController]
public class BoardColumnsController : ControllerBase
{
    private readonly wj_AppDbContext _context;

    public BoardColumnsController(wj_AppDbContext context)
    {
        _context = context;
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
    public async Task<ActionResult<IEnumerable<object>>> GetProjectColumns(int projectId)
    {
        var columns = await _context.wj_BoardColumns
            .Where(c => c.ProjectId == projectId)
            .OrderBy(c => c.Order)
            .Select(c => new
            {
                c.Id,
                c.Name,
                c.Order,
                TaskCount = _context.wj_WorkItems.Count(w => w.ColumnId == c.Id && w.ProjectId == projectId)
            })
            .ToListAsync();

        return Ok(columns);
    }

    [HttpPost]
    public async Task<ActionResult> PostColumn([FromBody] wj_BoardColumn column)
    {
        var userId = GetCurrentUserId();
        var project = await _context.wj_Projects.FindAsync(column.ProjectId);

        if (project == null || (project.CreatedById != userId && !IsTeacher()))
        {
            return Forbid();
        }

        if (column.Order == 0)
        {
            var maxOrder = await _context.wj_BoardColumns
                .Where(c => c.ProjectId == column.ProjectId)
                .MaxAsync(c => (int?)c.Order) ?? -1;
            column.Order = maxOrder + 1;
        }

        _context.wj_BoardColumns.Add(column);
        await _context.SaveChangesAsync();

        return Ok(column);
    }

    [HttpDelete("{id}")]
    public async Task<IActionResult> DeleteColumn(int id)
    {
        var userId = GetCurrentUserId();
        var column = await _context.wj_BoardColumns.FindAsync(id);
        if (column == null) return NotFound();

        var project = await _context.wj_Projects.FindAsync(column.ProjectId);

        if (project == null || (project.CreatedById != userId && !IsTeacher()))
        {
            return Forbid();
        }

        bool hasTasks = await _context.wj_WorkItems
            .AnyAsync(w => w.ColumnId == id);

        if (hasTasks)
        {
            return BadRequest(new { message = "Cannot delete column because it contains tasks. Move them first." });
        }

        _context.wj_BoardColumns.Remove(column);
        await _context.SaveChangesAsync();

        return NoContent();
    }

    [HttpPut("{id}")]
    public async Task<IActionResult> PutColumn(int id, [FromBody] wj_BoardColumn column)
    {
        var userId = GetCurrentUserId();
        var existingColumn = await _context.wj_BoardColumns.FindAsync(id);
        if (existingColumn == null) return NotFound();

        var project = await _context.wj_Projects.FindAsync(existingColumn.ProjectId);

        if (project == null || (project.CreatedById != userId && !IsTeacher()))
        {
            return Forbid();
        }

        existingColumn.Name = column.Name;
        existingColumn.Order = column.Order;

        await _context.SaveChangesAsync();
        return NoContent();
    }

    [HttpPut("reorder")]
    public async Task<IActionResult> ReorderColumns([FromBody] List<wj_BoardColumn> updatedColumns)
    {
        var userId = GetCurrentUserId();
        
        if (updatedColumns == null || !updatedColumns.Any()) return BadRequest();

        var firstCol = await _context.wj_BoardColumns.FindAsync(updatedColumns[0].Id);
        if (firstCol == null) return NotFound();
        
        var project = await _context.wj_Projects.FindAsync(firstCol.ProjectId);

        if (project == null || (project.CreatedById != userId && !IsTeacher()))
        {
            return Forbid();
        }

        foreach (var col in updatedColumns)
        {
            var existing = await _context.wj_BoardColumns.FindAsync(col.Id);
            if (existing != null)
            {
                existing.Order = col.Order;
            }
        }
        await _context.SaveChangesAsync();
        return Ok();
    }
}