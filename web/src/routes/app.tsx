import { createFileRoute } from '@tanstack/react-router'
import Sidebar from '#/components/app/sidebar'
import ChatLayout from '#/components/app/chats/layout'

function RouteComponent() {
  return (
    <main className="flex h-screen bg-(--bg-base) text-(--sea-ink) overflow-hidden">
      <Sidebar />
      <ChatLayout/>
    </main>
  )
}

export const Route = createFileRoute('/app')({
  component: RouteComponent,
})
