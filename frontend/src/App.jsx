import { Routes, Route, Navigate } from 'react-router-dom';
import { Layout } from './pages/Layout';
import { AuthPage } from './pages/AuthPage';
import { DashboardPage } from './pages/DashboardPage';
import { ProjectDetailsPage } from './pages/ProjectDetailsPage';
import { ProfilePage } from './pages/ProfilePage';
import { CreateProjectPage } from './pages/CreateProjectPage';

function App() {
  return (
    <Routes>
      <Route path="/login" element={<AuthPage mode="login" />} />
      <Route path="/register" element={<AuthPage mode="register" />} />
      
      <Route path="/" element={<Layout />}>
        <Route index element={<DashboardPage />} />
        <Route path="projects/new" element={<CreateProjectPage />} />
        <Route path="projects/:id" element={<ProjectDetailsPage />} />
        <Route path="profile" element={<ProfilePage />} />
      </Route>
      
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  );
}

export default App;
