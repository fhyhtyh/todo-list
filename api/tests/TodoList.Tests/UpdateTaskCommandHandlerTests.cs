using Moq;
using TodoList.Application.Tasks.Commands;
using TodoList.Domain.Entities;
using TodoList.Domain.Interfaces;

namespace TodoList.Tests;

public class UpdateTaskCommandHandlerTests
{
    [Fact]
    public async Task Handle_Should_UpdateTask_WhenTaskExists()
    {
        // Arrange
        var mockRepository = new Mock<ITaskItemRepository>();
        var taskId = Guid.NewGuid();
        var existingTask = new TaskItem { Id = taskId, Title = "Old Title" };
        
        mockRepository.Setup(r => r.GetByIdAsync(taskId))
            .ReturnsAsync(existingTask);

        var newDeadline = DateTime.UtcNow.AddDays(2);
        var command = new UpdateTaskCommand(taskId, "New Title", "New Description", newDeadline);
        var handler = new UpdateTaskCommandHandler(mockRepository.Object);

        // Act
        await handler.Handle(command, CancellationToken.None);

        // Assert
        Assert.Equal("New Title", existingTask.Title);
        Assert.Equal("New Description", existingTask.Description);
        Assert.Equal(newDeadline, existingTask.Deadline);
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

        var command = new UpdateTaskCommand(taskId, "New Title", "New Description", null);
        var handler = new UpdateTaskCommandHandler(mockRepository.Object);

        // Act & Assert
        var exception = await Assert.ThrowsAsync<KeyNotFoundException>(() => 
            handler.Handle(command, CancellationToken.None));
            
        Assert.Contains(taskId.ToString(), exception.Message);
        mockRepository.Verify(r => r.UpdateAsync(It.IsAny<TaskItem>()), Times.Never);
    }
}
