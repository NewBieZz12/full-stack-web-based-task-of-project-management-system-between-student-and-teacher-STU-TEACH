using AuthBackend.Data;
using AuthBackend.Models;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using Microsoft.AspNetCore.Authorization;
using System.Security.Claims;

namespace AuthBackend.Controllers;

[Authorize]
[Route("api/wj/attachments")]
[ApiController]
public class wj_AttachmentsController : ControllerBase
{
    private readonly wj_AppDbContext _context;
    private readonly IWebHostEnvironment _environment;

    public wj_AttachmentsController(wj_AppDbContext context, IWebHostEnvironment environment)
    {
        _context = context;
        _environment = environment;
    }

    private int? GetCurrentUserId()
    {
        var claim = User.FindFirst(ClaimTypes.NameIdentifier);
        if (claim == null) return null;
        return int.TryParse(claim.Value, out int id) ? id : null;
    }

    private bool IsTeacher()
    {
        return User.FindFirst(ClaimTypes.Role)?.Value == "Teacher";
    }

    [HttpPost("upload/{workItemId}")]
    [Consumes("multipart/form-data")]
    public async Task<IActionResult> Upload(int workItemId, [FromForm] FileUploadDto dto)
    {
        var userId = GetCurrentUserId();
        if (dto.File == null || dto.File.Length == 0)
            return BadRequest("No file selected.");

        var workItem = await _context.wj_WorkItems
            .Include(w => w.Project)
            .FirstOrDefaultAsync(w => w.Id == workItemId);

        if (workItem == null) return NotFound("WorkItem not found.");

        if (workItem.Project == null || (workItem.Project.CreatedById != userId && !IsTeacher()))
        {
            return Forbid();
        }

        try
        {
            string rootPath = _environment.WebRootPath ?? Path.Combine(Directory.GetCurrentDirectory(), "wwwroot");
            string uploadsFolder = Path.Combine(rootPath, "uploads");

            if (!Directory.Exists(uploadsFolder))
                Directory.CreateDirectory(uploadsFolder);

            string uniqueFileName = Guid.NewGuid().ToString() + "_" + dto.File.FileName;
            string filePath = Path.Combine(uploadsFolder, uniqueFileName);

            using (var fileStream = new FileStream(filePath, FileMode.Create))
            {
                await dto.File.CopyToAsync(fileStream);
            }

            var attachment = new wj_Attachment
            {
                WorkItemId = workItemId,
                FileName = dto.File.FileName,
                FilePath = $"/uploads/{uniqueFileName}",
                FileType = dto.File.ContentType,
                FileSize = dto.File.Length,
                UploadedAt = DateTime.Now
            };

            _context.wj_Attachments.Add(attachment);
            await _context.SaveChangesAsync();

            return Ok(attachment);
        }
        catch (Exception ex)
        {
            return StatusCode(500, $"Internal server error: {ex.Message}");
        }
    }

    [HttpDelete("{id}")]
    public async Task<IActionResult> DeleteAttachment(int id)
    {
        var userId = GetCurrentUserId();
        
        var attachment = await _context.wj_Attachments
            .Include(a => a.WorkItem)
            .ThenInclude(w => w.Project)
            .FirstOrDefaultAsync(a => a.Id == id);

        if (attachment == null) return NotFound();

        if (attachment.WorkItem?.Project == null || (attachment.WorkItem.Project.CreatedById != userId && !IsTeacher()))
        {
            return Forbid();
        }

        try
        {
            string rootPath = _environment.WebRootPath ?? Path.Combine(Directory.GetCurrentDirectory(), "wwwroot");
            var filePath = Path.Combine(rootPath, attachment.FilePath.TrimStart('/'));
            
            if (System.IO.File.Exists(filePath))
            {
                System.IO.File.Delete(filePath);
            }

            _context.wj_Attachments.Remove(attachment);
            await _context.SaveChangesAsync();

            return NoContent();
        }
        catch (Exception ex)
        {
            return StatusCode(500, $"Internal server error: {ex.Message}");
        }
    }

    public class FileUploadDto
    {
        public IFormFile File { get; set; }
    }
}