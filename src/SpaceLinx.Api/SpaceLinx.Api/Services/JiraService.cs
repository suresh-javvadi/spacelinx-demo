using System.Net.Http.Headers;
using System.Text;
using System.Text.Json;
using AutoMapper;
using Task = System.Threading.Tasks.Task;
using SpaceLinx.Api.Interfaces;
using SpaceLinx.Model;

namespace SpaceLinx.Api.Services
{
    public partial class JiraService : BaseService, IJiraService
    {
        private readonly HttpClient _httpClient;
        private readonly string _baseUrl;
        private readonly string _projectKey;
        private readonly bool _isEnabled;
        private readonly string _selfEndpoint;

        public JiraService(SpaceLinxContext spaceLinxContext, IMapper mapper, IHttpContextAccessor contextAccessor, IConfiguration configuration) : base(spaceLinxContext, contextAccessor)
        {
            _isEnabled = configuration.GetValue<bool>("Jira:Enabled");

            if (!_isEnabled) return;

            _baseUrl = configuration["Jira:BaseUrl"] ?? throw new ArgumentNullException("Jira:BaseUrl");
            _projectKey = configuration["Jira:ProjectKey"] ?? throw new ArgumentNullException("Jira:ProjectKey");
            _selfEndpoint = configuration["Jira:Endpoints:Self"] ?? throw new Exception("Jira self endpoint is missing in configuration.");

            var email = configuration["Jira:Email"];
            var token = configuration["Jira:ApiToken"];
            var authToken = Convert.ToBase64String(Encoding.ASCII.GetBytes($"{email}:{token}"));

            _httpClient = new HttpClient
            {
                BaseAddress = new Uri(_baseUrl)
            };
            _httpClient.DefaultRequestHeaders.Authorization = new AuthenticationHeaderValue("Basic", authToken);
            _httpClient.DefaultRequestHeaders.Accept.Add(new MediaTypeWithQualityHeaderValue("application/json"));
        }
        public bool IsEnabled => _isEnabled;

        public async Task<bool> IsJiraConnectedAsync()
        {
            try
            {
                var response = await _httpClient.GetAsync(_selfEndpoint);
                return response.IsSuccessStatusCode;
            }
            catch
            {
                return false;
            }
        }

        public async Task<string> CreateJiraIssueAsync(IssueWriteModel issueModel)
        {
            if (!await IsJiraConnectedAsync())
            {
                throw new Exception($"Jira connection failed");
            }

            var jiraPayload = new
            {
                fields = new
                {
                    project = new { key = _projectKey },
                    summary = issueModel.Summary,
                    description = new
                    {
                        type = "doc",
                        version = 1,
                        content = new[]
                        {
                            new
                            {
                                type = "paragraph",
                                content = new[]
                                {
                                    new
                                    {
                                        type = "text",
                                        text = issueModel.Description ?? "No description provided"
                                    }
                                }
                            }
                        }
                    },
                    issuetype = new { name = issueModel.IssueType },
                    priority = new { name = issueModel.Priority}
                }
            };

            var content = new StringContent(JsonSerializer.Serialize(jiraPayload), Encoding.UTF8, "application/json");
            var response = await _httpClient.PostAsync("/rest/api/3/issue", content);
            var result = await response.Content.ReadAsStringAsync();

            if (!response.IsSuccessStatusCode)
            {
                throw new Exception($"Jira issue creation failed: {response.StatusCode} - {result}");
            }

            using var json = JsonDocument.Parse(result);
            if (json.RootElement.TryGetProperty("key", out var keyElement))
            {
                return keyElement.GetString();
            }

            throw new Exception("Jira key not found in response: " + result);
        }

        public async Task UpdateJiraIssueAsync(string jiraKey, IssueUpdateModel issueModel)
        {
            if (!await IsJiraConnectedAsync())
            {
                throw new Exception($"Jira connection failed");
            }

            var updateData = new
            {
                fields = new
                {
                    summary = issueModel.Summary,
                    description = new
                    {
                        type = "doc",
                        version = 1,
                        content = new[]
                        {
                            new
                            {
                                type = "paragraph",
                                content = new[]
                                {
                                    new
                                    {
                                        type = "text",
                                        text = issueModel.Description ?? "No description provided"
                                    }
                                }
                            }
                        }
                    },
                    issuetype = new { name = issueModel.IssueType },
                    priority = new { name = issueModel.Priority }
                }
            };

            var content = new StringContent(JsonSerializer.Serialize(updateData), Encoding.UTF8, "application/json");
            var response = await _httpClient.PutAsync($"/rest/api/3/issue/{jiraKey}", content);
            var result = await response.Content.ReadAsStringAsync();

            if (!response.IsSuccessStatusCode)
            {
                throw new Exception($"Jira issue update failed: {response.StatusCode} - {result}");
            }
        }
    }
}