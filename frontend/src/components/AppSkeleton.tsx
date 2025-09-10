import { SidebarMenuSkeleton, SidebarProvider } from '@/components/ui/sidebar';
import { Skeleton } from '@/components/ui/skeleton';

export function AppSkeleton({
  collapsed = false,
  page = 'default',
}: {
  collapsed?: boolean;
  page?: string;
}) {
  return (
    <SidebarProvider>
      <div className="flex min-h-screen bg-gray-50 dark:bg-neutral-900">
        {/* Sidebar skeleton */}
        <aside
          className={`${
            collapsed ? 'w-14' : 'w-64'
          } transition-all duration-200 bg-gray-50 dark:bg-neutral-900 border-r border-gray-200 dark:border-neutral-800 flex flex-col`}
        >
          <div className="p-4">
            <Skeleton className={`h-8 ${collapsed ? 'w-8 mx-auto' : 'w-32'}`} />
          </div>
          <div className="flex-1 flex flex-col gap-2 px-2">
            {[...Array(collapsed ? 4 : 7)].map((_, i) => (
              <SidebarMenuSkeleton
                key={i}
                showIcon={true}
                className={collapsed ? 'justify-center' : ''}
              />
            ))}
          </div>
          <div className="p-4 mt-auto">
            <SidebarMenuSkeleton
              showIcon={true}
              className={collapsed ? 'justify-center' : ''}
            />
          </div>
        </aside>
        {/* Main skeleton */}
        <main className="flex-1 p-6">
          {page === 'student-dashboard' && (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
              {[...Array(3)].map((_, i) => (
                <Skeleton key={i} className="h-48 w-full rounded-lg" />
              ))}
            </div>
          )}
          {page === 'student-grades' && (
            <>
              <Skeleton className="h-8 w-40 mb-4" />
              <Skeleton className="h-10 w-full mb-4" />
              <div className="bg-white dark:bg-neutral-900 border border-gray-200 dark:border-neutral-800 rounded-lg">
                <div className="p-4 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                  {[...Array(3)].map((_, i) => (
                    <Skeleton key={i} className="h-24 w-full rounded-lg" />
                  ))}
                </div>
              </div>
              <div className="bg-white dark:bg-neutral-900 border border-gray-200 dark:border-neutral-800 rounded-lg mt-4">
                <div className="hidden md:block overflow-x-auto p-4">
                  <table className="min-w-full">
                    <thead>
                      <tr>
                        {[...Array(7)].map((_, i) => (
                          <th key={i} className="px-4 py-2">
                            <Skeleton className="h-4 w-20" />
                          </th>
                        ))}
                      </tr>
                    </thead>
                    <tbody>
                      {[...Array(5)].map((_, rowIdx) => (
                        <tr key={rowIdx}>
                          {[...Array(7)].map((_, colIdx) => (
                            <td key={colIdx} className="px-4 py-3">
                              <Skeleton className="h-4 w-20" />
                            </td>
                          ))}
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
                <div className="block md:hidden p-4 space-y-3">
                  {[...Array(3)].map((_, i) => (
                    <Skeleton key={i} className="h-32 w-full rounded-lg" />
                  ))}
                </div>
              </div>
            </>
          )}
          {/* Ajoute d'autres pages si besoin */}
          {page === 'default' && (
            <Skeleton className="h-10 w-1/2 mx-auto mt-20" />
          )}
        </main>
      </div>
    </SidebarProvider>
  );
}
