'use client';
import React, { useContext } from 'react'
import Image from 'next/image';
import { Button } from '@/components/ui/button';
import { OnSaveContext } from '@/context/OnSaveContext';

function PlaygroundHeader() {

  const {onSaveData, setOnSaveData} = useContext(OnSaveContext);

  return (
    <div className='flex justify-between items-center p-4 shadow'>
      <Image src={'/logo.svg'} alt='Logo' width={40} height={40} />
      <Button onClick={() => setOnSaveData(Date.now())}>Save</Button>
    </div>
  )
}

export default PlaygroundHeader
