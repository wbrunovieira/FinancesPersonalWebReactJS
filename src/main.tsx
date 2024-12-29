import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';

import './index.css';
import App from './App';
import {
  BrowserRouter,
  Route,
  Routes,
} from 'react-router-dom';
import Statement from './components/Statement';
import Dashboard from './components/ Dashboard';

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<App />} />
        <Route path="/statement" element={<Statement />} />
        <Route path="/dashboard" element={<Dashboard />} />
      </Routes>
    </BrowserRouter>{' '}
  </StrictMode>
);
