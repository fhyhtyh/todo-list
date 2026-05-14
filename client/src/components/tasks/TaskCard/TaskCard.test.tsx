import { render, screen, fireEvent } from '@testing-library/react';
import { TaskCard } from '../TaskCard';
import { TaskStatus } from '../../../types/task';
import type { Task } from '../../../types/task';

describe('TaskCard Component', () => {
  const mockTask: Task = {
    id: '1',
    title: 'Test Task Title',
    description: 'Test Task Description',
    status: TaskStatus.Todo,
    createdAt: new Date().toISOString(),
  };

  it('should render task title and description', () => {
    // Arrange
    const onViewDetailsMock = jest.fn();

    // Act
    render(
      <TaskCard
        task={mockTask}
        onViewDetails={onViewDetailsMock}
      />
    );

    // Assert
    expect(screen.getByText('Test Task Title')).toBeInTheDocument();
    expect(screen.getByText('Test Task Description')).toBeInTheDocument();
  });

  it('should call onClick when the card is clicked', () => {
    // Arrange
    const onViewDetailsMock = jest.fn();
    const { container } = render(
      <TaskCard
        task={mockTask}
        onViewDetails={onViewDetailsMock}
      />
    );

    // Act
    fireEvent.click(container.firstChild as HTMLElement);

    // Assert
    expect(onViewDetailsMock).toHaveBeenCalledTimes(1);
    expect(onViewDetailsMock).toHaveBeenCalledWith(mockTask);
  });
});
