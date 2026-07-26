"use client";

import React, { useState } from "react";
import { Question, QuestionType } from "@/lib/types";
import {
  DndContext,
  closestCenter,
  KeyboardSensor,
  PointerSensor,
  useSensor,
  useSensors,
  DragEndEvent,
} from "@dnd-kit/core";
import {
  SortableContext,
  sortableKeyboardCoordinates,
  verticalListSortingStrategy,
  useSortable,
} from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
import {
  Type,
  AlignLeft,
  CheckSquare,
  ListFilter,
  Mail,
  Hash,
  ToggleLeft,
  Star,
  Upload,
  GripVertical,
  Plus,
  Trash2,
  Smile,
} from "lucide-react";

export const QUESTION_TYPES: {
  type: QuestionType;
  label: string;
  icon: any;
  description: string;
}[] = [
  {
    type: "short_text",
    label: "Short Text",
    icon: Type,
    description: "Single line text response",
  },
  {
    type: "long_text",
    label: "Long Text",
    icon: AlignLeft,
    description: "Paragraph text response",
  },
  {
    type: "multiple_choice",
    label: "Multiple Choice",
    icon: CheckSquare,
    description: "Select one or more choices",
  },
  {
    type: "dropdown",
    label: "Dropdown",
    icon: ListFilter,
    description: "Select choice from dropdown",
  },
  { type: "email", label: "Email", icon: Mail, description: "Email address" },
  { type: "number", label: "Number", icon: Hash, description: "Numeric input" },
  {
    type: "yes_no",
    label: "Yes / No",
    icon: ToggleLeft,
    description: "Binary decision",
  },
  {
    type: "rating",
    label: "Rating",
    icon: Star,
    description: "Star or numeric scale",
  },
  {
    type: "file_upload",
    label: "File Upload",
    icon: Upload,
    description: "Attach documents or images",
  },
];

export function getQuestionIcon(type: QuestionType) {
  const item = QUESTION_TYPES.find((q) => q.type === type);
  const IconComponent = item ? item.icon : Type;
  return <IconComponent className="h-3.5 w-3.5 shrink-0 text-zinc-400" />;
}

interface SortableQuestionItemProps {
  question: Question;
  index: number;
  isSelected: boolean;
  onSelect: () => void;
  onDelete: (e: React.MouseEvent) => void;
}

function SortableQuestionItem({
  question,
  index,
  isSelected,
  onSelect,
  onDelete,
}: SortableQuestionItemProps) {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({
    id: question.id,
  });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    opacity: isDragging ? 0.5 : 1,
  };

  return (
    <div
      ref={setNodeRef}
      style={style}
      onClick={onSelect}
      className={`group relative flex items-center justify-between gap-2 rounded-xl p-2.5 text-xs font-medium transition-all duration-150 cursor-pointer ${
        isSelected
          ? "bg-[var(--brand-surface)] text-[var(--brand-primary)] ring-1 ring-[var(--brand-primary)]/20"
          : "text-[var(--text-secondary)] hover:bg-[var(--surface)] hover:text-[var(--text-primary)]"
      }`}
    >
      <div className="flex items-center gap-2 overflow-hidden min-w-0">
        <button
          {...attributes}
          {...listeners}
          onClick={(e) => e.stopPropagation()}
          className="cursor-grab text-[var(--text-subtle)] hover:text-[var(--text-muted)] active:cursor-grabbing shrink-0"
        >
          <GripVertical className="h-3.5 w-3.5" />
        </button>

        <span className="font-bold shrink-0 text-[10px] opacity-50 w-4 text-right tabular-nums">
          {index + 1}
        </span>

        {getQuestionIcon(question.type)}

        <span className="truncate">{question.title || "Untitled"}</span>
      </div>

      <button
        onClick={onDelete}
        className={`rounded-lg p-1 opacity-0 transition-opacity hover:bg-red-50 group-hover:opacity-100 ${
          isSelected
            ? "text-zinc-400 hover:text-red-500"
            : "text-zinc-300 hover:text-red-500"
        }`}
        title="Delete question"
      >
        <Trash2 className="h-3.5 w-3.5" />
      </button>
    </div>
  );
}

interface QuestionListProps {
  questions: Question[];
  selectedQuestionId: string | null;
  onSelectQuestion: (id: string | "thank_you") => void;
  onAddQuestion: (type: QuestionType) => void;
  onDeleteQuestion: (id: string) => void;
  onReorder: (newQuestions: Question[]) => void;
}

