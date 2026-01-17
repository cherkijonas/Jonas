import React, { createContext, useContext, useState, ReactNode } from 'react';
import { crisisData, healthyData, emptyStateData, AppState, Alert } from '../data/mockData';

interface DemoContextType {
  isDemoMode: boolean;
  toggleDemoMode: () => void;
  appState: AppState;
  applyFix: (alertId: number) => Promise<void>;
  isApplyingFix: boolean;
  fixingAlertId: number | null;
}

const DemoContext = createContext<DemoContextType | undefined>(undefined);

export const DemoProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [isDemoMode, setIsDemoMode] = useState(true);
  const [appState, setAppState] = useState<AppState>(crisisData);
  const [isApplyingFix, setIsApplyingFix] = useState(false);
  const [fixingAlertId, setFixingAlertId] = useState<number | null>(null);
  const [fixedAlerts, setFixedAlerts] = useState<Set<number>>(new Set());

  const toggleDemoMode = () => {
    setIsDemoMode((prev) => {
      const newMode = !prev;
      if (newMode) {
        setAppState(crisisData);
        setFixedAlerts(new Set());
      } else {
        setAppState(emptyStateData);
      }
      return newMode;
    });
  };

  const applyFix = async (alertId: number) => {
    setIsApplyingFix(true);
    setFixingAlertId(alertId);

    await new Promise((resolve) => setTimeout(resolve, 2000));

    setFixedAlerts((prev) => new Set(prev).add(alertId));

    const remainingAlerts = appState.alerts.filter((alert) => alert.id !== alertId);
    const totalAlerts = crisisData.alerts.length;
    const fixedCount = fixedAlerts.size + 1;
    const progressRatio = fixedCount / totalAlerts;

    const newHealthScore = Math.round(34 + (89 - 34) * progressRatio);
    const newMoneyWasted = Math.max(0, Math.round(4250 * (1 - progressRatio)));
    const newStalledTickets = Math.max(1, Math.round(12 * (1 - progressRatio)));
    const newAvgResponseTime = Math.max(1.2, 4.8 - (4.8 - 1.2) * progressRatio);
    const newClientSatisfaction = Math.round(62 + (94 - 62) * progressRatio);

    const interpolateVelocityData = () => {
      return crisisData.metrics.velocityData.map((crisis, index) => {
        const healthy = healthyData.metrics.velocityData[index];
        return {
          date: crisis.date,
          completed: Math.round(crisis.completed + (healthy.completed - crisis.completed) * progressRatio),
          target: crisis.target,
        };
      });
    };

    setAppState({
      ...appState,
      metrics: {
        ...appState.metrics,
        healthScore: newHealthScore,
        moneyWasted: newMoneyWasted,
        ticketsStalled: newStalledTickets,
        avgResponseTime: parseFloat(newAvgResponseTime.toFixed(1)),
        clientSatisfaction: newClientSatisfaction,
        velocityData: interpolateVelocityData(),
      },
      alerts: remainingAlerts.length > 0 ? remainingAlerts : healthyData.alerts,
      integrations: progressRatio >= 0.8 ? healthyData.integrations : appState.integrations,
      logs: progressRatio >= 0.8 ? healthyData.logs : [
        ...appState.logs,
        `> AI Fix applied to Alert #${alertId}`,
        `> Health score improved to ${newHealthScore}%`,
      ],
    });

    setIsApplyingFix(false);
    setFixingAlertId(null);
  };

  return (
    <DemoContext.Provider
      value={{
        isDemoMode,
        toggleDemoMode,
        appState,
        applyFix,
        isApplyingFix,
        fixingAlertId,
      }}
    >
      {children}
    </DemoContext.Provider>
  );
};

export const useDemo = (): DemoContextType => {
  const context = useContext(DemoContext);
  if (!context) {
    throw new Error('useDemo must be used within a DemoProvider');
  }
  return context;
};
