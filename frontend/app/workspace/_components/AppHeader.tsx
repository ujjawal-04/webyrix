import { SidebarTrigger } from '@/components/ui/sidebar'
import { UserButton } from '@clerk/nextjs'
import React from 'react'

const AppHeader = () => {
  return (
    <div className='flex justify-between items-center p-4 shadow'>
      <SidebarTrigger/>
      <UserButton />
    </div>
  )
}

export default AppHeader
