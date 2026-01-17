import { motion, AnimatePresence } from 'framer-motion';
import { TrendingUp } from 'lucide-react';
import { useEffect, useState } from 'react';

interface AnimatedHealthScoreProps {
  score: number;
  scoreIncreased: boolean;
}

export const AnimatedHealthScore: React.FC<AnimatedHealthScoreProps> = ({
  score,
  scoreIncreased,
}) => {
  const [displayScore, setDisplayScore] = useState(score);
  const [previousScore, setPreviousScore] = useState(score);

  useEffect(() => {
    if (score !== previousScore) {
      const increment = score > previousScore ? 1 : -1;
      const duration = Math.abs(score - previousScore) * 50;
      const steps = Math.abs(score - previousScore);
      const stepDuration = duration / steps;

      let current = previousScore;
      const interval = setInterval(() => {
        current += increment;
        setDisplayScore(current);

        if (current === score) {
          clearInterval(interval);
          setPreviousScore(score);
        }
      }, stepDuration);

      return () => clearInterval(interval);
    }
  }, [score, previousScore]);

  const getColor = (score: number) => {
    if (score >= 80) return 'text-emerald-400';
    if (score >= 60) return 'text-yellow-400';
    return 'text-red-400';
  };

  const getGlowColor = (score: number) => {
    if (score >= 80) return 'shadow-emerald-500/50';
    if (score >= 60) return 'shadow-yellow-500/50';
    return 'shadow-red-500/50';
  };

  return (
    <div className="relative">
      <motion.div
        animate={scoreIncreased ? { scale: [1, 1.2, 1] } : {}}
        transition={{ duration: 0.5 }}
        className="relative"
      >
        <span className={`text-5xl font-black ${getColor(displayScore)}`}>
          {displayScore}
        </span>
        <span className="text-2xl text-slate-400 ml-1">%</span>
      </motion.div>

      <AnimatePresence>
        {scoreIncreased && (
          <motion.div
            initial={{ opacity: 0, y: 10, scale: 0.8 }}
            animate={{ opacity: 1, y: -10, scale: 1 }}
            exit={{ opacity: 0, y: -30 }}
            transition={{ duration: 0.6 }}
            className="absolute -top-8 right-0 flex items-center gap-1 bg-emerald-500 text-white px-3 py-1.5 rounded-full shadow-lg"
          >
            <TrendingUp className="w-4 h-4" />
            <span className="text-sm font-bold">+{score - previousScore}</span>
          </motion.div>
        )}
      </AnimatePresence>

      {scoreIncreased && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: [0, 1, 0] }}
          transition={{ duration: 1 }}
          className={`absolute inset-0 ${getGlowColor(
            displayScore
          )} blur-2xl -z-10`}
        />
      )}
    </div>
  );
};
