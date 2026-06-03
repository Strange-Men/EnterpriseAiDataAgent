"use client";

import { useEffect, useState } from "react";
import { useTranslation } from "react-i18next";
import { useScheduleStore, type ScheduledTask } from "@/stores/schedule-store";

function ScheduleForm({ onSubmit, isLoading }: {
  onSubmit: (data: { name: string; question: string; table: string; interval: string }) => void;
  isLoading: boolean;
}) {
  const { t } = useTranslation();
  const [name, setName] = useState("");
  const [question, setQuestion] = useState("");
  const [table, setTable] = useState("");
  const [interval, setInterval] = useState("daily");

  const handleSubmit = () => {
    if (!name.trim() || !question.trim() || !table.trim()) return;
    onSubmit({ name: name.trim(), question: question.trim(), table: table.trim(), interval });
    setName("");
    setQuestion("");
    setTable("");
  };

  return (
    <div className="space-y-2 p-3 rounded-md bg-[var(--bg-primary)] border border-[var(--border-default)]">
      <input
        className="w-full px-2 py-1 text-xs bg-[var(--bg-secondary)] border border-[var(--border-default)] rounded text-[var(--text-primary)] placeholder:text-[var(--text-muted)]"
        placeholder={t("schedule.name")}
        value={name}
        onChange={(e) => setName(e.target.value)}
      />
      <input
        className="w-full px-2 py-1 text-xs bg-[var(--bg-secondary)] border border-[var(--border-default)] rounded text-[var(--text-primary)] placeholder:text-[var(--text-muted)]"
        placeholder={t("schedule.question")}
        value={question}
        onChange={(e) => setQuestion(e.target.value)}
      />
      <input
        className="w-full px-2 py-1 text-xs bg-[var(--bg-secondary)] border border-[var(--border-default)] rounded text-[var(--text-primary)] placeholder:text-[var(--text-muted)]"
        placeholder={t("schedule.table")}
        value={table}
        onChange={(e) => setTable(e.target.value)}
      />
      <select
        value={interval}
        onChange={(e) => setInterval(e.target.value)}
        className="w-full px-2 py-1 text-xs bg-[var(--bg-secondary)] border border-[var(--border-default)] rounded text-[var(--text-primary)]"
      >
        <option value="hourly">{t("schedule.hourly")}</option>
        <option value="daily">{t("schedule.daily")}</option>
        <option value="weekly">{t("schedule.weekly")}</option>
      </select>
      <button
        onClick={handleSubmit}
        disabled={isLoading || !name.trim() || !question.trim() || !table.trim()}
        className="w-full px-3 py-1.5 text-xs rounded bg-[var(--accent)]/10 text-[var(--accent)] hover:bg-[var(--accent)]/20 disabled:opacity-30 transition-colors"
      >
        {isLoading ? t("schedule.running") : t("schedule.add")}
      </button>
    </div>
  );
}

function ScheduleItem({ task, onToggle, onRemove }: {
  task: ScheduledTask;
  onToggle: () => void;
  onRemove: () => void;
}) {
  const { t } = useTranslation();

  return (
    <div className="flex items-center gap-2 px-2 py-1.5 rounded bg-[var(--bg-primary)] border border-[var(--border-default)]">
      <button
        onClick={onToggle}
        type="button"
        aria-pressed={task.enabled}
        aria-label={task.enabled ? t("schedule.enabled") : t("schedule.disabled")}
        className={`w-2 h-2 rounded-full shrink-0 ${task.enabled ? "bg-green-500" : "bg-[var(--bg-tertiary)]"}`}
        title={task.enabled ? t("schedule.enabled") : t("schedule.disabled")}
      />
      <div className="flex-1 min-w-0">
        <p className="text-xs text-[var(--text-primary)] truncate">{task.name}</p>
        <p className="text-[10px] text-[var(--text-muted)] truncate">{task.question}</p>
        <div className="flex gap-2 mt-0.5">
          <span className="text-[9px] text-[var(--text-muted)]">{task.interval}</span>
          {task.lastRunAt && (
            <span className="text-[9px] text-[var(--text-muted)]">
              {t("schedule.last-run")}: {new Date(task.lastRunAt).toLocaleDateString()}
            </span>
          )}
        </div>
      </div>
      <button
        onClick={onRemove}
        type="button"
        aria-label="Remove scheduled task"
        className="text-[10px] text-[var(--text-muted)] hover:text-red-400 transition-colors shrink-0"
      >
        ✕
      </button>
    </div>
  );
}

export function SchedulePanel() {
  const { t } = useTranslation();
  const { tasks, isLoading, error, addTask, removeTask, toggleTask, refreshTasks } = useScheduleStore();
  const [showForm, setShowForm] = useState(false);

  useEffect(() => {
    refreshTasks();
  }, [refreshTasks]);

  const handleAdd = async (data: { name: string; question: string; table: string; interval: string }) => {
    await addTask({
      name: data.name,
      question: data.question,
      table: data.table,
      interval: data.interval as "hourly" | "daily" | "weekly",
      enabled: true,
    });
    setShowForm(false);
  };

  return (
    <div className="space-y-2">
      <div className="flex items-center justify-between">
        <p className="text-[10px] text-[var(--text-muted)] uppercase tracking-wider">
          {t("schedule.title")}
        </p>
        <button
          type="button"
          onClick={() => setShowForm(!showForm)}
          aria-expanded={showForm}
          className={`text-[10px] px-1.5 py-0.5 rounded transition-colors ${
            showForm ? "bg-[var(--accent)]/10 text-[var(--accent)]" : "text-[var(--text-muted)] hover:text-[var(--accent)]"
          }`}
        >
          {showForm ? "−" : "+"}
        </button>
      </div>

      {showForm && <ScheduleForm onSubmit={(data) => void handleAdd(data)} isLoading={isLoading} />}

      {error && (
        <p className="text-[10px] text-red-400">{error}</p>
      )}

      {tasks.length === 0 && !showForm ? (
        <p className="text-xs text-[var(--text-muted)] text-center py-2">{t("schedule.no-tasks")}</p>
      ) : (
        <div className="space-y-1">
          {tasks.map((task) => (
            <ScheduleItem
              key={task.id}
              task={task}
              onToggle={() => void toggleTask(task.id)}
              onRemove={() => void removeTask(task.id)}
            />
          ))}
        </div>
      )}
    </div>
  );
}
