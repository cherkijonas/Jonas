import { createContext, useContext, useState, ReactNode, useEffect, useMemo } from 'react';
import { enterpriseIntegrations, type EnterpriseIntegration } from '../data/enterpriseIntegrations';
import { Issue } from '../types/issues';
import { issuesService } from '../services/issuesService';
import { activityService } from '../services/activityService';
import { integrationsService } from '../services/integrationsService';
import { useAuth } from './AuthContext';

export type UserRole = 'Manager' | 'Employee';
export type Language = 'fr' | 'en';

interface UserProfile {
  name: string;
  email: string;
  role: UserRole;
  avatar?: string;
  language: Language;
  timezone: string;
}

type Integration = EnterpriseIntegration;

interface Notification {
  id: string;
  title: string;
  message: string;
  timestamp: string;
  read: boolean;
  type: 'info' | 'warning' | 'success' | 'error';
}

interface AIConfig {
  blockageSensitivity: number;
  zombieTaskDelay: number;
  analyzeProductivity: boolean;
  analyzeCommunication: boolean;
  analyzeCalendars: boolean;
}

interface EthicsConfig {
  maskSensitiveData: boolean;
  disconnectionMode: boolean;
  noAnalysisStart: string;
  noAnalysisEnd: string;
  blacklistTags: string[];
}

interface NotificationsConfig {
  weeklyReport: boolean;
  criticalAlerts: boolean;
  minorAlerts: boolean;
}

interface ActivityFeedItem {
  id: string;
  type: 'scan' | 'trend' | 'win' | 'note';
  message: string;
  tool?: string;
  timestamp: string;
}

interface GlobalContextType {
  isAuthenticated: boolean;
  userProfile: UserProfile;
  integrations: Integration[];
  notifications: Notification[];
  aiConfig: AIConfig;
  ethicsConfig: EthicsConfig;
  notificationsConfig: NotificationsConfig;
  connectingIntegrationId: string | null;
  healthScore: number;
  connectedTools: Integration[];
  visibleIssues: Issue[];
  activityFeed: ActivityFeedItem[];
  resolvedIssues: Set<string>;
  login: (email: string, password: string) => void;
  logout: () => void;
  updateProfile: (updates: Partial<UserProfile>) => void;
  toggleIntegration: (id: string) => Promise<void>;
  resolveIssue: (issueId: string, pointsReward: number) => void;
  markNotificationRead: (id: string) => void;
  markAllNotificationsRead: () => void;
  updateAIConfig: (config: Partial<AIConfig>) => void;
  updateEthicsConfig: (config: Partial<EthicsConfig>) => void;
  updateNotificationsConfig: (config: Partial<NotificationsConfig>) => void;
}

const GlobalContext = createContext<GlobalContextType | undefined>(undefined);

