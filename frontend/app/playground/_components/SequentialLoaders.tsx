'use client';

import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

const SequentialLoaders = ({ mode = 'loading' }: { mode?: 'loading' | 'streaming' }) => {
    const [step, setStep] = useState(0);

    useEffect(() => {
        if (mode === 'streaming') {
            const timer = setInterval(() => {
                setStep((s) => (s + 1) % 2);
            }, 3000);
            return () => clearInterval(timer);
        } else {
            setStep(0); // Show only grid while loading
        }
    }, [mode]);

    return (
        <div className="flex flex-col items-center justify-center p-12 w-full h-full rounded-xl">
            <AnimatePresence mode="wait">
                {step === 0 ? (
                    /* Loading Squares (Grid) - Extra Large */
                    <motion.div
                        key="grid"
                        initial={{ opacity: 0, scale: 0.9 }}
                        animate={{ opacity: 1, scale: 1 }}
                        exit={{ opacity: 0, scale: 0.9 }}
                        transition={{ duration: 0.5 }}
                        className="rounded-2xl p-12"
                    >
                        <div className="grid grid-cols-2 gap-10 w-80 h-80">
                            {[0, 1, 2, 3].map((i) => (
                                <motion.div
                                    key={i}
                                    className="border-[4px] border-dashed border-primary/40 rounded-2xl"
                                    animate={{
                                        opacity: [0.3, 1, 0.3],
                                        scale: [0.95, 1.05, 0.95],
                                        borderColor: ['rgba(var(--primary),0.2)', 'rgba(var(--primary),0.8)', 'rgba(var(--primary),0.2)']
                                    }}
                                    transition={{
                                        duration: 2,
                                        repeat: Infinity,
                                        delay: i * 0.2,
                                        ease: "easeInOut"
                                    }}
                                />
                            ))}
                        </div>
                    </motion.div>
                ) : (
                    /* Shifting Windows (Streaming) - Extra Large */
                    <motion.div
                        key="streaming"
                        initial={{ opacity: 0, scale: 1.1 }}
                        animate={{ opacity: 1, scale: 1 }}
                        exit={{ opacity: 0, scale: 0.9 }}
                        transition={{ duration: 0.5 }}
                        className="flex flex-col items-center gap-8 rounded-2xl p-12"
                    >
                        <div className="relative p-12 border border-border/10">
                            <div className="relative w-72 h-72">
                                {/* Top-left box */}
                                <motion.div
                                    className="absolute border-[4px] border-dashed border-primary/60 rounded-xl"
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
                                />

                                {/* Top-right box */}
                                <motion.div
                                    className="absolute border-[4px] border-dashed border-primary/60 rounded-xl"
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
                                />

                                {/* Bottom-left box */}
                                <motion.div
                                    className="absolute border-[4px] border-dashed border-primary/60 rounded-xl"
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
                                />

                                {/* Bottom-right box */}
                                <motion.div
                                    className="absolute border-[4px] border-dashed border-primary/60 rounded-xl"
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
                                />
                            </div>
                        </div>
                    </motion.div>
                )}
            </AnimatePresence>
        </div>
    );
};

export default SequentialLoaders;
