using System;
using System.Threading;
using System.Threading.Tasks;

namespace SpaceLinx.Api.Interfaces;

public interface IBackgroundTaskQueue
{
    /// <summary>
    /// Queue a background work item
    /// </summary>
    ValueTask QueueBackgroundWorkItemAsync(Func<CancellationToken, ValueTask> workItem);

    /// <summary>
    /// Dequeue a background work item
    /// </summary>
    ValueTask<Func<CancellationToken, ValueTask>> DequeueAsync(CancellationToken cancellationToken);
}
