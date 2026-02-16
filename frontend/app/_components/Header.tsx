"use client"
import { Button } from '@/components/ui/button'
import { UserButton } from '@clerk/nextjs'
import { dark } from '@clerk/themes'
import Image from 'next/image'
import Link from 'next/link'
import React, { useState } from 'react'
import { useUser } from '@clerk/nextjs'

const navigation = [
  { name: 'Explore', href: '#explore' },
  { name: 'FAQ', href: '#faq' },
  { name: 'Pricing', href: '/pricing' }
]

const Header = () => {
  const { user } = useUser();
  const [menuOpen, setMenuOpen] = useState(false);

  return (
    <header className='relative'>
      <div className='flex items-center justify-between px-6 py-4 bg-background border-b border-border'>
        {/*Logo*/}
        <Link href='/' className="flex gap-2 items-center">
          <Image src="/logo.svg" alt="Logo" width={32} height={32} />
          <h2 className='text-xl font-bold text-foreground'>Webyrix</h2>
        </Link>

        {/*Desktop Navigation - visible md+ */}
        <nav className='hidden md:flex items-center gap-1'>
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
        </nav>

        {/*Desktop Actions - visible md+ */}
        <div className='hidden md:flex items-center gap-4'>
          <Link href='/contact'>
            <Button variant={'ghost'} className='text-muted-foreground hover:text-foreground hover:bg-transparent'>
              Contact
            </Button>
          </Link>

          {!user ? (
            <>
              <Link href="/sign-in">
                <Button variant={'ghost'} className='text-muted-foreground hover:text-foreground hover:bg-transparent'>
                  Log in
                </Button>
              </Link>
              <Link href="/sign-up">
                <Button className='bg-primary text-primary-foreground hover:bg-primary/90 rounded-lg px-5'>
                  Sign Up
                </Button>
              </Link>
            </>
          ) : (
            <>
              <Link href={'/workspace'}>
                <Button className='bg-primary text-primary-foreground hover:bg-primary/90 rounded-lg px-5'>
                  Dashboard
                </Button>
              </Link>
              <UserButton
                afterSignOutUrl='/'
                appearance={{
                  baseTheme: dark,
                  elements: {
                    avatarBox: "w-10 h-10 ring-2 ring-white/20 hover:ring-white/40 transition-all",
                    userButtonPopoverCard: "bg-neutral-900 border border-white/10 shadow-xl rounded-xl",
                    userButtonPopoverFooter: "hidden !hidden opacity-0 pointer-events-none h-0 p-0 m-0",
                    userButtonPopoverActionButton: "hover:bg-white/5",
                    userButtonPopoverActionButtonText: "text-white",
                    userButtonPopoverActionButtonIcon: "text-white/60"
                  }
                }}
              />
            </>
          )}
        </div>

        {/* Mobile Hamburger - visible < md */}
        <div className='md:hidden'>
          <button
            aria-label='Toggle menu'
            onClick={() => setMenuOpen(true)}
            className='p-2 rounded-md hover:bg-accent/60'
          >
            {/* hamburger icon */}
            <svg xmlns='http://www.w3.org/2000/svg' className='h-6 w-6 text-foreground' fill='none' viewBox='0 0 24 24' stroke='currentColor'>
              <path strokeLinecap='round' strokeLinejoin='round' strokeWidth={2} d='M4 6h16M4 12h16M4 18h16' />
            </svg>
          </button>
        </div>
      </div>

      {/* Mobile menu overlay */}
      {menuOpen && (
        <div className='fixed inset-0 z-50 md:hidden'>
          <div className='absolute inset-0 bg-black/40 backdrop-blur-sm' onClick={() => setMenuOpen(false)} />
          <aside className='absolute right-0 top-0 h-full w-3/4 max-w-xs bg-background shadow-lg p-6 flex flex-col gap-6'>
            <div className='flex items-center justify-between'>
              <Link href='/' className='flex gap-2 items-center' onClick={() => setMenuOpen(false)}>
                <Image src="/logo.svg" alt="Logo" width={28} height={28} />
                <h3 className='text-lg font-semibold text-foreground'>Webyrix</h3>
              </Link>
              <button aria-label='Close menu' onClick={() => setMenuOpen(false)} className='p-2 rounded-md hover:bg-accent/60'>
                <svg xmlns='http://www.w3.org/2000/svg' className='h-6 w-6 text-foreground' fill='none' viewBox='0 0 24 24' stroke='currentColor'>
                  <path strokeLinecap='round' strokeLinejoin='round' strokeWidth={2} d='M6 18L18 6M6 6l12 12' />
                </svg>
              </button>
            </div>

            <nav className='flex flex-col gap-2'>
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
                        setMenuOpen(false);
                      }}
                      className='text-foreground text-base text-left px-2 py-3 rounded-md'
                    >
                      {item.name}
                    </button>
                  );
                }

                return (
                  <Link key={item.name} href={item.href} target={isExternal ? '_blank' : undefined} rel={isExternal ? 'noopener noreferrer' : undefined} onClick={() => setMenuOpen(false)}>
                    <span className='block px-2 py-3 text-foreground'>{item.name}</span>
                  </Link>
                );
              })}
            </nav>

            <div className='mt-auto flex flex-col gap-3'>
              <Link href='/contact' onClick={() => setMenuOpen(false)}>
                <Button variant={'ghost'} className='w-full'>Contact</Button>
              </Link>

              {!user ? (
                <>
                  <Link href="/sign-in" onClick={() => setMenuOpen(false)}>
                    <Button className='w-full'>Log in</Button>
                  </Link>
                  <Link href="/sign-up" onClick={() => setMenuOpen(false)}>
                    <Button className='w-full bg-primary text-primary-foreground'>Sign Up</Button>
                  </Link>
                </>
              ) : (
                <>
                  <Link href={'/workspace'} onClick={() => setMenuOpen(false)}>
                    <Button className='w-full bg-primary text-primary-foreground'>Dashboard</Button>
                  </Link>
                  <div className='w-full'>
                    <UserButton
                      afterSignOutUrl='/'
                      appearance={{
                        baseTheme: dark,
                        elements: {
                          avatarBox: "w-10 h-10 ring-2 ring-white/20",
                          userButtonPopoverCard: "bg-neutral-900 border border-white/10 shadow-xl rounded-xl",
                          userButtonPopoverFooter: "hidden !hidden opacity-0 pointer-events-none h-0 p-0 m-0"
                        }
                      }}
                    />
                  </div>
                </>
              )}
            </div>
          </aside>
        </div>
      )}
    </header>
  )
}

export default Header;
