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
const Header = () => {
        </Link>

        {/*Desktop Navigation - visible md+ */}
        <nav className='hidden md:flex items-center gap-1'>
          {navigation.map((item) => {
            const isHashLink = item.href.startsWith('#');
            const isExternal = item.href.startsWith('http');
 const Header = () => {
            }

            return (
              <Link
                key={item.name}
                href={item.href}
                target={isExternal ? '_blank' : undefined}
                rel={isExternal ? 'noopener noreferrer' : undefined}
 const Header = () => {

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
const Header = () => {
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
 const Header = () => {

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
