using Moq;
using TodoList.Application.Tasks.Commands;
using TodoList.Domain.Entities;
using TodoList.Domain.Interfaces;

namespace TodoList.Tests;

public class CreateTaskCommandHandlerTests
{
    [Fact]
    public async Task Handle_Should_CreateTaskAndReturnId()
    {
        // Arrange
        var mockRepository = new Mock<ITaskItemRepository>();
        
        var expectedId = Guid.NewGuid();
        var command = new CreateTaskCommand("Test Task", "Test Description", DateTime.UtcNow.AddDays(1));
        
        mockRepository.Setup(r => r.AddAsync(It.IsAny<TaskItem>()))
            .ReturnsAsync((TaskItem task) => 
            {
                task.Id = expectedId; 
                return task;
            });

        var handler = new CreateTaskCommandHandler(mockRepository.Object);

        // Act
        var result = await handler.Handle(command, CancellationToken.None);

        // Assert
        Assert.Equal(expectedId, result);
        mockRepository.Verify(r => r.AddAsync(It.Is<TaskItem>(t => 
            t.Title == command.Title && 
            t.Description == command.Description && 
            t.Deadline == command.Deadline
        )), Times.Once);
    }
}
