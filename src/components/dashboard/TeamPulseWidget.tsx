import { Users, AlertTriangle } from 'lucide-react';

interface TeamMember {
  name: string;
  role: string;
  efforts: {
    development: number;
    support: number;
    meetings: number;
    documentation: number;
  };
}

const teamData: TeamMember[] = [
  {
    name: 'Thomas',
    role: 'Dev',
    efforts: { development: 35, support: 55, meetings: 7, documentation: 3 },
  },
  {
    name: 'Sarah',
    role: 'Finance',
    efforts: { development: 5, support: 45, meetings: 35, documentation: 15 },
  },
  {
    name: 'Julie',
    role: 'Marketing',
    efforts: { development: 10, support: 52, meetings: 25, documentation: 13 },
  },
  {
    name: 'Marc',
    role: 'Dev',
    efforts: { development: 60, support: 20, meetings: 15, documentation: 5 },
  },
];

export const TeamPulseWidget = () => {
  const getCellColor = (value: number) => {
    if (value >= 50) return 'bg-red-500/80 border-red-400';
    if (value >= 30) return 'bg-orange-500/60 border-orange-400';
    if (value >= 15) return 'bg-yellow-500/40 border-yellow-400';
    if (value >= 5) return 'bg-green-500/30 border-green-400';
    return 'bg-slate-700 border-slate-600';
  };

  const devsInSupport = teamData.filter(
    (member) => member.role === 'Dev' && member.efforts.support > 50
  );

  return (
    <div className="bg-slate-900/50 border border-slate-800 rounded-xl p-6">
      <div className="flex items-center gap-3 mb-6">
        <div className="w-10 h-10 bg-gradient-to-br from-purple-500 to-pink-600 rounded-lg flex items-center justify-center">
          <Users className="w-5 h-5 text-white" />
        </div>
        <div className="flex-1">
          <h3 className="text-lg font-bold text-white">Répartition d'Effort Équipe</h3>
          <p className="text-sm text-slate-400">Matrice d'activité cette semaine</p>
        </div>
      </div>

      {devsInSupport.length > 0 && (
        <div className="mb-6 p-4 bg-orange-500/10 border border-orange-500/30 rounded-lg">
          <div className="flex items-start gap-3">
            <AlertTriangle className="w-5 h-5 text-orange-400 flex-shrink-0 mt-0.5" />
            <div>
              <p className="text-sm font-semibold text-orange-400 mb-1">
                Alerte Répartition
              </p>
              <p className="text-sm text-orange-300">
                {devsInSupport.length} Développeur{devsInSupport.length > 1 ? 's' : ''} passe
                {devsInSupport.length === 1 ? '' : 'nt'} {'>'} 50% du temps sur le Support Client
                (Intercom)
              </p>
            </div>
          </div>
        </div>
      )}

      <div className="overflow-x-auto">
        <table className="w-full">
          <thead>
            <tr className="border-b border-slate-700">
              <th className="text-left text-xs font-semibold text-slate-400 uppercase tracking-wide pb-3 pr-4">
                Membre
              </th>
              <th className="text-center text-xs font-semibold text-slate-400 uppercase tracking-wide pb-3 px-2">
                Dév
              </th>
              <th className="text-center text-xs font-semibold text-slate-400 uppercase tracking-wide pb-3 px-2">
                Support
              </th>
              <th className="text-center text-xs font-semibold text-slate-400 uppercase tracking-wide pb-3 px-2">
                Réunions
              </th>
              <th className="text-center text-xs font-semibold text-slate-400 uppercase tracking-wide pb-3 px-2">
                Docs
              </th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-800">
            {teamData.map((member) => (
              <tr key={member.name}>
                <td className="py-3 pr-4">
                  <div>
                    <div className="text-sm font-semibold text-white">{member.name}</div>
                    <div className="text-xs text-slate-500">{member.role}</div>
                  </div>
                </td>
                <td className="py-3 px-2">
                  <div className="flex justify-center">
                    <div
                      className={`w-12 h-12 rounded-lg border-2 ${getCellColor(
                        member.efforts.development
                      )} flex items-center justify-center transition-all hover:scale-110`}
                    >
                      <span className="text-xs font-bold text-white">
                        {member.efforts.development}%
                      </span>
                    </div>
                  </div>
                </td>
                <td className="py-3 px-2">
                  <div className="flex justify-center">
                    <div
                      className={`w-12 h-12 rounded-lg border-2 ${getCellColor(
                        member.efforts.support
                      )} flex items-center justify-center transition-all hover:scale-110`}
                    >
                      <span className="text-xs font-bold text-white">
                        {member.efforts.support}%
                      </span>
                    </div>
                  </div>
                </td>
                <td className="py-3 px-2">
                  <div className="flex justify-center">
                    <div
                      className={`w-12 h-12 rounded-lg border-2 ${getCellColor(
                        member.efforts.meetings
                      )} flex items-center justify-center transition-all hover:scale-110`}
                    >
                      <span className="text-xs font-bold text-white">
                        {member.efforts.meetings}%
                      </span>
                    </div>
                  </div>
                </td>
                <td className="py-3 px-2">
                  <div className="flex justify-center">
                    <div
                      className={`w-12 h-12 rounded-lg border-2 ${getCellColor(
                        member.efforts.documentation
                      )} flex items-center justify-center transition-all hover:scale-110`}
                    >
                      <span className="text-xs font-bold text-white">
                        {member.efforts.documentation}%
                      </span>
                    </div>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <div className="mt-6 pt-4 border-t border-slate-700">
        <div className="flex items-center justify-between text-xs">
          <div className="flex items-center gap-4">
            <div className="flex items-center gap-2">
              <div className="w-4 h-4 bg-slate-700 border border-slate-600 rounded"></div>
              <span className="text-slate-400">Bas</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-4 h-4 bg-green-500/30 border border-green-400 rounded"></div>
              <span className="text-slate-400">Normal</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-4 h-4 bg-yellow-500/40 border border-yellow-400 rounded"></div>
              <span className="text-slate-400">Élevé</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-4 h-4 bg-red-500/80 border border-red-400 rounded"></div>
              <span className="text-slate-400">Critique</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
