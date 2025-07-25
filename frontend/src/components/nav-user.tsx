'use client';

import { LogOut } from 'lucide-react';
import { useContext } from 'react';
import { useNavigate } from 'react-router-dom';
import { UserContext } from '@/contexts/UserContext';
import { UserContextType } from '@/types';
import DarkModeToggle from '@/components/ui/dark-mode-toggle';

import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import {
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  useSidebar,
} from '@/components/ui/sidebar';

export function NavUser({
  user,
  isCollapsed = false,
}: {
  user: {
    name: string;
    email: string;
    avatar: string;
  };
  isCollapsed?: boolean;
}) {
  const { isMobile, setOpenMobile } = useSidebar();
  const navigate = useNavigate();
  const { clearUser, authenticatedUser } =
    useContext<UserContextType>(UserContext);

  const handleLogout = () => {
    clearUser();
    navigate('/login');
    // Fermer la sidebar sur mobile après déconnexion
    if (isMobile) {
      setOpenMobile(false);
    }
  };

  // Utiliser les données de l'utilisateur authentifié si disponibles
  const displayName = authenticatedUser
    ? `${authenticatedUser.user.firstname} ${authenticatedUser.user.lastname}`
    : user.name;
  const displayEmail = authenticatedUser
    ? authenticatedUser.user.email
    : user.email;
  const displayAvatar = user.avatar; // Garder l'avatar par défaut pour l'instant

  return (
    <SidebarMenu>
      <SidebarMenuItem>
        <div className="flex flex-col gap-1">
          {/* Avatar/User info avec Dark Mode Toggle */}
          <div className="flex items-center gap-2">
            <SidebarMenuButton
              size="lg"
              className="flex-1 justify-center hover:bg-gray-100 dark:hover:bg-neutral-800"
              title={`${displayName} - ${displayEmail}`}
            >
              <Avatar className="h-8 w-8 rounded-lg">
                <AvatarImage src={displayAvatar} alt={displayName} />
                <AvatarFallback className="rounded-lg bg-gray-200 dark:bg-neutral-700 text-gray-800 dark:text-white">
                  {displayName?.charAt(0)?.toUpperCase() || 'U'}
                </AvatarFallback>
              </Avatar>
              {!isCollapsed && (
                <>
                  <div className="grid flex-1 text-left text-sm leading-tight">
                    <span className="truncate font-medium text-gray-900 dark:text-white">
                      {displayName}
                    </span>
                    <span className="truncate text-xs text-gray-600 dark:text-gray-300">
                      {displayEmail}
                    </span>
                  </div>
                  <div className="flex-shrink-0">
                    <DarkModeToggle size="sm" className="h-8 w-8 p-1.5" />
                  </div>
                </>
              )}
            </SidebarMenuButton>
          </div>

          {/* Bouton de déconnexion - toujours visible */}
          <SidebarMenuButton
            size={isCollapsed ? 'lg' : 'sm'}
            onClick={handleLogout}
            className="justify-center hover:bg-red-50 dark:hover:bg-red-900/20 text-red-600 dark:text-red-400 border border-red-200 dark:border-red-800"
            title="Déconnexion"
          >
            <LogOut className={`${isCollapsed ? 'h-5 w-5' : 'h-4 w-4'}`} />
            {!isCollapsed && <span className="ml-2">Déconnexion</span>}
          </SidebarMenuButton>
        </div>
      </SidebarMenuItem>
    </SidebarMenu>
  );
}
