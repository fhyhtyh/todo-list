using Moq;
using TodoList.Application.Tasks.Commands;
using TodoList.Domain.Entities;
using TodoList.Domain.Interfaces;
using TaskStatusEnum = TodoList.Domain.Enums.TaskStatus;

namespace TodoList.Tests;

public class ChangeTaskStatusCommandHandlerTests
{
    [Fact]
    public async Task Handle_Should_UpdateStatus_WhenTaskExists()
    {
        // Arrange
        var mockRepository = new Mock<ITaskItemRepository>();
        var taskId = Guid.NewGuid();
        var existingTask = new TaskItem { Id = taskId, Status = TaskStatusEnum.Todo };
        
        mockRepository.Setup(r => r.GetByIdAsync(taskId))
            .ReturnsAsync(existingTask);

        var command = new ChangeTaskStatusCommand(taskId, TaskStatusEnum.InProgress);
        var handler = new ChangeTaskStatusCommandHandler(mockRepository.Object);

        // Act
        await handler.Handle(command, CancellationToken.None);

        // Assert
        Assert.Equal(TaskStatusEnum.InProgress, existingTask.Status);
        mockRepository.Verify(r => r.UpdateAsync(existingTask), Times.Once);
    }

    [Fact]
    public async Task Handle_Should_ThrowKeyNotFoundException_WhenTaskDoesNotExist()
    {
        // Arrange
        var mockRepository = new Mock<ITaskItemRepository>();
        var taskId = Guid.NewGuid();
        
        mockRepository.Setup(r => r.GetByIdAsync(taskId))
            .ReturnsAsync((TaskItem?)null);

        var command = new ChangeTaskStatusCommand(taskId, TaskStatusEnum.InProgress);
        var handler = new ChangeTaskStatusCommandHandler(mockRepository.Object);

        // Act & Assert
        var exception = await Assert.ThrowsAsync<KeyNotFoundException>(() => 
            handler.Handle(command, CancellationToken.None));
            
        Assert.Contains(taskId.ToString(), exception.Message);
        mockRepository.Verify(r => r.UpdateAsync(It.IsAny<TaskItem>()), Times.Never);
    }
}
