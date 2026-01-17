import { LayoutDashboard, Brain, Link2, Settings, LogOut, FileText, Users, ClipboardList, Sparkles } from 'lucide-react';
import { useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { useGlobal } from '../../context/GlobalContext';
import { t } from '../../utils/translations';

interface NavItem {
  id: string;
  path: string;
  labelKey: keyof ReturnType<typeof t>;
  icon: React.ReactNode;
  managerOnly?: boolean;
  employeeOnly?: boolean;
}

const navItems: NavItem[] = [
  { id: 'dashboard', path: '/app', labelKey: 'dashboard', icon: <LayoutDashboard size={20} /> },
  { id: 'insights', path: '/app', labelKey: 'insights', icon: <Brain size={20} /> },
  { id: 'connections', path: '/app/connections', labelKey: 'connections', icon: <Link2 size={20} /> },
  { id: 'advanced', path: '/app/advanced', labelKey: 'settings' as any, icon: <Sparkles size={20} />, employeeOnly: true },
  { id: 'teams', path: '/app/teams', labelKey: 'teams' as any, icon: <Users size={20} />, managerOnly: true },
  { id: 'my-team', path: '/app/my-team', labelKey: 'myTeam' as any, icon: <Users size={20} />, employeeOnly: true },
  { id: 'my-requests', path: '/app/my-requests', labelKey: 'myRequests' as any, icon: <ClipboardList size={20} />, employeeOnly: true },
  { id: 'activity-logs', path: '/app/activity', labelKey: 'activityLogs', icon: <FileText size={20} /> },
  { id: 'settings', path: '/app/settings', labelKey: 'settings', icon: <Settings size={20} /> },
];

export const UpdatedSidebar = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { signOut, user, profile } = useAuth();
  const { integrations, userProfile } = useGlobal();
  const connectedCount = integrations.filter((i) => i.connected).length;
  const isManager = profile?.role === 'manager' || profile?.role === 'admin';

  const getInitials = (name: string) => {
    return name
      .split(' ')
      .map((n) => n[0])
      .join('')
      .toUpperCase()
      .slice(0, 2);
  };

  return (
    <aside className="w-64 bg-slate-900/50 backdrop-blur-xl border-r border-slate-800/50 flex flex-col">
      <div className="p-6 border-b border-slate-800/50">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 bg-gradient-to-br from-cyan-500 to-blue-600 rounded-lg flex items-center justify-center shadow-lg shadow-cyan-500/20">
            <Brain className="text-white" size={24} />
          </div>
          <div>
            <h1 className="text-xl font-bold text-white">Flux.AI</h1>
            <p className="text-xs text-slate-400">Ops Intelligence</p>
          </div>
        </div>
      </div>

      <nav className="flex-1 p-4 space-y-2">
        {navItems.map((item) => {
          if (item.managerOnly && !isManager) return null;
          if (item.employeeOnly && isManager) return null;

          const isActive = location.pathname === item.path;
          const label = item.id === 'teams' ? 'Équipes' : item.id === 'my-team' ? 'Mon Équipe' : item.id === 'my-requests' ? 'Mes Demandes' : item.id === 'advanced' ? 'Fonctionnalités Avancées' : t(item.labelKey as any, userProfile.language);

          return (
            <button
              key={item.id}
              onClick={() => navigate(item.path)}
              className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg transition-all duration-200 cursor-pointer ${
                isActive
                  ? 'bg-gradient-to-r from-cyan-500/10 to-blue-600/10 text-cyan-400 border border-cyan-500/20 shadow-lg shadow-cyan-500/5'
                  : 'text-slate-400 hover:text-slate-300 hover:bg-slate-800/30'
              }`}
            >
              {item.icon}
              <span className="font-medium flex-1 text-left">
                {label}
              </span>
              {item.id === 'connections' && connectedCount > 0 && (
                <span className="px-2 py-0.5 bg-cyan-500/20 text-cyan-400 text-xs font-semibold rounded-full">
                  {connectedCount}
                </span>
              )}
            </button>
          );
        })}
      </nav>

      <div className="p-4 border-t border-slate-800/50 space-y-3">
        <div className="bg-gradient-to-br from-slate-800/50 to-slate-900/50 rounded-lg p-4 border border-slate-700/50">
          <div className="flex items-center gap-3 mb-3">
            <div className="w-8 h-8 bg-gradient-to-br from-violet-500 to-purple-600 rounded-full flex items-center justify-center text-xs font-bold text-white">
              {getInitials(userProfile.name)}
            </div>
            <div className="flex-1">
              <p className="text-sm font-medium text-white">{userProfile.name}</p>
              <p className="text-xs text-slate-400">
                {userProfile.role === 'Manager' ? 'MANAGER' : 'EMPLOYE'}
              </p>
            </div>
          </div>
        </div>

        <button
          onClick={async () => {
            await signOut();
            navigate('/login');
          }}
          className="w-full flex items-center gap-2 px-4 py-2.5 text-slate-400 hover:text-red-400 hover:bg-red-500/10 rounded-lg transition-all duration-200 cursor-pointer"
        >
          <LogOut size={18} />
          <span className="font-medium">{t('logout', userProfile.language)}</span>
        </button>
      </div>
    </aside>
  );
};
