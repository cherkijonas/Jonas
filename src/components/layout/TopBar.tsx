import { useGlobal } from '../../context/GlobalContext';
import { NotificationCenter } from '../common/NotificationCenter';
import { CommandBar } from '../common/CommandBar';
import { ArrowLeft } from 'lucide-react';
import { useNavigate, useLocation } from 'react-router-dom';

export const TopBar = () => {
  const { userProfile, healthScore } = useGlobal();
  const navigate = useNavigate();
  const location = useLocation();

  const isSubPage = location.pathname !== '/app';

  const getHealthStatus = (score: number) => {
    if (score === 0) return { text: 'Non Connecté', color: 'text-slate-500' };
    if (score < 30) return { text: 'Critique', color: 'text-red-400' };
    if (score < 50) return { text: 'Faible', color: 'text-orange-400' };
    if (score < 70) return { text: 'Moyen', color: 'text-yellow-400' };
    if (score < 85) return { text: 'Bon', color: 'text-green-400' };
    return { text: 'Excellent', color: 'text-emerald-400' };
  };

  const healthStatus = getHealthStatus(healthScore);
  const firstName = userProfile.name.split(' ')[0] || 'Utilisateur';

  return (
    <header className="h-16 bg-slate-900/30 backdrop-blur-xl border-b border-slate-800/50 flex items-center justify-between px-6 relative z-10">
      <div className="flex items-center gap-6">
        {isSubPage && (
          <button
            onClick={() => navigate(-1)}
            className="p-2 bg-slate-800/50 hover:bg-slate-700/50 backdrop-blur-sm border border-slate-700/50 rounded-lg transition-all text-slate-400 hover:text-white"
          >
            <ArrowLeft className="w-5 h-5" />
          </button>
        )}
        <div>
          <h2 className="text-lg font-semibold text-white">
            Bonjour, {firstName}. Santé de l'Agence :{' '}
            <span className={healthStatus.color}>{healthStatus.text}</span>
          </h2>
          <p className="text-sm text-slate-400">
            {userProfile.email || 'Non connecté'}
          </p>
        </div>
      </div>

      <div className="flex items-center gap-4">
        <div className="w-80">
          <CommandBar />
        </div>

        <NotificationCenter />
      </div>
    </header>
  );
};
