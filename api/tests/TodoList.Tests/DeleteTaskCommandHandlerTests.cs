using Moq;
using TodoList.Application.Tasks.Commands;
using TodoList.Domain.Entities;
using TodoList.Domain.Interfaces;

namespace TodoList.Tests;

public class DeleteTaskCommandHandlerTests
{
    [Fact]
    public async Task Handle_Should_DeleteTask_WhenTaskExists()
    {
        // Arrange
        var mockRepository = new Mock<ITaskItemRepository>();
        var taskId = Guid.NewGuid();
        var existingTask = new TaskItem { Id = taskId };
        
        mockRepository.Setup(r => r.GetByIdAsync(taskId))
            .ReturnsAsync(existingTask);

        var command = new DeleteTaskCommand(taskId);
        var handler = new DeleteTaskCommandHandler(mockRepository.Object);

        // Act
        await handler.Handle(command, CancellationToken.None);

        // Assert
        mockRepository.Verify(r => r.DeleteAsync(existingTask), Times.Once);
    }

    [Fact]
    public async Task Handle_Should_ThrowKeyNotFoundException_WhenTaskDoesNotExist()
    {
        // Arrange
        var mockRepository = new Mock<ITaskItemRepository>();
        var taskId = Guid.NewGuid();
        
        mockRepository.Setup(r => r.GetByIdAsync(taskId))
            .ReturnsAsync((TaskItem?)null);

        var command = new DeleteTaskCommand(taskId);
        var handler = new DeleteTaskCommandHandler(mockRepository.Object);

        // Act & Assert
        var exception = await Assert.ThrowsAsync<KeyNotFoundException>(() => 
            handler.Handle(command, CancellationToken.None));
            
        Assert.Contains(taskId.ToString(), exception.Message);
        mockRepository.Verify(r => r.DeleteAsync(It.IsAny<TaskItem>()), Times.Never);
    }
}
