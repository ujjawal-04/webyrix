import React from 'react'
import Image from 'next/image'

export const Logo = ({ className = "" }: { className?: string }) => (
    <div className={`flex items-center gap-2 font-bold text-xl tracking-tight ${className}`}>
        <div className="relative w-8 h-8">
            <Image src="/logo.svg" alt="Logo" fill className="object-contain" />
        </div>
        <span className="text-foreground">Webyrix</span>
    </div>
);