export const QuestionList: React.FC<QuestionListProps> = ({
  questions,
  selectedQuestionId,
  onSelectQuestion,
  onAddQuestion,
  onDeleteQuestion,
  onReorder,
}) => {
  const [addMenuOpen, setAddMenuOpen] = useState(false);

  const sensors = useSensors(
    useSensor(PointerSensor, { activationConstraint: { distance: 5 } }),
    useSensor(KeyboardSensor, { coordinateGetter: sortableKeyboardCoordinates })
  );

  const handleDragEnd = (event: DragEndEvent) => {
    const { active, over } = event;
    if (!over || active.id === over.id) return;

    const oldIndex = questions.findIndex((q) => q.id === active.id);
    const newIndex = questions.findIndex((q) => q.id === over.id);

    if (oldIndex !== -1 && newIndex !== -1) {
      const updated = [...questions];
      const [moved] = updated.splice(oldIndex, 1);
      updated.splice(newIndex, 0, moved);
      const reindexed = updated.map((q, idx) => ({ ...q, order_index: idx }));
      onReorder(reindexed);
    }
  };

  return (
    <aside className="flex h-full w-60 shrink-0 flex-col border-r border-[var(--border-default)] bg-[var(--background)]">
      {/* Header */}
      <div className="flex items-center justify-between border-b border-[var(--border-default)] px-4 py-3.5">
        <h2 className="text-xs font-semibold text-[var(--text-muted)] tracking-wide">
          Questions{" "}
          <span className="tabular-nums text-[var(--text-muted)]">{questions.length}</span>
        </h2>

        <div className="relative">
          <button
            onClick={() => setAddMenuOpen(!addMenuOpen)}
            className="flex h-7 w-7 items-center justify-center rounded-xl bg-[var(--brand-primary)] text-white shadow-sm transition-all duration-150 hover:bg-[var(--brand-primary-hover)] hover:scale-105 active:scale-95"
            title="Add Question"
          >
            <Plus className="h-4 w-4" />
          </button>

          {addMenuOpen && (
            <>
              <div
                className="fixed inset-0 z-20"
                onClick={() => setAddMenuOpen(false)}
              />
              <div className="absolute left-0 top-9 z-30 w-60 rounded-xl border border-[var(--border-strong)] bg-[var(--surface)] p-1.5 shadow-xl max-h-80 overflow-y-auto">
                <div className="px-2.5 py-1.5 text-[10px] font-semibold text-[var(--text-muted)] uppercase tracking-wide">
                  Question Type
                </div>
                {QUESTION_TYPES.map((qt) => {
                  const IconComp = qt.icon;
                  return (
                    <button
                      key={qt.type}
                      onClick={() => {
                        onAddQuestion(qt.type);
                        setAddMenuOpen(false);
                      }}
                      className="flex w-full items-center gap-2.5 rounded-lg px-2.5 py-2 text-left text-xs font-medium text-[var(--text-secondary)] hover:bg-[var(--surface-hover)] hover:text-[var(--text-primary)] transition-colors"
                    >
                      <IconComp className="h-4 w-4 text-[var(--text-muted)] shrink-0" />
                      <div>
                        <div className="font-semibold text-[var(--text-primary)]">
                          {qt.label}
                        </div>
                        <div className="text-[10px] text-[var(--text-muted)]">
                          {qt.description}
                        </div>
                      </div>
                    </button>
                  );
                })}
              </div>
            </>
          )}
        </div>
      </div>

      {/* List */}
      <div className="flex-1 overflow-y-auto p-3 space-y-1">
        <DndContext
          sensors={sensors}
          collisionDetection={closestCenter}
          onDragEnd={handleDragEnd}
        >
          <SortableContext
            items={questions.map((q) => q.id)}
            strategy={verticalListSortingStrategy}
          >
            {questions.map((q, idx) => (
              <SortableQuestionItem
                key={q.id}
                question={q}
                index={idx}
                isSelected={selectedQuestionId === q.id}
                onSelect={() => onSelectQuestion(q.id)}
                onDelete={(e) => {
                  e.stopPropagation();
                  onDeleteQuestion(q.id);
                }}
              />
            ))}
          </SortableContext>
        </DndContext>

        {/* Thank you screen */}
        <div
          onClick={() => onSelectQuestion("thank_you")}
          className={`flex items-center gap-2 rounded-xl p-2.5 text-xs font-medium cursor-pointer transition-all duration-150 ${
            selectedQuestionId === "thank_you"
              ? "bg-[var(--brand-surface)] text-[var(--brand-primary)] ring-1 ring-[var(--brand-primary)]/20"
              : "text-[var(--text-muted)] hover:bg-[var(--surface)] hover:text-[var(--text-secondary)]"
          }`}
        >
          <Smile className="h-3.5 w-3.5 shrink-0 text-emerald-500" />
          <span className="truncate font-semibold">Thank You Screen</span>
        </div>
      </div>
    </aside>
  );
};
