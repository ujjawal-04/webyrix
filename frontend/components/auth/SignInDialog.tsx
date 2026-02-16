"use client"

import { SignIn } from '@clerk/nextjs'
import { dark } from '@clerk/themes'
import { Dialog, DialogContent, DialogTitle } from '@/components/ui/dialog'
import { Logo } from '@/components/ui/logo'
import { VisuallyHidden } from '@radix-ui/react-visually-hidden'
import Image from 'next/image'

interface SignInDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
}

export function SignInDialog({ open, onOpenChange }: SignInDialogProps) {  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="!max-w-[1100px] w-[95vw] lg:w-[90vw] xl:w-[85vw] p-0 bg-transparent border-0 overflow-visible gap-0 max-h-[90vh]" showCloseButton={false}>
        <VisuallyHidden>
          <DialogTitle>Sign In</DialogTitle>
        </VisuallyHidden>
        
        {/* Main Card Container - Matches AuthLayout structure */}
        <div className="w-full min-h-fit lg:min-h-[600px] bg-card/40 backdrop-blur-2xl border border-white/10 rounded-2xl md:rounded-[32px] shadow-2xl overflow-auto flex flex-col lg:flex-row relative">
          
          {/* Left Side: Form Content */}
          <div className="w-full lg:w-[50%] p-3 sm:p-8 md:p-12 flex flex-col justify-center items-center relative bg-gradient-to-br from-white/[0.03] to-transparent">
            <div className="w-full max-w-[340px]">
              <div className="mb-6 flex flex-col items-center text-center lg:items-start lg:text-left">
                <Logo className="mb-6" />
                <h2 className="text-3xl sm:text-4xl md:text-5xl font-light text-white mb-2 tracking-tight">Welcome back</h2>
                <p className="text-gray-400 text-base sm:text-lg">Please Enter your Account details</p>
              </div>              <SignIn
                routing="hash"
                appearance={{
                  baseTheme: dark,
                  elements: {
                    rootBox: "w-full",
                    card: "bg-transparent shadow-none w-full p-0 flex flex-col items-center",
                    header: "hidden",
                    footer: "!hidden",

                    socialButtonsBlockButton: "w-full bg-white hover:bg-white/90 text-black border-0 rounded-full py-3 px-6 font-medium transition-all hover:scale-[1.02] shadow-lg",
                    socialButtonsBlockButtonText: "text-black font-medium",
                    socialButtonsProviderIcon__google: "w-5 h-5",
                    socialButtonsProviderIcon__github: "w-5 h-5",
                    socialButtonsProviderIcon__facebook: "w-5 h-5",                    formFieldLabel: "text-sm font-light tracking-tight text-white/70 ml-2 mb-1",
                    formFieldInput: "w-full bg-black border border-white/10 rounded-full py-3 px-6 text-white placeholder-white/20 focus:outline-none focus:ring-2 focus:ring-primary/40 transition-all duration-300 shadow-[inset_0_2px_10px_rgba(0,0,0,0.5)]",

                    formButtonPrimary: "w-full py-3 text-lg rounded-full font-light tracking-tight transition-all duration-300 transform active:scale-95 bg-gradient-to-r from-purple-500 via-pink-400 to-orange-400 text-white hover:opacity-90 shadow-[0_8px_30px_rgb(168,85,247,0.3)] mt-4 !border-0 !ring-0 !outline-none !text-white",

                    footerActionLink: "text-purple-500 hover:text-purple-400 underline decoration-purple-500/30 underline-offset-4",
                    badge: 'hidden',
                    identityPreviewText: "text-white/60",
                    formFieldAction: "text-white/60 hover:text-white",
                    dividerLine: "bg-white/10",
                    dividerText: "text-white/40 uppercase text-[10px] tracking-widest",
                  },
                  layout: {
                    socialButtonsPlacement: 'bottom',
                    socialButtonsVariant: 'blockButton',
                  }
                }}
              />

              <div className="mt-6 pt-4 border-t border-white/5 text-center">
                <p className="text-gray-400 text-sm">
                  Don&apos;t have an account?{' '}
                  <button
                    onClick={() => {
                      onOpenChange(false)
                      setTimeout(() => {
                        const signUpButton = document.querySelector('[data-signup-trigger]') as HTMLButtonElement
                        signUpButton?.click()
                      }, 100)
                    }}
                    className="text-purple-400 hover:text-purple-300 transition-colors font-medium"
                  >
                    Sign up
                  </button>
                </p>
              </div>
            </div>
          </div>

          {/* Right Side: Visual/Testimonial */}
          <div className="hidden lg:flex w-[50%] bg-[#0A0A0A] relative flex-col justify-between p-12 overflow-hidden border-l border-white/5">
            {/* Background Logo */}
            <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[120%] h-[120%] opacity-25 pointer-events-none">
              <Image
                src="/logo.svg"
                alt="Background Logo"
                fill
                className="object-contain opacity-20"
                priority
              />
            </div>

            {/* Content Area */}
            <div className="relative z-10 mt-10">
              <h2 className="text-[42px] font-light text-white mb-6 leading-[1.05] tracking-tight">
                What our Developers Said.
              </h2>

              <div className="text-5xl text-white/30 mb-4 font-serif select-none italic">"</div>

              <p className="text-gray-300 text-lg leading-relaxed mb-8 max-w-[90%]">
                Search and find your dream designs is now easier than ever. Just describe an idea and copy the code if you need to.
              </p>
            </div>

            {/* Floating Card */}
            <div className="absolute -bottom-1 -right-1 z-20">
              <div className="relative bg-white text-black p-8 pt-10 rounded-tl-[40px] w-[320px] shadow-2xl overflow-hidden hover:shadow-primary/10 transition-shadow duration-500">
                <div className="absolute top-0 right-0 w-20 h-20 bg-[#0A0A0A] rounded-bl-[40px] -mr-1 -mt-1 shadow-inner" />
                <div className="relative z-10">
                  <h3 className="font-light tracking-tight text-2xl mb-3 leading-[1.15] pr-16 text-[#0F0F0F]">
                    Start building your dream project today
                  </h3>
                  <p className="text-sm text-[#555555] mb-0 leading-relaxed max-w-[90%]">
                    Join thousands of developers creating stunning interfaces with Webyrix.
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  )
}
