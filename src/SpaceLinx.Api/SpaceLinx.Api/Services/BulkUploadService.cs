using Azure.Storage.Blobs;
using Azure.Storage.Blobs.Models;
using ExcelDataReader;
using Microsoft.EntityFrameworkCore;
using Newtonsoft.Json;
using Newtonsoft.Json.Linq;
using Npgsql;
using SpaceLinx.Api.Interfaces;
using SpaceLinx.Model;
using System.Data;
using System.Text;
using Task = System.Threading.Tasks.Task;

namespace SpaceLinx.Api.Services
{
    public class BulkUploadService(BlobServiceClient _blobServiceClient, SpaceLinxContext _spaceLinxContext, IHttpContextAccessor _contextAccessor, IConfiguration configuration)
        : BaseService(_spaceLinxContext, _contextAccessor), IBulkUploadService
    {
        public async Task<BulkUpload> SaveImportedFileAsync(IFormFile excelFile, string type)
        {
            try
            {
                string containerName = configuration["BlobStorage:ContainerName"];
                var container = _blobServiceClient.GetBlobContainerClient(containerName);
                var bulkUploadId = Guid.NewGuid();
                var blobPath = "bulkupload/import/" + bulkUploadId.ToString() + "_" + Path.GetFileName(excelFile.FileName);
                var blob = container.GetBlobClient(blobPath);

                var blobHttpHeaders = new BlobHttpHeaders
                {
                    ContentType = "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet"
                };

                await blob.UploadAsync(excelFile.OpenReadStream(), blobHttpHeaders);

                var bulkUpload = new BulkUpload
                {
                    Id = bulkUploadId,
                    ApplicationName = "MES",
                    FileName = Path.GetFileNameWithoutExtension(excelFile.FileName),
                    FilePath = blobPath,
                    RequestedBy = UserEmail,
                    RequestedAt = DateTime.UtcNow,
                    Type = type,
                    Url = blob.Uri.ToString(),
                    Error = "{}",
                    CreatedAt = DateTime.UtcNow, 
                    CreatedBy = UserEmail,
                    Status = "Processing",
                    TotalCount = 0,
                    SuccessCount = 0,
                    FailedCount = 0
                };

                _spaceLinxContext.BulkUploads.Add(bulkUpload);
                await _spaceLinxContext.SaveChangesAsync();

                return bulkUpload;
            }
            catch (Exception ex)
            {
                throw new ApplicationException($"Error uploading file: {ex.Message}");
            }
        }

        public async Task<List<JObject>> ReadFileAsync(Stream fileStream)
        {
            try
            {
                var records = new List<JObject>();

                Encoding.RegisterProvider(CodePagesEncodingProvider.Instance);

                using (var reader = ExcelReaderFactory.CreateReader(fileStream))
                {
                    var conf = new ExcelDataSetConfiguration
                    {
                        ConfigureDataTable = _ => new ExcelDataTableConfiguration
                        {
                            UseHeaderRow = true
                        }
                    };

                    var result = reader.AsDataSet(conf);
                    var table = result.Tables[0];

                    for (int row = 0; row < table.Rows.Count; row++)
                    {
                        var record = new JObject();
                        for (int col = 0; col < table.Columns.Count; col++)
                        {
                            var header = table.Columns[col].ColumnName;
                            var cellValue = table.Rows[row][col].ToString();
                            record[header] = cellValue;
                        }

                        record["RowNumber"] = row + 1; // Adding 1 to make it 1-based index

                        records.Add(record);
                    }
                }

                return await Task.FromResult(records);
            }
            catch(Exception ex)
            {
                throw new ApplicationException(ex.ToString());
            }
        }

        public async Task<List<FailedRecord>> ImportPartsAsync(List<JObject> records)
        {
            return await ProcessRecordsAsync(records, "mes.import_parts");
        }

        public async Task<List<FailedRecord>> ImportToolsAsync(List<JObject> records)
        {
            return await ProcessRecordsAsync(records, "mes.import_tools");
        }

        public async Task<List<FailedRecord>> ImportLocationsAsync(List<JObject> records)
        {
            return await ProcessRecordsAsync(records, "mes.import_locations");
        }

        public async Task<List<FailedRecord>> ImportEBomAsync(List<JObject> records)
        {
            return await ProcessRecordsAsync(records, "mes.import_ebom");
        }

        public async Task<List<FailedRecord>> ImportNewsAsync(List<JObject> records)
        {
            return await ProcessRecordsAsync(records, "mes.import_news");
        }

        public async Task<List<FailedRecord>> ImportMachineAsync(List<JObject> records)
        {
            return await ProcessRecordsAsync(records, "mes.import_machines");
        }

        private async Task<List<FailedRecord>> ProcessRecordsAsync(List<JObject> records, string storedProcedureName)
        {
            var failedRecords = new List<FailedRecord>();

            var recordsJsonArray = records.Select(r => r.ToString(Newtonsoft.Json.Formatting.None)).ToArray();

            try
            {
                using (var command = new NpgsqlCommand(storedProcedureName, _spaceLinxContext.Database.GetDbConnection() as NpgsqlConnection))
                {
                    command.CommandType = CommandType.StoredProcedure;

                    command.Parameters.Add(new NpgsqlParameter("records", NpgsqlTypes.NpgsqlDbType.Array | NpgsqlTypes.NpgsqlDbType.Jsonb) { Value = recordsJsonArray });
                    command.Parameters.Add(new NpgsqlParameter("user_email", NpgsqlTypes.NpgsqlDbType.Text) { Value = UserEmail });
                    command.Parameters.Add(new NpgsqlParameter("results", NpgsqlTypes.NpgsqlDbType.Jsonb) { Value = DBNull.Value, Direction = ParameterDirection.Output });

                    await _spaceLinxContext.Database.OpenConnectionAsync();
                    try
                    {
                        await command.ExecuteNonQueryAsync();
                    }
                    finally
                    {
                        await _spaceLinxContext.Database.CloseConnectionAsync();
                    }

                    var resultParameter = command.Parameters["results"];
                    if (resultParameter.Value != DBNull.Value && resultParameter.Value != null)
                    {
                        var resultsJson = resultParameter.Value.ToString();
                        var results = JArray.Parse(resultsJson);

                        foreach (var result in results)
                        {
                            var rowNumber = result["row_number"].Value<int>();


                            if (result["error_message"] != null)
                            {
                                var errorMessage = result["error_message"].Value<string>();
                                if (!string.IsNullOrEmpty(errorMessage) && errorMessage != "success")
                                {
                                    failedRecords.Add(new FailedRecord
                                    {
                                        RowNumber = rowNumber,
                                        ErrorMessage = errorMessage
                                    });
                                }
                            }
                        }
                    }
                }
            }
            catch (Exception ex)
            {
                failedRecords.Add(new FailedRecord { RowNumber = -1, ErrorMessage = ex.Message });
            }

            return failedRecords;
        }

        public async Task<List<FailedRecord>> ProcessFileAsync(Stream fileStream, string fileName, string type, Guid bulkUploadId)
        {
           
            List<FailedRecord> failedRecords;

            var records = await ReadFileAsync(fileStream);
            var totalRecords =records.Count;

            switch (type.ToLower())
            {
                case "part":
                    failedRecords = await ImportPartsAsync(records);
                    break;
                case "tool":
                    failedRecords = await ImportToolsAsync(records);
                    break;
                case "location":
                    failedRecords = await ImportLocationsAsync(records);
                    break;
                case "ebom":
                    failedRecords = await ImportEBomAsync(records);
                    break;
                case "news":
                    failedRecords = await ImportNewsAsync(records);
                    break;
                case "machine":
                    failedRecords = await ImportMachineAsync(records);
                    break;
                default:
                    throw new ArgumentException("Invalid type specified");
            }

            var errorJson = JsonConvert.SerializeObject(failedRecords);
            string status = failedRecords.Count == records.Count ? "Failed"
                                : failedRecords.Any() ? "Partial Complete" : "Complete";

            int failedCount = failedRecords.Count(fr => fr.ErrorMessage != "Success");
            int successCount = totalRecords - failedCount;

            await UpdateBulkUploadStatus(bulkUploadId, status, errorJson, totalRecords, successCount, failedCount);

            return failedRecords;              
        }
        public async Task UpdateBulkUploadStatus(Guid id, string status, string error, int totalCount, int successCount, int failedCount)
        {
            var bulkUpload = await _spaceLinxContext.BulkUploads.FindAsync(id);

            bulkUpload.Error = error;
            bulkUpload.Status = status;
            bulkUpload.TotalCount = totalCount;
            bulkUpload.SuccessCount = successCount;
            bulkUpload.FailedCount = failedCount;

            await _spaceLinxContext.SaveChangesAsync();
        }

        public class FailedRecord
        {
            public int RowNumber { get; set; }
            public string? ErrorMessage { get; set; }
        }
    }
}
