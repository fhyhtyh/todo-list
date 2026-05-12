using Moq;
using TodoList.Application.Tasks.Queries;
using TodoList.Domain.Entities;
using TodoList.Domain.Interfaces;

namespace TodoList.Tests;

public class GetAllTasksQueryHandlerTests
{
    [Fact]
    public async Task Handle_Should_ReturnAllTasks_WhenTasksExist()
    {
        // Arrange
        var mockRepository = new Mock<ITaskItemRepository>();
        var expectedTasks = new List<TaskItem>
        {
            new TaskItem { Id = Guid.NewGuid(), Title = "Task 1" },
            new TaskItem { Id = Guid.NewGuid(), Title = "Task 2" }
        };
        
        mockRepository.Setup(r => r.GetAllAsync())
            .ReturnsAsync(expectedTasks);

        var query = new GetAllTasksQuery();
        var handler = new GetAllTasksQueryHandler(mockRepository.Object);

        // Act
        var result = await handler.Handle(query, CancellationToken.None);

        // Assert
        Assert.NotNull(result);
        Assert.Equal(2, result.Count());
        Assert.Equal(expectedTasks, result);
        mockRepository.Verify(r => r.GetAllAsync(), Times.Once);
    }

    [Fact]
    public async Task Handle_Should_ReturnEmptyList_WhenNoTasksExist()
    {
        // Arrange
        var mockRepository = new Mock<ITaskItemRepository>();
        
        mockRepository.Setup(r => r.GetAllAsync())
            .ReturnsAsync(new List<TaskItem>());

        var query = new GetAllTasksQuery();
        var handler = new GetAllTasksQueryHandler(mockRepository.Object);

        // Act
        var result = await handler.Handle(query, CancellationToken.None);

        // Assert
        Assert.NotNull(result);
        Assert.Empty(result);
        mockRepository.Verify(r => r.GetAllAsync(), Times.Once);
    }
}
