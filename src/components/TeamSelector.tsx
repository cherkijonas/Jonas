import { useState, useEffect } from 'react';
import { Users, Plus, ArrowRight, Mail, Crown, Sparkles, ArrowLeft } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { supabase } from '../lib/supabase';
import { teamsService } from '../services/teamsService';
import { teamJoinRequestsService } from '../services/teamJoinRequestsService';

interface Team {
  id: string;
  name: string;
  slug: string;
  role?: string;
}

interface TeamSelectorProps {
  userId: string;
  userRole: 'admin' | 'manager' | 'member';
  onTeamSelected: (teamId: string) => void;
}

export function TeamSelector({ userId, userRole, onTeamSelected }: TeamSelectorProps) {
  const navigate = useNavigate();
  const [teams, setTeams] = useState<Team[]>([]);
  const [availableTeams, setAvailableTeams] = useState<Team[]>([]);
  const [loading, setLoading] = useState(true);
  const [showCreateForm, setShowCreateForm] = useState(false);
  const [showJoinForm, setShowJoinForm] = useState(false);
  const [teamName, setTeamName] = useState('');
  const [requestMessage, setRequestMessage] = useState('');
  const [creating, setCreating] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  const canCreateTeams = userRole === 'admin' || userRole === 'manager';

  useEffect(() => {
    loadTeams();
  }, [userId]);

  const loadTeams = async () => {
    try {
      const userTeams = await teamsService.getUserTeams(userId);
      setTeams(userTeams);

      if (userTeams.length === 1) {
        onTeamSelected(userTeams[0].id);
      }

      if (!canCreateTeams) {
        const available = await teamJoinRequestsService.getAllTeamsForJoinRequest();
        setAvailableTeams(available);
      }
    } catch (err) {
      console.error('Error loading teams:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleCreateTeam = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!teamName.trim()) return;

    setCreating(true);
    setError('');

    try {
      const slug = teamName.toLowerCase().replace(/[^a-z0-9]+/g, '-');
      const team = await teamsService.createTeam(teamName, slug, userId);
      onTeamSelected(team.id);
    } catch (err: any) {
      setError(err.message || 'Failed to create team');
    } finally {
      setCreating(false);
    }
  };

  const handleJoinRequest = async (teamId: string) => {
    setCreating(true);
    setError('');
    setSuccess('');

    try {
      await teamJoinRequestsService.createJoinRequest(teamId, requestMessage);
      setSuccess('Join request sent successfully!');
      setShowJoinForm(false);
      setRequestMessage('');
    } catch (err: any) {
      setError(err.message || 'Failed to send join request');
    } finally {
      setCreating(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 flex items-center justify-center">
        <div className="text-white">Loading...</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 flex items-center justify-center p-4">
      <button
        onClick={() => navigate('/role-selection')}
        className="absolute top-6 left-6 z-10 p-3 bg-slate-800/50 hover:bg-slate-700/50 backdrop-blur-sm border border-slate-700/50 rounded-xl transition-all text-slate-400 hover:text-white"
      >
        <ArrowLeft className="w-5 h-5" />
      </button>

      <div className="w-full max-w-md">
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-16 h-16 bg-blue-500 rounded-2xl mb-4">
            <Users className="w-8 h-8 text-white" />
          </div>
          <h1 className="text-3xl font-bold text-white mb-2">Select Your Team</h1>
          <p className="text-slate-400">
            {canCreateTeams
              ? 'Choose a team to continue or create a new one'
              : 'Choose a team or request to join another'}
          </p>
        </div>

        {success && (
          <div className="mb-4 p-3 bg-emerald-500/10 border border-emerald-500 rounded-lg text-emerald-400 text-sm">
            {success}
          </div>
        )}

        {!showCreateForm && !showJoinForm ? (
          <div className="space-y-4">
            {teams.length > 0 && (
              <div className="space-y-2">
                {teams.map((team) => (
                  <button
                    key={team.id}
                    onClick={() => onTeamSelected(team.id)}
                    className="w-full bg-slate-800 hover:bg-slate-700 border border-slate-700 rounded-xl p-4 flex items-center justify-between transition-all group"
                  >
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 bg-gradient-to-br from-blue-500 to-purple-600 rounded-lg flex items-center justify-center">
                        <span className="text-white font-bold text-lg">
                          {team.name.charAt(0).toUpperCase()}
                        </span>
                      </div>
                      <div className="text-left">
                        <div className="text-white font-medium">{team.name}</div>
                        {team.role && (
                          <div className="text-slate-400 text-sm capitalize">{team.role}</div>
                        )}
                      </div>
                    </div>
                    <ArrowRight className="w-5 h-5 text-slate-400 group-hover:text-white group-hover:translate-x-1 transition-all" />
                  </button>
                ))}
              </div>
            )}

            {teams.length === 0 && !canCreateTeams && availableTeams.length === 0 && (
              <div className="bg-slate-800/50 border-2 border-dashed border-slate-700 rounded-2xl p-8 text-center">
                <div className="w-16 h-16 bg-gradient-to-br from-amber-500 to-orange-600 rounded-2xl flex items-center justify-center mx-auto mb-4">
                  <Crown className="w-8 h-8 text-white" />
                </div>
                <h3 className="text-xl font-bold text-white mb-2">Aucune équipe disponible</h3>
                <p className="text-slate-400 mb-6">
                  Il n'y a pas encore d'équipe à rejoindre. Devenez manager pour créer votre première équipe!
                </p>
                <button
                  onClick={async () => {
                    if (!userId) return;
                    setLoading(true);
                    try {
                      const { error } = await supabase.from('profiles').update({ role: 'manager' }).eq('id', userId);
                      if (error) throw error;
                      navigate('/app');
                    } catch (err) {
                      console.error('Error updating role:', err);
                    } finally {
                      setLoading(false);
                    }
                  }}
                  className="w-full bg-gradient-to-r from-amber-500 to-orange-600 hover:from-amber-600 hover:to-orange-700 text-white rounded-xl p-4 flex items-center justify-center gap-2 transition-all font-medium shadow-lg shadow-amber-500/20"
                >
                  <Crown className="w-5 h-5" />
                  Devenir Manager
                </button>
              </div>
            )}

            {canCreateTeams && (
              <button
                onClick={() => setShowCreateForm(true)}
                className="w-full bg-blue-500 hover:bg-blue-600 text-white rounded-xl p-4 flex items-center justify-center gap-2 transition-all font-medium"
              >
                <Plus className="w-5 h-5" />
                Create New Team
              </button>
            )}

            {!canCreateTeams && availableTeams.length > 0 && (
              <button
                onClick={() => setShowJoinForm(true)}
                className="w-full bg-emerald-500 hover:bg-emerald-600 text-white rounded-xl p-4 flex items-center justify-center gap-2 transition-all font-medium"
              >
                <Mail className="w-5 h-5" />
                Request to Join Team
              </button>
            )}
          </div>
        ) : showJoinForm ? (
          <div className="bg-slate-800 border border-slate-700 rounded-xl p-6">
            <h2 className="text-xl font-bold text-white mb-4">Request to Join Team</h2>

            {error && (
              <div className="mb-4 p-3 bg-red-500/10 border border-red-500 rounded-lg text-red-500 text-sm">
                {error}
              </div>
            )}

            <div className="space-y-4">
              <div>
                <label className="block text-slate-300 text-sm font-medium mb-2">
                  Select Team
                </label>
                <div className="space-y-2 max-h-48 overflow-y-auto">
                  {availableTeams.map((team) => (
                    <button
                      key={team.id}
                      onClick={() => handleJoinRequest(team.id)}
                      disabled={creating}
                      className="w-full bg-slate-900 hover:bg-slate-700 border border-slate-700 rounded-lg p-3 flex items-center gap-3 transition-all disabled:opacity-50"
                    >
                      <div className="w-8 h-8 bg-gradient-to-br from-blue-500 to-purple-600 rounded-lg flex items-center justify-center">
                        <span className="text-white font-bold">
                          {team.name.charAt(0).toUpperCase()}
                        </span>
                      </div>
                      <span className="text-white font-medium">{team.name}</span>
                    </button>
                  ))}
                </div>
              </div>

              <button
                type="button"
                onClick={() => {
                  setShowJoinForm(false);
                  setError('');
                }}
                className="w-full bg-slate-700 hover:bg-slate-600 text-white rounded-lg py-3 transition-all font-medium"
                disabled={creating}
              >
                Cancel
              </button>
            </div>
          </div>
        ) : (
          <form onSubmit={handleCreateTeam} className="bg-slate-800 border border-slate-700 rounded-xl p-6">
            <h2 className="text-xl font-bold text-white mb-4">Create New Team</h2>

            {error && (
              <div className="mb-4 p-3 bg-red-500/10 border border-red-500 rounded-lg text-red-500 text-sm">
                {error}
              </div>
            )}

            <div className="space-y-4">
              <div>
                <label className="block text-slate-300 text-sm font-medium mb-2">
                  Team Name
                </label>
                <input
                  type="text"
                  value={teamName}
                  onChange={(e) => setTeamName(e.target.value)}
                  placeholder="My Awesome Team"
                  className="w-full bg-slate-900 border border-slate-700 rounded-lg px-4 py-3 text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-blue-500"
                  required
                  disabled={creating}
                />
              </div>

              <div className="flex gap-3">
                <button
                  type="button"
                  onClick={() => setShowCreateForm(false)}
                  className="flex-1 bg-slate-700 hover:bg-slate-600 text-white rounded-lg py-3 transition-all font-medium"
                  disabled={creating}
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="flex-1 bg-blue-500 hover:bg-blue-600 text-white rounded-lg py-3 transition-all font-medium disabled:opacity-50"
                  disabled={creating || !teamName.trim()}
                >
                  {creating ? 'Creating...' : 'Create Team'}
                </button>
              </div>
            </div>
          </form>
        )}
      </div>
    </div>
  );
}
