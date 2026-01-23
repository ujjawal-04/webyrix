import { Button } from '@/components/ui/button'
import { Code2Icon, Download, Monitor, SquareArrowOutUpRightIcon, Tablet } from 'lucide-react'
import React, { useEffect, useState } from 'react'
import ViewCodeBlock from './ViewCodeBlock'

const HTML_CODE = `<!DOCTYPE html>
      <html lang="en">
      <head>
        <meta charset="UTF-8" />
        <meta name="viewport" content="width=device-width, initial-scale=1.0" />
        <meta name="description" content="AI Website Builder - Modern TailwindCSS + Flowbite Template" />
        <title>Webyrix</title>

        <!-- Tailwind CSS -->
        <script src="https://cdn.tailwindcss.com"></script>

        <!-- Flowbite CSS & JS -->
        <link href="https://cdnjs.cloudflare.com/ajax/libs/flowbite/2.3.0/flowbite.min.css" rel="stylesheet" />
        <script src="https://cdnjs.cloudflare.com/ajax/libs/flowbite/2.3.0/flowbite.min.js"></script>

        <!-- Font Awesome / Lucide -->
        <script src="https://unpkg.com/lucide@latest/dist/umd/lucide.js"></script>

        <!-- Chart.js -->
        <script src="https://cdn.jsdelivr.net/npm/chart.js"></script>

        <!-- AOS -->
        <link href="https://cdnjs.cloudflare.com/ajax/libs/aos/2.3.4/aos.css" rel="stylesheet" />
        <script src="https://cdnjs.cloudflare.com/ajax/libs/aos/2.3.4/aos.js"></script>

        <!-- GSAP -->
        <script src="https://cdnjs.cloudflare.com/ajax/libs/gsap/3.12.2/gsap.min.js"></script>

        <!-- Lottie -->
        <script src="https://cdnjs.cloudflare.com/ajax/libs/lottie-web/5.11.2/lottie.min.js"></script>

        <!-- Swiper -->
        <link href="https://cdn.jsdelivr.net/npm/swiper@10/swiper-bundle.min.css" rel="stylesheet" />
        <script src="https://cdn.jsdelivr.net/npm/swiper@10/swiper-bundle.min.js"></script>

        <!-- Tippy.js -->
        <link href="https://unpkg.com/tippy.js@6/dist/tippy.css" rel="stylesheet" />
        <script src="https://unpkg.com/@popperjs/core@2"></script>
        <script src="https://unpkg.com/tippy.js@6"></script>
      </head>
      <body id="root">
      {code}
      </body>
      </html>`

function WebPageTools({ selectedScreenSize, setSelectedScreenSize, generatedCode }: any) {

  const [finalCode, setFinalCode] = useState<string>();

  useEffect(() => {
    const cleanCode = (HTML_CODE.replace('{code}', generatedCode) || '')
      .replaceAll("```html", '')
      .replace('```', '')
      .replaceAll('html', '')
    setFinalCode(cleanCode);
  }, [generatedCode]);

  const ViewInNewTab = () => {
    if (!finalCode) return;

    const blob = new Blob([finalCode ?? ''], { type: 'text/html' });
    const url = URL.createObjectURL(blob);

    window.open(url, "_blank");
  }

  const downloadCode = () => {
    const blob = new Blob([finalCode ?? ''], { type: 'text/html' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'index.html';
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  }

  return (
    <div className='glass flex items-center justify-between gap-3 border-t border-border/50 px-4 py-3'>
      <div className='flex gap-1 rounded-lg border border-border/50 bg-secondary/30 p-1'>
        <Button variant={'ghost'}
          size="icon"
          className={`h-8 w-8 transition-all duration-200 rounded-md ${selectedScreenSize == 'web' ? 'bg-foreground text-background hover:bg-foreground hover:text-background' : 'text-muted-foreground hover:text-foreground hover:bg-background/50'}`}
          onClick={() => setSelectedScreenSize('web')}><Monitor className='h-4 w-4' /></Button>
        <Button variant={'ghost'}
          size="icon"
          className={`h-8 w-8 transition-all duration-200 rounded-md ${selectedScreenSize == 'mobile' ? 'bg-foreground text-background hover:bg-foreground hover:text-background' : 'text-muted-foreground hover:text-foreground hover:bg-background/50'}`}
          onClick={() => setSelectedScreenSize('mobile')}><Tablet className='h-4 w-4' /></Button>
      </div>
      <div className='flex gap-2 items-center'>
        <Button variant={'outline'} size="sm" onClick={() => ViewInNewTab()} className='text-xs h-8 bg-transparent border-border/50 text-muted-foreground hover:text-foreground hover:bg-accent/50 transition-all duration-200'>
          <SquareArrowOutUpRightIcon className='h-3.5 w-3.5 sm:mr-1.5' />
          <span className='hidden sm:inline'>Open</span>
        </Button>
        <ViewCodeBlock code={finalCode}>
          <Button size="sm" variant="secondary" className='text-xs h-8 transition-all duration-200'>
            <Code2Icon className='h-3.5 w-3.5 sm:mr-1.5' />
            <span className='hidden sm:inline'>Code</span>
          </Button>
        </ViewCodeBlock>
        <Button onClick={downloadCode} size="sm" className='text-xs h-8 gap-1.5 bg-foreground text-background hover:bg-foreground/90 hover:shadow-lg hover:shadow-foreground/10 transition-all duration-200'>
          <Download className='h-3.5 w-3.5' />
          <span>Export</span>
        </Button>
      </div>
    </div>
  )
}

export default WebPageTools
