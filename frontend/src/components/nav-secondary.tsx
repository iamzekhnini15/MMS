import * as React from 'react';
import { type LucideIcon } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

import {
  SidebarGroup,
  SidebarGroupContent,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  useSidebar,
} from '@/components/ui/sidebar';

export function NavSecondary({
  items,
  isCollapsed = false,
  ...props
}: {
  items: {
    title: string;
    url: string;
    icon: LucideIcon;
  }[];
  isCollapsed?: boolean;
} & React.ComponentPropsWithoutRef<typeof SidebarGroup>) {
  const navigate = useNavigate();
  const { isMobile, setOpenMobile } = useSidebar();

  const handleNavigation = (url: string) => {
    if (url !== '#') {
      navigate(url);
      // Fermer la sidebar sur mobile après navigation
      if (isMobile) {
        setOpenMobile(false);
      }
    }
  };

  return (
    <SidebarGroup {...props}>
      <SidebarGroupContent>
        <SidebarMenu>
          {items.map((item) => (
            <SidebarMenuItem key={item.title}>
              <SidebarMenuButton asChild size="sm">
                <button
                  onClick={() => handleNavigation(item.url)}
                  className="w-full flex items-center cursor-pointer"
                >
                  <item.icon />
                  {!isCollapsed && <span>{item.title}</span>}
                </button>
              </SidebarMenuButton>
            </SidebarMenuItem>
          ))}
        </SidebarMenu>
      </SidebarGroupContent>
    </SidebarGroup>
  );
}
