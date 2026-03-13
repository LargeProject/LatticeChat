// import { useMemo, useState } from 'react'
// import { createFileRoute } from '@tanstack/react-router'
// import Sidebar from '#/components/app/sidebar'
// import {
//   CheckCheck,
//   MoreVertical,
//   Paperclip,
//   Phone,
//   Search,
//   Send,
//   Smile,
//   Video,
// } from 'lucide-react'

// type Conversation = {
//   id: string
//   name: string
//   snippet: string
//   time: string
//   unread?: number
//   status?: 'online' | 'away' | 'offline'
// }

// type Message = {
//   id: string
//   sender: 'you' | 'them'
//   content: string
//   time: string
//   status?: 'sent' | 'delivered' | 'read'
// }

// const sampleConversations: Conversation[] = [
//   {
//     id: 'c1',
//     name: 'Bread',
//     snippet: 'Let’s lock plans for tonight.',
//     time: '12:42',
//     unread: 3,
//     status: 'online',
//   },
//   {
//     id: 'c2',
//     name: 'Team Vault',
//     snippet: 'Deploy went green. Great job!',
//     time: '11:18',
//     status: 'away',
//   },
//   {
//     id: 'c3',
//     name: 'Security Desk',
//     snippet: 'New keys issued. Please confirm.',
//     time: 'Yesterday',
//     status: 'offline',
//   },
//   {
//     id: 'c4',
//     name: 'Cuck hands',
//     snippet: 'I’ll send the doc after lunch.',
//     time: 'Yesterday',
//   },
// ]

// const sampleMessages: Message[] = [
//   { id: 'm1', sender: 'them', content: 'Can we sync later today?', time: '12:35' },
//   { id: 'm2', sender: 'you', content: 'Sure. 6 PM work for you?', time: '12:37', status: 'delivered' },
//   { id: 'm3', sender: 'them', content: 'Perfect. I’ll bring the notes.', time: '12:39' },
//   { id: 'm4', sender: 'you', content: 'Awesome. See you then!', time: '12:40', status: 'read' },
// ]

// function StatusDot({ status }: { status?: Conversation['status'] }) {
//   const palette: Record<NonNullable<Conversation['status']>, string> = {
//     online: 'bg-emerald-500',
//     away: 'bg-amber-400',
//     offline: 'bg-(--line)',
//   }
//   return (
//     <span className={`inline-block h-2.5 w-2.5 rounded-full ring-2 ring-(--surface) ${status ? palette[status] : 'bg-(--line)'}`} />
//   )
// }

// function ChatsPage() {
//   const [selectedId, setSelectedId] = useState<string>('c1')
//   const [query, setQuery] = useState('')

//   const conversations = useMemo(() => sampleConversations, [])
//   const messages = useMemo(() => sampleMessages, [])

//   const filtered = useMemo(() => {
//     const q = query.trim().toLowerCase()
//     if (!q) return conversations
//     return conversations.filter((c) => c.name.toLowerCase().includes(q) || c.snippet.toLowerCase().includes(q))
//   }, [conversations, query])

//   const selected = conversations.find((c) => c.id === selectedId) ?? conversations[0]

//   return (
//     <main className="flex h-screen bg-(--bg-base) text-(--sea-ink) overflow-hidden">
//       <Sidebar/>

//       <section className="flex flex-1 h-full overflow-hidden">
//         {/* Chat list */}
//         <div className="hidden w-80 flex-col border-r border-(--line) bg-(--surface-strong) dark:bg-black md:flex">
//           <div className="flex items-center gap-2 px-4 py-4">
//             <div className="flex w-full items-center gap-2 rounded-xl border border-(--line) bg-(--surface) px-3 py-2.5 transition-colors focus-within:border-(--lagoon) focus-within:ring-1 focus-within:ring-(--lagoon)/20">
//               <Search className="size-4 text-(--sea-ink-soft)" />
//               <input
//                 value={query}
//                 onChange={(e) => setQuery(e.target.value)}
//                 placeholder="Search chats"
//                 className="w-full bg-transparent text-sm text-(--sea-ink) placeholder:text-(--sea-ink-soft) focus:outline-none"
//               />
//             </div>
//           </div>

