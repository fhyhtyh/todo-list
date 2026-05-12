import React, { useEffect } from 'react';
import { Spin } from 'antd';
import type { Task } from '../../types/task';
import { TaskStatus } from '../../types/task';
import styles from './TaskDetailModal.module.css';

interface TaskDetailModalProps {
  task: Task | null;
  onClose: () => void;
  onEdit?: (task: Task) => void;
  onDelete?: (id: string) => void;
  onStatusChange?: (id: string, status: TaskStatus) => void;
  isLoading?: boolean;
}

const STATUS_LABELS: Record<TaskStatus, string> = {
  [TaskStatus.Todo]: 'Todo',
  [TaskStatus.InProgress]: 'In Progress',
  [TaskStatus.Done]: 'Done',
};

const STATUS_COLORS: Record<TaskStatus, string> = {
  [TaskStatus.Todo]: styles.statusTodo,
  [TaskStatus.InProgress]: styles.statusInProgress,
  [TaskStatus.Done]: styles.statusDone,
};

const STATUS_NEXT: Record<TaskStatus, TaskStatus | null> = {
  [TaskStatus.Todo]: TaskStatus.InProgress,
  [TaskStatus.InProgress]: TaskStatus.Done,
  [TaskStatus.Done]: null,
};

function formatDate(dateStr?: string): string | null {
  if (!dateStr) return null;
  return new Date(dateStr).toLocaleDateString('uk-UA', {
    day: 'numeric',
    month: 'long',
    year: 'numeric',
  });
}

function isOverdue(dateStr?: string, status?: TaskStatus): boolean {
  if (!dateStr || status === TaskStatus.Done) return false;
  return new Date(dateStr) < new Date();
}

