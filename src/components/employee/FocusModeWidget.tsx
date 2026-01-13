import React, { useState, useEffect } from 'react';
import { Play, Pause, X, AlertCircle } from 'lucide-react';
import { focusSessionService } from '../../services/focusSessionService';

export const FocusModeWidget: React.FC = () => {
  const [isActive, setIsActive] = useState(false);
  const [duration, setDuration] = useState(25);
  const [timeLeft, setTimeLeft] = useState(duration * 60);
  const [sessionId, setSessionId] = useState<string | null>(null);
  const [interruptions, setInterruptions] = useState(0);

  useEffect(() => {
    let interval: NodeJS.Timeout;

    if (isActive && timeLeft > 0) {
      interval = setInterval(() => {
        setTimeLeft((prev) => prev - 1);
      }, 1000);
    } else if (timeLeft === 0 && isActive) {
      handleSessionEnd(true);
    }

    return () => clearInterval(interval);
  }, [isActive, timeLeft]);

  const handleStart = async () => {
    try {
      const session = await focusSessionService.startFocusSession(duration);
      setSessionId(session.id);
      setIsActive(true);
      setTimeLeft(duration * 60);
      setInterruptions(0);
    } catch (error) {
      console.error('Error starting focus session:', error);
    }
  };

  const handlePause = () => {
    setIsActive(false);
  };

  const handleResume = () => {
    setIsActive(true);
  };

  const handleSessionEnd = async (completed: boolean) => {
    if (!sessionId) return;

    try {
      const actualDuration = Math.floor((duration * 60 - timeLeft) / 60);
      const qualityScore = completed && interruptions === 0 ? 10 : Math.max(1, 10 - interruptions * 2);

      await focusSessionService.endFocusSession(sessionId, actualDuration, qualityScore);
      setIsActive(false);
      setSessionId(null);
      setTimeLeft(duration * 60);
      setInterruptions(0);
    } catch (error) {
      console.error('Error ending focus session:', error);
    }
  };

  const handleInterruption = async () => {
    if (sessionId) {
      await focusSessionService.addInterruption(sessionId);
      setInterruptions((prev) => prev + 1);
    }
  };

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  return (
    <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-6">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-lg font-semibold text-slate-900">Mode Focus</h3>
        {isActive && (
          <span className="px-3 py-1 bg-emerald-100 text-emerald-700 rounded-full text-sm font-medium animate-pulse">
            En cours
          </span>
        )}
      </div>

      {!isActive && !sessionId && (
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-2">
              Durée (minutes)
            </label>
            <div className="flex gap-2">
              {[25, 45, 60, 90].map((mins) => (
                <button
                  key={mins}
                  onClick={() => {
                    setDuration(mins);
                    setTimeLeft(mins * 60);
                  }}
                  className={`flex-1 py-2 px-3 rounded-lg border text-sm font-medium transition-colors ${
                    duration === mins
                      ? 'bg-blue-50 border-blue-300 text-blue-700'
                      : 'bg-white border-slate-200 text-slate-600 hover:border-slate-300'
                  }`}
                >
                  {mins}m
                </button>
              ))}
            </div>
          </div>

          <button
            onClick={handleStart}
            className="w-full py-3 bg-gradient-to-r from-blue-600 to-indigo-600 text-white rounded-lg font-medium hover:from-blue-700 hover:to-indigo-700 transition-all flex items-center justify-center gap-2"
          >
            <Play size={18} />
            Démarrer Focus
          </button>

          <div className="bg-blue-50 border border-blue-200 rounded-lg p-3 text-sm text-blue-800">
            <p className="font-medium mb-1">Pendant le mode focus :</p>
            <ul className="text-xs space-y-1 ml-4 list-disc">
              <li>Les notifications seront bloquées</li>
              <li>Votre statut sera "En focus"</li>
              <li>Concentration maximale recommandée</li>
            </ul>
          </div>
        </div>
      )}

      {isActive && (
        <div className="space-y-4">
          <div className="text-center">
            <div className="text-5xl font-bold text-slate-900 mb-2">
              {formatTime(timeLeft)}
            </div>
            <div className="text-sm text-slate-500">
              {Math.round((timeLeft / (duration * 60)) * 100)}% restant
            </div>
          </div>

          <div className="w-full bg-slate-200 rounded-full h-2">
            <div
              className="bg-gradient-to-r from-blue-500 to-indigo-500 h-2 rounded-full transition-all duration-1000"
              style={{ width: `${((duration * 60 - timeLeft) / (duration * 60)) * 100}%` }}
            />
          </div>

          {interruptions > 0 && (
            <div className="flex items-center gap-2 text-amber-600 text-sm">
              <AlertCircle size={16} />
              <span>{interruptions} interruption{interruptions > 1 ? 's' : ''}</span>
            </div>
          )}

          <div className="flex gap-2">
            <button
              onClick={handlePause}
              className="flex-1 py-2 bg-amber-100 text-amber-700 rounded-lg font-medium hover:bg-amber-200 transition-colors flex items-center justify-center gap-2"
            >
              <Pause size={16} />
              Pause
            </button>
            <button
              onClick={handleInterruption}
              className="flex-1 py-2 bg-orange-100 text-orange-700 rounded-lg font-medium hover:bg-orange-200 transition-colors text-sm"
            >
              Interruption
            </button>
            <button
              onClick={() => handleSessionEnd(false)}
              className="px-4 py-2 bg-red-100 text-red-700 rounded-lg hover:bg-red-200 transition-colors"
            >
              <X size={16} />
            </button>
          </div>
        </div>
      )}

      {!isActive && sessionId && (
        <div className="space-y-4">
          <div className="text-center">
            <div className="text-4xl font-bold text-slate-900 mb-2">
              {formatTime(timeLeft)}
            </div>
            <div className="text-sm text-slate-500">En pause</div>
          </div>

          <div className="flex gap-2">
            <button
              onClick={handleResume}
              className="flex-1 py-3 bg-emerald-600 text-white rounded-lg font-medium hover:bg-emerald-700 transition-colors flex items-center justify-center gap-2"
            >
              <Play size={18} />
              Reprendre
            </button>
            <button
              onClick={() => handleSessionEnd(false)}
              className="px-4 py-3 bg-red-100 text-red-700 rounded-lg hover:bg-red-200 transition-colors"
            >
              <X size={18} />
            </button>
          </div>
        </div>
      )}
    </div>
  );
};
