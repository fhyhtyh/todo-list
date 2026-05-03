using MediatR;
using TodoList.Domain.Entities;
using TodoList.Domain.Interfaces;

namespace TodoList.Application.Tasks.Queries;

public record GetTaskByIdQuery(Guid Id) : IRequest<TaskItem?>;

public class GetTaskByIdQueryHandler : IRequestHandler<GetTaskByIdQuery, TaskItem?>
{
    private readonly ITaskItemRepository _repository;

    public GetTaskByIdQueryHandler(ITaskItemRepository repository)
    {
        _repository = repository;
    }

    public async Task<TaskItem?> Handle(GetTaskByIdQuery request, CancellationToken cancellationToken)
    {
        return await _repository.GetByIdAsync(request.Id);
    }
}
