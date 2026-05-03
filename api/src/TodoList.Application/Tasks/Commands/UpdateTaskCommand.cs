using MediatR;
using TodoList.Domain.Interfaces;

namespace TodoList.Application.Tasks.Commands;

public record UpdateTaskCommand(
    Guid Id,
    string Title,
    string? Description,
    DateTime? Deadline) : IRequest;

public class UpdateTaskCommandHandler : IRequestHandler<UpdateTaskCommand>
{
    private readonly ITaskItemRepository _repository;

    public UpdateTaskCommandHandler(ITaskItemRepository repository)
    {
        _repository = repository;
    }

    public async Task Handle(UpdateTaskCommand request, CancellationToken cancellationToken)
    {
        var taskItem = await _repository.GetByIdAsync(request.Id)
            ?? throw new KeyNotFoundException($"Task with id '{request.Id}' was not found.");

        taskItem.Title = request.Title;
        taskItem.Description = request.Description;
        taskItem.Deadline = request.Deadline;

        await _repository.UpdateAsync(taskItem);
    }
}
