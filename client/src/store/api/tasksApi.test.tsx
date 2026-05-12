import React, { ReactNode } from 'react';
import { render, screen, waitFor, fireEvent } from '@testing-library/react';
import { Provider } from 'react-redux';
import { configureStore } from '@reduxjs/toolkit';
import { setupServer } from 'msw/node';
import { http, HttpResponse } from 'msw';
import { tasksApi, useGetTasksQuery, useCreateTaskMutation } from './tasksApi';
import { TaskStatus } from '../../types/task';

const mockTasks = [
  {
    id: '1',
    title: 'Test Task 1',
    description: 'Desc 1',
    status: TaskStatus.Todo,
    createdAt: new Date().toISOString()
  }
];

const server = setupServer(
  http.get('http://localhost/api/tasks', () => {
    return HttpResponse.json(mockTasks);
  }),
  http.post('http://localhost/api/tasks', async ({ request }) => {
    const newTask = await request.json() as any;
    return HttpResponse.json({
      id: '2',
      title: newTask.title,
      description: newTask.description,
      status: TaskStatus.Todo,
      createdAt: new Date().toISOString()
    }, { status: 201 });
  })
);

beforeAll(() => server.listen({ onUnhandledRequest: 'error' }));
afterEach(() => {
  server.resetHandlers();
  tasksApi.util.resetApiState();
});
afterAll(() => server.close());

const setupStore = () => configureStore({
  reducer: {
    [tasksApi.reducerPath]: tasksApi.reducer,
  },
  middleware: (getDefaultMiddleware) =>
    getDefaultMiddleware({ serializableCheck: false }).concat(tasksApi.middleware),
});

const Wrapper = ({ children }: { children: ReactNode }) => {
  return <Provider store={setupStore()}>{children}</Provider>;
};

describe('tasksApi with MSW', () => {

  it('1. Test Successful Data Fetching (Queries)', async () => {
    const TestComponent = () => {
      const { data, isLoading, isSuccess, error } = useGetTasksQuery();
      console.log('Test 1 - data:', data, 'error:', error);

      return (
        <div>
          {isLoading && <div data-testid="loading">Loading...</div>}
          {isSuccess && <div data-testid="success">Success</div>}
          <ul>
            {data?.map(t => <li key={t.id}>{t.title}</li>)}
          </ul>
        </div>
      );
    };

    render(<TestComponent />, { wrapper: Wrapper });

    expect(screen.getByTestId('loading')).toBeInTheDocument();

    await waitFor(() => {
      expect(screen.getByTestId('success')).toBeInTheDocument();
    });

    expect(screen.getByText('Test Task 1')).toBeInTheDocument();
  });

  it('2. Test Error Handling (Server returns 500)', async () => {
    server.use(
      http.get('http://localhost/api/tasks', () => {
        return new HttpResponse(null, { status: 500 });
      })
    );

    const TestComponent = () => {
      const { isError, isLoading } = useGetTasksQuery();

      return (
        <div>
          {isLoading && <div>Loading...</div>}
          {isError && <div data-testid="error-message">Failed to load tasks.</div>}
        </div>
      );
    };

    render(<TestComponent />, { wrapper: Wrapper });

    await waitFor(() => {
      expect(screen.getByTestId('error-message')).toBeInTheDocument();
    });
  });

  it('3. Test Mutations and Cache Invalidation', async () => {
    let getTasksCallCount = 0;

    server.use(
      http.get('http://localhost/api/tasks', () => {
        getTasksCallCount++;
        return HttpResponse.json(mockTasks);
      })
    );

    const TestComponent = () => {
      const { data, isFetching } = useGetTasksQuery();
      const [createTask] = useCreateTaskMutation();

      return (
        <div>
          <div data-testid="fetch-status">{isFetching ? 'Fetching' : 'Idle'}</div>
          <button
            onClick={() => createTask({ title: 'New Mutation Task' })}
          >
            Create
          </button>
          <ul>
            {data?.map(t => <li key={t.id}>{t.title}</li>)}
          </ul>
        </div>
      );
    };

    render(<TestComponent />, { wrapper: Wrapper });

    await waitFor(() => {
      expect(screen.getByText('Test Task 1')).toBeInTheDocument();
    });

    expect(getTasksCallCount).toBe(1);

    const btn = screen.getByText('Create');
    fireEvent.click(btn);
    await waitFor(() => {
      expect(getTasksCallCount).toBe(2);
    });
  });
});
