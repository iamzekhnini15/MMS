'use client';

import { BadgeCheck, Bell, ChevronsUpDown, LogOut } from 'lucide-react';
import { useContext } from 'react';
import { useNavigate } from 'react-router-dom';
import { UserContext } from '@/contexts/UserContext';
import { UserContextType } from '@/types';

import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuGroup,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
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

  const handleNavigation = (url: string) => {
    navigate(url);
    // Fermer la sidebar sur mobile après navigation
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
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <SidebarMenuButton
              size="lg"
              className="data-[state=open]:bg-sidebar-accent data-[state=open]:text-sidebar-accent-foreground"
            >
              <Avatar className="h-8 w-8 rounded-lg">
                <AvatarImage src={displayAvatar} alt={displayName} />
                <AvatarFallback className="rounded-lg">
                  {displayName?.charAt(0)?.toUpperCase() || 'U'}
                </AvatarFallback>
              </Avatar>
              {!isCollapsed && (
                <div className="grid flex-1 text-left text-sm leading-tight">
                  <span className="truncate font-medium">{displayName}</span>
                  <span className="truncate text-xs">{displayEmail}</span>
                </div>
              )}
              {!isCollapsed && <ChevronsUpDown className="ml-auto size-4" />}
            </SidebarMenuButton>
          </DropdownMenuTrigger>
          <DropdownMenuContent
            className="w-(--radix-dropdown-menu-trigger-width) min-w-56 rounded-lg"
            side={isMobile ? 'bottom' : 'right'}
            align="end"
            sideOffset={4}
          >
            <DropdownMenuLabel className="p-0 font-normal">
              <div className="flex items-center gap-2 px-1 py-1.5 text-left text-sm">
                <Avatar className="h-8 w-8 rounded-lg">
                  <AvatarImage src={displayAvatar} alt={displayName} />
                  <AvatarFallback className="rounded-lg">
                    {displayName?.charAt(0)?.toUpperCase() || 'U'}
                  </AvatarFallback>
                </Avatar>
                <div className="grid flex-1 text-left text-sm leading-tight">
                  <span className="truncate font-medium">{displayName}</span>
                  <span className="truncate text-xs">{displayEmail}</span>
                </div>
              </div>
            </DropdownMenuLabel>
            <DropdownMenuSeparator />
            <DropdownMenuGroup>
              <DropdownMenuItem onClick={() => handleNavigation('/settings')}>
                <BadgeCheck />
                Paramètres du compte
              </DropdownMenuItem>
              <DropdownMenuItem>
                <Bell />
                Notifications
              </DropdownMenuItem>
            </DropdownMenuGroup>
            <DropdownMenuSeparator />
            <DropdownMenuItem onClick={handleLogout}>
              <LogOut />
              Déconnexion
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </SidebarMenuItem>
    </SidebarMenu>
  );
}
