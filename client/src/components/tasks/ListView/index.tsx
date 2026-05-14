import React from 'react';
import type { Task } from '../../../types/task';
import { TaskStatus } from '../../../types/task';
import { TaskCard } from '../TaskCard';
import styles from './styles.module.css';

interface ListViewProps {
  tasks: Task[];
  onStatusChange?: (id: string, status: TaskStatus) => void;
  onEdit?: (task: Task) => void;
  onDelete?: (id: string) => void;
  onViewDetails?: (task: Task) => void;
  pendingTaskIds?: Set<string>;
}

const GROUP_ORDER: TaskStatus[] = [TaskStatus.Todo, TaskStatus.InProgress, TaskStatus.Done];
const GROUP_LABELS: Record<TaskStatus, string> = {
  [TaskStatus.Todo]: 'Todo',
  [TaskStatus.InProgress]: 'In Progress',
  [TaskStatus.Done]: 'Done',
};

export const ListView: React.FC<ListViewProps> = ({
  tasks,
  onStatusChange,
  onEdit,
  onDelete,
  onViewDetails,
  pendingTaskIds,
}) => {
  const groups = GROUP_ORDER.map((status) => ({
    status,
    label: GROUP_LABELS[status],
    tasks: tasks.filter((t) => t.status === status),
  })).filter((g) => g.tasks.length > 0);

  if (tasks.length === 0) {
    return (
      <div className={styles.empty} role="status">
        <span className={styles.emptyIcon}>📭</span>
        <p>No tasks yet. Create your first task!</p>
      </div>
    );
  }

  return (
    <div className={styles.list} role="region" aria-label="Task list">
      {groups.map(({ status, label, tasks: groupTasks }) => (
        <section key={status} className={styles.group}>
          <div className={`${styles.groupHeader} ${styles[`groupHeader-${status}`]}`}>
            <span className={`${styles.dot} ${styles[`dot-${status}`]}`} aria-hidden="true" />
            <span className={styles.groupLabel}>{label}</span>
            <span className={styles.groupCount}>{groupTasks.length}</span>
          </div>

          <div className={styles.groupCards}>
            {groupTasks.map((task) => (
              <TaskCard
                key={task.id}
                task={task}
                isDraggable={false}
                onStatusChange={onStatusChange}
                onEdit={onEdit}
                onDelete={onDelete}
                onViewDetails={onViewDetails}
                isPending={pendingTaskIds?.has(task.id)}
              />
            ))}
          </div>
        </section>
      ))}
    </div>
  );
};
