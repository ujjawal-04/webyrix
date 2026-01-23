'use client'

import React, { useEffect, useRef, useState } from 'react'
import axios from 'axios'
import { useUser, useAuth } from '@clerk/nextjs'
import { User } from 'lucide-react'
import { UserDetailContext } from '@/context/UserDetailContext'
import { OnSaveContext } from '@/context/OnSaveContext'
import { on } from 'events'

function Provider({ children }: { children: React.ReactNode }) {
  const { user, isLoaded } = useUser()
  const { getToken } = useAuth()
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
      const token = await getToken();
      const res = await axios.post(process.env.NEXT_PUBLIC_API_URL + '/api/users', {}, {
        headers: {
          Authorization: `Bearer ${token}`
        }
      })
      console.log(res.data);
      setUserDetail(res.data?.data);
    } catch (error) {
      console.error('Create user failed:', error)
    }
  }

  const refreshCredits = async () => {
    if (!userDetail) return; // Wait for user to be created/loaded
    try {
      const token = await getToken();
      const res = await axios.get(process.env.NEXT_PUBLIC_API_URL + '/api/users/credits', {
        headers: {
          Authorization: `Bearer ${token}`
        }
      });
      if (res.data?.data) {
        setUserDetail((prev: any) => ({ ...prev, credits: res.data.data.credits }));
      }
    } catch (error: any) {
      if (error.response?.status !== 404) {
        console.error('Refresh credits failed:', error);
      }
    }
  };

  return (
    <UserDetailContext.Provider value={{ userDetail, setUserDetail, refreshCredits }}>
      <OnSaveContext.Provider value={{ onSaveData, setOnSaveData }}>
        {children}
      </OnSaveContext.Provider>
    </UserDetailContext.Provider>
  );
}

export default Provider
