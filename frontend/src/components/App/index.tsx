import { Outlet } from 'react-router-dom';
import { useContext, useState } from 'react';
import Navbar from '../Navbar';
import { AppSidebar } from '../app-sidebar';
import { UserContext } from '@/contexts/UserContext';
import { SidebarProvider, SidebarTrigger } from '@/components/ui/sidebar';
import { Separator } from '@/components/ui/separator';
import DarkModeToggle from '@/components/ui/dark-mode-toggle';

const App = () => {
  const [activeMenuItem, setActiveMenuItem] = useState('dashboard');
  const { authenticatedUser } = useContext(UserContext);

  // Vérifie si l'utilisateur est connecté (peu importe le rôle)
  const isAuthenticated = authenticatedUser?.user?.role;

  return (
    <SidebarProvider>
      <div className="flex h-screen overflow-hidden w-full bg-white dark:bg-neutral-900">
        {/* Sidebar pour tous les utilisateurs connectés */}
        {isAuthenticated && <AppSidebar />}

        {/* Contenu principal */}
        <div className="flex-1 flex flex-col">
          {/* Header avec bouton hamburger mobile pour les utilisateurs connectés */}
          {isAuthenticated && (
            <div className="lg:hidden bg-white dark:bg-neutral-900 border-b dark:border-neutral-800 px-4 py-3 flex items-center justify-between shadow-sm">
              <div className="flex items-center">
                <SidebarTrigger className="mr-3 dark:text-white" />
                <span className="font-bold text-lg text-blue-600 dark:text-white">MMS</span>
              </div>
              <div className="flex items-center gap-2">
                <DarkModeToggle size="sm" />
                <div className="text-sm text-gray-500 dark:text-white">
                  {authenticatedUser?.user?.firstname} {authenticatedUser?.user?.lastname}
                </div>
              </div>
            </div>
          )}
          
          {/* Navbar uniquement pour les utilisateurs non-connectés */}
          {!isAuthenticated && (
            <>
              <Navbar
                activeMenuItem={activeMenuItem}
                setActiveMenuItem={setActiveMenuItem}
              />
              <Separator />
            </>
          )}

          <main className={`flex-1 overflow-y-auto bg-gray-50 dark:bg-neutral-900 ${
            isAuthenticated ? 'p-4 sm:p-6' : 'p-6'
          }`}>
            <Outlet />
          </main>
        </div>
      </div>
    </SidebarProvider>
  );
};

export default App;
