import React from 'react'
import Image from 'next/image'


interface AuthLayoutProps {
    children: React.ReactNode
    testimonialTitle: string
    testimonialText: string
}

export function AuthLayout({
    children,
    testimonialTitle,
    testimonialText,
}: Omit<AuthLayoutProps, 'authorName' | 'authorRole'>) {
    return (
        <div className="min-h-screen flex items-center justify-center p-3 sm:p-4 relative bg-background selection:bg-primary/30 overflow-hidden">
            {/* Ambient Background Glows */}
            <div className="absolute top-1/4 -left-20 w-[600px] h-[600px] bg-primary/10 blur-[150px] rounded-full pointer-events-none" />
            <div className="absolute bottom-1/4 -right-20 w-[600px] h-[600px] bg-accent/5 blur-[150px] rounded-full pointer-events-none" />


            {/* Main Card Container */}
            <div className="w-full max-w-[1000px] min-h-fit lg:min-h-[600px] bg-card/40 backdrop-blur-2xl border border-white/10 rounded-2xl md:rounded-[32px] shadow-2xl overflow-hidden flex flex-col lg:flex-row relative z-10 transition-all duration-500">

                {/* Left Side: Form Content */}
                <div className="w-full lg:w-[50%] p-3 sm:p-8 md:p-12 flex flex-col justify-center items-center relative bg-gradient-to-br from-white/[0.03] to-transparent">
                    <div className="w-full max-w-[440px]">
                        {children}
                    </div>
                </div>

                {/* Right Side: Visual/Testimonial */}
                <div className="hidden lg:flex w-[50%] bg-[#0A0A0A] relative flex-col justify-between p-12 overflow-hidden border-l border-white/5">
                    {/* Geometric Starburst Graphic - Pixel Perfect to reference */}
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
                            {testimonialTitle}
                        </h2>

                        <div className="text-5xl text-white/30 mb-4 font-serif select-none italic">“</div>

                        <p className="text-gray-300 text-lg leading-relaxed mb-8 max-w-[90%]">
                            {testimonialText}
                        </p>
                    </div>

                    {/* Highly Notched Floating Card implementation */}
                    <div className="absolute -bottom-1 -right-1 z-20">
                        <div className="relative bg-white text-black p-8 pt-10 rounded-tl-[40px] w-[320px] shadow-2xl overflow-hidden hover:shadow-primary/10 transition-shadow duration-500">
                            {/* The Visual Notch effect */}
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
        </div>
    )
}
