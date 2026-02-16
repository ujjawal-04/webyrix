'use client';

import React, { useState, useEffect } from 'react';
import { Layers, LayoutTemplate, Box, Package } from 'lucide-react';

const CodeWindowLoader = () => {
    const [activeStep, setActiveStep] = useState(0);

    // Transition timing
    const TRANSITION_DURATION = 2500;

    const steps = [
        {
            file: 'app/globals.css',
            status: 'Updating styles',
            icon: <Layers className="w-3.5 h-3.5" />,
            color: 'text-violet-400',
            lines: [
                { width: '30%', color: 'bg-muted' },
                { width: '60%', color: 'bg-violet-500/30' },
                { width: '45%', color: 'bg-violet-500/20' },
                { width: '0%', color: 'transparent' },
                { width: '65%', color: 'bg-fuchsia-500/30' },
                { width: '40%', color: 'bg-muted' },
                { width: '75%', color: 'bg-violet-500/20' },
            ]
        },
        {
            file: 'app/layout.tsx',
            status: 'Updating layout',
            icon: <LayoutTemplate className="w-3.5 h-3.5" />,
            color: 'text-amber-400',
            lines: [
                { width: '25%', color: 'bg-pink-500/30' },
                { width: '40%', color: 'bg-muted' },
                { width: '0%', color: 'transparent' },
                { width: '55%', color: 'bg-amber-500/20' },
                { width: '70%', color: 'bg-muted', indent: true },
                { width: '45%', color: 'bg-amber-500/20', indent: true },
                { width: '35%', color: 'bg-muted', indent: true },
            ]
        },
        {
            file: 'components/header.tsx',
            status: 'Creating component',
            icon: <Box className="w-3.5 h-3.5" />,
            color: 'text-emerald-400',
            lines: [
                { width: '35%', color: 'bg-muted' },
                { width: '0%', color: 'transparent' },
                { width: '60%', color: 'bg-emerald-500/30' },
                { width: '80%', color: 'bg-muted', indent: true },
                { width: '50%', color: 'bg-emerald-500/20', indent: true },
                { width: '70%', color: 'bg-emerald-500/20', indent: true },
                { width: '25%', color: 'bg-muted' },
            ]
        },
        {
            file: 'lib/utils.ts',
            status: 'Optimizing assets',
            icon: <Package className="w-3.5 h-3.5" />,
            color: 'text-orange-400',
            lines: [
                { width: '20%', color: 'bg-orange-500/30' },
                { width: '45%', color: 'bg-muted' },
                { width: '0%', color: 'transparent' },
                { width: '65%', color: 'bg-orange-500/20' },
                { width: '40%', color: 'bg-muted', indent: true },
                { width: '55%', color: 'bg-orange-500/20', indent: true },
                { width: '30%', color: 'bg-muted' },
            ]
        }
    ];

    useEffect(() => {
        const interval = setInterval(() => {
            setActiveStep((prev) => (prev + 1) % steps.length);
        }, TRANSITION_DURATION);
        return () => clearInterval(interval);
    }, [steps.length]);

    const currentStep = steps[activeStep];

    return (
        <div className="flex min-h-[400px] w-full flex-col items-center justify-center bg-background p-8 font-sans antialiased">

            {/* Container for the window with slight perspective/glow */}
            <div className="group relative w-full max-w-[400px] transition-transform duration-700 hover:scale-[1.02]">

                {/* Glow Effect behind window */}
                <div className={`absolute -inset-0.5 rounded-xl opacity-20 blur-xl transition-colors duration-1000 ${currentStep.color.replace('text-', 'bg-')}`} />

                {/* The Main Code Window */}
                <div className="relative overflow-hidden rounded-xl border border-border/50 bg-card/90 shadow-2xl backdrop-blur-sm">

                    {/* Window Header */}
                    <div className="flex h-10 items-center justify-between border-b border-border/30 bg-secondary/30 px-4">
                        {/* Traffic Lights */}
                        <div className="flex gap-1.5 opacity-40 transition-opacity duration-300 group-hover:opacity-100">
                            <div className="h-2.5 w-2.5 rounded-full bg-red-500/80" />
                            <div className="h-2.5 w-2.5 rounded-full bg-yellow-500/80" />
                            <div className="h-2.5 w-2.5 rounded-full bg-green-500/80" />
                        </div>

                        {/* Filename Transition */}
                        <div className="flex items-center gap-2">
                            <AnimatedText
                                text={currentStep.file}
                                icon={currentStep.icon}
                                iconColor={currentStep.color}
                                className="text-xs font-medium text-muted-foreground"
                            />
                        </div>

                        {/* Empty space to balance header */}
                        <div className="w-10" />
                    </div>

                    {/* Window Body (Code Content) */}
                    <div className="flex flex-col gap-3 p-6">
                        {Array.from({ length: 7 }).map((_, i) => (
                            <CodeLine
                                key={i}
                                lineData={currentStep.lines[i]}
                            />
                        ))}
                    </div>

                    {/* Shimmer Overlay */}
                    <div className="pointer-events-none absolute inset-0 -translate-x-full animate-[shimmer_2s_infinite] bg-gradient-to-r from-transparent via-white/[0.03] to-transparent" />
                </div>
            </div>

            <style>{`
        @keyframes shimmer {
          100% { transform: translateX(100%); }
        }
        @keyframes slideUpFadeIn {
          0% { opacity: 0; transform: translateY(8px); }
          100% { opacity: 1; transform: translateY(0); }
        }
      `}</style>
        </div>
    );
};

/* --- Subcomponents for Smooth Transitions --- */

// Handles the elastic width transitions for code bars
const CodeLine = ({ lineData }: { lineData: { width: string; color: string; indent?: boolean } | undefined }) => (
    <div
        className={`h-2.5 rounded-full transition-all duration-700 ease-[cubic-bezier(0.25,0.1,0.25,1.0)] ${lineData?.indent ? 'ml-6' : ''}`}
        style={{
            width: lineData?.width || '0%',
            backgroundColor: lineData?.color === 'transparent' ? 'transparent' : undefined
        }}
    >
        {lineData?.color !== 'transparent' && (
            <div className={`h-full w-full rounded-full opacity-100 ${lineData?.color}`} />
        )}
    </div>
);

// Handles the text sliding up/down for Filenames
const AnimatedText = ({ text, icon, iconColor, className }: { text: string, icon: React.ReactNode, iconColor: string, className?: string }) => {
    return (
        <div className={`relative flex h-5 w-40 items-center justify-center overflow-hidden ${className}`}>
            {/* Key prop ensures React unmounts old text and mounts new text to trigger animation */}
            <div key={text} className="absolute inset-0 flex items-center justify-center gap-2 animate-[slideUpFadeIn_0.4s_ease-out_forwards]">
                <span className={iconColor}>{icon}</span>
                <span>{text}</span>
            </div>
        </div>
    );
};

// Handles the status text sliding
const AnimatedStatus = ({ text }: { text: string }) => {
    return (
        <div className="relative flex w-60 justify-center">
            {/* Key prop ensures React unmounts old text and mounts new text to trigger animation */}
            <div key={text} className="absolute top-0 flex items-center gap-2 animate-[slideUpFadeIn_0.5s_ease-out_forwards]">
                <div className="h-1.5 w-1.5 animate-pulse rounded-full bg-muted-foreground/50" />
                <span className="text-sm font-medium text-muted-foreground">{text}</span>
            </div>
        </div>
    );
};

export default CodeWindowLoader;
