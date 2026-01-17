import React, { createContext, useContext, useState, ReactNode } from 'react';
import { crisisData, healthyData, emptyStateData, realModeData, AppState } from '../data/mockData';
import { Integration, integrationsList } from '../data/integrations';
import { Issue, mockIssues } from '../types/issues';
import { getIssueForTool } from '../data/toolIssues';

interface AppContextType {
  isAuthenticated: boolean;
  login: (email: string, password: string) => Promise<void>;
  logout: () => void;
  isDemoMode: boolean;
  toggleDemoMode: () => void;
  appState: AppState;
  applyFix: (alertId: number) => Promise<void>;
  isApplyingFix: boolean;
  fixingAlertId: number | null;
  integrations: Integration[];
  connectIntegration: (id: string) => Promise<void>;
  disconnectIntegration: (id: string) => void;
  connectingId: string | null;
  showToast: (message: string, type: 'success' | 'error' | 'info') => void;
  toast: { message: string; type: 'success' | 'error' | 'info' } | null;
  issues: Issue[];
  executeIssueFix: (issueId: string, pointsReward: number) => Promise<void>;
  isExecutingFix: boolean;
  healthScore: number;
  scoreIncreased: boolean;
}

const AppContext = createContext<AppContextType | undefined>(undefined);

export const AppProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [isDemoMode, setIsDemoMode] = useState(true);
  const [appState, setAppState] = useState<AppState>(crisisData);
  const [isApplyingFix, setIsApplyingFix] = useState(false);
  const [fixingAlertId, setFixingAlertId] = useState<number | null>(null);
  const [fixedAlerts, setFixedAlerts] = useState<Set<number>>(new Set());
  const [integrations, setIntegrations] = useState<Integration[]>(integrationsList);
  const [connectingId, setConnectingId] = useState<string | null>(null);
  const [toast, setToast] = useState<{ message: string; type: 'success' | 'error' | 'info' } | null>(null);
  const [issues, setIssues] = useState<Issue[]>(mockIssues);
  const [isExecutingFix, setIsExecutingFix] = useState(false);
  const [healthScore, setHealthScore] = useState(64);
  const [scoreIncreased, setScoreIncreased] = useState(false);

  const showToast = (message: string, type: 'success' | 'error' | 'info') => {
    setToast({ message, type });
    setTimeout(() => setToast(null), 3000);
  };

  const login = async (email: string, password: string) => {
    await new Promise((resolve) => setTimeout(resolve, 1000));
    setIsAuthenticated(true);
    showToast('Successfully logged in!', 'success');
  };

  const logout = () => {
    setIsAuthenticated(false);
    showToast('Logged out successfully', 'info');
  };

  const toggleDemoMode = () => {
    setIsDemoMode((prev) => {
      const newMode = !prev;
      if (newMode) {
        setAppState(crisisData);
        setFixedAlerts(new Set());
        setIssues(mockIssues);
        setHealthScore(64);
      } else {
        setAppState(realModeData);
        setIssues([]);
        setHealthScore(50);
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
    showToast(`AI Fix applied successfully!`, 'success');
  };

  const connectIntegration = async (id: string) => {
    setConnectingId(id);
    await new Promise((resolve) => setTimeout(resolve, 1500));

    setIntegrations((prev) =>
      prev.map((int) =>
        int.id === id ? { ...int, connected: true } : int
      )
    );

    const integration = integrations.find((int) => int.id === id);
    if (integration) {
      showToast(`Successfully connected to ${integration.name}`, 'success');

      const toolIssue = getIssueForTool(id);
      if (toolIssue && !issues.find((i) => i.id === toolIssue.id)) {
        setIssues((prev) => [toolIssue, ...prev]);

        setAppState((prev) => ({
          ...prev,
          logs: [
            `> [System] Connected to ${integration.name}`,
            `> Scanning data from ${integration.name}...`,
            `> [Alert] Issue detected: ${toolIssue.title}`,
            ...prev.logs,
          ],
        }));
      } else {
        setAppState((prev) => ({
          ...prev,
          logs: [
            `> [System] Connected to ${integration.name}`,
            `> Scanning data from ${integration.name}...`,
            ...prev.logs,
          ],
        }));
      }
    }

    setConnectingId(null);
  };

  const disconnectIntegration = (id: string) => {
    setIntegrations((prev) =>
      prev.map((int) =>
        int.id === id ? { ...int, connected: false } : int
      )
    );

    const integration = integrations.find((int) => int.id === id);
    if (integration) {
      const toolIssue = getIssueForTool(id);
      if (toolIssue) {
        setIssues((prev) => prev.filter((issue) => issue.id !== toolIssue.id));
      }

      showToast(`Disconnected from ${integration.name}`, 'info');
    }
  };

  const executeIssueFix = async (issueId: string, pointsReward: number) => {
    setIsExecutingFix(true);

    await new Promise((resolve) => setTimeout(resolve, 2000));

    setIssues((prev) =>
      prev.map((issue) =>
        issue.id === issueId ? { ...issue, resolved: true } : issue
      )
    );

    const newHealthScore = healthScore + pointsReward;
    setHealthScore(newHealthScore);

    setScoreIncreased(true);
    setTimeout(() => setScoreIncreased(false), 1500);

    setAppState((prev) => ({
      ...prev,
      logs: [
        `> [AI Agent] Successfully resolved: ${issues.find((i) => i.id === issueId)?.title}`,
        `> Health score increased by +${pointsReward} points`,
        `> New health score: ${newHealthScore}%`,
        ...prev.logs,
      ],
    }));

    setIsExecutingFix(false);
    showToast(`Issue resolved! Health score +${pointsReward}`, 'success');
  };

  return (
    <AppContext.Provider
      value={{
        isAuthenticated,
        login,
        logout,
        isDemoMode,
        toggleDemoMode,
        appState,
        applyFix,
        isApplyingFix,
        fixingAlertId,
        integrations,
        connectIntegration,
        disconnectIntegration,
        connectingId,
        showToast,
        toast,
        issues,
        executeIssueFix,
        isExecutingFix,
        healthScore,
        scoreIncreased,
      }}
    >
      {children}
    </AppContext.Provider>
  );
};

export const useApp = (): AppContextType => {
  const context = useContext(AppContext);
  if (!context) {
    throw new Error('useApp must be used within an AppProvider');
  }
  return context;
};
