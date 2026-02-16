'use client';

import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Layers, LayoutTemplate, Box, Package, Activity } from 'lucide-react';

// --- CONFIGURATION ---
const TRANSITION_DURATION = 3500;

const STEPS = [
    {
        file: 'app/globals.css',
        status: 'Updating styles',
        icon: <Layers className="w-3.5 h-3.5" />,
        color: 'text-violet-400',
        borders: ['border-violet-400/50', 'border-fuchsia-400/50', 'border-violet-300/40', 'border-purple-400/50'],
        accents: ['bg-violet-500/30', 'bg-fuchsia-500/20', 'bg-muted/30']
    },
    {
        file: 'app/layout.tsx',
        status: 'Updating layout',
        icon: <LayoutTemplate className="w-3.5 h-3.5" />,
        color: 'text-amber-400',
        borders: ['border-amber-400/50', 'border-pink-400/50', 'border-amber-300/40', 'border-orange-400/50'],
        accents: ['bg-amber-500/30', 'bg-pink-500/20', 'bg-muted/30']
    },
    {
        file: 'components/header.tsx',
        status: 'Creating component',
        icon: <Box className="w-3.5 h-3.5" />,
        color: 'text-emerald-400',
        borders: ['border-emerald-400/50', 'border-teal-400/50', 'border-emerald-300/40', 'border-green-400/50'],
        accents: ['bg-emerald-500/30', 'bg-teal-500/20', 'bg-muted/30']
    },
    {
        file: 'lib/utils.ts',
        status: 'Optimizing assets',
        icon: <Package className="w-3.5 h-3.5" />,
        color: 'text-orange-400',
        borders: ['border-orange-400/50', 'border-amber-400/50', 'border-orange-300/40', 'border-yellow-400/50'],
        accents: ['bg-orange-500/30', 'bg-amber-500/20', 'bg-muted/30']
    }
];

// --- SUB-COMPONENTS ---

const InternalCodeLines = ({ accents }: { accents: string[] }) => (
    <div className="flex flex-col gap-1.5 w-full h-full justify-center p-2.5">
        {[0, 1, 2, 3, 4, 5, 6].map((i) => (
            <motion.div
                key={i}
                initial={{ width: 0 }}
                animate={{ width: [`${15 + i * 10}%`, `${85 - i * 5}%`, `${25 + i * 12}%`] }}
                transition={{ duration: 4, repeat: Infinity, ease: "linear", delay: i * 0.3 }}
                className={`h-1.5 rounded-full ${accents[i % accents.length]}`}
            />
        ))}
    </div>
);

const AnimatedBoxes = ({ currentStep, showContent = false }: { currentStep: typeof STEPS[0], showContent?: boolean }) => (
    <div className="relative w-120 h-72">
        {/* Top-left box */}
        <motion.div
            className={`absolute border-[2px] border-dashed ${currentStep.borders[0]} rounded-xl flex items-center justify-center`}
            style={{ top: '6px', left: '6px' }}
            animate={{
                width: ["calc(50% - 12px)", "calc(70% - 12px)", "calc(30% - 12px)", "calc(50% - 12px)"],
                height: ["calc(50% - 12px)", "calc(50% - 12px)", "calc(50% - 12px)", "calc(30% - 12px)", "calc(70% - 12px)", "calc(50% - 12px)"]
            }}
            transition={{
                duration: 4,
                repeat: Infinity,
                ease: "easeInOut",
                times: [0, 0.15, 0.35, 0.5, 0.65, 0.85, 1]
            }}
        >
            {showContent && <InternalCodeLines accents={currentStep.accents} />}
        </motion.div>

        {/* Top-right box */}
        <motion.div
            className={`absolute border-[2px] border-dashed ${currentStep.borders[1]} rounded-xl flex items-center justify-center`}
            style={{ top: '6px', right: '6px' }}
            animate={{
                width: ["calc(50% - 12px)", "calc(30% - 12px)", "calc(70% - 12px)", "calc(50% - 12px)"],
                height: ["calc(50% - 12px)", "calc(50% - 12px)", "calc(50% - 12px)", "calc(30% - 12px)", "calc(70% - 12px)", "calc(50% - 12px)"]
            }}
            transition={{
                duration: 4,
                repeat: Infinity,
                ease: "easeInOut",
                times: [0, 0.15, 0.35, 0.5, 0.65, 0.85, 1]
            }}
        >
            {showContent && <InternalCodeLines accents={currentStep.accents} />}
        </motion.div>

        {/* Bottom-left box */}
        <motion.div
            className={`absolute border-[2px] border-dashed ${currentStep.borders[2]} rounded-xl flex items-center justify-center`}
            style={{ bottom: '6px', left: '6px' }}
            animate={{
                width: ["calc(50% - 12px)", "calc(30% - 12px)", "calc(70% - 12px)", "calc(50% - 12px)"],
                height: ["calc(50% - 12px)", "calc(50% - 12px)", "calc(50% - 12px)", "calc(70% - 12px)", "calc(30% - 12px)", "calc(50% - 12px)"]
            }}
            transition={{
                duration: 4,
                repeat: Infinity,
                ease: "easeInOut",
                times: [0, 0.15, 0.35, 0.5, 0.65, 0.85, 1]
            }}
        >
            {showContent && <InternalCodeLines accents={currentStep.accents} />}
        </motion.div>

        {/* Bottom-right box */}
        <motion.div
            className={`absolute border-[2px] border-dashed ${currentStep.borders[3]} rounded-xl flex items-center justify-center`}
            style={{ bottom: '6px', right: '6px' }}
            animate={{
                width: ["calc(50% - 12px)", "calc(70% - 12px)", "calc(30% - 12px)", "calc(50% - 12px)"],
                height: ["calc(50% - 12px)", "calc(50% - 12px)", "calc(50% - 12px)", "calc(70% - 12px)", "calc(30% - 12px)", "calc(50% - 12px)"]
            }}
            transition={{
                duration: 4,
                repeat: Infinity,
                ease: "easeInOut",
                times: [0, 0.15, 0.35, 0.5, 0.65, 0.85, 1]
            }}
        >
            {showContent && <InternalCodeLines accents={currentStep.accents} />}
        </motion.div>
    </div>
);

