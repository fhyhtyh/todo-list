import React, { useState } from 'react';
import type { Task } from '../../types/task';
import { TaskStatus } from '../../types/task';
import { TaskCard } from './TaskCard';
import styles from './BoardView.module.css';

interface BoardViewProps {
  tasks: Task[];
  onStatusChange?: (id: string, status: TaskStatus) => void;
  onEdit?: (task: Task) => void;
  onDelete?: (id: string) => void;
  onViewDetails?: (task: Task) => void;
  pendingTaskIds?: Set<string>;
}

const COLUMNS: { status: TaskStatus; label: string; icon: string }[] = [
  { status: TaskStatus.Todo, label: 'Todo', icon: '📋' },
  { status: TaskStatus.InProgress, label: 'In Progress', icon: '⚡' },
  { status: TaskStatus.Done, label: 'Done', icon: '✅' },
];

export const BoardView: React.FC<BoardViewProps> = ({
  tasks,
  onStatusChange,
  onEdit,
  onDelete,
  onViewDetails,
  pendingTaskIds,
}) => {
  const [dragOverStatus, setDragOverStatus] = useState<TaskStatus | null>(null);

  const byStatus = (status: TaskStatus) => tasks.filter((t) => t.status === status);

  const handleDragOver = (e: React.DragEvent<HTMLElement>, status: TaskStatus) => {
    e.preventDefault();
    e.dataTransfer.dropEffect = 'move';
    setDragOverStatus(status);
  };

  const handleDragLeave = (e: React.DragEvent<HTMLElement>) => {
    if (!e.currentTarget.contains(e.relatedTarget as Node)) {
      setDragOverStatus(null);
    }
  };

  const handleDrop = (e: React.DragEvent<HTMLElement>, targetStatus: TaskStatus) => {
    e.preventDefault();
    setDragOverStatus(null);

    const taskId = e.dataTransfer.getData('taskId');
    const fromStatus = Number(e.dataTransfer.getData('fromStatus')) as TaskStatus;

    if (!taskId || fromStatus === targetStatus) return;
    onStatusChange?.(taskId, targetStatus);
  };

  return (
    <div className={styles.board} role="region" aria-label="Task board">
      {COLUMNS.map(({ status, label, icon }) => {
        const columnTasks = byStatus(status);
        const isOver = dragOverStatus === status;

        return (
          <section
            key={status}
            className={`${styles.column} ${styles[`column-${status}`]} ${isOver ? styles.columnOver : ''}`}
            aria-label={`${label} column`}
            onDragOver={(e) => handleDragOver(e, status)}
            onDragLeave={handleDragLeave}
            onDrop={(e) => handleDrop(e, status)}
          >
            <div className={styles.columnHeader}>
              <span className={styles.columnIcon}>{icon}</span>
              <h2 className={styles.columnTitle}>{label}</h2>
              <span className={`${styles.count} ${styles[`count-${status}`]}`}>
                {columnTasks.length}
              </span>
            </div>

            <div className={styles.cardList}>
              {columnTasks.length === 0 ? (
                <div className={`${styles.empty} ${isOver ? styles.emptyOver : ''}`}>
                  <span>{isOver ? 'Drop here' : 'No tasks here'}</span>
                </div>
              ) : (
                columnTasks.map((task) => (
                  <TaskCard
                    key={task.id}
                    task={task}
                    onStatusChange={onStatusChange}
                    onEdit={onEdit}
                    onDelete={onDelete}
                    onViewDetails={onViewDetails}
                    isPending={pendingTaskIds?.has(task.id)}
                  />
                ))
              )}
              {columnTasks.length > 0 && isOver && (
                <div className={styles.dropHint} aria-hidden="true" />
              )}
            </div>
          </section>
        );
      })}
    </div>
  );
};
