import React, { useMemo, useState } from 'react';
import { Spin } from 'antd';
import type { Task } from '../../../types/task';
import { TaskStatus } from '../../../types/task';
import { BoardView } from '../BoardView';
import { ListView } from '../ListView';
import styles from './styles.module.css';

type ViewMode = 'board' | 'list';
type SortKey = 'createdAt' | 'deadline' | 'title';

interface TaskContainerProps {
  tasks: Task[];
  isLoading?: boolean;
  isError?: boolean;
  onStatusChange?: (id: string, status: TaskStatus) => void;
  onEdit?: (task: Task) => void;
  onDelete?: (id: string) => void;
  onAddTask?: () => void;
  onViewDetails?: (task: Task) => void;
  pendingTaskIds?: Set<string>;
}

const STATUS_FILTER_OPTIONS: { value: TaskStatus | 'all'; label: string }[] = [
  { value: 'all', label: 'All' },
  { value: TaskStatus.Todo, label: 'Todo' },
  { value: TaskStatus.InProgress, label: 'In Progress' },
  { value: TaskStatus.Done, label: 'Done' },
];

const SORT_OPTIONS: { value: SortKey; label: string }[] = [
  { value: 'createdAt', label: 'Created' },
  { value: 'deadline', label: 'Deadline' },
  { value: 'title', label: 'Title' },
];


