import { motion } from 'framer-motion';
import { TrendingUp, Calendar } from 'lucide-react';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Area, AreaChart } from 'recharts';

interface ProductivityTrendChartProps {
  userId: string;
}

export const ProductivityTrendChart = ({ userId }: ProductivityTrendChartProps) => {
  const mockData = [
    { day: 'Lun', productivity: 72, focus: 65 },
    { day: 'Mar', productivity: 78, focus: 70 },
    { day: 'Mer', productivity: 85, focus: 82 },
    { day: 'Jeu', productivity: 81, focus: 75 },
    { day: 'Ven', productivity: 88, focus: 85 },
    { day: 'Sam', productivity: 45, focus: 40 },
    { day: 'Dim', productivity: 35, focus: 30 },
  ];

  const CustomTooltip = ({ active, payload }: any) => {
    if (active && payload && payload.length) {
      return (
        <div className="bg-slate-900 border border-slate-700 rounded-lg p-3 shadow-xl">
          <p className="text-white font-semibold mb-1">{payload[0].payload.day}</p>
          <p className="text-cyan-400 text-sm">
            Productivité: {payload[0].value}%
          </p>
          <p className="text-violet-400 text-sm">
            Focus: {payload[1].value}%
          </p>
        </div>
      );
    }
    return null;
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
      className="bg-gradient-to-br from-slate-900/50 to-slate-800/30 backdrop-blur-xl rounded-2xl border border-slate-700/50 p-6"
    >
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-3">
          <div className="p-2 bg-gradient-to-br from-cyan-500/20 to-blue-600/20 rounded-lg">
            <TrendingUp className="w-5 h-5 text-cyan-400" />
          </div>
          <div>
            <h2 className="text-lg font-semibold text-white">Tendance Productivité</h2>
            <p className="text-sm text-slate-400">7 derniers jours</p>
          </div>
        </div>
        <div className="flex items-center gap-1 text-xs text-slate-500">
          <Calendar className="w-3 h-3" />
          <span>Cette semaine</span>
        </div>
      </div>

      <div className="mb-4 flex items-center gap-4">
        <div className="flex items-center gap-2">
          <div className="w-3 h-3 rounded-full bg-cyan-500" />
          <span className="text-xs text-slate-400">Productivité</span>
        </div>
        <div className="flex items-center gap-2">
          <div className="w-3 h-3 rounded-full bg-violet-500" />
          <span className="text-xs text-slate-400">Focus</span>
        </div>
      </div>

      <ResponsiveContainer width="100%" height={200}>
        <AreaChart data={mockData}>
          <defs>
            <linearGradient id="colorProductivity" x1="0" y1="0" x2="0" y2="1">
              <stop offset="5%" stopColor="#06B6D4" stopOpacity={0.3} />
              <stop offset="95%" stopColor="#06B6D4" stopOpacity={0} />
            </linearGradient>
            <linearGradient id="colorFocus" x1="0" y1="0" x2="0" y2="1">
              <stop offset="5%" stopColor="#8B5CF6" stopOpacity={0.3} />
              <stop offset="95%" stopColor="#8B5CF6" stopOpacity={0} />
            </linearGradient>
          </defs>
          <CartesianGrid strokeDasharray="3 3" stroke="#334155" opacity={0.3} />
          <XAxis
            dataKey="day"
            stroke="#64748B"
            tick={{ fill: '#94A3B8', fontSize: 12 }}
            axisLine={{ stroke: '#334155' }}
          />
          <YAxis
            stroke="#64748B"
            tick={{ fill: '#94A3B8', fontSize: 12 }}
            axisLine={{ stroke: '#334155' }}
            domain={[0, 100]}
          />
          <Tooltip content={<CustomTooltip />} />
          <Area
            type="monotone"
            dataKey="productivity"
            stroke="#06B6D4"
            strokeWidth={2}
            fill="url(#colorProductivity)"
          />
          <Area
            type="monotone"
            dataKey="focus"
            stroke="#8B5CF6"
            strokeWidth={2}
            fill="url(#colorFocus)"
          />
        </AreaChart>
      </ResponsiveContainer>

      <div className="mt-4 grid grid-cols-2 gap-4">
        <div className="p-3 bg-gradient-to-br from-cyan-500/10 to-blue-600/10 border border-cyan-500/30 rounded-lg">
          <p className="text-xs text-slate-400 mb-1">Moyenne Productivité</p>
          <p className="text-xl font-bold text-cyan-400">73%</p>
          <p className="text-xs text-emerald-400 mt-1">+8% vs semaine dernière</p>
        </div>
        <div className="p-3 bg-gradient-to-br from-violet-500/10 to-purple-600/10 border border-violet-500/30 rounded-lg">
          <p className="text-xs text-slate-400 mb-1">Temps Focus Moyen</p>
          <p className="text-xl font-bold text-violet-400">4.2h</p>
          <p className="text-xs text-emerald-400 mt-1">+0.5h vs semaine dernière</p>
        </div>
      </div>
    </motion.div>
  );
};
