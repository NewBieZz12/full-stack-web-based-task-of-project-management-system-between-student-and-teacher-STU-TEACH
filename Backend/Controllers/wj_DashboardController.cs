using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using AuthBackend.Data;
using AuthBackend.Models;
using Microsoft.AspNetCore.Authorization;
using System.Security.Claims;

namespace AuthBackend.Controllers
{
    [Authorize]
    [Route("api/wj/dashboard")]
    [ApiController]
    public class wj_DashboardController : ControllerBase
    {
        private readonly wj_AppDbContext _context;

        public wj_DashboardController(wj_AppDbContext context)
        {
            _context = context;
        }

        private int? GetCurrentUserId()
        {
            var claim = User.FindFirst(ClaimTypes.NameIdentifier);
            return claim != null ? int.Parse(claim.Value) : null;
        }

        [HttpGet("summary")]
        public async Task<IActionResult> GetDashboardSummary()
        {
            var userId = GetCurrentUserId();
            if (userId == null) return Unauthorized();

            var activeItems = await _context.wj_WorkItems
                .Where(w => w.AssignedToId == userId && w.Status != "Done")
                .ToListAsync();

            var today = DateTime.Today;

            return Ok(new
            {
                TotalActive = activeItems.Count,
                DueToday = activeItems.Count(w => w.Deadline.HasValue && w.Deadline.Value.Date == today),
                Overdue = activeItems.Count(w => w.Deadline.HasValue && w.Deadline.Value.Date < today),
                CompletedCount = await _context.wj_WorkItems.CountAsync(w => w.AssignedToId == userId && w.Status == "Done")
            });
        }

        [HttpGet("recent-items")]
        public async Task<IActionResult> GetRecentItems()
        {
            var userId = GetCurrentUserId();
            if (userId == null) return Unauthorized();

            var recent = await _context.wj_WorkItems
                .Include(w => w.Project)
                .Where(w => w.AssignedToId == userId)
                .OrderByDescending(w => w.Id)
                .Take(5)
                .Select(w => new
                {
                    w.Id,
                    w.Title,
                    w.Status,
                    w.Deadline,
                    ProjectName = w.Project != null ? w.Project.Name : "No Project"
                })
                .ToListAsync();

            return Ok(recent);
        }
    }
}