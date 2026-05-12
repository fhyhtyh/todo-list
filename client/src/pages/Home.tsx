import React, { useState } from 'react';
import { TaskContainer, TaskModal } from '../components/tasks';
import { TaskDetailModal } from '../components/tasks/TaskDetailModal';
import {
  useGetTasksQuery,
  useChangeTaskStatusMutation,
  useDeleteTaskMutation,
  useCreateTaskMutation,
  useUpdateTaskMutation,
} from '../store/api/tasksApi';
import { TaskStatus } from '../types/task';
import type { Task, CreateTaskRequest, UpdateTaskRequest } from '../types/task';

export const Home: React.FC = () => {
  const { data: tasks = [], isLoading, isFetching, isError } = useGetTasksQuery();
  const [changeStatus] = useChangeTaskStatusMutation();
  const [deleteTask] = useDeleteTaskMutation();
  const [createTask, { isLoading: isCreating }] = useCreateTaskMutation();
  const [updateTask, { isLoading: isUpdating }] = useUpdateTaskMutation();

  const [pendingTaskIds, setPendingTaskIds] = useState<Set<string>>(new Set());

  const setPending = (id: string, pending: boolean) =>
    setPendingTaskIds((prev) => {
      const next = new Set(prev);
      pending ? next.add(id) : next.delete(id);
      return next;
    });

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingTask, setEditingTask] = useState<Task | null>(null);
  const [selectedTask, setSelectedTask] = useState<Task | null>(null);
  const [submitError, setSubmitError] = useState<string | null>(null);

  const handleOpenModal = (task?: Task) => {
    setSubmitError(null);
    setEditingTask(task || null);
    setIsModalOpen(true);
  };

  const handleCloseModal = () => {
    setSubmitError(null);
    setEditingTask(null);
    setIsModalOpen(false);
  };

  const handleSubmit = async (payload: CreateTaskRequest | UpdateTaskRequest) => {
    setSubmitError(null);
    try {
      if ('id' in payload) {
        await updateTask(payload as UpdateTaskRequest).unwrap();
      } else {
        await createTask(payload as CreateTaskRequest).unwrap();
      }
      handleCloseModal();
    } catch {
      setSubmitError('Failed to save the task. Please try again.');
    }
  };

  const handleStatusChange = async (id: string, status: TaskStatus) => {
    setPending(id, true);
    try {
      await changeStatus({ id, status }).unwrap();
    } finally {
      setPending(id, false);
    }
  };

  const handleDelete = async (id: string) => {
    setPending(id, true);
    try {
      await deleteTask(id).unwrap();
      if (selectedTask?.id === id) setSelectedTask(null);
    } finally {
      setPending(id, false);
    }
  };

  return (
    <>
      <TaskContainer
        tasks={tasks}
        isLoading={isLoading || isFetching}
        isError={isError}
        onStatusChange={handleStatusChange}
        onDelete={handleDelete}
        onEdit={(task) => handleOpenModal(task)}
        onAddTask={() => handleOpenModal()}
        onViewDetails={(task) => setSelectedTask(task)}
        pendingTaskIds={pendingTaskIds}
      />

      <TaskModal
        isOpen={isModalOpen}
        onClose={handleCloseModal}
        onSubmit={handleSubmit}
        initialData={editingTask}
        isLoading={isCreating || isUpdating}
        error={submitError}
      />

      <TaskDetailModal
        task={selectedTask}
        onClose={() => setSelectedTask(null)}
        onEdit={(task) => { setSelectedTask(null); handleOpenModal(task); }}
        onDelete={handleDelete}
        onStatusChange={handleStatusChange}
        isLoading={selectedTask ? pendingTaskIds.has(selectedTask.id) : false}
      />
    </>
  );
};
