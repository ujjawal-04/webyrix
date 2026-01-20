'use client'
import { Button } from '@/components/ui/button'
import { SignInButton, useAuth, useUser } from '@clerk/nextjs'
import axios from 'axios'
import { ArrowUp, HomeIcon, ImagePlus, LayoutDashboard, Loader2Icon, User, UserPlus } from 'lucide-react'
import { useRouter } from 'next/navigation'
import React, { useContext, useState } from 'react'
import { toast } from 'sonner'
import { v4 as uuidv4 } from 'uuid';
import { UserDetailContext } from "@/context/UserDetailContext"

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


function Hero() {

  const [userInput, setUserInput] = useState<string>();
  const { user } = useUser();
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const { has, getToken } = useAuth();
  const { userDetail, setUserDetail } = useContext(UserDetailContext);

  const hasUnlimitedAccess = has && has({ plan: 'unlimited' });

  const CreateNewProject = async () => {

    if (!hasUnlimitedAccess && userDetail?.credits! <= 0) {
      toast.error('You have no credits left. Please upgrade your plan.');
      return;
    }


    setLoading(true);
    const projectId = uuidv4();
    const frameId = generateRandomFrameNumber();
    const messages = [
      {
        role: 'user',
        content: userInput
      }
    ]
    try {
      const token = await getToken();
      const result = await axios.post(process.env.NEXT_PUBLIC_API_URL + '/api/projects', {
        projectId: projectId,
        frameId: frameId,
        messages: messages,
        credits: userDetail?.credits
      }, {
        headers: {
          Authorization: `Bearer ${token}`
        }
      });

      console.log(result.data);
      toast.success('Project created');
      //Navigate to playgrund
      router.push(`/playground/${projectId}?frameId=${frameId}`);
      setUserDetail((prev: any) => ({
        ...prev,
        credits: prev?.credits! - 1
      }));
      setLoading(false);
    } catch (e) {
      toast.error('Internal Server Error');
      console.log(e);
      setLoading(false);
    }
  }

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
          {!user ? <SignInButton mode='modal' forceRedirectUrl={'/workspace'}>
            <Button disabled={!userInput}> <ArrowUp /> </Button>
          </SignInButton> :
            <Button disabled={!userInput || loading} onClick={CreateNewProject}>{loading ? <Loader2Icon className='animate-spin' /> : <ArrowUp />}</Button>}
        </div>
      </div>

      {/* suggestion list */}
      <div className='flex mt-4 gap-3'>
        {suggestions.map((suggestion, index) => (
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

const generateRandomFrameNumber = () => {
  const num = Math.floor(Math.random() * 10000);
  return num;
}