export const TaskContainer: React.FC<TaskContainerProps> = ({
  tasks,
  isLoading = false,
  isError = false,
  onStatusChange,
  onEdit,
  onDelete,
  onAddTask,
  onViewDetails,
  pendingTaskIds,
}) => {
  const [view, setView] = useState<ViewMode>('board');
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState<TaskStatus | 'all'>('all');
  const [sortKey, setSortKey] = useState<SortKey>('createdAt');

  const filtered = useMemo(() => {
    let result = [...tasks];

    if (statusFilter !== 'all') {
      result = result.filter((t) => t.status === statusFilter);
    }

    if (search.trim()) {
      const q = search.toLowerCase();
      result = result.filter(
        (t) =>
          t.title.toLowerCase().includes(q) ||
          t.description?.toLowerCase().includes(q),
      );
    }

    result.sort((a, b) => {
      if (sortKey === 'title') return a.title.localeCompare(b.title);
      if (sortKey === 'deadline') {
        const hasA = !!a.deadline;
        const hasB = !!b.deadline;
        if (hasA && hasB) {
          return new Date(a.deadline!).getTime() - new Date(b.deadline!).getTime();
        }
        if (hasA) return -1;
        if (hasB) return 1;
        return 0;
      }
      const timeA = a.createdAt ? new Date(a.createdAt).getTime() : 0;
      const timeB = b.createdAt ? new Date(b.createdAt).getTime() : 0;
      return timeB - timeA;
    });

    return result;
  }, [tasks, statusFilter, search, sortKey]);

  const counts = useMemo(() => ({
    todo: tasks.filter((t) => t.status === TaskStatus.Todo).length,
    inProgress: tasks.filter((t) => t.status === TaskStatus.InProgress).length,
    done: tasks.filter((t) => t.status === TaskStatus.Done).length,
  }), [tasks]);

  return (
    <Spin size='large' spinning={isLoading}>
      <div className={styles.container}>
        <div className={styles.topBar}>
          <div className={styles.titleRow}>
            <h1 className={styles.title}>Task Board</h1>
            {onAddTask && (
              <button id="add-task-btn" className={styles.addBtn} onClick={onAddTask}>
                <svg width="16" height="16" viewBox="0 0 16 16" fill="currentColor" aria-hidden="true">
                  <path d="M8 1a.75.75 0 0 1 .75.75v5.5h5.5a.75.75 0 0 1 0 1.5h-5.5v5.5a.75.75 0 0 1-1.5 0v-5.5H1.75a.75.75 0 0 1 0-1.5h5.5V1.75A.75.75 0 0 1 8 1z" />
                </svg>
                Add Task
              </button>
            )}
          </div>

          <div className={styles.summaryRow}>
            <span className={`${styles.pill} ${styles.pillTodo}`}>
              📋 {counts.todo} Todo
            </span>
            <span className={`${styles.pill} ${styles.pillInProgress}`}>
              ⚡ {counts.inProgress} In Progress
            </span>
            <span className={`${styles.pill} ${styles.pillDone}`}>
              ✅ {counts.done} Done
            </span>
          </div>
        </div>

        <div className={styles.toolbar}>
          <div className={styles.searchWrapper}>
            <svg className={styles.searchIcon} width="15" height="15" viewBox="0 0 16 16" fill="currentColor" aria-hidden="true">
              <path d="M11.742 10.344a6.5 6.5 0 1 0-1.397 1.398h-.001c.03.04.062.078.098.115l3.85 3.85a1 1 0 0 0 1.415-1.414l-3.85-3.85a1.007 1.007 0 0 0-.115-.099zm-5.242 1.156a5.5 5.5 0 1 1 0-11 5.5 5.5 0 0 1 0 11z" />
            </svg>
            <input
              id="task-search"
              type="search"
              placeholder="Search tasks…"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className={styles.searchInput}
              aria-label="Search tasks"
            />
          </div>

          <select
            id="task-status-filter"
            value={statusFilter}
            onChange={(e) => {
              const val = e.target.value;
              setStatusFilter(val === 'all' ? 'all' : Number(val) as TaskStatus);
            }}
            className={styles.select}
            aria-label="Filter by status"
          >
            {STATUS_FILTER_OPTIONS.map((o) => (
              <option key={o.value} value={o.value}>{o.label}</option>
            ))}
          </select>

          <select
            id="task-sort"
            value={sortKey}
            onChange={(e) => setSortKey(e.target.value as SortKey)}
            className={styles.select}
            aria-label="Sort tasks"
          >
            {SORT_OPTIONS.map((o) => (
              <option key={o.value} value={o.value}>Sort: {o.label}</option>
            ))}
          </select>

          <div className={styles.viewToggle} role="group" aria-label="View mode">
            <button
              id="view-board-btn"
              className={`${styles.viewBtn} ${view === 'board' ? styles.active : ''}`}
              onClick={() => setView('board')}
              aria-pressed={view === 'board'}
              title="Board view"
            >
              <svg width="16" height="16" viewBox="0 0 16 16" fill="currentColor" aria-hidden="true">
                <rect x="1" y="1" width="6" height="14" rx="2" />
                <rect x="9" y="1" width="6" height="14" rx="2" />
              </svg>
            </button>
            <button
              id="view-list-btn"
              className={`${styles.viewBtn} ${view === 'list' ? styles.active : ''}`}
              onClick={() => setView('list')}
              aria-pressed={view === 'list'}
              title="List view"
            >
              <svg width="16" height="16" viewBox="0 0 16 16" fill="currentColor" aria-hidden="true">
                <rect x="1" y="2" width="14" height="2" rx="1" />
                <rect x="1" y="7" width="14" height="2" rx="1" />
                <rect x="1" y="12" width="14" height="2" rx="1" />
              </svg>
            </button>
          </div>
        </div>

        <div className={styles.content}>
          {isError ? (
            <div className={styles.errorState} role="alert">
              <span className={styles.errorIcon}>⚠️</span>
              <p>Failed to load tasks. Please try again.</p>
            </div>
          ) : (
            <>
              {view === 'board' ? (
                <BoardView
                  tasks={filtered}
                  onStatusChange={onStatusChange}
                  onEdit={onEdit}
                  onDelete={onDelete}
                  onViewDetails={onViewDetails}
                  pendingTaskIds={pendingTaskIds}
                />
              ) : (
                <ListView
                  tasks={filtered}
                  onStatusChange={onStatusChange}
                  onEdit={onEdit}
                  onDelete={onDelete}
                  onViewDetails={onViewDetails}
                  pendingTaskIds={pendingTaskIds}
                />
              )}
            </>
          )}
        </div>
      </div>
    </Spin>
  );
};
