using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using AuthBackend.Data;
using AuthBackend.Models;
using Microsoft.AspNetCore.Authorization;
using System.Security.Claims;

namespace AuthBackend.Controllers
{
    [Authorize]
    [Route("api/wj/projects")]
    [ApiController]
    public class wj_ProjectController : ControllerBase
    {
        private readonly wj_AppDbContext _context;
        public wj_ProjectController(wj_AppDbContext context) => _context = context;

        private int? GetCurrentUserId()
        {
            var claim = User.FindFirst(ClaimTypes.NameIdentifier);
            if (claim == null) return null;
            if (int.TryParse(claim.Value, out int id)) return id;
            return null;
        }

        private bool IsTeacher()
        {
            return User.FindFirst(ClaimTypes.Role)?.Value == "Teacher";
        }

        [HttpGet("my-projects")]
        public async Task<IActionResult> GetMyProjects()
        {
            var userId = GetCurrentUserId();
            if (userId == null) return Unauthorized("User ID not found in token.");
            
            var projectData = await _context.wj_ProjectMembers
                .Where(pm => pm.UserId == userId)
                .Join(_context.wj_Projects, 
                    pm => pm.ProjectId, 
                    p => p.Id, 
                    (pm, p) => p)
                .Include(p => p.WorkItems) 
                .ToListAsync();

            var projects = projectData.Select(p => new {
                p.Id, 
                p.Name, 
                p.Status, 
                p.IsStarred,
                p.IsArchived,
                p.CreatedById,
                Progress = (p.WorkItems != null && p.WorkItems.Any()) 
                    ? (int)Math.Round((double)p.WorkItems.Count(w => w.Status == "Done") / p.WorkItems.Count * 100) 
                    : 0
            }).ToList();

            return Ok(projects);
        }

        [HttpGet("{id}/details")]
        public async Task<IActionResult> GetProjectDetails(string id)
        {
            if (id == "undefined") return BadRequest("Project ID is undefined.");
            if (!int.TryParse(id, out int projectId)) return BadRequest("Invalid Project ID format.");

            var userId = GetCurrentUserId();
            
            var isMember = await _context.wj_ProjectMembers.AnyAsync(pm => pm.ProjectId == projectId && pm.UserId == userId);
            if (!isMember && !IsTeacher()) return Forbid();

            var project = await _context.wj_Projects.FindAsync(projectId);
            if (project == null) return NotFound();

            var members = await _context.wj_ProjectMembers
                .Where(pm => pm.ProjectId == projectId)
                .Join(_context.wj_Users, 
                    pm => pm.UserId, 
                    u => u.Id, 
                    (pm, u) => new { pm.Id, pm.Role, User = new { u.Id, u.Username, u.Email } })
                .ToListAsync();

            var workItems = await _context.wj_WorkItems.Where(t => t.ProjectId == projectId).ToListAsync();
            var goals = await _context.wj_Goals.Where(g => g.ProjectId == projectId).ToListAsync();
            var columns = await _context.wj_BoardColumns.Where(c => c.ProjectId == projectId).ToListAsync();

            return Ok(new {
                project.Id, project.Name, project.Description, project.Status, project.StartDate, project.EndDate,
                project.IsStarred, project.IsArchived, project.CreatedById, 
                Members = members, WorkItems = workItems, Goals = goals, Columns = columns,
                Progress = workItems.Any() ? (int)Math.Round((double)workItems.Count(t => t.Status == "Done") / workItems.Count * 100) : 0
            });
        }

        [HttpDelete("{id}")]
        public async Task<IActionResult> DeleteProject(int id)
        {
            var userId = GetCurrentUserId();
            var project = await _context.wj_Projects.FindAsync(id);
            if (project == null) return NotFound();
            
            if (project.CreatedById != userId && !IsTeacher()) return Forbid("Only owners or teachers can delete.");

            _context.wj_Projects.Remove(project);
            await _context.SaveChangesAsync();
            return NoContent();
        }

