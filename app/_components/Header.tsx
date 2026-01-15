import { Button } from '@/components/ui/button'
import { SignInButton } from '@clerk/nextjs'
import { ArrowRight } from 'lucide-react'
import Image from 'next/image'
import Link from 'next/link'
import React from 'react'

const navigation = [
    {name: 'Home', href: '/'},
    {name: 'Pricing', href: '/pricing'},
    {name: 'Contact-us', href: '/contact'}
]

const Header = () => {
  return (
    <div className='flex items-center justify-between p-4 shadow'>
    {/*Logo*/}
    <div className='flex gap-2 items-center'>
      <Image src="/logo.svg" alt="Logo" width={35} height={35} />
      <h2 className='text-lg font-bold'>Webyrix</h2>
    </div>
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
      <SignInButton mode='modal' forceRedirectUrl={'/workspace'}>
      <Button>Get Started <ArrowRight /></Button>
      </SignInButton>
    </div>
    </div>
  )
}

export default Header
