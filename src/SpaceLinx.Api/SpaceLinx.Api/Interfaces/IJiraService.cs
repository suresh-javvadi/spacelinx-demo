using Microsoft.AspNetCore.Mvc;
using SpaceLinx.Model;
using Task = System.Threading.Tasks.Task;
namespace SpaceLinx.Api.Interfaces
{
    public interface IJiraService
    {
        bool IsEnabled { get; }
        Task<string> CreateJiraIssueAsync(IssueWriteModel issueModel);
        Task UpdateJiraIssueAsync(string jiraKey, IssueUpdateModel issueModel);
        Task<bool> IsJiraConnectedAsync();
    }
}   