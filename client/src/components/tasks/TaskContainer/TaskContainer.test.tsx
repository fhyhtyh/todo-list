import { render, screen, fireEvent, within } from '@testing-library/react';
import { TaskContainer } from '../TaskContainer';
import { TaskStatus } from '../../../types/task';
import type { Task } from '../../../types/task';

describe('TaskContainer Component - Filtering and Sorting', () => {
  const mockTasks: Task[] = [
    {
      id: '1',
      title: 'A Task',
      description: 'First',
      status: TaskStatus.Todo,
      createdAt: '2026-05-10T10:00:00Z',
    },
    {
      id: '2',
      title: 'Z Task',
      description: 'Second',
      status: TaskStatus.InProgress,
      createdAt: '2026-05-11T10:00:00Z',
    },
    {
      id: '3',
      title: 'M Task',
      description: 'Third',
      status: TaskStatus.Done,
      createdAt: '2026-05-12T10:00:00Z',
    }
  ];

  it('should filter tasks by status', () => {
    // Arrange
    render(<TaskContainer tasks={mockTasks} />);

    // Check initial state (all tasks)
    expect(screen.getByText('A Task')).toBeInTheDocument();
    expect(screen.getByText('Z Task')).toBeInTheDocument();
    expect(screen.getByText('M Task')).toBeInTheDocument();

    // Act - Filter by InProgress
    const statusSelect = screen.getByLabelText('Filter by status');
    fireEvent.change(statusSelect, { target: { value: TaskStatus.InProgress.toString() } });

    // Assert
    expect(screen.queryByText('A Task')).not.toBeInTheDocument();
    expect(screen.getByText('Z Task')).toBeInTheDocument();
    expect(screen.queryByText('M Task')).not.toBeInTheDocument();
  });

  it('should search tasks by title', () => {
    // Arrange
    render(<TaskContainer tasks={mockTasks} />);

    // Act - Search for 'M Task'
    const searchInput = screen.getByLabelText('Search tasks');
    fireEvent.change(searchInput, { target: { value: 'M Task' } });

    // Assert
    expect(screen.queryByText('A Task')).not.toBeInTheDocument();
    expect(screen.queryByText('Z Task')).not.toBeInTheDocument();
    expect(screen.getByText('M Task')).toBeInTheDocument();
  });

  it('should sort tasks by title', () => {
    // Arrange
    const sortTasks: Task[] = [
      { id: '1', title: 'Z Task', description: '', status: TaskStatus.Todo, createdAt: '2026-05-10T10:00:00Z' },
      { id: '2', title: 'M Task', description: '', status: TaskStatus.Todo, createdAt: '2026-05-11T10:00:00Z' },
      { id: '3', title: 'A Task', description: '', status: TaskStatus.Todo, createdAt: '2026-05-12T10:00:00Z' }
    ];

    // Default order (createdAt descending): A Task, M Task, Z Task
    const { container } = render(<TaskContainer tasks={sortTasks} />);

    // Switch to list view to ensure stable DOM querying
    const listViewBtn = screen.getByTitle('List view');
    fireEvent.click(listViewBtn);

    // Act - Sort by title
    const sortSelect = screen.getByLabelText('Sort tasks');
    fireEvent.change(sortSelect, { target: { value: 'title' } });

    const articles = container.querySelectorAll('article h3');
    expect(articles[0]).toHaveTextContent('A Task');
    expect(articles[1]).toHaveTextContent('M Task');
    expect(articles[2]).toHaveTextContent('Z Task');
  });
});