        [HttpPatch("{id}/archive")]
        public async Task<IActionResult> ArchiveProject(int id)
        {
            var userId = GetCurrentUserId();
            var project = await _context.wj_Projects.FindAsync(id);
            
            if (project == null || (project.CreatedById != userId && !IsTeacher())) return Forbid();

            project.IsArchived = !project.IsArchived;
            await _context.SaveChangesAsync();
            return Ok(project);
        }

        [HttpPut("{id}/update")]
        public async Task<IActionResult> UpdateProject(int id, [FromBody] wj_Project model)
        {
            var userId = GetCurrentUserId();
            var project = await _context.wj_Projects.FindAsync(id);
            
            if (project == null || (project.CreatedById != userId && !IsTeacher())) return Forbid();

            project.Name = model.Name;
            project.Description = model.Description;
            project.StartDate = model.StartDate;
            project.EndDate = model.EndDate;

            await _context.SaveChangesAsync();
            return Ok(project);
        }

        [HttpPost("{projectId}/goals")]
        public async Task<IActionResult> AddGoal(int projectId, [FromBody] wj_Goal goal)
        {
            var userId = GetCurrentUserId();
            var project = await _context.wj_Projects.FindAsync(projectId);
            
            if (project == null || (project.CreatedById != userId && !IsTeacher())) return Forbid();

            goal.ProjectId = projectId;
            _context.wj_Goals.Add(goal);
            await _context.SaveChangesAsync();
            return Ok(goal);
        }

        [HttpPatch("goals/{id}/toggle")]
        public async Task<IActionResult> ToggleGoal(int id)
        {
            var goal = await _context.wj_Goals.FindAsync(id);
            if (goal == null) return NotFound();
            
            goal.IsCompleted = !goal.IsCompleted;
            await _context.SaveChangesAsync();
            return Ok(goal);
        }

        [HttpDelete("goals/{id}")]
        public async Task<IActionResult> DeleteGoal(int id)
        {
            var userId = GetCurrentUserId();
            var goal = await _context.wj_Goals.FindAsync(id);
            if (goal == null) return NotFound();

            var project = await _context.wj_Projects.FindAsync(goal.ProjectId);
            
            if (project?.CreatedById != userId && !IsTeacher()) return Forbid();

            _context.wj_Goals.Remove(goal);
            await _context.SaveChangesAsync();
            return NoContent();
        }

        [HttpPost("{projectId}/workitems")]
        public async Task<IActionResult> CreateWorkItem(int projectId, [FromBody] wj_WorkItem model)
        {
            var userId = GetCurrentUserId();
            var project = await _context.wj_Projects.FindAsync(projectId);
            
            if (project == null || (project.CreatedById != userId && !IsTeacher())) return Forbid();

            model.ProjectId = projectId;
            _context.wj_WorkItems.Add(model);
            await _context.SaveChangesAsync();
            return Ok(model);
        }

        [HttpPatch("workitems/{id}")]
        public async Task<IActionResult> UpdateWorkItem(int id, [FromBody] wj_WorkItem updatedData)
        {
            var userId = GetCurrentUserId();
            var workItem = await _context.wj_WorkItems.FindAsync(id);
            if (workItem == null) return NotFound();
            
            var project = await _context.wj_Projects.FindAsync(workItem.ProjectId);
            bool isPrivileged = (project?.CreatedById == userId || IsTeacher());

            if (isPrivileged) {
                workItem.Title = updatedData.Title;
                workItem.Content = updatedData.Content;
                workItem.Priority = updatedData.Priority;
                workItem.Deadline = updatedData.Deadline;
                workItem.AssignedToId = updatedData.AssignedToId;
            }
            
            workItem.Status = updatedData.Status; 
            workItem.ColumnId = updatedData.ColumnId; 
            
            await _context.SaveChangesAsync();
            return Ok(workItem);
        }

