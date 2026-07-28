import { Routes, Route, Navigate } from 'react-router-dom';
import { Layout } from './pages/Layout';
import { AuthPage } from './pages/AuthPage';
import { DashboardPage } from './pages/DashboardPage';
import { ProjectDetailsPage } from './pages/ProjectDetailsPage';
import { ProfilePage } from './pages/ProfilePage';
import { CreateProjectPage } from './pages/CreateProjectPage';
import { EditProjectPage } from './pages/EditProjectPage';
import { MyProjectsPage } from './pages/MyProjectsPage';
import { UserProfilePage } from './pages/UserProfilePage';
import { HomePage } from './pages/HomePage';
import { WorkspacePage } from './pages/WorkspacePage';
import { ProtectedRoute } from './components/common/ProtectedRoute';

import { Toaster } from 'sonner';

function App() {
  return (
    <>
      <Toaster theme="dark" position="top-right" />
      <Routes>
        <Route path="/login" element={<AuthPage mode="login" />} />
        <Route path="/register" element={<AuthPage mode="register" />} />
        
        <Route path="/" element={<HomePage />} />
        
        <Route element={<ProtectedRoute />}>
          <Route element={<Layout />}>
            <Route path="/discover" element={<DashboardPage />} />
            <Route path="/projects/new" element={<CreateProjectPage />} />
            <Route path="/projects/:id" element={<ProjectDetailsPage />} />
            <Route path="/projects/:id/workspace" element={<WorkspacePage />} />
            <Route path="/projects/:id/edit" element={<EditProjectPage />} />
            <Route path="/my-projects" element={<MyProjectsPage />} />
            <Route path="/profile" element={<ProfilePage />} />
            <Route path="/users/:id" element={<UserProfilePage />} />
          </Route>
        </Route>
        
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </>
  );
}

export default App;
