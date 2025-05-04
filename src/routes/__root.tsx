import { Outlet, createRootRouteWithContext } from '@tanstack/react-router'
import { TanStackRouterDevtools } from '@tanstack/react-router-devtools'

import Header from '../components/Header'

import TanstackQueryLayout from '../integrations/tanstack-query/layout'

import type { QueryClient } from '@tanstack/react-query'

interface MyRouterContext {
  queryClient: QueryClient
}

export const Route = createRootRouteWithContext<MyRouterContext>()({
  component: () => (
    <div className="min-h-screen bg-background flex flex-col">
      <Header />
      <main className="container mx-auto py-6 flex-1">
        <Outlet />
      </main>
      <footer className="text-center text-xs text-gray-500 py-4 border-t bg-white">
        Vocabulary data sourced from <a href="https://www.gregmat.com/" target="_blank" rel="noopener noreferrer" className="underline hover:text-blue-600">GregMAT</a>.
      </footer>
      <TanStackRouterDevtools />
      <TanstackQueryLayout />
    </div>
  ),
})
