import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import { BrowserRouter } from 'react-router';
import App from './App.tsx';
import './index.css';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';

const client = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 1000 * 60 * 5,
      refetchOnWindowFocus: false,
      retry: 5,
    },
  },
});

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <BrowserRouter>
      <QueryClientProvider client={client}>
        <App />
        <div id="portal" className="my-4" />
      </QueryClientProvider>
    </BrowserRouter>
  </StrictMode>,
);
