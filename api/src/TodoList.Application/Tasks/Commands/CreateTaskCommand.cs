using MediatR;
using TodoList.Domain.Entities;
using TodoList.Domain.Interfaces;

namespace TodoList.Application.Tasks.Commands;

public record CreateTaskCommand(
    string Title,
    string? Description,
    DateTime? Deadline) : IRequest<Guid>;

public class CreateTaskCommandHandler : IRequestHandler<CreateTaskCommand, Guid>
{
    private readonly ITaskItemRepository _repository;

    public CreateTaskCommandHandler(ITaskItemRepository repository)
    {
        _repository = repository;
    }

    public async Task<Guid> Handle(CreateTaskCommand request, CancellationToken cancellationToken)
    {
        var taskItem = new TaskItem
        {
            Title = request.Title,
            Description = request.Description,
            Deadline = request.Deadline
        };

        var created = await _repository.AddAsync(taskItem);
        return created.Id;
    }
}
