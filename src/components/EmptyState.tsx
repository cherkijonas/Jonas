import { Link2, Trello, MessageSquare, Github, LayoutGrid } from 'lucide-react';

export const EmptyState = () => {
  return (
    <div className="min-h-[80vh] flex items-center justify-center">
      <div className="max-w-2xl mx-auto text-center">
        <div className="w-24 h-24 bg-gradient-to-br from-slate-800 to-slate-900 rounded-2xl flex items-center justify-center mx-auto mb-8 border border-slate-700/50">
          <Link2 className="text-slate-400" size={48} />
        </div>

        <h2 className="text-3xl font-bold text-white mb-4">Connect Your Tools</h2>
        <p className="text-lg text-slate-400 mb-12">
          Flux.AI needs access to your project management tools to analyze your agency's operations.
          Connect at least one integration to get started.
        </p>

        <div className="grid grid-cols-2 gap-4 mb-12">
          {[
            { name: 'Trello', icon: Trello, color: 'from-blue-500 to-blue-600' },
            { name: 'Slack', icon: MessageSquare, color: 'from-purple-500 to-purple-600' },
            { name: 'GitHub', icon: Github, color: 'from-gray-600 to-gray-700' },
            { name: 'Jira', icon: LayoutGrid, color: 'from-blue-600 to-blue-700' },
          ].map((tool) => (
            <button
              key={tool.name}
              className="bg-gradient-to-br from-slate-900/50 to-slate-800/30 backdrop-blur-xl rounded-xl p-6 border border-slate-700/50 hover:border-slate-600/50 transition-all duration-300 shadow-lg hover:shadow-xl group"
            >
              <div className={`w-12 h-12 bg-gradient-to-br ${tool.color} rounded-lg flex items-center justify-center mx-auto mb-3 group-hover:scale-110 transition-transform duration-300`}>
                <tool.icon className="text-white" size={24} />
              </div>
              <p className="font-semibold text-white">{tool.name}</p>
              <p className="text-xs text-slate-400 mt-1">Connect</p>
            </button>
          ))}
        </div>

        <div className="bg-gradient-to-br from-cyan-500/10 to-blue-600/10 rounded-xl p-6 border border-cyan-500/20">
          <p className="text-sm text-slate-300">
            <span className="font-semibold text-cyan-400">Want to see it in action?</span>
            <br />
            Toggle "Demo Mode" in the top bar to explore Flux.AI with sample data.
          </p>
        </div>
      </div>
    </div>
  );
};
