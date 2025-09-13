import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { GalleryPage } from './pages/GalleryPage';
import { EditPage } from './pages/EditPage';
import { ResultPage } from './pages/ResultPage';
import { Header } from './components/Header';
import { ToastProvider } from './components/ui/Toaster';
import { PageTransition } from './components/PageTransition';

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 5 * 60 * 1000, // 5 minutes
      retry: 1,
    },
  },
});

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <ToastProvider>
        <Router>
          <div className="min-h-screen bg-gray-50">
            <Header />
            <main>
              <PageTransition>
                <Routes>
                  <Route path="/" element={<GalleryPage />} />
                  <Route path="/edit/:templateId" element={<EditPage />} />
                  <Route path="/result" element={<ResultPage />} />
                </Routes>
              </PageTransition>
            </main>
          </div>
        </Router>
      </ToastProvider>
    </QueryClientProvider>
  );
}

export default App;
