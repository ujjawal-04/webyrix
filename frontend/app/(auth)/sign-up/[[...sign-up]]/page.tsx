import { SignUp } from '@clerk/nextjs'
import { dark } from '@clerk/themes'
import { AuthLayout } from '@/components/auth/auth-layout'
import { Logo } from '@/components/ui/logo'
import Link from 'next/link'

export default function Page() {
  return (
    <AuthLayout
      testimonialTitle="Join the Revolution."
      testimonialText="Webyrix changed how we prototype. It's not just a tool; it's a creative partner that understands design systems perfectly."
    >
      <div className="mb-6 flex flex-col items-center text-center lg:items-start lg:text-left">
        <Logo className="mb-6" />
        <h2 className="text-3xl sm:text-4xl md:text-5xl font-light text-white mb-2 tracking-tight">Get Started</h2>
        <p className="text-gray-400 text-base sm:text-lg">Create your account to start building</p>
      </div>

      <SignUp
        appearance={{
          baseTheme: dark,
          elements: {
            rootBox: "w-full",
            card: "bg-transparent shadow-none w-full p-0 flex flex-col items-center",
            header: "hidden",
            footer: "!hidden",

            formFieldLabel: "text-sm font-light tracking-tight text-white/70 ml-2 mb-1",
            formFieldInput: "w-full bg-black border border-white/10 rounded-full py-3 px-6 text-white placeholder-white/20 focus:outline-none focus:ring-2 focus:ring-primary/40 transition-all duration-300 shadow-[inset_0_2px_10px_rgba(0,0,0,0.5)]",

            formButtonPrimary: "w-full py-3 text-lg rounded-full font-light tracking-tight transition-all duration-300 transform active:scale-95 bg-gradient-to-r from-purple-500 via-pink-400 to-orange-400 text-white hover:opacity-90 shadow-[0_8px_30px_rgb(168,85,247,0.3)] mt-4 !border-0 !ring-0 !outline-none",
            footerActionLink: "text-purple-500 hover:text-purple-400 underline decoration-purple-500/30 underline-offset-4",
            badge: 'hidden',
            dividerLine: "bg-white/10",
            dividerText: "text-white/40 uppercase text-[10px] tracking-widest",

            socialButtonsBlockButton: "hidden",
            socialButtonsIconButton: "bg-white hover:bg-white/90 w-10 h-10 rounded-full flex items-center justify-center shadow-lg transition-transform hover:scale-110",
            socialButtonsProviderIcon__google: "w-6 h-6",
            socialButtonsProviderIcon__github: "w-6 h-6 text-black",
            socialButtonsProviderIcon__facebook: "w-6 h-6",
          },
          layout: {
            socialButtonsPlacement: 'bottom',
            socialButtonsVariant: 'iconButton',
          }
        }}
      />
      <div className="mt-6 pt-4 border-t border-white/5 text-center">
        <p className="text-gray-400 text-sm">
          Already have an account?{' '}
          <Link href="/sign-in" className="text-purple-400 hover:text-purple-300 transition-colors font-medium">
            Login
          </Link>
        </p>
      </div>
    </AuthLayout>
  )
}