//           <div className="flex-1 overflow-y-auto px-2 pb-2">
//             {filtered.map((c) => {
//               const active = c.id === selectedId
//               return (
//                 <button
//                   key={c.id}
//                   onClick={() => setSelectedId(c.id)}
//                   className={`group mb-1 flex w-full items-center gap-3 rounded-xl px-3 py-3 text-left transition-all ${
//                     active
//                       ? 'bg-(--lagoon)/10 dark:bg-(--lagoon)/20'
//                       : 'hover:bg-(--surface)'
//                   }`}
//                 >
//                   <div className="relative flex size-10 shrink-0 items-center justify-center rounded-full bg-linear-to-br from-(--lagoon) to-(--lagoon-deep) text-sm font-bold text-white shadow-sm">
//                     {c.name
//                       .split(' ')
//                       .map((p) => p[0])
//                       .join('')
//                       .slice(0, 2)
//                       .toUpperCase()}
//                     <div className="absolute -bottom-0.5 -right-0.5">
//                       <StatusDot status={c.status} />
//                     </div>
//                   </div>
//                   <div className="min-w-0 flex-1">
//                     <div className="flex items-center gap-2">
//                       <p className={`truncate text-sm font-semibold transition-colors ${active ? 'text-(--sea-ink)' : 'text-(--sea-ink)'}`}>
//                         {c.name}
//                       </p>
//                       <span className="ml-auto text-[11px] text-(--sea-ink-soft)">{c.time}</span>
//                     </div>
//                     <div className="flex items-center gap-2">
//                       <p className="truncate text-xs text-(--sea-ink-soft) opacity-90 group-hover:opacity-100">{c.snippet}</p>
//                       {c.unread ? (
//                         <span className="ml-auto flex h-4 min-w-4 items-center justify-center rounded-full bg-(--lagoon) px-1 text-[9px] font-bold text-white">
//                           {c.unread}
//                         </span>
//                       ) : null}
//                     </div>
//                   </div>
//                 </button>
//               )
//             })}
//           </div>
//         </div>

//         {/* Conversation */}
//         <div className="flex min-w-0 flex-1 flex-col bg-(--foam) dark:bg-black">
//           <header className="flex h-18 items-center gap-3 border-b border-(--line) bg-(--surface-strong) dark:bg-black px-4 py-3 sm:px-6">
//             <div className="hidden sm:flex size-10 items-center justify-center rounded-full bg-linear-to-br from-(--lagoon) to-(--lagoon-deep) text-sm font-bold text-white">
//               {selected.name
//                 .split(' ')
//                 .map((p) => p[0])
//                 .join('')
//                 .slice(0, 2)
//                 .toUpperCase()}
//             </div>
//             <div className="min-w-0">
//               <h2 className="truncate text-base font-semibold text-(--sea-ink)">{selected.name}</h2>
//               <div className="flex items-center gap-1.5 text-xs text-(--sea-ink-soft)">
//                 <div className={`h-1.5 w-1.5 rounded-full ${selected.status === 'online' ? 'bg-emerald-500' : 'bg-gray-400'}`} />
//                 <span className="capitalize">{selected.status ?? 'offline'}</span>
//               </div>
//             </div>
//             <div className="ml-auto flex items-center gap-1 text-(--sea-ink-soft)">
//               <button className="flex size-9 items-center justify-center rounded-full hover:bg-(--surface) hover:text-(--sea-ink) transition-colors">
//                 <Phone className="size-5" />
//               </button>
//               <button className="flex size-9 items-center justify-center rounded-full hover:bg-(--surface) hover:text-(--sea-ink) transition-colors">
//                 <Video className="size-5" />
//               </button>
//               <button className="flex size-9 items-center justify-center rounded-full hover:bg-(--surface) hover:text-(--sea-ink) transition-colors">
//                 <MoreVertical className="size-5" />
//               </button>
//             </div>
//           </header>

//           <div className="flex-1 overflow-y-auto px-4 py-6 sm:px-6 md:px-8">
//             <div className="mx-auto flex max-w-3xl flex-col gap-4">
//               <div className="flex justify-center pb-4">
//                 <span className="rounded-full bg-(--surface) border border-(--line) px-3 py-1 text-[11px] font-medium text-(--sea-ink-soft)">
//                   Today
//                 </span>
//               </div>
              
