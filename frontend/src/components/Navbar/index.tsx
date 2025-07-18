import React, { useContext } from 'react';
import { useNavigate } from 'react-router-dom';
import { UserContextType } from '../../types';
import { UserContext } from '../../contexts/UserContext';
import { Button } from '@/components/ui/button';
import { Separator } from '@/components/ui/separator';
import {
  NavigationMenu,
  NavigationMenuList,
  NavigationMenuItem,
  NavigationMenuTrigger,
  NavigationMenuContent,
  NavigationMenuLink,
} from '@/components/ui/navigation-menu';
import { cn } from '@/lib/utils';
import { LogOut } from 'lucide-react';

interface NavbarProps {
  activeMenuItem: string;
  setActiveMenuItem: (id: string) => void;
}

const Navbar: React.FC<NavbarProps> = ({
  activeMenuItem,
  setActiveMenuItem,
}) => {
  const navigate = useNavigate();
  const { clearUser, authenticatedUser } =
    useContext<UserContextType>(UserContext);

  const handleLogout = () => {
    clearUser();
    navigate('/login');
  };

  const managementPages = [
    {
      id: 'manage-courses',
      name: 'Gestion des cours',
      icon: 'fa-solid fa-book',
    },
    {
      id: 'manage-teachers',
      name: 'Gestion des enseignants',
      icon: 'fa-solid fa-book',
    },
    {
      id: 'manage-classes',
      name: 'Gestion des classes',
      icon: 'fa-solid fa-book',
    },
    {
      id: 'manage-classroom',
      name: 'Gestion des salles de cours',
      icon: 'fa-solid fa-book',
    },
  ];

  if (!authenticatedUser) return null;

  return (
    <header className="w-full bg-white shadow-md z-10">
      <div className="flex items-center justify-between px-6 py-4">
        {/* Logo */}
        <div
          onClick={() => navigate('/')}
          className="text-xl font-bold text-blue-600 cursor-pointer"
        >
          ManageMySchool
        </div>

        {/* Navigation Menu */}
        <NavigationMenu>
          <NavigationMenuList className="flex items-center space-x-4">
            {/* Menu Gestion Dropdown */}
            <NavigationMenuItem>
              <NavigationMenuTrigger className="flex items-center px-4 py-2 text-sm font-medium cursor-pointer rounded-md hover:bg-gray-100">
                <i className="fa-solid fa-book mr-2"></i>
                Gestion
              </NavigationMenuTrigger>
              <NavigationMenuContent className="p-4 grid gap-2 lg:w-[250px] bg-white shadow-lg rounded-md">
                <div className="flex flex-col space-y-2">
                  {managementPages.map((item) => (
                    <NavigationMenuLink
                      key={item.id}
                      className={cn(
                        'flex items-center px-4 py-2 text-sm font-medium cursor-pointer rounded-md transition-colors',
                        activeMenuItem === item.id
                          ? 'bg-blue-100 text-blue-700'
                          : 'text-gray-700 hover:bg-gray-100',
                      )}
                      onClick={() => {
                        navigate(`/${item.id}`);
                        setActiveMenuItem(item.id);
                      }}
                    >
                      <i className={`${item.icon} mr-2`}></i>
                      {item.name}
                    </NavigationMenuLink>
                  ))}
                </div>
              </NavigationMenuContent>
            </NavigationMenuItem>

            {/* Tableau de bord */}
            <NavigationMenuItem>
              <NavigationMenuLink
                className={cn(
                  'flex items-center px-4 py-2 text-sm font-medium cursor-pointer rounded-md transition-colors',
                  activeMenuItem === 'dashboard'
                    ? 'bg-blue-100 text-blue-700'
                    : 'text-gray-700 hover:bg-gray-100',
                )}
                onClick={() => {
                  navigate('/dashboard');
                  setActiveMenuItem('dashboard');
                }}
              >
                <i className="fa-solid fa-gauge-high mr-2"></i>
                Tableau de bord
              </NavigationMenuLink>
            </NavigationMenuItem>

            {/* Emploi du temps */}
            <NavigationMenuItem>
              <NavigationMenuLink
                className={cn(
                  'flex items-center px-4 py-2 text-sm font-medium cursor-pointer rounded-md transition-colors',
                  activeMenuItem === 'schedule'
                    ? 'bg-blue-100 text-blue-700'
                    : 'text-gray-700 hover:bg-gray-100',
                )}
                onClick={() => {
                  navigate('/schedule');
                  setActiveMenuItem('schedule');
                }}
              >
                <i className="fa-solid fa-calendar-days mr-2"></i>
                Emploi du temps
              </NavigationMenuLink>
            </NavigationMenuItem>

            {/* Bulletins scolaires */}
            <NavigationMenuItem>
              <NavigationMenuLink
                className={cn(
                  'flex items-center px-4 py-2 text-sm font-medium cursor-pointer rounded-md transition-colors',
                  activeMenuItem === 'reports'
                    ? 'bg-blue-100 text-blue-700'
                    : 'text-gray-700 hover:bg-gray-100',
                )}
                onClick={() => {
                  navigate('/reports');
                  setActiveMenuItem('reports');
                }}
              >
                <i className="fa-solid fa-file-lines mr-2"></i>
                Bulletins scolaires
              </NavigationMenuLink>
            </NavigationMenuItem>

            {/* Communication */}
            <NavigationMenuItem>
              <NavigationMenuLink
                className={cn(
                  'flex items-center px-4 py-2 text-sm font-medium cursor-pointer rounded-md transition-colors',
                  activeMenuItem === 'communication'
                    ? 'bg-blue-100 text-blue-700'
                    : 'text-gray-700 hover:bg-gray-100',
                )}
                onClick={() => {
                  navigate('/communication');
                  setActiveMenuItem('communication');
                }}
              >
                <i className="fa-solid fa-comments mr-2"></i>
                Communication
              </NavigationMenuLink>
            </NavigationMenuItem>

            {/* Paramètres */}
            <NavigationMenuItem>
              <NavigationMenuLink
                className={cn(
                  'flex items-center px-4 py-2 text-sm font-medium cursor-pointer rounded-md transition-colors',
                  activeMenuItem === 'settings'
                    ? 'bg-blue-100 text-blue-700'
                    : 'text-gray-700 hover:bg-gray-100',
                )}
                onClick={() => {
                  navigate('/settings');
                  setActiveMenuItem('settings');
                }}
              >
                <i className="fa-solid fa-gear mr-2"></i>
                Paramètres
              </NavigationMenuLink>
            </NavigationMenuItem>
          </NavigationMenuList>
        </NavigationMenu>

        {/* Logout */}
        <Button
          variant="destructive"
          onClick={handleLogout}
          className="flex items-center text-sm font-medium"
        >
          <LogOut className="w-4 h-4 mr-2" />
          Déconnexion
        </Button>
      </div>
      <Separator />
    </header>
  );
};

export default Navbar;
