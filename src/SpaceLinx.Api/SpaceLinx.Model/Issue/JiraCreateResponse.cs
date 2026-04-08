using System.Text.Json.Serialization;

namespace SpaceLinx.Model
{
    public partial class JiraCreateResponse
    {
        [JsonPropertyName("id")]
        public string Id { get; set; }

        [JsonPropertyName("key")]
        public string Key { get; set; }

        [JsonPropertyName("self")]
        public string Self { get; set; }
    }
}
