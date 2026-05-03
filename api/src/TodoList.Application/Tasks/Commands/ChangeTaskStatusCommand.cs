using MediatR;
using TodoList.Domain.Interfaces;
using TaskStatusEnum = TodoList.Domain.Enums.TaskStatus;

namespace TodoList.Application.Tasks.Commands;

public record ChangeTaskStatusCommand(
    Guid Id,
    TaskStatusEnum NewStatus) : IRequest;

public class ChangeTaskStatusCommandHandler : IRequestHandler<ChangeTaskStatusCommand>
{
    private readonly ITaskItemRepository _repository;

    public ChangeTaskStatusCommandHandler(ITaskItemRepository repository)
    {
        _repository = repository;
    }

    public async Task Handle(ChangeTaskStatusCommand request, CancellationToken cancellationToken)
    {
        var taskItem = await _repository.GetByIdAsync(request.Id)
            ?? throw new KeyNotFoundException($"Task with id '{request.Id}' was not found.");

        taskItem.Status = request.NewStatus;

        await _repository.UpdateAsync(taskItem);
    }
}
