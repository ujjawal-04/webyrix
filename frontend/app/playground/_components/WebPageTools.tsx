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
    <div className='p-2 mt-3 shadow rounded-xl w-full flex flex-col sm:flex-row justify-between gap-2 bg-white dark:bg-gray-800'>
      <div className='flex gap-2 justify-center'>
        <Button variant={'ghost'}
          size="sm"
          className={`${selectedScreenSize == 'web' ? 'border border-primary' : ''}`}
          onClick={() => setSelectedScreenSize('web')}><Monitor className='h-4 w-4' /></Button>
        <Button variant={'ghost'}
          size="sm"
          className={`${selectedScreenSize == 'mobile' ? 'border border-primary' : ''}`}
          onClick={() => setSelectedScreenSize('mobile')}><Tablet className='h-4 w-4' /></Button>
      </div>
      <div className='flex gap-2 justify-center flex-wrap'>
        <Button variant={'outline'} size="sm" onClick={() => ViewInNewTab()} className='text-xs sm:text-sm'>
          <span className='hidden sm:inline'>View</span>
          <SquareArrowOutUpRightIcon className='h-4 w-4' />
        </Button>
        <ViewCodeBlock code={finalCode}>
          <Button size="sm" className='text-xs sm:text-sm'>
            <span className='hidden sm:inline'>View</span>
            <Code2Icon className='h-4 w-4' />
          </Button>
        </ViewCodeBlock>
        <Button onClick={downloadCode} size="sm" className='text-xs sm:text-sm'>
          <span className='hidden sm:inline'>Download</span>
          <Download className='h-4 w-4' />
        </Button>
      </div>
    </div>
  )
}

export default WebPageTools
