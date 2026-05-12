import React, { useState, useEffect } from 'react';
import { Spin, Alert } from 'antd';
import DatePicker from 'react-datepicker';
import 'react-datepicker/dist/react-datepicker.css';
import type { Task, CreateTaskRequest, UpdateTaskRequest } from '../../types/task';
import styles from './TaskModal.module.css';

interface TaskModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (task: CreateTaskRequest | UpdateTaskRequest) => void;
  initialData?: Task | null;
  isLoading?: boolean;
  error?: string | null;
}

export const TaskModal: React.FC<TaskModalProps> = ({
  isOpen,
  onClose,
  onSubmit,
  initialData,
  isLoading,
  error,
}) => {
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [deadline, setDeadline] = useState<Date | null>(null);

  useEffect(() => {
    if (isOpen) {
      if (initialData) {
        setTitle(initialData.title);
        setDescription(initialData.description || '');
        setDeadline(initialData.deadline ? new Date(initialData.deadline) : null);
      } else {
        setTitle('');
        setDescription('');
        setDeadline(null);
      }
    }
  }, [isOpen, initialData]);

  if (!isOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim()) return;

    const payload = {
      title: title.trim(),
      description: description.trim() || undefined,
      deadline: deadline ? deadline.toISOString() : undefined,
    };

    if (initialData) {
      onSubmit({ ...payload, id: initialData.id });
    } else {
      onSubmit(payload);
    }
  };

  return (
    <div className={styles.modalOverlay} onClick={onClose} role="dialog" aria-modal="true">
      <div className={styles.modalContent} onClick={e => e.stopPropagation()}>
        <div className={styles.header}>
          <h2 className={styles.title}>{initialData ? 'Edit Task' : 'Create Task'}</h2>
          <button className={styles.closeButton} onClick={onClose} aria-label="Close modal">
            &times;
          </button>
        </div>

        {error && (
          <div className={styles.errorAlert}>
            <Alert message={error} type="error" showIcon closable />
          </div>
        )}

        <form onSubmit={handleSubmit}>
          <div className={styles.formGroup}>
            <label htmlFor="task-title" className={styles.label}>Title <span style={{ color: '#ef4444' }}>*</span></label>
            <input
              id="task-title"
              type="text"
              value={title}
              onChange={e => setTitle(e.target.value)}
              className={styles.input}
              placeholder="e.g., Buy groceries"
              required
              autoFocus
              disabled={isLoading}
            />
          </div>

          <div className={styles.formGroup}>
            <label htmlFor="task-desc" className={styles.label}>Description</label>
            <textarea
              id="task-desc"
              value={description}
              onChange={e => setDescription(e.target.value)}
              className={styles.textarea}
              placeholder="Add more details..."
              disabled={isLoading}
            />
          </div>

          <div className={styles.formGroup}>
            <label htmlFor="task-deadline" className={styles.label}>Deadline</label>
            <div className={styles.datePickerWrapper}>
              <DatePicker
                id="task-deadline"
                selected={deadline}
                onChange={(date: Date | null) => setDeadline(date)}
                className={styles.input}
                placeholderText="Select a deadline"
                isClearable
                showTimeSelect
                dateFormat="MMM d, yyyy h:mm aa"
                disabled={isLoading}
              />
            </div>
          </div>

          <div className={styles.actions}>
            <button type="button" onClick={onClose} className={styles.cancelBtn} disabled={isLoading}>
              Cancel
            </button>
            <button type="submit" className={styles.submitBtn} disabled={!title.trim() || isLoading}>
              {isLoading
                ? <Spin size="small" />
                : (initialData ? 'Save Changes' : 'Create Task')}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
