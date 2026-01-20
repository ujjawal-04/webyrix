'use client'
import { Button } from '@/components/ui/button'
import { SignInButton } from '@clerk/nextjs'
import { ArrowRight } from 'lucide-react'
import Image from 'next/image'
import Link from 'next/link'
import React from 'react'
import { useUser } from '@clerk/nextjs'

const navigation = [
    {name: 'Home', href: '/'},
    {name: 'Pricing', href: '/pricing'},
    {name: 'Contact-us', href: '/contact'}
]
const Header = () => {
  const { user } = useUser();
  
  return (
    <div className='flex items-center justify-between p-4 shadow'>
    {/*Logo*/}
      <Link href='/' className="flex gap-2 items-center">
        <Image src="/logo.svg" alt="Logo" width={35} height={35} />
        <h2 className='text-2xl font-bold'>Webyrix</h2>
      </Link>
    {/*Navigation*/}
    <div className='flex gap-3'> 
        {navigation.map((item) => (
            <Button variant={'ghost'}key={item.name}>
              <Link href={item.href}>{item.name}</Link>
            </Button>
        ))}
    </div>
    {/*Get Started Button*/}
    <div>
      {!user ? <SignInButton mode='modal' forceRedirectUrl={'/workspace'}>
      <Button>Get Started <ArrowRight /></Button>
      </SignInButton> :
      <Link href={'/workspace'}>
      <Button>Get Started <ArrowRight /></Button>
      </Link>}
    </div>
  </div>
  )
}

export default Header;
