'use client'
import { Button } from '@/components/ui/button'
import { ArrowUp, HomeIcon, ImagePlus, LayoutDashboard, User, UserPlus } from 'lucide-react'
import React, { useState } from 'react'

const suggestions = [
  {
    label: 'Dashboard',
    prompt: 'Create an analytics dashboard to track customers and revenue data for a SaaS',
    icon: LayoutDashboard
  },
  {
    label: 'SignUp Form',
    prompt: 'Create a modern sign up form with email/password fields, Google and Github login options, and terms checkbox',
    icon: UserPlus
  },
  {
    label: 'Hero',
    prompt: 'Create a modern header and centered hero section for a productivity SaaS. Include a badge for feature announcement, a title with a subtle gradient effect',
    icon: HomeIcon
  },
  {
    label: 'User Profile Card',
    prompt: 'Create a modern user profile card component for a social media website',
    icon: User
  }
]


const Hero = () => {

    const [userInput, setUserInput] = useState<string>();
  return (
    <div className='flex flex-col items-center justify-center h-[80vh]'>
        {/* Header & description */}
        <h2 className='text-6xl font-bold'>What should we Design?</h2>
        <p className='mt-2 text-xl text-gray-500'>Generate, Edit and Explore Designs with AI</p>

        {/* input box */}
        <div className='w-full max-w-2xl p-5 border mt-5 rounded-2xl'>
            <textarea placeholder='Describe your design idea...' 
            value={userInput}
            onChange={(event) => setUserInput(event.target.value)}
            className='w-full h-24 focus:outline-none focus:ring-0 resize-none'
            />
            <div className='flex justify-between items-center'>
                <Button variant={'ghost'}><ImagePlus /></Button>
                <Button> <ArrowUp /> </Button>
            </div>
        </div>

        {/* suggestion list */}
        <div className='flex mt-4 gap-3'>
            {suggestions.map((suggestion,index) => (
                <Button key={index} variant={'outline'}
                onClick={() => setUserInput(suggestion.prompt)}
                >
                    <suggestion.icon />
                    {suggestion.label}
                </Button>
            ))}
        </div>
    </div>
  )
}

export default Hero