export const TaskDetailModal: React.FC<TaskDetailModalProps> = ({
  task,
  onClose,
  onEdit,
  onDelete,
  onStatusChange,
  isLoading = false,
}) => {
  useEffect(() => {
    if (!task) return;
    const handler = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
    };
    document.addEventListener('keydown', handler);
    return () => document.removeEventListener('keydown', handler);
  }, [task, onClose]);

  useEffect(() => {
    if (task) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = '';
    }
    return () => { document.body.style.overflow = ''; };
  }, [task]);

  if (!task) return null;

  const deadline = formatDate(task.deadline);
  const overdue = isOverdue(task.deadline, task.status);
  const nextStatus = STATUS_NEXT[task.status];

  const handleDelete = () => {
    onDelete?.(task.id);
  };

  const handleStatusChange = (status: TaskStatus) => {
    onStatusChange?.(task.id, status);
    onClose();
  };

  const Spinner = () => <Spin size="small" />;

  return (
    <div
      className={styles.overlay}
      onClick={onClose}
      role="dialog"
      aria-modal="true"
      aria-label={`Task details: ${task.title}`}
    >
      <div
        className={styles.panel}
        onClick={(e) => e.stopPropagation()}
      >
        <div className={styles.panelHeader}>
          <div className={`${styles.statusDot} ${STATUS_COLORS[task.status]}`} />
          <span className={`${styles.statusBadge} ${STATUS_COLORS[task.status]}`}>
            {STATUS_LABELS[task.status]}
          </span>
          <button
            className={styles.closeBtn}
            onClick={onClose}
            aria-label="Close task details"
          >
            <svg width="16" height="16" viewBox="0 0 16 16" fill="currentColor">
              <path d="M3.72 3.72a.75.75 0 0 1 1.06 0L8 6.94l3.22-3.22a.75.75 0 1 1 1.06 1.06L9.06 8l3.22 3.22a.75.75 0 1 1-1.06 1.06L8 9.06l-3.22 3.22a.75.75 0 0 1-1.06-1.06L6.94 8 3.72 4.78a.75.75 0 0 1 0-1.06z" />
            </svg>
          </button>
        </div>

        <div className={styles.panelContent}>
          <h2 className={styles.taskTitle}>{task.title}</h2>

          {task.description ? (
            <div className={styles.section}>
              <p className={styles.sectionLabel}>Description</p>
              <p className={styles.description}>{task.description}</p>
            </div>
          ) : (
            <div className={styles.section}>
              <p className={styles.sectionLabel}>Description</p>
              <p className={styles.emptyDescription}>No description provided.</p>
            </div>
          )}

          <div className={styles.metaGrid}>
            <div className={styles.metaItem}>
              <span className={styles.metaIcon}>
                <svg width="14" height="14" viewBox="0 0 16 16" fill="currentColor" aria-hidden="true">
                  <path d="M8 1a7 7 0 1 0 0 14A7 7 0 0 0 8 1zm0 1.5a5.5 5.5 0 1 1 0 11A5.5 5.5 0 0 1 8 2.5zM7.25 5v3.5l3 1.75.5-.87-2.5-1.46V5h-1z" />
                </svg>
              </span>
              <div>
                <p className={styles.metaLabel}>Deadline</p>
                <p className={`${styles.metaValue} ${overdue ? styles.overdue : ''}`}>
                  {deadline
                    ? (overdue ? `⚠ Overdue: ${deadline}` : deadline)
                    : '—'}
                </p>
              </div>
            </div>

            <div className={styles.metaItem}>
              <span className={styles.metaIcon}>
                <svg width="14" height="14" viewBox="0 0 16 16" fill="currentColor" aria-hidden="true">
                  <path d="M1.5 8a6.5 6.5 0 1 1 13 0 6.5 6.5 0 0 1-13 0zM8 0a8 8 0 1 0 0 16A8 8 0 0 0 8 0zm.75 4.75a.75.75 0 0 0-1.5 0v3.5c0 .414.336.75.75.75h2.5a.75.75 0 0 0 0-1.5H8.75V4.75z" />
                </svg>
              </span>
              <div>
                <p className={styles.metaLabel}>Created</p>
                <p className={styles.metaValue}>
                  {new Date(task.createdAt).toLocaleDateString('uk-UA', {
                    day: 'numeric',
                    month: 'long',
                    year: 'numeric',
                  })}
                </p>
              </div>
            </div>
          </div>

          {(nextStatus !== null || task.status !== TaskStatus.Todo) && (
            <div className={styles.section}>
              <p className={styles.sectionLabel}>Move to</p>
              <div className={styles.statusActions}>
                {task.status !== TaskStatus.Todo && (
                  <button
                    className={`${styles.statusBtn} ${styles.statusBtnTodo}`}
                    onClick={() => handleStatusChange(TaskStatus.Todo)}
                    disabled={isLoading}
                  >
                    📋 Todo
                  </button>
                )}
                {task.status !== TaskStatus.InProgress && (
                  <button
                    className={`${styles.statusBtn} ${styles.statusBtnInProgress}`}
                    onClick={() => handleStatusChange(TaskStatus.InProgress)}
                    disabled={isLoading}
                  >
                    ⚡ In Progress
                  </button>
                )}
                {task.status !== TaskStatus.Done && (
                  <button
                    className={`${styles.statusBtn} ${styles.statusBtnDone}`}
                    onClick={() => handleStatusChange(TaskStatus.Done)}
                    disabled={isLoading}
                  >
                    ✅ Done
                  </button>
                )}
              </div>
            </div>
          )}
        </div>

        <div className={styles.panelFooter}>
          <button
            id={`task-detail-edit-${task.id}`}
            className={styles.editBtn}
            onClick={() => { onEdit?.(task); onClose(); }}
            disabled={isLoading}
          >
            {isLoading ? <Spinner /> : (
              <svg width="14" height="14" viewBox="0 0 16 16" fill="currentColor" aria-hidden="true">
                <path d="M11.013 1.427a1.75 1.75 0 0 1 2.474 0l1.086 1.086a1.75 1.75 0 0 1 0 2.474l-8.61 8.61c-.21.21-.47.364-.756.445l-3.251.93a.75.75 0 0 1-.927-.928l.929-3.25c.081-.286.235-.547.445-.758l8.61-8.61zm1.414 1.06a.25.25 0 0 0-.354 0L10.811 3.75l1.439 1.44 1.263-1.263a.25.25 0 0 0 0-.354l-1.086-1.086zM11.189 6.25 9.75 4.81l-6.286 6.287a.25.25 0 0 0-.064.108l-.558 1.953 1.953-.558a.249.249 0 0 0 .108-.064l6.286-6.286z" />
              </svg>
            )}
            {isLoading ? 'Saving…' : 'Edit Task'}
          </button>
          <button
            id={`task-detail-delete-${task.id}`}
            className={styles.deleteBtn}
            onClick={handleDelete}
            disabled={isLoading}
          >
            {isLoading ? <Spinner /> : (
              <svg width="14" height="14" viewBox="0 0 16 16" fill="currentColor" aria-hidden="true">
                <path d="M11 1.75V3h2.25a.75.75 0 0 1 0 1.5H2.75a.75.75 0 0 1 0-1.5H5V1.75C5 .784 5.784 0 6.75 0h2.5C10.216 0 11 .784 11 1.75zM4.496 6.675l.66 6.6a.25.25 0 0 0 .249.225h5.19a.25.25 0 0 0 .249-.225l.66-6.6a.75.75 0 0 1 1.492.149l-.66 6.6A1.748 1.748 0 0 1 10.595 15h-5.19a1.75 1.75 0 0 1-1.741-1.575l-.66-6.6a.75.75 0 1 1 1.492-.15zM6.5 1.75V3h3V1.75a.25.25 0 0 0-.25-.25h-2.5a.25.25 0 0 0-.25.25z" />
              </svg>
            )}
            {isLoading ? '…' : 'Delete'}
          </button>
        </div>
      </div>
    </div>
  );
};
