using MediatR;
using TodoList.Domain.Interfaces;

namespace TodoList.Application.Tasks.Commands;

public record DeleteTaskCommand(Guid Id) : IRequest;

public class DeleteTaskCommandHandler : IRequestHandler<DeleteTaskCommand>
{
    private readonly ITaskItemRepository _repository;

    public DeleteTaskCommandHandler(ITaskItemRepository repository)
    {
        _repository = repository;
    }

    public async Task Handle(DeleteTaskCommand request, CancellationToken cancellationToken)
    {
        var taskItem = await _repository.GetByIdAsync(request.Id)
            ?? throw new KeyNotFoundException($"Task with id '{request.Id}' was not found.");

        await _repository.DeleteAsync(taskItem);
    }
}
