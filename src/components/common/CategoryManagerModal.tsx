import React, { useState } from 'react';
import { Tag, Plus, Trash2, X } from 'lucide-react';
import { Modal } from './Modal';
import { useApp } from '../../context/AppContext';

interface CategoryManagerModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const CategoryManagerModal: React.FC<CategoryManagerModalProps> = ({
  isOpen,
  onClose,
}) => {
  const {
    taskCategories,
    addTaskCategory,
    deleteTaskCategory,
    goalCategories,
    addGoalCategory,
    bucketCategories,
    addBucketCategory,
    financeCategories,
    addFinanceCategory,
  } = useApp();

  const [activeSection, setActiveSection] = useState<'tasks' | 'goals' | 'bucket' | 'finance'>('tasks');
  const [newCatName, setNewCatName] = useState('');
  const [newCatColor, setNewCatColor] = useState('#6366f1');

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newCatName.trim()) return;

    if (activeSection === 'tasks') {
      await addTaskCategory({ name: newCatName.trim(), color: newCatColor });
    } else if (activeSection === 'goals') {
      await addGoalCategory({ name: newCatName.trim(), color: newCatColor });
    } else if (activeSection === 'bucket') {
      await addBucketCategory({ name: newCatName.trim(), color: newCatColor });
    } else if (activeSection === 'finance') {
      await addFinanceCategory({
        name: newCatName.trim(),
        type: 'expense',
        color: newCatColor,
        icon: 'Tag',
      });
    }

    setNewCatName('');
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose} title="Category Manager" maxWidth="md">
      <div className="space-y-4">
        {/* Section Tabs */}
        <div className="flex p-1 rounded-2xl bg-slate-800/80 border border-slate-700/60 text-xs font-semibold">
          {(['tasks', 'goals', 'bucket', 'finance'] as const).map((sec) => (
            <button
              key={sec}
              onClick={() => setActiveSection(sec)}
              className={`flex-1 py-1.5 rounded-xl capitalize transition-all ${
                activeSection === sec
                  ? 'bg-indigo-600 text-white shadow-md'
                  : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              {sec}
            </button>
          ))}
        </div>

        {/* Create New Category Bar */}
        <form onSubmit={handleCreate} className="flex items-center gap-2">
          <input
            type="color"
            value={newCatColor}
            onChange={(e) => setNewCatColor(e.target.value)}
            className="w-9 h-9 rounded-xl border border-slate-700 bg-slate-800 p-0.5 cursor-pointer shrink-0"
            title="Choose category color"
          />
          <input
            type="text"
            required
            placeholder={`New ${activeSection} category name...`}
            value={newCatName}
            onChange={(e) => setNewCatName(e.target.value)}
            className="flex-1 px-3 py-2 rounded-xl bg-slate-800 border border-slate-700 text-slate-100 text-xs focus:outline-none focus:ring-2 focus:ring-indigo-500"
          />
          <button
            type="submit"
            className="px-3.5 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-bold shrink-0 active:scale-95 transition-all flex items-center gap-1"
          >
            <Plus className="w-3.5 h-3.5" />
            <span>Add</span>
          </button>
        </form>

        {/* Current Categories List */}
        <div className="space-y-1.5 max-h-60 overflow-y-auto no-scrollbar">
          {activeSection === 'tasks' &&
            taskCategories.map((cat) => (
              <div
                key={cat.id}
                className="flex items-center justify-between p-2.5 rounded-xl bg-slate-800/50 border border-slate-700/40 text-xs"
              >
                <div className="flex items-center gap-2">
                  <span
                    className="w-3 h-3 rounded-full shrink-0"
                    style={{ backgroundColor: cat.color }}
                  />
                  <span className="font-medium text-slate-200">{cat.name}</span>
                </div>
                {taskCategories.length > 2 && (
                  <button
                    onClick={() => deleteTaskCategory(cat.id)}
                    className="text-slate-400 hover:text-rose-400 p-1"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                )}
              </div>
            ))}

          {activeSection === 'goals' &&
            goalCategories.map((cat) => (
              <div
                key={cat.id}
                className="flex items-center justify-between p-2.5 rounded-xl bg-slate-800/50 border border-slate-700/40 text-xs"
              >
                <div className="flex items-center gap-2">
                  <span
                    className="w-3 h-3 rounded-full shrink-0"
                    style={{ backgroundColor: cat.color }}
                  />
                  <span className="font-medium text-slate-200">{cat.name}</span>
                </div>
              </div>
            ))}

          {activeSection === 'bucket' &&
            bucketCategories.map((cat) => (
              <div
                key={cat.id}
                className="flex items-center justify-between p-2.5 rounded-xl bg-slate-800/50 border border-slate-700/40 text-xs"
              >
                <div className="flex items-center gap-2">
                  <span
                    className="w-3 h-3 rounded-full shrink-0"
                    style={{ backgroundColor: cat.color }}
                  />
                  <span className="font-medium text-slate-200">{cat.name}</span>
                </div>
              </div>
            ))}

          {activeSection === 'finance' &&
            financeCategories.map((cat) => (
              <div
                key={cat.id}
                className="flex items-center justify-between p-2.5 rounded-xl bg-slate-800/50 border border-slate-700/40 text-xs"
              >
                <div className="flex items-center gap-2">
                  <span
                    className="w-3 h-3 rounded-full shrink-0"
                    style={{ backgroundColor: cat.color }}
                  />
                  <span className="font-medium text-slate-200">{cat.name}</span>
                </div>
                <span className="text-[10px] font-mono uppercase text-slate-400">
                  {cat.type}
                </span>
              </div>
            ))}
        </div>
      </div>
    </Modal>
  );
};
