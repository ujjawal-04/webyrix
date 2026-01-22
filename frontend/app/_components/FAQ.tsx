"use client";

import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";

const faqs = [
  {
    question: "How does the credit system work?",
    answer: "You start with 2 free credits when you sign up. Each new project you create costs 1 credit. Credits allow you to generate designs and iterate on them as much as you want within that project. Once you run out, you can purchase additional credits to continue creating.",
  },
  {
    question: "What technologies does Webyrix support?",
    answer: "Webyrix generates production-ready React components using Tailwind CSS for styling. The code follows modern React best practices and is fully compatible with Next.js, Create React App, and other React frameworks. You can copy and paste the generated code directly into your projects.",
  },
  {
    question: "Can I customize the generated designs?",
    answer: "Absolutely! You can refine your designs through an iterative chat-based conversation. Simply describe what you want to change, and the AI will update the code accordingly. You can also copy the code and manually edit it in your own editor for complete control.",
  },
  {
    question: "What AI model powers Webyrix?",
    answer: "Webyrix uses advanced AI models through the OpenRouter API, providing state-of-the-art design generation capabilities. The AI understands natural language descriptions and generates high-quality, semantic HTML with modern Tailwind CSS styling.",
  },
  {
    question: "Are my projects saved automatically?",
    answer: "Yes! Every project you create is automatically saved to your account. You can access all your previous projects anytime from your dashboard, making it easy to revisit and continue working on your designs.",
  },
  {
    question: "Can I use the generated code commercially?",
    answer: "Yes, you have full rights to use the generated code in both personal and commercial projects. Once you generate the code, it's yours to use however you like without any attribution required.",
  },
  {
    question: "How fast is the code generation?",
    answer: "Code generation happens in real-time with streaming responses. You'll see your design being built live as the AI writes the code, typically taking just a few seconds to generate a complete component. The preview updates instantly as code is generated.",
  },
  {
    question: "Do I need coding knowledge to use Webyrix?",
    answer: "While Webyrix is designed for developers, you don't need to be an expert. Simply describe what you want in plain English, and the AI will handle the technical implementation. However, basic familiarity with React and Tailwind CSS will help you customize the generated code.",
  },
];

export default function FAQ() {
  return (
    <section id="faq" className="py-16 md:py-24 px-4 bg-background scroll-mt-32">
      <div className="max-w-4xl mx-auto">
        {/* Section Header */}
        <div className="text-center mb-12 md:mb-16 space-y-4">
          <h2 className="text-4xl md:text-5xl lg:text-6xl font-light tracking-tight text-foreground">
            <span className="bg-gradient-to-r from-purple-500 via-pink-400 to-orange-400 bg-clip-text text-transparent">Frequently</span> Asked Questions
          </h2>
          <p className="text-muted-foreground text-lg md:text-xl max-w-3xl mx-auto font-light tracking-wide">
            Everything you need to know about Webyrix
          </p>
        </div>

        {/* FAQ Accordion */}
        <Accordion
          type="single"
          collapsible
          className="w-full space-y-4 animate-in fade-in slide-in-from-bottom-8 duration-700"
        >
          {faqs.map((faq, index) => (
            <AccordionItem
              key={index}
              value={`item-${index}`}
              className="border border-border rounded-xl px-6 bg-card hover:border-muted-foreground/50 transition-colors duration-300"
              style={{
                animationDelay: `${index * 50}ms`,
              }}
            >
              <AccordionTrigger className="text-left hover:no-underline py-6">
                <span className="text-lg font-light tracking-wide text-foreground pr-4">
                  {faq.question}
                </span>
              </AccordionTrigger>
              <AccordionContent className="text-muted-foreground leading-relaxed pb-6 font-light tracking-wide">
                {faq.answer}
              </AccordionContent>
            </AccordionItem>
          ))}
        </Accordion>
      </div>
    </section>
  );
}
