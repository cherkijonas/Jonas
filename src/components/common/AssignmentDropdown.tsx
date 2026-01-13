import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { UserPlus, X } from 'lucide-react';

interface User {
  id: string;
  name: string;
  role: string;
  status: 'online' | 'busy' | 'offline';
  avatar: string;
}

interface AssignmentDropdownProps {
  onAssign: (userId: string, userName: string) => void;
}

export const AssignmentDropdown: React.FC<AssignmentDropdownProps> = ({ onAssign }) => {
  const [isOpen, setIsOpen] = useState(false);
  const [selectedUser, setSelectedUser] = useState<string | null>(null);

  const users: User[] = [
    { id: '1', name: 'Moi (Admin)', role: 'Administrateur', status: 'online', avatar: '👨‍💼' },
    { id: '2', name: 'Thomas (Dev)', role: 'Développeur', status: 'busy', avatar: '👨‍💻' },
    { id: '3', name: 'Julie (Marketing)', role: 'Marketing', status: 'offline', avatar: '👩‍💼' },
    { id: '4', name: 'Sarah (Finance)', role: 'Finance', status: 'online', avatar: '👩‍💻' },
  ];

  const getStatusConfig = (status: string) => {
    switch (status) {
      case 'online':
        return { label: 'En ligne', color: 'bg-green-500' };
      case 'busy':
        return { label: 'Occupé', color: 'bg-red-500' };
      case 'offline':
        return { label: 'Absente', color: 'bg-slate-500' };
      default:
        return { label: '', color: 'bg-slate-500' };
    }
  };

  const handleAssign = (user: User) => {
    setSelectedUser(user.id);
    setIsOpen(false);
    onAssign(user.id, user.name);
  };

  return (
    <div className="relative">
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="flex items-center gap-2 px-4 py-2 bg-slate-800 hover:bg-slate-700 border border-slate-600 rounded-lg transition-colors text-white text-sm font-medium"
      >
        <UserPlus className="w-4 h-4" />
        Assigner
      </button>

      <AnimatePresence>
        {isOpen && (
          <>
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="fixed inset-0 z-40"
              onClick={() => setIsOpen(false)}
            />

            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: -10 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: -10 }}
              className="absolute right-0 top-12 w-72 bg-slate-900 border border-slate-700 rounded-xl shadow-2xl z-50 overflow-hidden"
            >
              <div className="p-3 border-b border-slate-700 flex items-center justify-between">
                <h3 className="text-sm font-bold text-white">Assigner à</h3>
                <button
                  onClick={() => setIsOpen(false)}
                  className="text-slate-400 hover:text-white transition-colors"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>

              <div className="p-2 max-h-80 overflow-y-auto">
                {users.map((user) => {
                  const statusConfig = getStatusConfig(user.status);
                  return (
                    <button
                      key={user.id}
                      onClick={() => handleAssign(user)}
                      className={`w-full flex items-center gap-3 p-3 hover:bg-slate-800 rounded-lg transition-colors text-left ${
                        selectedUser === user.id ? 'bg-slate-800' : ''
                      }`}
                    >
                      <span className="text-2xl">{user.avatar}</span>
                      <div className="flex-1 min-w-0">
                        <div className="text-sm font-medium text-white truncate">
                          {user.name}
                        </div>
                        <div className="text-xs text-slate-400">{user.role}</div>
                      </div>
                      <div className="flex items-center gap-1.5">
                        <div className={`w-2 h-2 rounded-full ${statusConfig.color}`}></div>
                        <span className="text-xs text-slate-500">
                          {statusConfig.label}
                        </span>
                      </div>
                    </button>
                  );
                })}
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </div>
  );
};
