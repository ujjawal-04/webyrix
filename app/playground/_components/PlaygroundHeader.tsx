import React from 'react'
import Image from 'next/image';
import { Button } from '@/components/ui/button';

function PlaygroundHeader() {
  return (
    <div className='flex justify-between items-center p-4 shadow'>
      <Image src={'/logo.svg'} alt='Logo' width={40} height={40} />
      <Button>Save</Button>
    </div>
  )
}

export default PlaygroundHeader
