import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { GlobalProvider } from './context/GlobalContext';
import { AppProvider } from './context/AppContext';
import { AuthProvider, useAuth } from './context/AuthContext';
import { LandingPage } from './pages/LandingPage';
import { Login } from './pages/Login';
import { RoleSelection } from './pages/RoleSelection';
import { SelectTeam } from './pages/SelectTeam';
import { Dashboard } from './components/Dashboard';
import { EmployeeDashboard } from './pages/EmployeeDashboard';
import { EmployeeDashboardV2 } from './pages/EmployeeDashboardV2';
import EmployeeAdvancedFeatures from './pages/EmployeeAdvancedFeatures';
import { ManagerDashboard } from './pages/ManagerDashboard';
import { ManagerSettings } from './pages/ManagerSettings';
import RequestCenter from './pages/RequestCenter';
import { Connections } from './pages/Connections';
import { ActivityLogs } from './pages/ActivityLogs';
import { Settings } from './pages/Settings';
import { Teams } from './pages/Teams';
import { MyTeamV2 } from './pages/MyTeamV2';
import { MyRequests } from './pages/MyRequests';
import RequestCenterV2 from './pages/RequestCenterV2';
import { UpdatedSidebar } from './components/layout/UpdatedSidebar';
import { TopBar } from './components/layout/TopBar';
import { Toast } from './components/common/Toast';
import { CommandPalette } from './components/common/CommandPalette';
import { ManagerRouteGuard } from './components/guards/ManagerRouteGuard';
import { motion } from 'framer-motion';

function ProtectedRoute({ children }: { children: React.ReactNode }) {
  const { user, loading } = useAuth();

  if (loading) {
    return (
      <div className="min-h-screen bg-slate-950 flex items-center justify-center">
        <div className="text-white">Loading...</div>
      </div>
    );
  }

  if (!user) {
    return <Navigate to="/login" replace />;
  }

  return <>{children}</>;
}

function ManagerProtectedRoute({ children }: { children: React.ReactNode }) {
  const { user, profile, loading } = useAuth();

  if (loading) {
    return (
      <div className="min-h-screen bg-slate-950 flex items-center justify-center">
        <div className="text-white">Loading...</div>
      </div>
    );
  }

  if (!user) {
    return <Navigate to="/login" replace />;
  }

  if (profile?.role !== 'manager') {
    return <Navigate to="/app" replace />;
  }

  return <>{children}</>;
}

function EmployeeProtectedRoute({ children }: { children: React.ReactNode }) {
  const { user, profile, loading } = useAuth();

  if (loading) {
    return (
      <div className="min-h-screen bg-slate-950 flex items-center justify-center">
        <div className="text-white">Loading...</div>
      </div>
    );
  }

  if (!user) {
    return <Navigate to="/login" replace />;
  }

  if (profile?.role === 'manager') {
    return <Navigate to="/manager" replace />;
  }

  return <>{children}</>;
}

function AppLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="flex h-screen bg-slate-950 text-white overflow-hidden">
      <UpdatedSidebar />
      <div className="flex-1 flex flex-col overflow-hidden">
        <TopBar />
        <main className="flex-1 overflow-y-auto p-6">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.2 }}
          >
            {children}
          </motion.div>
        </main>
      </div>
      <CommandPalette />
      <Toast />
    </div>
  );
}

function App() {
  return (
    <BrowserRouter>
      <AuthProvider>
        <GlobalProvider>
          <AppProvider>
            <Routes>
              <Route path="/" element={<LandingPage />} />
              <Route path="/login" element={<Login />} />
              <Route path="/role-selection" element={<RoleSelection />} />
              <Route path="/select-team" element={<SelectTeam />} />
              <Route
                path="/manager/:teamSlug"
                element={
                  <ManagerRouteGuard>
                    <ManagerDashboard />
                  </ManagerRouteGuard>
                }
              />
              <Route
                path="/manager/:teamSlug/settings"
                element={
                  <ManagerRouteGuard>
                    <ManagerSettings />
                  </ManagerRouteGuard>
                }
              />
              <Route
                path="/manager/:teamSlug/requests"
                element={
                  <ManagerRouteGuard>
                    <RequestCenterV2 />
                  </ManagerRouteGuard>
                }
              />
              <Route
                path="/app"
                element={
                  <EmployeeProtectedRoute>
                    <AppLayout>
                      <EmployeeDashboardV2 />
                    </AppLayout>
                  </EmployeeProtectedRoute>
                }
              />
              <Route
                path="/app/connections"
                element={
                  <EmployeeProtectedRoute>
                    <AppLayout>
                      <Connections />
                    </AppLayout>
                  </EmployeeProtectedRoute>
                }
              />
              <Route
                path="/app/teams"
                element={
                  <EmployeeProtectedRoute>
                    <AppLayout>
                      <Teams />
                    </AppLayout>
                  </EmployeeProtectedRoute>
                }
              />
              <Route
                path="/app/my-team"
                element={
                  <EmployeeProtectedRoute>
                    <AppLayout>
                      <MyTeamV2 />
                    </AppLayout>
                  </EmployeeProtectedRoute>
                }
              />
              <Route
                path="/app/my-requests"
                element={
                  <EmployeeProtectedRoute>
                    <AppLayout>
                      <MyRequests />
                    </AppLayout>
                  </EmployeeProtectedRoute>
                }
              />
              <Route
                path="/app/activity"
                element={
                  <EmployeeProtectedRoute>
                    <AppLayout>
                      <ActivityLogs />
                    </AppLayout>
                  </EmployeeProtectedRoute>
                }
              />
              <Route
                path="/app/settings"
                element={
                  <EmployeeProtectedRoute>
                    <AppLayout>
                      <Settings />
                    </AppLayout>
                  </EmployeeProtectedRoute>
                }
              />
              <Route
                path="/app/advanced"
                element={
                  <EmployeeProtectedRoute>
                    <AppLayout>
                      <EmployeeAdvancedFeatures />
                    </AppLayout>
                  </EmployeeProtectedRoute>
                }
              />
            </Routes>
          </AppProvider>
        </GlobalProvider>
      </AuthProvider>
    </BrowserRouter>
  );
}

export default App;
