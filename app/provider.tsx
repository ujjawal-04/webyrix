'use client'

import React, { useEffect, useRef, useState } from 'react'
import axios from 'axios'
import { useUser } from '@clerk/nextjs'
import { User } from 'lucide-react'
import { UserDetailContext } from '@/context/UserDetailContext'
import { OnSaveContext } from '@/context/OnSaveContext'
import { on } from 'events'

function Provider({ children }: { children: React.ReactNode }) {
  const { user, isLoaded } = useUser()
  const [userDetail, setUserDetail] = useState<any>();
  const hasCreatedUser = useRef(false);
  const [onSaveData, setOnSaveData] = useState<any>();

  useEffect(() => {
    if (!isLoaded || !user || hasCreatedUser.current) return

    hasCreatedUser.current = true
    createNewUser()
  }, [isLoaded, user])

  const createNewUser = async () => {
    try {
      const res = await axios.post('/api/users')
      console.log(res.data);
      setUserDetail(res.data?.user);
    } catch (error) {
      console.error('Create user failed:', error)
    }
  }

  return <>
  <UserDetailContext.Provider value={{ userDetail, setUserDetail }}>
    <OnSaveContext.Provider value={{onSaveData, setOnSaveData}}>
        {children}
    </OnSaveContext.Provider>
  </UserDetailContext.Provider>
  </>
}

export default Provider
