"use client";

import { Card } from "@/components/ui/card";
import { 
  Sparkles, 
  Eye, 
  MessageSquare, 
  Code2, 
  FolderOpen, 
  Coins 
} from "lucide-react";

const features = [
  {
    icon: Sparkles,
    title: "AI-Powered Generation",
    description: "Describe your design idea in natural language and watch as AI generates production-ready React and Tailwind CSS code instantly.",
  },
  {
    icon: Eye,
    title: "Live Preview",
    description: "See your design come to life in real-time with an interactive preview as the code is being generated.",
  },
  {
    icon: MessageSquare,
    title: "Iterative Refinement",
    description: "Chat with AI to refine and improve your design. Make changes through conversation until it's perfect.",
  },
  {
    icon: Code2,
    title: "Copy & Export",
    description: "Get clean, production-ready code that you can copy with one click and integrate directly into your project.",
  },
  {
    icon: FolderOpen,
    title: "Project Management",
    description: "Save your generated designs as projects and access them anytime. All your work is automatically preserved.",
  },
  {
    icon: Coins,
    title: "Credit System",
    description: "Start with 2 free credits to explore. Each new project costs 1 credit, making it easy to try before you commit.",
  },
];

export default function Explore() {
  return (
    <section id="explore" className="py-16 md:py-24 px-4 bg-background scroll-mt-32">
      <div className="max-w-7xl mx-auto">
        {/* Section Header */}
        <div className="text-center mb-12 md:mb-16 space-y-4">
          <h2 className="text-4xl md:text-5xl lg:text-6xl font-light tracking-tight">
            <span className="bg-gradient-to-r from-purple-500 via-pink-400 to-orange-400 bg-clip-text text-transparent">
              Explore
            </span>{" "}
            <span className="text-foreground">Features</span>
          </h2>
          <p className="text-muted-foreground text-lg md:text-xl max-w-3xl mx-auto font-light tracking-wide">
            Everything you need to transform your design ideas into production-ready code
          </p>
        </div>

        {/* Features Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {features.map((feature, index) => {
            return (
              <Card
                key={index}
                className="p-6 bg-card border-border hover:border-muted-foreground/50 transition-all duration-300 hover:shadow-lg hover:shadow-purple-500/10 animate-in fade-in slide-in-from-bottom-4"
                style={{
                  animationDelay: `${index * 100}ms`,
                  animationDuration: "700ms",
                }}
              >
                <div className="space-y-4">
                  <h3 className="text-xl font-light tracking-wide text-foreground">
                    {feature.title}
                  </h3>
                  <p className="text-muted-foreground leading-relaxed font-light tracking-wide">
                    {feature.description}
                  </p>
                </div>
              </Card>
            );
          })}
        </div>
      </div>
    </section>
  );
}
