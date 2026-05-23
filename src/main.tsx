import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import { createHashRouter, RouterProvider } from 'react-router-dom';
import App from './App';
import Home from './pages/Home';
import SampleDetail from './pages/SampleDetail';
import About from './pages/About';
import PlatformPage from './pages/PlatformPage';
import Community from './pages/Community';
import { AuthProvider } from './contexts/AuthContext';
import './styles/global.css';

const router = createHashRouter([
  {
    path: '/',
    element: <App />,
    children: [
      { index: true, element: <Home /> },
      { path: 'about', element: <About /> },
      { path: 'platform/:platform', element: <PlatformPage /> },
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
