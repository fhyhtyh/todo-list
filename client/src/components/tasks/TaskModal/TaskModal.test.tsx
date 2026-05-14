import { render, screen, fireEvent } from '@testing-library/react';
import { TaskModal } from './TaskModal';

describe('TaskModal Component', () => {
  const onCloseMock = jest.fn();
  const onSubmitMock = jest.fn();

  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('should not call onSubmit if title is empty (button should be disabled)', () => {
    // Arrange
    render(
      <TaskModal 
        isOpen={true} 
        onClose={onCloseMock} 
        onSubmit={onSubmitMock} 
      />
    );

    // Assert
    const submitBtn = screen.getByRole('button', { name: /create task/i });
    expect(submitBtn).toBeDisabled();
  });

  it('should call onSubmit with form data when valid', () => {
    // Arrange
    render(
      <TaskModal 
        isOpen={true} 
        onClose={onCloseMock} 
        onSubmit={onSubmitMock} 
      />
    );

    // Act
    const titleInput = screen.getByLabelText(/title/i);
    const descInput = screen.getByLabelText(/description/i);
    
    fireEvent.change(titleInput, { target: { value: 'New Task' } });
    fireEvent.change(descInput, { target: { value: 'Some description' } });

    const submitBtn = screen.getByRole('button', { name: /create task/i });
    expect(submitBtn).not.toBeDisabled();
    
    fireEvent.click(submitBtn);

    // Assert
    expect(onSubmitMock).toHaveBeenCalledTimes(1);
    expect(onSubmitMock).toHaveBeenCalledWith({
      title: 'New Task',
      description: 'Some description',
      deadline: undefined
    });
  });

  it('should prepopulate data when editing', () => {
    // Arrange
    const initialData = {
      id: '1',
      title: 'Existing Task',
      description: 'Existing Description',
      status: 0,
      createdAt: new Date().toISOString()
    };

    render(
      <TaskModal 
        isOpen={true} 
        onClose={onCloseMock} 
        onSubmit={onSubmitMock} 
        initialData={initialData}
      />
    );

    // Assert
    expect(screen.getByDisplayValue('Existing Task')).toBeInTheDocument();
    expect(screen.getByDisplayValue('Existing Description')).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /save changes/i })).not.toBeDisabled();
  });
});
