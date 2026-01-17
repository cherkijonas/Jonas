import { DollarSign, TrendingDown } from 'lucide-react';
import { useEffect, useState } from 'react';

interface MoneyWastedCounterProps {
  amount: number;
  onClick?: () => void;
}

export const MoneyWastedCounter = ({ amount, onClick }: MoneyWastedCounterProps) => {
  const [displayAmount, setDisplayAmount] = useState(0);

  useEffect(() => {
    const duration = 1200;
    const steps = 60;
    const stepValue = amount / steps;
    let currentStep = 0;

    const interval = setInterval(() => {
      currentStep++;
      setDisplayAmount(Math.min(Math.round(stepValue * currentStep), amount));

      if (currentStep >= steps) {
        clearInterval(interval);
      }
    }, duration / steps);

    return () => clearInterval(interval);
  }, [amount]);

  return (
    <div
      onClick={onClick}
      className="bg-gradient-to-br from-slate-900/50 to-slate-800/30 backdrop-blur-xl rounded-2xl p-8 border border-slate-700/50 shadow-2xl hover:border-red-500/30 transition-all cursor-pointer"
    >
      <div className="flex items-center gap-3 mb-6">
        <div className={`p-3 rounded-lg ${amount > 0 ? 'bg-red-500/10' : 'bg-green-500/10'}`}>
          <DollarSign className={amount > 0 ? 'text-red-400' : 'text-green-400'} size={24} />
        </div>
        <div>
          <h3 className="text-xl font-semibold text-white">Argent Gaspillé</h3>
          <p className="text-sm text-slate-400">Dû aux inefficacités</p>
        </div>
      </div>

      <div className="text-center py-8">
        <div className="relative inline-block">
          <span className={`text-5xl font-bold ${amount > 0 ? 'text-red-400' : 'text-green-400'} transition-colors duration-500`}>
            {displayAmount.toLocaleString()} €
          </span>
          <span className="text-xl text-slate-500 ml-2">/mois</span>
        </div>

        {amount > 0 ? (
          <div className="mt-6 flex items-center justify-center gap-2 text-red-400">
            <TrendingDown size={20} />
            <span className="text-sm font-medium">Pertes actives détectées</span>
          </div>
        ) : (
          <div className="mt-6 flex items-center justify-center gap-2 text-green-400">
            <span className="text-sm font-medium">Tous les systèmes optimisés</span>
          </div>
        )}
      </div>

      <div className="mt-6 pt-6 border-t border-slate-700/50">
        <div className="grid grid-cols-3 gap-4 text-center">
          <div>
            <p className="text-xs text-slate-500 mb-1">Impact Annuel</p>
            <p className="text-lg font-semibold text-white">
              {(displayAmount * 12).toLocaleString()} €
            </p>
          </div>
          <div>
            <p className="text-xs text-slate-500 mb-1">Cette Semaine</p>
            <p className="text-lg font-semibold text-white">
              {Math.round(displayAmount / 4).toLocaleString()} €
            </p>
          </div>
          <div>
            <p className="text-xs text-slate-500 mb-1">Aujourd'hui</p>
            <p className="text-lg font-semibold text-white">
              {Math.round(displayAmount / 30).toLocaleString()} €
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};