const LoadingVariant = ({ currentStep }: { currentStep: typeof STEPS[0] }) => (
    <motion.div
        key="loading-variant"
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: 1, scale: 1 }}
        exit={{ opacity: 0, scale: 1.1 }}
        className="flex flex-col items-center justify-center p-12 w-full h-full rounded-xl"
    >
        <div className="flex flex-col items-center gap-8 rounded-2xl p-12">
            <div className="relative p-12">
                <AnimatedBoxes currentStep={currentStep} showContent={false} />
            </div>
        </div>
    </motion.div>
);

const StreamingVariant = ({ currentStep }: { currentStep: typeof STEPS[0] }) => {
    return (
        <motion.div
            key="streaming-variant"
            initial={{ opacity: 0, scale: 0.98 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 1.02 }}
            className="relative w-full max-w-[520px] group"
        >
            <motion.div layout className="relative overflow-hidden rounded-2xl border border-border/50 bg-card/95 shadow-[0_40px_100px_rgba(0,0,0,0.4)] backdrop-blur-md">
                {/* Header */}
                <div className="flex h-12 items-center justify-between border border-white/[0.05] bg-secondary/50 px-5">
                    <div className="flex gap-2.5">
                        <div className="h-3 w-3 rounded-full bg-white/[0.05]" />
                        <div className="h-3 w-3 rounded-full bg-white/[0.05]" />
                        <div className="h-3 w-3 rounded-full bg-white/[0.05]" />
                    </div>
                    {/* <div className="flex items-center gap-2">
                        <AnimatePresence mode="wait">
                            <motion.div
                                key={currentStep.file}
                                initial={{ y: 8, opacity: 0 }}
                                animate={{ y: 0, opacity: 1 }}
                                exit={{ y: -8, opacity: 0 }}
                                className="flex items-center gap-2.5 text-[13px] font-medium text-muted-foreground"
                            >
                                <span className={currentStep.color}>{currentStep.icon}</span>
                                <span className="tracking-tight text-white/90">{currentStep.file}</span>
                            </motion.div>
                        </AnimatePresence>
                    </div>
                    <div className="w-10 flex justify-end">
                        <Activity className="h-4 w-4 text-primary opacity-30 animate-pulse" />
                    </div> */}
                </div>

                {/* Content Area */}
                <div className="relative h-80 w-full flex items-center justify-center overflow-hidden bg-transparent">
                    <div className="relative w-full h-full border border-white/[0.02] flex items-center justify-center">
                        <AnimatedBoxes currentStep={currentStep} showContent={true} />
                    </div>
                </div>
            </motion.div>
        </motion.div>
    );
};

// --- MAIN COMPONENT ---

const SequentialLoaders = ({ mode }: { mode?: 'loading' | 'streaming' }) => {
    const [activeStep, setActiveStep] = useState(0);

    useEffect(() => {
        if (mode === 'loading' || mode === 'streaming') {
            const interval = setInterval(() => {
                setActiveStep((prev) => (prev + 1) % STEPS.length);
            }, TRANSITION_DURATION);
            return () => clearInterval(interval);
        }
    }, [mode]);

    // safety guard: Return null if mode is missing or invalid
    if (!mode || (mode !== 'loading' && mode !== 'streaming')) return null;

    return (
        <div className="flex flex-col items-center justify-center p-8 w-full h-full bg-transparent font-sans antialiased overflow-hidden">
            <AnimatePresence mode="wait">
                {mode === 'loading' ? (
                    <LoadingVariant key="loading" currentStep={STEPS[activeStep]} />
                ) : (
                    <StreamingVariant key="streaming" currentStep={STEPS[activeStep]} />
                )}
            </AnimatePresence>
        </div>
    );
};

export default SequentialLoaders;








{/* Status Bar */ }
// <div className="h-11 border border-border/10 bg-transparent flex items-center justify-center">
//     <AnimatePresence mode="wait">
//         <motion.div
//             key={currentStep.status}
//             initial={{ opacity: 0, y: 5 }}
//             animate={{ opacity: 1, y: 0 }}
//             exit={{ opacity: 0, y: -5 }}
//             className="flex items-center gap-2.5"
//         >
//             <div className={`h-2 w-2 rounded-full ${currentStep.color.replace('text-', 'bg-').split('/')[0]} opacity-30 animate-pulse`} />
//             {/* <span className="text-[12px] font-medium text-muted-foreground tracking-wide">{currentStep.status}</span> */}
//         </motion.div>
//     </AnimatePresence>
// </div>