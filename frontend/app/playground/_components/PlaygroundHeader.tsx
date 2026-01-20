'use client';
import React, { useContext } from 'react'
import Image from 'next/image';
import { Button } from '@/components/ui/button';
import { OnSaveContext } from '@/context/OnSaveContext';
import Link from 'next/link';

function PlaygroundHeader() {

  const {onSaveData, setOnSaveData} = useContext(OnSaveContext);

  return (
    <div className='flex justify-between items-center p-4 shadow'>
        <Link href='/' className='flex gap-2 items-center'>
          <Image src={'/logo.svg'} alt='Logo' width={40} height={40} />
          <h2 className="font-bold text-2xl">Webyrix</h2>
        </Link>
      <Button onClick={() => setOnSaveData(Date.now())}>Save</Button>
    </div>
  )
}

export default PlaygroundHeader
