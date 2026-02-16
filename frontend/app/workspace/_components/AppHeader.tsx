import { SidebarTrigger } from '@/components/ui/sidebar'
import { UserButton } from '@clerk/nextjs'
import { dark } from '@clerk/themes'
import React from 'react'

const AppHeader = () => {
  return (
    <div className='flex justify-between items-center p-4 shadow'>
      <SidebarTrigger />
      <UserButton
        afterSignOutUrl='/'
        appearance={{
          baseTheme: dark,
          elements: {
            avatarBox: "w-10 h-10 ring-2 ring-white/20 hover:ring-white/40 transition-all",
            userButtonPopoverCard: "bg-neutral-900 border border-white/10 shadow-xl rounded-xl",
            userButtonPopoverFooter: "hidden !hidden opacity-0 pointer-events-none h-0 p-0 m-0",
            userButtonPopoverActionButton: "hover:bg-white/5",
            userButtonPopoverActionButtonText: "text-white",
            userButtonPopoverActionButtonIcon: "text-white/60"
          }
        }}
      />
    </div>
  )
}

export default AppHeader
