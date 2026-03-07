import { useState } from "react";
import type { Task, TaskStatus } from "../../types/task";
import styles from "./Filter.module.css";
import { Search } from "lucide-react";

interface FilterBarProps {
  filter: TaskStatus | "all";
  setFilter: (value: TaskStatus | "all") => void;
  searchTerm: string;
  setSearchTerm: (value: string) => void;
  sortBy: "created" | "asc" | "desc";
  onSortChange: (value: "created" | "asc" | "desc") => void;
  task: Task[];
}

const FilterBar = ({
  filter,
  setFilter,
  searchTerm,
  setSearchTerm,
  sortBy,
  onSortChange,
  task,
}: FilterBarProps) => {
  const [showSearch, setShowSearch] = useState(false);
  return (
    <div className={styles.wrapper}>
      <div className={styles.leftSection}>
        {["all", "pending", "completed"].map((f) => (
          <button
            key={f}
            className={
              filter === f ? `${styles.button} ${styles.active}` : styles.button
            }
            onClick={() => setFilter(f as TaskStatus | "all")}
            type="button"
            aria-label="Filter tab"
          >
            {f.toUpperCase()}
          </button>
        ))}
      </div>

      {task.length > 2 && (
        <div className={styles.rightSection}>
          {/* Animated Search Input */}
          {showSearch && (
            <input
              type="text"
              placeholder="Search tasks..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className={styles.searchInput}
              data-testid='search input'
            />
          )}

          {/* Search Icon */}
          <button
            className={styles.searchButton}
            onClick={() => setShowSearch((prev) => !prev)}
            data-testid='search btn'
          >
            <Search size={18} /> 
          </button>

          {/* Sort Dropdown */}
          <select
            value={sortBy}
            onChange={(e) =>
              onSortChange(e.target.value as "created" | "asc" | "desc")
            }
            className={styles.sortSelect}
            aria-label="Sort tasks"
          >
            <option value="created">Latest</option>
            <option value="asc">A-Z</option>
            <option value="desc">Z-A</option>
          </select>
        </div>
      )}
    </div>
  );
};

export default FilterBar;
