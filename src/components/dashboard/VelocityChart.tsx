import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import { TrendingUp } from 'lucide-react';

interface VelocityChartProps {
  data: Array<{
    date: string;
    completed: number;
    target: number;
  }>;
}

export const VelocityChart = ({ data }: VelocityChartProps) => {
  return (
    <div className="bg-gradient-to-br from-slate-900/50 to-slate-800/30 backdrop-blur-xl rounded-2xl p-8 border border-slate-700/50 shadow-2xl">
      <div className="flex items-center gap-3 mb-6">
        <TrendingUp className="text-cyan-400" size={24} />
        <div>
          <h3 className="text-xl font-semibold text-white">Ticket Velocity</h3>
          <p className="text-sm text-slate-400">Completion rate vs. target</p>
        </div>
      </div>

      <ResponsiveContainer width="100%" height={250}>
        <AreaChart data={data}>
          <defs>
            <linearGradient id="completedGradient" x1="0" y1="0" x2="0" y2="1">
              <stop offset="5%" stopColor="#06b6d4" stopOpacity={0.3} />
              <stop offset="95%" stopColor="#06b6d4" stopOpacity={0} />
            </linearGradient>
            <linearGradient id="targetGradient" x1="0" y1="0" x2="0" y2="1">
              <stop offset="5%" stopColor="#64748b" stopOpacity={0.2} />
              <stop offset="95%" stopColor="#64748b" stopOpacity={0} />
            </linearGradient>
          </defs>
          <CartesianGrid strokeDasharray="3 3" stroke="#334155" opacity={0.2} />
          <XAxis
            dataKey="date"
            stroke="#64748b"
            style={{ fontSize: '12px' }}
          />
          <YAxis
            stroke="#64748b"
            style={{ fontSize: '12px' }}
          />
          <Tooltip
            contentStyle={{
              backgroundColor: '#1e293b',
              border: '1px solid #334155',
              borderRadius: '8px',
              boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.3)',
            }}
            labelStyle={{ color: '#cbd5e1' }}
          />
          <Area
            type="monotone"
            dataKey="target"
            stroke="#64748b"
            strokeWidth={2}
            strokeDasharray="5 5"
            fill="url(#targetGradient)"
            name="Target"
          />
          <Area
            type="monotone"
            dataKey="completed"
            stroke="#06b6d4"
            strokeWidth={3}
            fill="url(#completedGradient)"
            name="Completed"
          />
        </AreaChart>
      </ResponsiveContainer>

      <div className="mt-6 pt-6 border-t border-slate-700/50 flex items-center justify-between">
        <div>
          <p className="text-xs text-slate-400">Weekly Average</p>
          <p className="text-lg font-semibold text-white">
            {Math.round(data.reduce((acc, d) => acc + d.completed, 0) / data.length)} tickets
          </p>
        </div>
        <div>
          <p className="text-xs text-slate-400">Target</p>
          <p className="text-lg font-semibold text-slate-300">
            {data[0]?.target || 0} tickets/day
          </p>
        </div>
      </div>
    </div>
  );
};
