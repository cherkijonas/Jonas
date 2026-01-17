import { useEffect, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { supabase } from '../../lib/supabase';
import { AlertCircle } from 'lucide-react';

interface ManagerRouteGuardProps {
  children: React.ReactNode;
}

export const ManagerRouteGuard = ({ children }: ManagerRouteGuardProps) => {
  const { user, profile, loading: authLoading } = useAuth();
  const navigate = useNavigate();
  const { teamSlug } = useParams<{ teamSlug: string }>();
  const [isAuthorized, setIsAuthorized] = useState<boolean | null>(null);
  const [teamName, setTeamName] = useState<string>('');
  const [teamSlugForRedirect, setTeamSlugForRedirect] = useState<string>('');

  useEffect(() => {
    const checkAccess = async () => {
      console.log('[ManagerRouteGuard] Vérification accès:', { authLoading, user: !!user, profile, teamSlug });

      if (authLoading) return;

      if (!user || !profile) {
        console.log('[ManagerRouteGuard] Pas de user ou profile, redirection vers /login');
        navigate('/login');
        return;
      }

      if (profile.role !== 'manager') {
        console.log('[ManagerRouteGuard] Role non-manager:', profile.role, 'redirection vers /app');
        navigate('/app');
        return;
      }

      if (!profile.assigned_team_id) {
        console.log('[ManagerRouteGuard] Pas d\'assigned_team_id, redirection vers /login');
        navigate('/login');
        return;
      }

      const { data: assignedTeam, error } = await supabase
        .from('teams')
        .select('id, name, slug')
        .eq('id', profile.assigned_team_id)
        .single();

      console.log('[ManagerRouteGuard] Équipe assignée:', assignedTeam, 'Erreur:', error);

      if (error || !assignedTeam) {
        console.log('[ManagerRouteGuard] Erreur chargement équipe, redirection vers /login');
        navigate('/login');
        return;
      }

      if (assignedTeam.slug !== teamSlug) {
        console.log('[ManagerRouteGuard] Mauvais slug:', { expected: assignedTeam.slug, got: teamSlug });
        setIsAuthorized(false);
        setTeamName(assignedTeam.name);
        setTeamSlugForRedirect(assignedTeam.slug);
        return;
      }

      console.log('[ManagerRouteGuard] Accès autorisé!');
      setIsAuthorized(true);
    };

    checkAccess();
  }, [user, profile, authLoading, teamSlug, navigate]);

  if (authLoading || isAuthorized === null) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-950 via-slate-900 to-slate-950 flex items-center justify-center">
        <div className="text-white">Vérification des accès...</div>
      </div>
    );
  }

  if (isAuthorized === false) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-950 via-slate-900 to-slate-950 flex items-center justify-center p-6">
        <div className="max-w-md w-full bg-slate-900/50 backdrop-blur-sm border border-red-500/30 rounded-2xl p-8 text-center">
          <div className="w-16 h-16 bg-red-500/10 rounded-full flex items-center justify-center mx-auto mb-4">
            <AlertCircle className="w-8 h-8 text-red-400" />
          </div>
          <h2 className="text-2xl font-bold text-white mb-3">Accès Refusé</h2>
          <p className="text-slate-400 mb-6">
            Vous n'êtes pas autorisé à accéder à cette équipe. Vous êtes assigné à l'équipe <strong className="text-white">{teamName}</strong>.
          </p>
          <button
            onClick={() => navigate(`/manager/${teamSlugForRedirect}`)}
            className="px-6 py-3 bg-gradient-to-r from-cyan-500 to-blue-600 hover:from-cyan-600 hover:to-blue-700 text-white rounded-xl font-semibold transition-all"
          >
            Retour à mon tableau de bord
          </button>
        </div>
      </div>
    );
  }

  return <>{children}</>;
};
