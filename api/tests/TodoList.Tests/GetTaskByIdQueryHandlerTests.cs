using Moq;
using TodoList.Application.Tasks.Queries;
using TodoList.Domain.Entities;
using TodoList.Domain.Interfaces;

namespace TodoList.Tests;

public class GetTaskByIdQueryHandlerTests
{
    [Fact]
    public async Task Handle_Should_ReturnTask_WhenTaskExists()
    {
        // Arrange
        var mockRepository = new Mock<ITaskItemRepository>();
        var taskId = Guid.NewGuid();
        var expectedTask = new TaskItem { Id = taskId, Title = "Test Task" };
        
        mockRepository.Setup(r => r.GetByIdAsync(taskId))
            .ReturnsAsync(expectedTask);

        var query = new GetTaskByIdQuery(taskId);
        var handler = new GetTaskByIdQueryHandler(mockRepository.Object);

        // Act
        var result = await handler.Handle(query, CancellationToken.None);

        // Assert
        Assert.NotNull(result);
        Assert.Equal(taskId, result!.Id);
        Assert.Equal("Test Task", result.Title);
        mockRepository.Verify(r => r.GetByIdAsync(taskId), Times.Once);
    }

    [Fact]
    public async Task Handle_Should_ReturnNull_WhenTaskDoesNotExist()
    {
        // Arrange
        var mockRepository = new Mock<ITaskItemRepository>();
        var taskId = Guid.NewGuid();
        
        mockRepository.Setup(r => r.GetByIdAsync(taskId))
            .ReturnsAsync((TaskItem?)null);

        var query = new GetTaskByIdQuery(taskId);
        var handler = new GetTaskByIdQueryHandler(mockRepository.Object);

        // Act
        var result = await handler.Handle(query, CancellationToken.None);

        // Assert
        Assert.Null(result);
        mockRepository.Verify(r => r.GetByIdAsync(taskId), Times.Once);
    }
}
