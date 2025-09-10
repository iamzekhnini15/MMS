import * as React from 'react';
import { useContext } from 'react';
import { Link } from 'react-router-dom';
import {
  Calendar,
  Command,
  FileText,
  Gauge,
  LifeBuoy,
  MessageCircle,
  Send,
  Settings2,
  SquareTerminal,
  GraduationCap,
  BookOpen,
  ClipboardList,
  Users,
  BarChart3,
  Calculator,
  Award,
} from 'lucide-react';

import { NavMain } from '@/components/nav-main';
import { NavSecondary } from '@/components/nav-secondary';
import { NavUser } from '@/components/nav-user';
import { UserContext } from '@/contexts/UserContext';
import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarTrigger,
  useSidebar,
} from '@/components/ui/sidebar';

// Configuration de navigation par rôle
const getNavigationByRole = (role: string | undefined) => {
  const baseSecondary = [
    {
      title: 'Support',
      url: '#',
      icon: LifeBuoy,
    },
    {
      title: 'Feedback',
      url: '#',
      icon: Send,
    },
  ];

  switch (role) {
    case 'ADMIN':
      return {
        navMain: [
          {
            title: 'Tableau de bord',
            url: '/dashboard',
            icon: Gauge,
            isActive: true,
          },
          {
            title: 'Gestion',
            url: '#',
            icon: SquareTerminal,
            isActive: true,
            items: [
              {
                title: 'Cours',
                url: '/manage-courses',
              },
              {
                title: 'Enseignants',
                url: '/manage-teachers',
              },
              {
                title: 'Classes',
                url: '/manage-classes',
              },
              {
                title: 'Emplois du temps',
                url: '/manage-timetables',
              },
              {
                title: 'Salles de cours',
                url: '/manage-classroom',
              },
            ],
          },
          {
            title: 'Emploi du temps',
            url: '/schedule',
            icon: Calendar,
          },
          {
            title: 'Consulter horaires',
            url: '/view-schedules',
            icon: Calendar,
          },
          {
            title: 'Bulletins scolaires',
            url: '/reports',
            icon: FileText,
          },
          {
            title: 'Communication',
            url: '/communication',
            icon: MessageCircle,
          },
          {
            title: 'Paramètres',
            url: '/settings',
            icon: Settings2,
          },
        ],
        navSecondary: baseSecondary,
      };

    case 'TEACHER':
      return {
        navMain: [
          {
            title: 'Tableau de bord',
            url: '/teacher',
            icon: Gauge,
            isActive: true,
          },
          {
            title: 'Mes Classes',
            url: '/teacher/classes',
            icon: Users,
            isActive: true,
          },
          {
            title: 'Évaluations',
            url: '#',
            icon: ClipboardList,
            isActive: true,
            items: [
              {
                title: 'Créer une évaluation',
                url: '/teacher/evaluations',
              },
              {
                title: 'Saisir les notes',
                url: '/teacher/grades',
              },
            ],
          },
          {
            title: 'Coefficients',
            url: '/teacher/coefficients',
            icon: Calculator,
            isActive: true,
          },
          {
            title: 'Bulletins',
            url: '/teacher/bulletins',
            icon: Award,
            isActive: true,
          },
          {
            title: 'Périodes',
            url: '/teacher/periods',
            icon: Calendar,
            isActive: true,
          },
          {
            title: 'Mon emploi du temps',
            url: '/teacher/schedule',
            icon: Calendar,
            isActive: true,
          },
        ],
        navSecondary: baseSecondary,
      };

    case 'STUDENT':
      return {
        navMain: [
          {
            title: 'Tableau de bord',
            url: '/student',
            icon: Gauge,
            isActive: true,
          },
          {
            title: 'Mes Notes',
            url: '/student/grades',
            icon: BarChart3,
            isActive: true,
          },
          {
            title: 'Emploi du temps',
            url: '/student/schedule',
            icon: Calendar,
            isActive: true,
          },
          {
            title: 'Mes Bulletins',
            url: '/student/bulletins',
            icon: Award,
            isActive: true,
          },
          {
            title: 'Ressources',
            url: '/student/resources',
            icon: BookOpen,
            isActive: true,
          },
        ],
        navSecondary: baseSecondary,
      };

    default:
      // Navigation par défaut (utilisateur non connecté ou rôle non défini)
      return {
        navMain: [
          {
            title: 'Accueil',
            url: '/',
            icon: Gauge,
            isActive: true,
          },
          {
            title: 'Connexion',
            url: '/login',
            icon: GraduationCap,
            isActive: true,
          },
        ],
        navSecondary: baseSecondary,
      };
  }
};

export function AppSidebar({ ...props }: React.ComponentProps<typeof Sidebar>) {
  const { authenticatedUser } = useContext(UserContext);
  const { state } = useSidebar();

  // Récupérer le rôle de l'utilisateur connecté
  const userRole = authenticatedUser?.user?.role;
  const userName =
    authenticatedUser?.user?.firstname && authenticatedUser?.user?.lastname
      ? `${authenticatedUser.user.firstname} ${authenticatedUser.user.lastname}`
      : 'Utilisateur';
  const userEmail = authenticatedUser?.user?.email || 'non-connecté';

  // Obtenir la navigation appropriée selon le rôle
  const navigation = getNavigationByRole(userRole);

  const userData = {
    name: userName,
    email: userEmail,
    avatar: '/avatars/default.jpg', // Avatar par défaut
  };

  const isCollapsed = state === 'collapsed';

  return (
    <Sidebar
      variant="inset"
      collapsible="icon"
      {...props}
      className="bg-gray-50 dark:bg-neutral-900 [&>*]:bg-gray-50 [&>*]:dark:bg-neutral-900"
    >
      <SidebarHeader>
        <SidebarMenu>
          <SidebarMenuItem>
            {!isCollapsed ? (
              <div className="flex items-center gap-2">
                <SidebarMenuButton size="lg" asChild className="flex-1">
                  <Link to="/">
                    <div className="bg-gray-200 dark:bg-neutral-800 text-gray-800 dark:text-white flex aspect-square size-8 items-center justify-center rounded-lg">
                      <Command className="size-4" />
                    </div>
                    <div className="grid flex-1 text-left text-sm leading-tight">
                      <span className="truncate font-medium text-gray-900 dark:text-white">
                        ManageMySchool
                      </span>
                      <span className="truncate text-xs text-gray-600 dark:text-gray-300">
                        {userRole === 'ADMIN' && 'Administration'}
                        {userRole === 'TEACHER' && 'Interface Enseignant'}
                        {userRole === 'STUDENT' && 'Interface Étudiant'}
                        {!userRole && 'Système de gestion scolaire'}
                      </span>
                    </div>
                  </Link>
                </SidebarMenuButton>
                <SidebarTrigger className="h-8 w-8 shrink-0" />
              </div>
            ) : (
              <div className="flex justify-center">
                <SidebarTrigger className="h-8 w-8" />
              </div>
            )}
          </SidebarMenuItem>
        </SidebarMenu>
      </SidebarHeader>
      <SidebarContent className="bg-gray-50 dark:bg-neutral-900">
        <NavMain items={navigation.navMain} isCollapsed={isCollapsed} />
        <NavSecondary
          items={navigation.navSecondary}
          className="mt-auto"
          isCollapsed={isCollapsed}
        />
      </SidebarContent>
      <SidebarFooter className="bg-gray-50 dark:bg-neutral-900">
        <NavUser user={userData} isCollapsed={isCollapsed} />
      </SidebarFooter>
    </Sidebar>
  );
}
