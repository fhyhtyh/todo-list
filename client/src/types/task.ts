export enum TaskStatus {
  Todo = 0,
  InProgress = 1,
  Done = 2
}

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
