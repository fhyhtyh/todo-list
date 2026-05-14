import { render, screen, fireEvent } from '@testing-library/react';
import { TaskDetailModal } from '../TaskDetailModal';
import { TaskStatus } from '../../../types/task';
import type { Task } from '../../../types/task';

describe('TaskDetailModal Component', () => {
  const mockTask: Task = {
    id: '1',
    title: 'Detail Task',
    description: 'Detail Description',
    status: TaskStatus.Todo,
    createdAt: new Date().toISOString()
  };

  const onCloseMock = jest.fn();
  const onEditMock = jest.fn();
  const onDeleteMock = jest.fn();
  const onStatusChangeMock = jest.fn();

  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('should not render anything if task is null', () => {
    const { container } = render(
      <TaskDetailModal
        task={null}
        onClose={onCloseMock}
      />
    );
    expect(container).toBeEmptyDOMElement();
  });

  it('should render task details when open', () => {
    render(
      <TaskDetailModal
        task={mockTask}
        onClose={onCloseMock}
      />
    );

    expect(screen.getByText('Detail Task')).toBeInTheDocument();
    expect(screen.getByText('Detail Description')).toBeInTheDocument();
  });

  it('should call onEdit when edit button is clicked', () => {
    render(
      <TaskDetailModal
        task={mockTask}
        onClose={onCloseMock}
        onEdit={onEditMock}
      />
    );

    const editBtn = screen.getByRole('button', { name: /edit task/i });
    fireEvent.click(editBtn);

    expect(onEditMock).toHaveBeenCalledTimes(1);
    expect(onEditMock).toHaveBeenCalledWith(mockTask);
  });

  it('should call onDelete when delete button is clicked', () => {
    render(
      <TaskDetailModal
        task={mockTask}
        onClose={onCloseMock}
        onDelete={onDeleteMock}
      />
    );

    const deleteBtn = screen.getByRole('button', { name: /delete/i });
    fireEvent.click(deleteBtn);

    expect(onDeleteMock).toHaveBeenCalledTimes(1);
    expect(onDeleteMock).toHaveBeenCalledWith(mockTask.id);
  });
});
