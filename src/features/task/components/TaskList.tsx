import { DndContext, closestCenter } from "@dnd-kit/core";
import type { DragEndEvent } from "@dnd-kit/core";
import {
  arrayMove,
  SortableContext,
  verticalListSortingStrategy,
} from "@dnd-kit/sortable";
import type { Task } from "../../../types/task";
import TaskItem from "./TaskItem";
import styles from '../styles/Task.module.css'

interface TaskListProps {
  tasks: Task[];
  onDelete: (id: string) => void;
  onToggle: (id: string) => void;
  onEdit: (id: string, newTitle: string) => void;
  onSubtaskToggle: (task: Task, subtaskId: string) => void;
  onStartFocus: (task: Task) => void;
  onReorder: (newTasks: Task[]) => void;
}

const TaskList = ({
  tasks,
  onDelete,
  onToggle,
  onEdit,
  onSubtaskToggle,
  onStartFocus,
  onReorder,
}: TaskListProps) => {
  const handleDragEnd = (event: DragEndEvent) => {
    const { active, over } = event;

    if (!over || active.id === over.id) return;

    const oldIndex = tasks.findIndex((t) => t.id === active.id);
    const newIndex = tasks.findIndex((t) => t.id === over.id);

    const newTasks = arrayMove(tasks, oldIndex, newIndex);
    onReorder(newTasks);
  };

  if (tasks.length === 0) {
    return (
      <div className={styles.card} style={{ marginTop: 20, justifyContent: "center" }}>
        <div className={styles.taskBody}>
          <span className={styles.title}>No tasks yet.</span>
          <p className={styles.muted}>Create your first task.</p>
        </div>
      </div>
    );
  }

  return (
    <DndContext collisionDetection={closestCenter} onDragEnd={handleDragEnd}>
      <SortableContext
        items={tasks.map((t) => t.id)}
        strategy={verticalListSortingStrategy}
      >
        <div className={styles.cardContainer}>
          {tasks.map((task) => (
            <TaskItem
              key={task.id}
              task={task}
              onDelete={onDelete}
              onToggle={onToggle}
              onEdit={onEdit}
              onSubtaskToggle={onSubtaskToggle}
              onStartFocus={onStartFocus}
            />
          ))}
        </div>
      </SortableContext>
    </DndContext>
  );
};

export default TaskList;
