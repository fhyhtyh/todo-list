export const TaskStatus = {
  Todo: 0,
  InProgress: 1,
  Done: 2
} as const;

export type TaskStatus = typeof TaskStatus[keyof typeof TaskStatus];

export interface Task {
  id: string;
  title: string;
  description?: string;
  deadline?: string;
  status: TaskStatus;
  createdAt: string;
}

export interface CreateTaskRequest {
  title: string;
  description?: string;
  deadline?: string;
}

export interface UpdateTaskRequest {
  id: string;
  title: string;
  description?: string;
  deadline?: string;
}

export interface ChangeTaskStatusRequest {
  id: string;
  status: TaskStatus;
}