//               {messages.map((m) => {
//                 const outgoing = m.sender === 'you'
//                 return (
//                   <div key={m.id} className={`flex w-full ${outgoing ? 'justify-end' : 'justify-start'}`}>
//                     <div
//                       className={`relative max-w-[85%] sm:max-w-[70%] rounded-2xl px-4 py-3 text-sm shadow-sm ${
//                         outgoing 
//                           ? 'bg-(--lagoon) text-white rounded-br-none' 
//                           : 'bg-(--surface) text-(--sea-ink) border border-(--line) rounded-bl-none'
//                       }`}
//                     >
//                       <p className="leading-relaxed whitespace-pre-wrap">{m.content}</p>
//                       <div className={`mt-1 flex items-center justify-end gap-1 text-[10px] ${outgoing ? 'text-white/80' : 'text-(--sea-ink-soft)'}`}>
//                         <span>{m.time}</span>
//                         {outgoing && m.status ? (
//                           <CheckCheck className={`size-3.5 ${m.status === 'read' ? 'text-white' : 'text-white/60'}`} />
//                         ) : null}
//                       </div>
//                     </div>
//                   </div>
//                 )
//               })}
//             </div>
//           </div>

//           <footer className="border-t border-(--line) bg-(--surface-strong) dark:bg-black px-4 py-4 sm:px-6">
//             <div className="mx-auto flex max-w-4xl items-center gap-2 rounded-2xl border border-(--line) bg-(--surface) px-2 py-2 shadow-sm focus-within:ring-1 focus-within:ring-(--lagoon)/30 focus-within:border-(--lagoon) transition-all">
//               <button className="flex size-10 items-center justify-center rounded-xl text-(--sea-ink-soft) hover:bg-(--line) hover:text-(--sea-ink) transition-colors">
//                 <Smile className="size-5" />
//               </button>
//               <button className="flex size-10 items-center justify-center rounded-xl text-(--sea-ink-soft) hover:bg-(--line) hover:text-(--sea-ink) transition-colors">
//                 <Paperclip className="size-5" />
//               </button>
//               <input
//                 placeholder="Type a message..."
//                 className="flex-1 bg-transparent px-2 text-sm text-(--sea-ink) placeholder:text-(--sea-ink-soft)/70 focus:outline-none"
//               />
//               <button className="flex size-10 items-center justify-center rounded-xl bg-(--lagoon) text-white shadow-md hover:bg-(--lagoon-deep) transition-colors active:scale-95">
//                 <Send className="size-4 ml-0.5" />
//               </button>
//             </div>
//           </footer>
//         </div>

//         {/* Details / info panel */}
//         <aside className="hidden w-70 flex-col border-l border-(--line) bg-(--surface-strong) dark:bg-black px-6 py-6 lg:flex">
//           <div className="flex flex-col items-center">
//             <div className="flex size-20 items-center justify-center rounded-full bg-linear-to-br from-(--lagoon) to-(--lagoon-deep) text-2xl font-bold text-white shadow-lg">
//               {selected.name
//                 .split(' ')
//                 .map((p) => p[0])
//                 .join('')
//                 .slice(0, 2)
//                 .toUpperCase()}
//             </div>
//             <h3 className="mt-3 text-lg font-bold text-(--sea-ink)">{selected.name}</h3>
//             <p className="text-xs text-(--sea-ink-soft)">Active {selected.time}</p>
//           </div>
          
//           <div className="mt-8 space-y-4">
//             <div className="rounded-xl border border-(--line) bg-(--surface) p-4">
//               <p className="text-[10px] uppercase tracking-wider text-(--sea-ink-soft) font-bold mb-2">Status</p>
//               <div className="flex items-center gap-2">
//                 <StatusDot status={selected.status} />
//                 <span className="text-sm capitalize font-medium">{selected.status ?? 'offline'}</span>
//               </div>
//             </div>
            
//             <div className="rounded-xl border border-(--line) bg-(--surface) p-4">
//               <p className="text-[10px] uppercase tracking-wider text-(--sea-ink-soft) font-bold mb-2">Privacy</p>
//               <div className="space-y-1">
//                 <p className="text-sm font-medium">End-to-end encrypted</p>
//                 <p className="text-xs text-(--sea-ink-soft)">Messages are secured with session keys.</p>
//               </div>
//             </div>
            
//             <div className="rounded-xl border border-(--line) bg-(--surface) p-4">
//               <div className="flex items-center justify-between mb-2">
//                 <p className="text-[10px] uppercase tracking-wider text-(--sea-ink-soft) font-bold">Shared Media</p>
//                 <button className="text-[10px] text-(--lagoon) hover:underline font-medium">View All</button>
//               </div>
//               <div className="flex h-16 items-center justify-center rounded-lg border border-dashed border-(--line) bg-(--bg-base)">
//                 <p className="text-xs text-(--sea-ink-soft)">No media shared</p>
//               </div>
//             </div>
//           </div>
//         </aside>
//       </section>
//     </main>
//   )
// }

// export const Route = createFileRoute('/chats')({
//   component: ChatsPage,
// })

