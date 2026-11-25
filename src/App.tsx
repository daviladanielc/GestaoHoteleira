import { BrowserRouter, Routes, Route } from 'react-router-dom';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { Toaster } from 'sonner';
import { Header } from './components/Header';
import { PaginaMapaUHs } from './pages/PaginaMapaUHs';
import { PaginaDetalheUH } from './pages/PaginaDetalheUH';
import { PaginaCadastros } from './pages/PaginaCadastros';

const queryClient = new QueryClient();

export function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <BrowserRouter>
        <Toaster richColors position="top-right" />
        <div className="min-h-screen bg-slate-100 font-sans pb-12">
          <Header />
          <main className="max-w-5xl mx-auto px-4">
            <Routes>
              <Route path="/" element={<PaginaMapaUHs />} />
              <Route path="/uh/:numeroUH" element={<PaginaDetalheUH />} />
              <Route path="/cadastros" element={<PaginaCadastros />} />
            </Routes>
          </main>
        </div>
      </BrowserRouter>
    </QueryClientProvider>
  );
}

export default App;