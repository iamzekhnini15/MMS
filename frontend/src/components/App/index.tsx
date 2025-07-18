import { Outlet } from 'react-router-dom';
import { useContext, useState } from 'react';
import Navbar from '../Navbar';
import { AppSidebar } from '../app-sidebar';
import { UserContext } from '@/contexts/UserContext';
import { SidebarProvider } from '@/components/ui/sidebar';
import { Separator } from '@/components/ui/separator';

const App = () => {
  const [activeMenuItem, setActiveMenuItem] = useState('dashboard');
  const { authenticatedUser } = useContext(UserContext);

  // Vérifie si l'utilisateur est admin
  const isAdmin = authenticatedUser?.user.role === 'ADMIN';

  return (
    <SidebarProvider>
      <div className="flex h-screen overflow-hidden w-full">
        {/* Sidebar si admin */}
        {isAdmin && <AppSidebar />}

        {/* Contenu principal */}
        <div className="flex-1 flex flex-col">
          {/* Navbar si non-admin */}
          {!isAdmin && (
            <>
              <Navbar
                activeMenuItem={activeMenuItem}
                setActiveMenuItem={setActiveMenuItem}
              />
              <Separator />
            </>
          )}

          <main className="flex-1 overflow-y-auto p-6 bg-gray-50">
            <Outlet />
          </main>
        </div>
      </div>
    </SidebarProvider>
  );
};

export default App;
