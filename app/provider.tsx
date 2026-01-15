'use client'

import React, { useEffect, useRef, useState } from 'react'
import axios from 'axios'
import { useUser } from '@clerk/nextjs'
import { User } from 'lucide-react'
import { UserDetailContext } from '@/context/UserDetailContext'

function Provider({ children }: { children: React.ReactNode }) {
  const { user, isLoaded } = useUser()
  const [userDetails, setUserDetails] = useState<any>();
  const hasCreatedUser = useRef(false)

  useEffect(() => {
    if (!isLoaded || !user || hasCreatedUser.current) return

    hasCreatedUser.current = true
    createNewUser()
  }, [isLoaded, user])

  const createNewUser = async () => {
    try {
      const res = await axios.post('/api/users')
      console.log(res.data);
      setUserDetails(res.data?.user);
    } catch (error) {
      console.error('Create user failed:', error)
    }
  }

  return <>
  <UserDetailContext.Provider value={{ userDetails, setUserDetails }}>
  {children}
  </UserDetailContext.Provider>
  </>
}

export default Provider
