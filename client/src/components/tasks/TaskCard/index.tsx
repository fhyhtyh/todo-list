import React, { useState } from 'react';
import { Spin } from 'antd';
import type { Task } from '../../../types/task';
import { TaskStatus } from '../../../types/task';
import styles from './styles.module.css';

interface TaskCardProps {
  task: Task;
  isDraggable?: boolean;
  onStatusChange?: (id: string, status: TaskStatus) => void;
  onEdit?: (task: Task) => void;
  onDelete?: (id: string) => void;
  onViewDetails?: (task: Task) => void;
  isPending?: boolean;
}

const STATUS_LABELS: Record<TaskStatus, string> = {
  [TaskStatus.Todo]: 'Todo',
  [TaskStatus.InProgress]: 'In Progress',
  [TaskStatus.Done]: 'Done',
};

const STATUS_NEXT: Record<TaskStatus, TaskStatus | null> = {
  [TaskStatus.Todo]: TaskStatus.InProgress,
  [TaskStatus.InProgress]: TaskStatus.Done,
  [TaskStatus.Done]: null,
};

function formatDeadline(dateStr?: string): string | null {
  if (!dateStr) return null;
  const date = new Date(dateStr);
  return date.toLocaleDateString('uk-UA', { day: 'numeric', month: 'short', year: 'numeric' });
}

function isOverdue(dateStr?: string, status?: TaskStatus): boolean {
  if (!dateStr || status === TaskStatus.Done) return false;
  return new Date(dateStr) < new Date();
}

export const TaskCard: React.FC<TaskCardProps> = ({ task, isDraggable = true, onStatusChange, onEdit, onDelete, onViewDetails, isPending = false }) => {
  const [menuOpen, setMenuOpen] = useState(false);
  const [dragging, setDragging] = useState(false);

  const deadline = formatDeadline(task.deadline);
  const overdue = isOverdue(task.deadline, task.status);
  const nextStatus = STATUS_NEXT[task.status];

  const handleMenuToggle = (e: React.MouseEvent) => {
    e.stopPropagation();
    setMenuOpen((v) => !v);
  };

  const handleMenuBlur = () => {
    setTimeout(() => setMenuOpen(false), 150);
  };

  const handleStatusChange = (status: TaskStatus) => {
    onStatusChange?.(task.id, status);
    setMenuOpen(false);
  };

  const handleDragStart = (e: React.DragEvent<HTMLElement>) => {
    if (!isDraggable) { e.preventDefault(); return; }
    e.dataTransfer.effectAllowed = 'move';
    e.dataTransfer.setData('taskId', task.id);
    e.dataTransfer.setData('fromStatus', String(task.status));
    setDragging(true);
  };

  const handleDragEnd = () => {
    setDragging(false);
  };

  const handleCardClick = () => {
    if (!menuOpen) onViewDetails?.(task);
  };

  return (
    <article
      className={`${styles.card} ${styles[`status-${task.status}`]} ${dragging ? styles.dragging : ''} ${onViewDetails ? styles.clickable : ''} ${isPending ? styles.pending : ''}`}
      draggable={isDraggable && !isPending}
      onDragStart={handleDragStart}
      onDragEnd={handleDragEnd}
      onClick={handleCardClick}
      role={onViewDetails ? 'button' : undefined}
      tabIndex={onViewDetails ? 0 : undefined}
      onKeyDown={onViewDetails ? (e) => { if (e.key === 'Enter' || e.key === ' ') handleCardClick(); } : undefined}
      aria-busy={isPending}
    >
      {isPending && (
        <span className={styles.pendingOverlay} aria-hidden="true">
          <Spin size="small" />
        </span>
      )}
      <span className={styles.strip} aria-hidden="true" />

      <div className={styles.body}>
        <div className={styles.header}>
          <span className={`${styles.badge} ${styles[`badge-${task.status}`]}`}>
            {STATUS_LABELS[task.status]}
          </span>

          <div className={styles.menuWrapper} onBlur={handleMenuBlur}>
            <button
              id={`task-menu-${task.id}`}
              className={styles.menuBtn}
              onClick={handleMenuToggle}
              aria-label="Task options"
              aria-haspopup="true"
              aria-expanded={menuOpen}
            >
              <svg width="16" height="16" viewBox="0 0 16 16" fill="currentColor">
                <circle cx="8" cy="3" r="1.5" />
                <circle cx="8" cy="8" r="1.5" />
                <circle cx="8" cy="13" r="1.5" />
              </svg>
            </button>

            {menuOpen && (
              <ul className={styles.menu} role="menu" aria-labelledby={`task-menu-${task.id}`}>
                {nextStatus !== null && (
                  <li role="menuitem">
                    <button onClick={() => handleStatusChange(nextStatus)}>
                      → Move to {STATUS_LABELS[nextStatus]}
                    </button>
                  </li>
                )}
                {task.status !== TaskStatus.Todo && (
                  <li role="menuitem">
                    <button onClick={() => handleStatusChange(TaskStatus.Todo)}>
                      ↩ Move to Todo
                    </button>
                  </li>
                )}
                <li role="menuitem">
                  <button onClick={() => { onEdit?.(task); setMenuOpen(false); }}>
                    ✏️ Edit
                  </button>
                </li>
                <li className={styles.menuDivider} role="separator" />
                <li role="menuitem">
                  <button
                    className={styles.menuDanger}
                    onClick={() => { onDelete?.(task.id); setMenuOpen(false); }}
                  >
                    🗑 Delete
                  </button>
                </li>
              </ul>
            )}
          </div>
        </div>

        <h3 className={styles.title}>{task.title}</h3>

        {task.description && (
          <p className={styles.description}>{task.description}</p>
        )}

        <div className={styles.footer}>
          {deadline && (
            <span className={`${styles.deadline} ${overdue ? styles.overdue : ''}`}>
              <svg width="12" height="12" viewBox="0 0 16 16" fill="currentColor" aria-hidden="true">
                <path d="M8 1a7 7 0 1 0 0 14A7 7 0 0 0 8 1zm0 1.5a5.5 5.5 0 1 1 0 11A5.5 5.5 0 0 1 8 2.5zM7.25 5v3.5l3 1.75.5-.87-2.5-1.46V5h-1z" />
              </svg>
              {overdue ? 'Прострочено: ' : ''}{deadline}
            </span>
          )}
          <span className={styles.createdAt}>
            {new Date(task.createdAt).toLocaleDateString('uk-UA', { day: 'numeric', month: 'short' })}
          </span>
        </div>
      </div>
    </article>
  );
};