        [HttpDelete("workitems/{id}")]
        public async Task<IActionResult> DeleteWorkItem(int id)
        {
            var userId = GetCurrentUserId();
            var workItem = await _context.wj_WorkItems.FindAsync(id);
            if (workItem == null) return NotFound();
            var project = await _context.wj_Projects.FindAsync(workItem.ProjectId);
            
            if (project?.CreatedById != userId && !IsTeacher()) return Forbid();

            _context.wj_WorkItems.Remove(workItem);
            await _context.SaveChangesAsync();
            return NoContent();
        }

        [HttpPost("{projectId}/columns")]
        public async Task<IActionResult> CreateColumn(int projectId, [FromBody] wj_BoardColumn column)
        {
            var userId = GetCurrentUserId();
            var project = await _context.wj_Projects.FindAsync(projectId);
            
            if (project == null || (project.CreatedById != userId && !IsTeacher())) return Forbid();

            column.ProjectId = projectId;
            _context.wj_BoardColumns.Add(column);
            await _context.SaveChangesAsync();
            return Ok(column);
        }

        [HttpDelete("columns/{id}")]
        public async Task<IActionResult> DeleteColumn(int id)
        {
            var userId = GetCurrentUserId();
            var column = await _context.wj_BoardColumns.FindAsync(id);
            if (column == null) return NotFound();
            var project = await _context.wj_Projects.FindAsync(column.ProjectId);
            
            if (project?.CreatedById != userId && !IsTeacher()) return Forbid();

            _context.wj_BoardColumns.Remove(column);
            await _context.SaveChangesAsync();
            return NoContent();
        }

        [HttpPost("create")]
        public async Task<IActionResult> CreateProject([FromBody] wj_Project model)
        {
            var userId = GetCurrentUserId();
            if (userId == null) return Unauthorized();
            model.CreatedById = userId.Value;
            model.CreatedAt = DateTime.Now;
            _context.wj_Projects.Add(model);
            await _context.SaveChangesAsync();
            _context.wj_ProjectMembers.Add(new wj_ProjectMember { ProjectId = model.Id, UserId = userId.Value, Role = "Lead", JoinedAt = DateTime.UtcNow });
            await _context.SaveChangesAsync();
            return Ok(new { id = model.Id });
        }

        [HttpPost("{projectId}/members/add-by-email")]
        public async Task<IActionResult> AddMemberByEmail(int projectId, [FromBody] string email)
        {
            var userId = GetCurrentUserId();
            var inviter = await _context.wj_Users.FindAsync(userId);
            var project = await _context.wj_Projects.FindAsync(projectId);
            
            if (project == null || (project.CreatedById != userId && !IsTeacher())) return Forbid();

            var targetUser = await _context.wj_Users.FirstOrDefaultAsync(u => u.Email == email);
            if (targetUser == null) return NotFound(new { message = "User not found." });
            
            if (inviter?.Role == "Student" && targetUser.Role == "Teacher") return BadRequest(new { message = "Restricted." });
            
            if (await _context.wj_ProjectMembers.AnyAsync(m => m.ProjectId == projectId && m.UserId == targetUser.Id)) return BadRequest(new { message = "Already member." });
            
            _context.wj_ProjectMembers.Add(new wj_ProjectMember { ProjectId = projectId, UserId = targetUser.Id, Role = "Member" });
            await _context.SaveChangesAsync();
            return Ok(new { message = "User added!" });
        }

        [HttpPost("workitems/{id}/comments")]
        public async Task<IActionResult> AddComment(int id, [FromBody] wj_Comment comment)
        {
            var userId = GetCurrentUserId();
            var workItem = await _context.wj_WorkItems.FindAsync(id);
            if (workItem == null) return NotFound();
            
            var isMember = await _context.wj_ProjectMembers.AnyAsync(pm => pm.ProjectId == workItem.ProjectId && pm.UserId == userId);
            if (!isMember && !IsTeacher()) return Forbid();

            comment.WorkItemId = id;
            comment.AuthorId = userId.Value;
            _context.wj_Comments.Add(comment);
            await _context.SaveChangesAsync();
            return Ok(comment);
        }
    }
}