import { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { Users, Mail, Calendar, Crown } from 'lucide-react';
import { supabase } from '../../lib/supabase';

interface TeamMember {
  id: string;
  full_name: string | null;
  email: string;
  role: string;
  joined_at: string;
}

interface TeamMembersGridProps {
  teamId: string;
  currentUserId: string;
}

export const TeamMembersGrid = ({ teamId, currentUserId }: TeamMembersGridProps) => {
  const [members, setMembers] = useState<TeamMember[]>([]);
  const [teamName, setTeamName] = useState('');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadTeamData();
  }, [teamId]);

  const loadTeamData = async () => {
    try {
      const { data: team } = await supabase
        .from('teams')
        .select('name')
        .eq('id', teamId)
        .maybeSingle();

      if (team) {
        setTeamName(team.name);
      }

      const { data: teamMembers } = await supabase
        .from('team_members')
        .select(`
          user_id,
          role,
          joined_at,
          profiles (
            id,
            full_name,
            email
          )
        `)
        .eq('team_id', teamId)
        .order('joined_at', { ascending: true });

      if (teamMembers) {
        const formattedMembers = teamMembers.map((tm: any) => ({
          id: tm.user_id,
          full_name: tm.profiles?.full_name,
          email: tm.profiles?.email,
          role: tm.role,
          joined_at: tm.joined_at,
        }));
        setMembers(formattedMembers);
      }
    } catch (error) {
      console.error('Error loading team data:', error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="animate-pulse space-y-4">
        <div className="h-6 bg-slate-700/50 rounded w-1/3"></div>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {[1, 2, 3, 4].map((i) => (
            <div key={i} className="h-24 bg-slate-700/50 rounded-xl"></div>
          ))}
        </div>
      </div>
    );
  }

  const getRoleColor = (role: string) => {
    switch (role) {
      case 'manager':
        return {
          bg: 'from-amber-500/10 to-orange-600/10',
          border: 'border-amber-500/30',
          text: 'text-amber-400',
          badge: 'bg-amber-500/20 text-amber-400',
        };
      case 'member':
        return {
          bg: 'from-emerald-500/10 to-teal-600/10',
          border: 'border-emerald-500/30',
          text: 'text-emerald-400',
          badge: 'bg-emerald-500/20 text-emerald-400',
        };
      default:
        return {
          bg: 'from-slate-500/10 to-slate-600/10',
          border: 'border-slate-500/30',
          text: 'text-slate-400',
          badge: 'bg-slate-500/20 text-slate-400',
        };
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h3 className="text-xl font-semibold text-white mb-1">{teamName}</h3>
          <div className="flex items-center gap-2 text-sm text-slate-400">
            <Users className="w-4 h-4" />
            <span>{members.length} membre{members.length > 1 ? 's' : ''}</span>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {members.map((member, index) => {
          const roleStyle = getRoleColor(member.role);
          const isCurrentUser = member.id === currentUserId;

          return (
            <motion.div
              key={member.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.1 }}
              className={`p-4 bg-gradient-to-br ${roleStyle.bg} border ${roleStyle.border} rounded-xl hover:border-opacity-70 transition-all ${
                isCurrentUser ? 'ring-2 ring-cyan-500/50' : ''
              }`}
            >
              <div className="flex items-start justify-between mb-3">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 bg-gradient-to-br from-cyan-500 to-blue-600 rounded-full flex items-center justify-center">
                    <span className="text-white font-semibold text-sm">
                      {member.full_name
                        ? member.full_name
                            .split(' ')
                            .map((n) => n[0])
                            .join('')
                            .toUpperCase()
                            .slice(0, 2)
                        : member.email[0].toUpperCase()}
                    </span>
                  </div>
                  <div>
                    <div className="flex items-center gap-2">
                      <h4 className="font-semibold text-white text-sm">
                        {member.full_name || 'Sans nom'}
                      </h4>
                      {isCurrentUser && (
                        <span className="px-2 py-0.5 bg-cyan-500/20 text-cyan-400 text-xs rounded border border-cyan-500/30">
                          Vous
                        </span>
                      )}
                    </div>
                    <div className="flex items-center gap-1 text-xs text-slate-400 mt-0.5">
                      <Mail className="w-3 h-3" />
                      <span>{member.email}</span>
                    </div>
                  </div>
                </div>
                {member.role === 'manager' && (
                  <Crown className="w-4 h-4 text-amber-400 flex-shrink-0" />
                )}
              </div>

              <div className="flex items-center justify-between">
                <div className="flex items-center gap-1 text-xs text-slate-500">
                  <Calendar className="w-3 h-3" />
                  <span>
                    Rejoint le {new Date(member.joined_at).toLocaleDateString('fr-FR')}
                  </span>
                </div>
                <span className={`px-2 py-1 text-xs font-medium rounded ${roleStyle.badge}`}>
                  {member.role === 'manager' ? 'Manager' : 'Membre'}
                </span>
              </div>
            </motion.div>
          );
        })}
      </div>

      {members.length === 0 && (
        <div className="text-center py-12">
          <Users className="w-16 h-16 text-slate-700 mx-auto mb-3" />
          <p className="text-slate-400">Aucun membre dans cette équipe</p>
        </div>
      )}
    </div>
  );
};
