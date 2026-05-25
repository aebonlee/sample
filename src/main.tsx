import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import { createHashRouter, RouterProvider } from 'react-router-dom';
import App from './App';
import Home from './pages/Home';
import SampleDetail from './pages/SampleDetail';
import About from './pages/About';
import PlatformPage from './pages/PlatformPage';
import Community from './pages/Community';
import Projects from './pages/Projects';
import ProjectGuide from './pages/ProjectGuide';
import ProjectBuild from './pages/ProjectBuild';
import KoreatechProjects from './pages/KoreatechProjects';
import Preview from './pages/Preview';
import { AuthProvider } from './contexts/AuthContext';
import './styles/global.css';

const router = createHashRouter([
  {
    path: '/preview/:id',
    element: <Preview />,
  },
  {
    path: '/',
    element: <App />,
    children: [
      { index: true, element: <Home /> },
      { path: 'about', element: <About /> },
      { path: 'platform/:platform', element: <PlatformPage /> },
      { path: 'projects', element: <Projects /> },
      { path: 'projects/:id', element: <ProjectGuide /> },
      { path: 'projects/:id/build', element: <ProjectBuild /> },
      { path: 'projects-koreatech', element: <KoreatechProjects /> },
      { path: 'projects-koreatech/:id', element: <KoreatechProjects /> },
      { path: 'community', element: <Community /> },
      { path: 'samples/:id', element: <SampleDetail /> },
    ],
  },
]);

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <AuthProvider>
      <RouterProvider router={router} />
    </AuthProvider>
  </StrictMode>,
);
