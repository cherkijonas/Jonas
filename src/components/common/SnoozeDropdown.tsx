import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Clock, X, Calendar } from 'lucide-react';

interface SnoozeDropdownProps {
  onSnooze: (option: string) => void;
}

export const SnoozeDropdown: React.FC<SnoozeDropdownProps> = ({ onSnooze }) => {
  const [isOpen, setIsOpen] = useState(false);
  const [showCalendar, setShowCalendar] = useState(false);

  const snoozeOptions = [
    { id: '1h', label: 'Plus tard (1h)', icon: '⏰' },
    { id: 'tomorrow', label: 'Demain matin (09:00)', icon: '🌅' },
    { id: 'monday', label: 'Lundi prochain', icon: '📅' },
    { id: 'custom', label: 'Choisir une date...', icon: '📆' },
  ];

  const handleSnooze = (option: { id: string; label: string }) => {
    if (option.id === 'custom') {
      setShowCalendar(true);
    } else {
      setIsOpen(false);
      onSnooze(option.label);
    }
  };

  const handleCustomDate = (day: number) => {
    setIsOpen(false);
    setShowCalendar(false);
    onSnooze(`Reporté au ${day} décembre`);
  };

  return (
    <div className="relative">
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="flex items-center gap-2 px-4 py-2 bg-slate-800 hover:bg-slate-700 border border-slate-600 rounded-lg transition-colors text-white text-sm font-medium"
      >
        <Clock className="w-4 h-4" />
        Reporter
      </button>

      <AnimatePresence>
        {isOpen && (
          <>
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="fixed inset-0 z-40"
              onClick={() => {
                setIsOpen(false);
                setShowCalendar(false);
              }}
            />

            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: -10 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: -10 }}
              className="absolute right-0 top-12 w-80 bg-slate-900 border border-slate-700 rounded-xl shadow-2xl z-50 overflow-hidden"
            >
              <div className="p-3 border-b border-slate-700 flex items-center justify-between">
                <h3 className="text-sm font-bold text-white">Reporter l'alerte</h3>
                <button
                  onClick={() => {
                    setIsOpen(false);
                    setShowCalendar(false);
                  }}
                  className="text-slate-400 hover:text-white transition-colors"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>

              {!showCalendar ? (
                <div className="p-2">
                  {snoozeOptions.map((option) => (
                    <button
                      key={option.id}
                      onClick={() => handleSnooze(option)}
                      className="w-full flex items-center gap-3 p-3 hover:bg-slate-800 rounded-lg transition-colors text-left"
                    >
                      <span className="text-2xl">{option.icon}</span>
                      <span className="text-sm text-slate-200">{option.label}</span>
                    </button>
                  ))}
                </div>
              ) : (
                <div className="p-4">
                  <div className="flex items-center gap-2 mb-4">
                    <Calendar className="w-5 h-5 text-blue-400" />
                    <h4 className="text-sm font-semibold text-white">
                      Décembre 2025
                    </h4>
                  </div>
                  <div className="grid grid-cols-7 gap-2">
                    {['L', 'M', 'M', 'J', 'V', 'S', 'D'].map((day, i) => (
                      <div
                        key={i}
                        className="text-xs font-semibold text-slate-500 text-center py-2"
                      >
                        {day}
                      </div>
                    ))}
                    {Array.from({ length: 31 }, (_, i) => i + 1).map((day) => (
                      <button
                        key={day}
                        onClick={() => handleCustomDate(day)}
                        className={`p-2 text-sm rounded-lg transition-colors ${
                          day === 17
                            ? 'bg-blue-500 text-white font-bold'
                            : 'bg-slate-800 hover:bg-slate-700 text-slate-300'
                        }`}
                      >
                        {day}
                      </button>
                    ))}
                  </div>
                </div>
              )}
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </div>
  );
};
