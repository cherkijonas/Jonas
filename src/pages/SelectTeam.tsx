import { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { TeamManagement } from './TeamManagement';
import { TeamSelector } from '../components/TeamSelector';

export const SelectTeam = () => {
  const { user, profile, teamId, setTeamId, loading } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    if (!loading && !user) {
      navigate('/login');
    } else if (!loading && profile?.role === 'member') {
      navigate('/app');
    }
  }, [user, profile, loading, navigate]);

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 flex items-center justify-center">
        <div className="text-white">Loading...</div>
      </div>
    );
  }

  if (!user || !profile) {
    return null;
  }

  if (profile.role === 'manager' || profile.role === 'admin') {
    return <TeamManagement />;
  }

  return <TeamSelector userId={user.id} userRole={profile.role} onTeamSelected={setTeamId} />;
};
