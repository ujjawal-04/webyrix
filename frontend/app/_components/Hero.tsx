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
    <div className='flex flex-col items-center justify-center min-h-[80vh] py-12 px-4 bg-background'>
      
      {/* Badge / Banner */}
      <div className='mb-8 flex items-center gap-3 px-5 py-2.5 rounded-full border border-border bg-background hover:border-border/80 transition-colors cursor-pointer animate-in fade-in slide-in-from-bottom-4 duration-500'>
        <span className='text-xs font-bold text-foreground'>WEBYRIX CONF 2026</span>
        <span className='text-sm text-muted-foreground'>Join us for the <span className='text-foreground font-semibold'>Live Keynote</span> on <span className='text-foreground font-semibold'>March 15 at 10am PT</span>.</span>
        <ArrowUp className='h-3 w-3 ml-1 rotate-45 text-muted-foreground' />
      </div>

      {/* Header & description */}
      <div className='text-center space-y-6 max-w-5xl mx-auto'>
        <h1 className='text-5xl md:text-7xl lg:text-[7rem] font-lg tracking-tight leading-[0.95] animate-in fade-in slide-in-from-bottom-8 duration-700'>
          <span className='bg-gradient-to-r from-purple-500 via-pink-400 to-orange-400 bg-clip-text text-transparent'>Imagine.</span>{' '}
          <span className='text-foreground'>Preview.</span>{' '}
          <span className='text-foreground'>Copy.</span>
        </h1>
        <p className='mt-6 text-base md:text-lg text-muted-foreground max-w-3xl mx-auto animate-in fade-in slide-in-from-bottom-12 duration-1000 leading-relaxed'>
          Webyrix's AI Imagine suite provides developers with designs and corresponding copy-and-paste-friendly React code in a matter of seconds.
        </p>
      </div>

      {/* input box */}
      <div className='w-full max-w-4xl mt-12 animate-in fade-in slide-in-from-bottom-16 duration-1000 delay-200'>
        <div className='rounded-3xl border-2 border-border bg-card/30 backdrop-blur-sm p-6 transition-all focus-within:border-muted-foreground/50'>
          <textarea 
            placeholder='Describe your design idea...'
            value={userInput}
            onChange={(event) => setUserInput(event.target.value)}
            className='w-full bg-transparent focus:outline-none resize-none text-lg text-foreground placeholder:text-muted-foreground h-20 mb-4'
          />
          <div className='flex justify-between items-center pt-2'>
            <Button variant={'ghost'} size="icon" className='text-muted-foreground hover:text-foreground hover:bg-accent'>
              <ImagePlus className='h-5 w-5' />
            </Button>
            
            {!user ? (
              <SignInButton mode='modal' forceRedirectUrl={'/workspace'}>
                <Button disabled={!userInput} className="rounded-xl bg-secondary text-secondary-foreground hover:bg-secondary/80 px-12 py-5 font-medium text-sm h-auto"> 
                  <ArrowUp className='h-5 w-5' />
                </Button>
              </SignInButton>
            ) : (
              <Button 
                disabled={!userInput || loading} 
                onClick={CreateNewProject} 
                className="rounded-xl bg-secondary text-secondary-foreground hover:bg-secondary/80 px-12 py-5 font-medium text-sm h-auto"
              >
                {loading ? <Loader2Icon className='animate-spin h-5 w-5' /> : <ArrowUp className='h-5 w-5' />}
              </Button>
            )}
          </div>
        </div>
      </div>

      {/* suggestion list */}
      <div className='flex flex-wrap justify-center items-center mt-8 gap-3 animate-in fade-in slide-in-from-bottom-20 duration-1000 delay-300'>
        <span className='text-sm text-muted-foreground'>Need inspiration?</span>
        {suggestions.map((suggestion, index) => (
          <button 
            key={index} 
            onClick={() => setUserInput(suggestion.prompt)}
            className='flex items-center gap-2 px-4 py-2 rounded-lg border border-border bg-background hover:border-muted-foreground/50 hover:bg-card text-sm text-foreground transition-all duration-200'
          >
            {suggestion.label}
            <ArrowUp className='h-3 w-3 rotate-45' />
          </button>
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
