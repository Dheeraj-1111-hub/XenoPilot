import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { AppShell } from './components/app-shell';
import Dashboard from './pages/dashboard';
import AIStudio from './pages/ai-studio';
import Customers from './pages/customers';
import Segments from './pages/segments';
import Campaigns from './pages/campaigns';
import Analytics from './pages/analytics';

import { Toaster } from 'sonner';

function App() {
  return (
    <BrowserRouter>
      <AppShell>
        <Routes>
          <Route path="/" element={<Dashboard />} />
          <Route path="/ai-studio" element={<AIStudio />} />
          <Route path="/customers" element={<Customers />} />
          <Route path="/segments" element={<Segments />} />
          <Route path="/campaigns" element={<Campaigns />} />
          <Route path="/analytics" element={<Analytics />} />
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </AppShell>
      <Toaster theme="dark" position="bottom-right" toastOptions={{ style: { background: '#050505', border: '1px solid rgba(255,255,255,0.1)', color: '#fff' } }} />
    </BrowserRouter>
  );
}

export default App;
