import { SignIn } from '@clerk/nextjs'
import { dark } from '@clerk/themes'
import { AuthLayout } from '@/components/auth/auth-layout'
import { Logo } from '@/components/ui/logo'
import Link from 'next/link'

export default function Page() {
  return (
    <AuthLayout
      testimonialTitle="What our Developers Said."
      testimonialText="Search and find your dream designs is now easier than ever. Just describe an idea and copy the code if you need to."
    >
      <div className="mb-6 flex flex-col items-center text-center lg:items-start lg:text-left">
        <Logo className="mb-6" />
        <h2 className="text-3xl sm:text-4xl md:text-5xl font-light text-white mb-2 tracking-tight">Welcome back</h2>
        <p className="text-gray-400 text-base sm:text-lg">Please Enter your Account details</p>
      </div>

      <SignIn
        appearance={{
          baseTheme: dark,
          elements: {
            rootBox: "w-full",
            card: "bg-transparent shadow-none w-full p-0 flex flex-col items-center",
            header: "hidden", // Hide default Clerk header as we use custom one
            footer: "!hidden",

            // Social Buttons
            socialButtonsBlockButton: "hidden", // Hide block buttons if we want icon only, but Clerk usually does block or icon. 
            // Let's use icon variant layout override if possible, or style block buttons to look like icons? 
            // Actually the user design has circular icons. Clerk's 'socialButtonsVariant': 'iconButton' in layout config does this.
            socialButtonsIconButton: "bg-white hover:bg-white/90 w-10 h-10 rounded-full flex items-center justify-center shadow-lg transition-transform hover:scale-110",
            socialButtonsProviderIcon__google: "w-6 h-6",
            socialButtonsProviderIcon__github: "w-6 h-6 text-black",
            socialButtonsProviderIcon__facebook: "w-6 h-6",

            formFieldLabel: "text-sm font-light tracking-tight text-white/70 ml-2 mb-1",
            formFieldInput: "w-full bg-black border border-white/10 rounded-full py-3 px-6 text-white placeholder-white/20 focus:outline-none focus:ring-2 focus:ring-primary/40 transition-all duration-300 shadow-[inset_0_2px_10px_rgba(0,0,0,0.5)]",

            formButtonPrimary: "w-full py-3 text-lg rounded-full font-light tracking-tight transition-all duration-300 transform active:scale-95 bg-gradient-to-r from-purple-500 via-pink-400 to-orange-400 text-white hover:opacity-90 shadow-[0_8px_30px_rgb(168,85,247,0.3)] mt-4 !border-0 !ring-0 !outline-none",

            footerActionLink: "text-purple-500 hover:text-purple-400 underline decoration-purple-500/30 underline-offset-4",
            badge: 'hidden',
            identityPreviewText: "text-white/60",
            formFieldAction: "text-white/60 hover:text-white",
            dividerLine: "bg-white/10",
            dividerText: "text-white/40 uppercase text-[10px] tracking-widest",
          },
          layout: {
            socialButtonsPlacement: 'bottom',
            socialButtonsVariant: 'iconButton',
          }
        }}
      />
      <div className="mt-6 pt-4 border-t border-white/5 text-center">
        <p className="text-gray-400 text-sm">
          Don&apos;t have an account?{' '}
          <Link href="/sign-up" className="text-purple-400 hover:text-purple-300 transition-colors font-medium">
            Sign up
          </Link>
        </p>
      </div>
    </AuthLayout>
  )
}