export const GlobalProvider = ({ children }: { children: ReactNode }) => {
  const { teamId, user, profile } = useAuth();
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [userProfile, setUserProfile] = useState<UserProfile>({
    name: '',
    email: '',
    role: 'Employee',
    language: 'fr',
    timezone: 'Europe/Paris (GMT+1)',
  });

  useEffect(() => {
    if (user && profile) {
      const displayName = profile.full_name ||
                         user.user_metadata?.full_name ||
                         user.email?.split('@')[0] ||
                         'Utilisateur';

      setUserProfile({
        name: displayName,
        email: user.email || '',
        role: profile.role === 'manager' ? 'Manager' : 'Employee',
        language: 'fr',
        timezone: 'Europe/Paris (GMT+1)',
      });
      setIsAuthenticated(true);

      console.log('User profile loaded:', {
        name: displayName,
        email: user.email,
        role: profile.role
      });
    } else {
      setIsAuthenticated(false);
    }
  }, [user, profile]);

  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [resolvedIssues, setResolvedIssues] = useState<Set<string>>(new Set());
  const [dbIssues, setDbIssues] = useState<any[]>([]);
  const [dbIntegrations, setDbIntegrations] = useState<any[]>([]);

  const allIntegrations = useMemo(() => {
    return enterpriseIntegrations.map(int => {
      const dbInt = dbIntegrations.find(db => db.tool_name === int.name);
      return {
        ...int,
        connected: dbInt?.status === 'connected',
        lastSync: dbInt?.last_sync
      };
    });
  }, [dbIntegrations]);

  const [aiConfig, setAIConfig] = useState<AIConfig>({
    blockageSensitivity: 70,
    zombieTaskDelay: 7,
    analyzeProductivity: true,
    analyzeCommunication: true,
    analyzeCalendars: false,
  });

  const [ethicsConfig, setEthicsConfig] = useState<EthicsConfig>({
    maskSensitiveData: true,
    disconnectionMode: true,
    noAnalysisStart: '19:00',
    noAnalysisEnd: '08:00',
    blacklistTags: ['#perso', '#pause', 'Salaire'],
  });

  const [notificationsConfig, setNotificationsConfig] = useState<NotificationsConfig>({
    weeklyReport: true,
    criticalAlerts: true,
    minorAlerts: false,
  });

  useEffect(() => {
    if (user) {
      loadIntegrations();
      if (teamId) {
        loadIssues();
      }
    }
  }, [teamId, user]);

  const loadIssues = async () => {
    if (!teamId) return;
    try {
      const issues = await issuesService.getIssues(teamId);
      setDbIssues(issues);
    } catch (error) {
      console.error('Error loading issues:', error);
    }
  };

  const loadIntegrations = async () => {
    if (!user) return;
    try {
      const integs = await integrationsService.getIntegrations(teamId, user.id);
      console.log('Integrations loaded:', integs);
      setDbIntegrations(integs);
    } catch (error) {
      console.error('Error loading integrations:', error);
    }
  };

  const login = (email: string, _password: string) => {
    const role: UserRole = email.toLowerCase().includes('admin') ? 'Manager' : 'Employee';
    setUserProfile({
      name: role === 'Manager' ? 'John Doe' : 'Marie Martin',
      email,
      role,
      language: 'fr',
      timezone: 'Europe/Paris (GMT+1)',
    });
    setIsAuthenticated(true);
  };

  const logout = () => {
    setIsAuthenticated(false);
    setUserProfile({
      name: '',
      email: '',
      role: 'Employee',
      language: 'fr',
      timezone: 'Europe/Paris (GMT+1)',
    });
  };

  const updateProfile = (updates: Partial<UserProfile>) => {
    setUserProfile(prev => ({ ...prev, ...updates }));
  };

  const [connectingIntegrationId, setConnectingIntegrationId] = useState<string | null>(null);

  const connectedTools = useMemo(() => {
    const connectedToolNames = dbIntegrations
      .filter(int => int.status === 'connected')
      .map(int => int.tool_name);

    return enterpriseIntegrations
      .filter(int => connectedToolNames.includes(int.name))
      .map(int => ({
        ...int,
        connected: true,
        lastSync: dbIntegrations.find(db => db.tool_name === int.name)?.last_sync
      }));
  }, [dbIntegrations]);

  const visibleIssues = useMemo(() => {
    return dbIssues.map(issue => ({
      id: issue.id,
      title: issue.title,
      description: issue.description,
      impact: issue.severity === 'critical' ? 'high' : issue.severity === 'high' ? 'high' : issue.severity === 'medium' ? 'medium' : 'low',
      sourceTool: issue.tool,
      detectedAt: new Date(issue.detected_at).toLocaleDateString(),
      category: 'Technique',
      resolved: issue.status === 'resolved',
      assignedTo: issue.profiles?.full_name,
      metadata: issue.metadata
    }));
  }, [dbIssues]);

  const activityFeed = useMemo((): ActivityFeedItem[] => {
    if (connectedTools.length === 0) {
      return [];
    }

    const feed: ActivityFeedItem[] = [];
    const issuesMap = new Map(visibleIssues.map(issue => [issue.sourceTool, issue]));

    connectedTools.forEach((tool, index) => {
      const hasIssue = issuesMap.has(tool.name);
      const baseTime = Date.now() - (index * 3 * 60 * 1000);
      const timeAgo = Math.floor((Date.now() - baseTime) / 60000);

      if (hasIssue) {
        feed.push({
          id: `scan-${tool.id}`,
          type: 'scan',
          message: `Scan ${tool.name} terminé. 1 anomalie détectée.`,
          tool: tool.name,
          timestamp: `Il y a ${timeAgo} min`
        });
      } else {
        feed.push({
          id: `scan-ok-${tool.id}`,
          type: 'win',
          message: `Scan ${tool.name} terminé. 0 anomalies détectées.`,
          tool: tool.name,
          timestamp: `Il y a ${timeAgo} min`
        });
      }
    });

    return feed;
  }, [connectedTools, visibleIssues]);

  const healthScore = useMemo(() => {
    if (connectedTools.length === 0) {
      return 0;
    }

    const activeIssues = visibleIssues.filter(issue => !issue.resolved);
    const baseScore = 50;
    const issuesPenalty = activeIssues.length * 10;
    const resolvedBonus = resolvedIssues.size * 5;

    return Math.min(100, Math.max(0, baseScore - issuesPenalty + resolvedBonus));
  }, [connectedTools, visibleIssues, resolvedIssues]);

  const resolveIssue = async (issueId: string, pointsReward: number) => {
    if (teamId && user) {
      try {
        await issuesService.resolveIssue(issueId);
        await activityService.logActivity(teamId, user.id, 'resolved', 'issue', issueId, {
          points_reward: pointsReward
        });
        await loadIssues();
      } catch (error) {
        console.error('Error resolving issue:', error);
      }
    }
  };

  const toggleIntegration = async (id: string) => {
    setConnectingIntegrationId(id);

    if (!user) {
      console.error('No user logged in');
      setConnectingIntegrationId(null);
      return;
    }

    try {
      const integration = enterpriseIntegrations.find(int => int.id === id);
      if (!integration) {
        console.error('Integration not found:', id);
        setConnectingIntegrationId(null);
        return;
      }

      console.log('Toggling integration:', {
        integrationName: integration.name,
        teamId,
        userId: user.id
      });

      const existing = await integrationsService.getIntegrationByTool(integration.name, teamId, user.id);

      console.log('Existing integration:', existing);

      if (existing && existing.status === 'connected') {
        console.log('Disconnecting integration...');
        await integrationsService.disconnectIntegration(integration.name, teamId, user.id);
        if (teamId) {
          await activityService.logActivity(teamId, user.id, 'disconnected', 'integration', existing.id, {
            tool_name: integration.name
          });
        }
      } else {
        console.log('Connecting integration...');
        const result = await integrationsService.connectIntegration(integration.name, {}, teamId, user.id);
        console.log('Integration connected:', result);

        if (teamId) {
          await activityService.logActivity(teamId, user.id, 'connected', 'integration', null, {
            tool_name: integration.name
          });
        }
      }

      await loadIntegrations();
    } catch (error) {
      console.error('Error toggling integration:', error);
      if (error instanceof Error) {
        console.error('Error details:', error.message);
      }
    }

    setConnectingIntegrationId(null);
  };

  const markNotificationRead = (id: string) => {
    setNotifications(prev => prev.map(notif =>
      notif.id === id ? { ...notif, read: true } : notif
    ));
  };

  const markAllNotificationsRead = () => {
    setNotifications(prev => prev.map(notif => ({ ...notif, read: true })));
  };

  const updateAIConfig = (config: Partial<AIConfig>) => {
    setAIConfig(prev => ({ ...prev, ...config }));
  };

  const updateEthicsConfig = (config: Partial<EthicsConfig>) => {
    setEthicsConfig(prev => ({ ...prev, ...config }));
  };

  const updateNotificationsConfig = (config: Partial<NotificationsConfig>) => {
    setNotificationsConfig(prev => ({ ...prev, ...config }));
  };

  return (
    <GlobalContext.Provider
      value={{
        isAuthenticated,
        userProfile,
        integrations: allIntegrations,
        notifications,
        aiConfig,
        ethicsConfig,
        notificationsConfig,
        connectingIntegrationId,
        healthScore,
        connectedTools,
        visibleIssues,
        activityFeed,
        resolvedIssues,
        login,
        logout,
        updateProfile,
        toggleIntegration,
        resolveIssue,
        markNotificationRead,
        markAllNotificationsRead,
        updateAIConfig,
        updateEthicsConfig,
        updateNotificationsConfig,
      }}
    >
      {children}
    </GlobalContext.Provider>
  );
};

export const useGlobal = () => {
  const context = useContext(GlobalContext);
  if (!context) {
    throw new Error('useGlobal must be used within GlobalProvider');
  }
  return context;
};
