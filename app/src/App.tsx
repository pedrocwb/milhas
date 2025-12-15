import { useState } from 'react';
import { AppProvider } from './context/AppContext';
import { Layout } from './components/Layout';
import { Dashboard, People, Miles, Beneficiaries, Sales } from './pages';

type Page = 'dashboard' | 'people' | 'miles' | 'beneficiaries' | 'sales';

function App() {
  const [currentPage, setCurrentPage] = useState<Page>('dashboard');

  const renderPage = () => {
    switch (currentPage) {
      case 'dashboard':
        return <Dashboard />;
      case 'people':
        return <People />;
      case 'miles':
        return <Miles />;
      case 'beneficiaries':
        return <Beneficiaries />;
      case 'sales':
        return <Sales />;
      default:
        return <Dashboard />;
    }
  };

  return (
    <AppProvider>
      <Layout currentPage={currentPage} onNavigate={(page) => setCurrentPage(page as Page)}>
        {renderPage()}
      </Layout>
    </AppProvider>
  );
}

export default App;
