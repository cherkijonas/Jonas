import React, { useState, useEffect } from 'react';
import { Zap, Plus, Play, Pause, Trash2, Settings } from 'lucide-react';
import { automationsService, Automation } from '../../services/automationsService';

export const AutomationsWidget: React.FC = () => {
  const [automations, setAutomations] = useState<Automation[]>([]);
  const [templates, setTemplates] = useState<any[]>([]);
  const [showTemplates, setShowTemplates] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      setLoading(true);
      const [autos, temps] = await Promise.all([
        automationsService.getAutomations(),
        Promise.resolve(automationsService.getAutomationTemplates()),
      ]);
      setAutomations(autos);
      setTemplates(temps);
    } catch (error) {
      console.error('Error loading automations:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleToggle = async (id: string, isActive: boolean) => {
    try {
      await automationsService.toggleAutomation(id, !isActive);
      setAutomations((prev) =>
        prev.map((auto) => (auto.id === id ? { ...auto, is_active: !isActive } : auto))
      );
    } catch (error) {
      console.error('Error toggling automation:', error);
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Supprimer cette automation ?')) return;

    try {
      await automationsService.deleteAutomation(id);
      setAutomations((prev) => prev.filter((auto) => auto.id !== id));
    } catch (error) {
      console.error('Error deleting automation:', error);
    }
  };

  const handleCreateFromTemplate = async (template: any) => {
    try {
      const automation = await automationsService.createAutomation(template);
      setAutomations((prev) => [automation, ...prev]);
      setShowTemplates(false);
    } catch (error) {
      console.error('Error creating automation:', error);
    }
  };

  if (loading) {
    return (
      <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-6">
        <div className="animate-pulse space-y-3">
          <div className="h-6 bg-slate-200 rounded w-1/3"></div>
          <div className="h-20 bg-slate-200 rounded"></div>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-6">
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-2">
          <Zap size={20} className="text-amber-500" />
          <h3 className="text-lg font-semibold text-slate-900">Automatisations</h3>
        </div>
        <button
          onClick={() => setShowTemplates(!showTemplates)}
          className="p-2 text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
        >
          <Plus size={18} />
        </button>
      </div>

      {showTemplates && (
        <div className="mb-4 p-4 bg-slate-50 rounded-lg">
          <h4 className="text-sm font-medium text-slate-700 mb-3">Templates</h4>
          <div className="space-y-2">
            {templates.map((template, index) => (
              <div
                key={index}
                className="flex items-start justify-between p-3 bg-white rounded-lg border border-slate-200 hover:border-blue-300 transition-colors"
              >
                <div className="flex-1">
                  <h5 className="font-medium text-slate-900 text-sm">{template.name}</h5>
                  <p className="text-xs text-slate-500 mt-1">{template.description}</p>
                </div>
                <button
                  onClick={() => handleCreateFromTemplate(template)}
                  className="ml-3 px-3 py-1 bg-blue-600 text-white text-xs rounded-lg hover:bg-blue-700 transition-colors"
                >
                  Utiliser
                </button>
              </div>
            ))}
          </div>
          <button
            onClick={() => setShowTemplates(false)}
            className="mt-3 w-full py-2 text-sm text-slate-600 hover:bg-slate-100 rounded-lg transition-colors"
          >
            Fermer
          </button>
        </div>
      )}

      {automations.length === 0 ? (
        <div className="text-center py-8">
          <div className="w-16 h-16 bg-amber-100 rounded-full flex items-center justify-center mx-auto mb-3">
            <Zap size={32} className="text-amber-600" />
          </div>
          <p className="text-slate-600 font-medium">Aucune automation</p>
          <p className="text-sm text-slate-500 mt-1">Créez votre première automation!</p>
        </div>
      ) : (
        <div className="space-y-2">
          {automations.map((automation) => (
            <div
              key={automation.id}
              className="group p-4 bg-slate-50 rounded-lg hover:bg-slate-100 transition-colors"
            >
              <div className="flex items-start justify-between mb-2">
                <div className="flex-1">
                  <div className="flex items-center gap-2">
                    <h4 className="font-medium text-slate-900">{automation.name}</h4>
                    {automation.is_active && (
                      <span className="px-2 py-0.5 bg-emerald-100 text-emerald-700 text-xs rounded-full font-medium">
                        Actif
                      </span>
                    )}
                  </div>
                  {automation.description && (
                    <p className="text-sm text-slate-500 mt-1">{automation.description}</p>
                  )}
                </div>
                <div className="flex items-center gap-1">
                  <button
                    onClick={() => handleToggle(automation.id, automation.is_active)}
                    className={`p-2 rounded-lg transition-colors ${
                      automation.is_active
                        ? 'text-amber-600 hover:bg-amber-50'
                        : 'text-slate-400 hover:bg-slate-200'
                    }`}
                  >
                    {automation.is_active ? <Pause size={16} /> : <Play size={16} />}
                  </button>
                  <button
                    onClick={() => handleDelete(automation.id)}
                    className="p-2 text-red-600 hover:bg-red-50 rounded-lg transition-colors opacity-0 group-hover:opacity-100"
                  >
                    <Trash2 size={16} />
                  </button>
                </div>
              </div>

              <div className="flex items-center gap-4 text-xs text-slate-500">
                <span className="flex items-center gap-1">
                  <Settings size={12} />
                  {automation.trigger_type}
                </span>
                {automation.run_count > 0 && (
                  <span>Exécuté {automation.run_count} fois</span>
                )}
                {automation.last_run_at && (
                  <span>
                    Dernière: {new Date(automation.last_run_at).toLocaleDateString('fr-FR')}
                  </span>
                )}
              </div>
            </div>
          ))}
        </div>
      )}

      <div className="mt-4 pt-4 border-t border-slate-200 text-center">
        <p className="text-xs text-slate-500">
          Gagnez du temps avec des workflows automatisés
        </p>
      </div>
    </div>
  );
};
