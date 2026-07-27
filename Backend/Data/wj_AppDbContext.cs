using Microsoft.EntityFrameworkCore;
using AuthBackend.Models;

namespace AuthBackend.Data
{
    public class wj_AppDbContext : DbContext
    {
        public wj_AppDbContext(DbContextOptions<wj_AppDbContext> options) : base(options) { }
        
        public DbSet<wj_User> wj_Users { get; set; }
        public DbSet<wj_Task> wj_Tasks { get; set; }
        public DbSet<wj_Project> wj_Projects { get; set; }
        public DbSet<wj_ProjectMember> wj_ProjectMembers { get; set; }
        public DbSet<wj_BoardColumn> wj_BoardColumns { get; set; }
        public DbSet<wj_Goal> wj_Goals { get; set; }
        public DbSet<wj_WorkItem> wj_WorkItems { get; set; }
        public DbSet<wj_Attachment> wj_Attachments { get; set; }
        public DbSet<wj_Comment> wj_Comments { get; set; }

        protected override void OnModelCreating(ModelBuilder builder)
        {
            base.OnModelCreating(builder);

            builder.Entity<wj_User>()
                .HasIndex(u => u.Username)
                .IsUnique();

            builder.Entity<wj_User>()
                .HasIndex(u => u.Email)
                .IsUnique();

            builder.Entity<wj_Comment>()
                .HasOne(c => c.WorkItem)
                .WithMany()
                .HasForeignKey(c => c.WorkItemId)
                .OnDelete(DeleteBehavior.Cascade);

            builder.Entity<wj_Comment>()
                .HasOne(c => c.Author)
                .WithMany()
                .HasForeignKey(c => c.AuthorId)
                .OnDelete(DeleteBehavior.NoAction);

            builder.Entity<wj_BoardColumn>()
                .Property(c => c.Name)
                .HasMaxLength(100);

            builder.Entity<wj_WorkItem>()
                .HasOne(w => w.Column)
                .WithMany()
                .HasForeignKey(w => w.ColumnId)
                .OnDelete(DeleteBehavior.Restrict);

            builder.Entity<wj_WorkItem>()
                .HasOne(w => w.Project)
                .WithMany(p => p.WorkItems)
                .HasForeignKey(w => w.ProjectId)
                .OnDelete(DeleteBehavior.Cascade);

            builder.Entity<wj_Goal>()
                .HasOne(g => g.Project)
                .WithMany(p => p.Goals)
                .HasForeignKey(g => g.ProjectId)
                .OnDelete(DeleteBehavior.Cascade);

            builder.Entity<wj_Task>()
                .HasOne<wj_Project>()
                .WithMany()
                .HasForeignKey(t => t.ProjectId)
                .OnDelete(DeleteBehavior.Cascade);

            builder.Entity<wj_ProjectMember>()
                .HasOne(pm => pm.Project)
                .WithMany(p => p.Members)
                .HasForeignKey(pm => pm.ProjectId)
                .OnDelete(DeleteBehavior.Cascade);

            builder.Entity<wj_ProjectMember>()
                .HasOne(pm => pm.User)
                .WithMany() 
                .HasForeignKey(pm => pm.UserId)
                .OnDelete(DeleteBehavior.NoAction);
        }
    }
}
