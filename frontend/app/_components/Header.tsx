'use client'
import { Button } from '@/components/ui/button'
import { SignInButton, UserButton } from '@clerk/nextjs'
import Image from 'next/image'
import Link from 'next/link'
import React from 'react'
import { useUser } from '@clerk/nextjs'

const navigation = [
    {name: 'Explore', href: '#explore'},
    {name: 'FAQ', href: '#faq'},
    {name: 'Pricing', href: '/pricing'}
]

const Header = () => {
  const { user } = useUser();
  
  return (
    <div className='flex items-center justify-between px-6 py-4 bg-background border-b border-border'>
      {/*Logo*/}
      <Link href='/' className="flex gap-2 items-center">
        <Image src="/logo.svg" alt="Logo" width={32} height={32} />
        <h2 className='text-xl font-bold text-foreground'>Webyrix</h2>
      </Link>
      
      {/*Navigation*/}
      <div className='flex gap-1'> 
        {navigation.map((item) => {
          const isHashLink = item.href.startsWith('#');
          const isExternal = item.href.startsWith('http');
          
          if (isHashLink) {
            return (
              <button
                key={item.name}
                onClick={() => {
                  const element = document.querySelector(item.href);
                  if (element) {
                    element.scrollIntoView({ behavior: 'smooth', block: 'start' });
                  }
                }}
                className='text-muted-foreground hover:text-foreground hover:bg-accent px-4 py-2 rounded-md transition-colors'
              >
                {item.name}
              </button>
            );
          }
          
          return (
            <Link 
              key={item.name} 
              href={item.href}
              target={isExternal ? '_blank' : undefined}
              rel={isExternal ? 'noopener noreferrer' : undefined}
            >
              <Button variant={'ghost'} className='text-muted-foreground hover:text-foreground hover:bg-accent'>
                {item.name}
              </Button>
            </Link>
          );
        })}
      </div>
      
      {/*Right Side Actions*/}
      <div className='flex items-center gap-4'>
        <Link href='/contact'>
          <Button variant={'ghost'} className='text-muted-foreground hover:text-foreground hover:bg-transparent'>
            Contact
          </Button>
        </Link>
        
        {!user ? (
          <>
            <SignInButton mode='modal' forceRedirectUrl={'/workspace'}>
              <Button variant={'ghost'} className='text-muted-foreground hover:text-foreground hover:bg-transparent'>
                Log in
              </Button>
            </SignInButton>
            <SignInButton mode='modal' forceRedirectUrl={'/workspace'}>
              <Button className='bg-primary text-primary-foreground hover:bg-primary/90 rounded-lg px-5'>
                Sign Up
              </Button>
            </SignInButton>
          </>
        ) : (
          <>
            <Link href={'/workspace'}>
              <Button className='bg-primary text-primary-foreground hover:bg-primary/90 rounded-lg px-5'>
                Dashboard
              </Button>
            </Link>
            <UserButton afterSignOutUrl='/' />
          </>
        )}
      </div>
    </div>
  )
}

export default Header;
