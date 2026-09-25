import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { BrowserRouter } from 'react-router-dom';
import App from './App.tsx';
import { AuthProvider } from './context/AuthContext.tsx';
import './index.css';

const queryClient = new QueryClient();

// A scanned attendance QR opens /?attend=<token>. Keep the token across the
// login redirect; the student Home page submits it once signed in.
const attendToken = new URLSearchParams(window.location.search).get('attend');
if (attendToken) {
  try {
    sessionStorage.setItem('pendingAttendToken', attendToken);
  } catch {
    // storage unavailable — student can still enter the token manually
  }
}

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <QueryClientProvider client={queryClient}>
      <BrowserRouter>
        <AuthProvider>
          <App />
        </AuthProvider>
      </BrowserRouter>
    </QueryClientProvider>
  </StrictMode>,
);
