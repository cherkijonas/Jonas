import React, { useState } from 'react';
import { FocusModeWidget } from '../components/employee/FocusModeWidget';
import { QuickWinsWidget } from '../components/employee/QuickWinsWidget';
import { TimeIntelligenceWidget } from '../components/employee/TimeIntelligenceWidget';
import { TimeHeatmapWidget } from '../components/employee/TimeHeatmapWidget';
import { AutomationsWidget } from '../components/employee/AutomationsWidget';
import { KnowledgeBaseWidget } from '../components/employee/KnowledgeBaseWidget';
import { WellnessWidget } from '../components/employee/WellnessWidget';
import { EnergyManagementWidget } from '../components/employee/EnergyManagementWidget';
import { SkillsGrowthWidget } from '../components/employee/SkillsGrowthWidget';
import { SmartCollaborationWidget } from '../components/employee/SmartCollaborationWidget';
import { UnifiedNotificationsWidget } from '../components/employee/UnifiedNotificationsWidget';
import { Zap, Clock, Workflow, BookOpen, Heart, Award, Users, Bell } from 'lucide-react';

export const EmployeeAdvancedFeatures: React.FC = () => {
  const [activeTab, setActiveTab] = useState<string>('productivity');

  const tabs = [
    { id: 'productivity', label: 'Productivité', icon: Zap },
    { id: 'time', label: 'Temps', icon: Clock },
    { id: 'automation', label: 'Automatisations', icon: Workflow },
    { id: 'knowledge', label: 'Connaissances', icon: BookOpen },
    { id: 'wellness', label: 'Bien-être', icon: Heart },
    { id: 'skills', label: 'Compétences', icon: Award },
    { id: 'collaboration', label: 'Collaboration', icon: Users },
    { id: 'notifications', label: 'Notifications', icon: Bell },
  ];

  return (
    <div className="max-w-7xl mx-auto">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-white mb-2">Fonctionnalités Avancées</h1>
        <p className="text-slate-400">Boostez votre productivité avec nos outils intelligents</p>
      </div>

      <div className="mb-6 overflow-x-auto">
        <div className="flex gap-2 min-w-max">
          {tabs.map((tab) => {
            const Icon = tab.icon;
            return (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`flex items-center gap-2 px-4 py-2 rounded-lg font-medium transition-all ${
                  activeTab === tab.id
                    ? 'bg-gradient-to-r from-blue-600 to-indigo-600 text-white shadow-lg'
                    : 'bg-white text-slate-600 hover:bg-slate-50 border border-slate-200'
                }`}
              >
                <Icon size={18} />
                {tab.label}
              </button>
            );
          })}
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {activeTab === 'productivity' && (
          <>
            <FocusModeWidget />
            <QuickWinsWidget />
            <EnergyManagementWidget />
          </>
        )}

        {activeTab === 'time' && (
          <>
            <TimeIntelligenceWidget />
            <TimeHeatmapWidget />
          </>
        )}

        {activeTab === 'automation' && (
          <>
            <AutomationsWidget />
          </>
        )}

        {activeTab === 'knowledge' && (
          <>
            <KnowledgeBaseWidget />
          </>
        )}

        {activeTab === 'wellness' && (
          <>
            <WellnessWidget />
            <EnergyManagementWidget />
          </>
        )}

        {activeTab === 'skills' && (
          <>
            <SkillsGrowthWidget />
          </>
        )}

        {activeTab === 'collaboration' && (
          <>
            <SmartCollaborationWidget />
          </>
        )}

        {activeTab === 'notifications' && (
          <>
            <UnifiedNotificationsWidget />
          </>
        )}
      </div>
    </div>
  );
};

export default EmployeeAdvancedFeatures;
