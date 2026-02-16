import { Button } from '@/components/ui/button'
import { Code2Icon, Download, Monitor, SquareArrowOutUpRightIcon, Tablet } from 'lucide-react'
import React, { useEffect, useState } from 'react'
import ViewCodeBlock from './ViewCodeBlock'
import { useParams, useSearchParams } from 'next/navigation'

const HTML_CODE = `<!DOCTYPE html>
      <html lang="en">
      <head>
        <meta charset="UTF-8" />
        <meta name="viewport" content="width=device-width, initial-scale=1.0" />
        <meta name="description" content="AI Website Builder - Modern TailwindCSS + Flowbite Template" />
        <title>Webyrix | Preview</title>
        <link rel="icon" href="data:image/svg+xml,%3Csvg%20width%3D%2240%22%20height%3D%2248%22%20viewBox%3D%220%200%2040%2048%22%20xmlns%3D%22http%3A%2F%2Fwww.w3.org%2F2000%2Fsvg%22%3E%3Cdefs%3E%3ClinearGradient%20id%3D%22grad-light%22%20x1%3D%220%25%22%20y1%3D%220%25%22%20x2%3D%22100%25%22%20y2%3D%220%25%22%3E%3Cstop%20offset%3D%220%25%22%20stop-color%3D%22%23c084fc%22%2F%3E%3Cstop%20offset%3D%2250%25%22%20stop-color%3D%22%23f9a8d4%22%2F%3E%3Cstop%20offset%3D%22100%25%22%20stop-color%3D%22%23fdba74%22%2F%3E%3C%2FlinearGradient%3E%3ClinearGradient%20id%3D%22grad-medium%22%20x1%3D%220%25%22%20y1%3D%220%25%22%20x2%3D%22100%25%22%20y2%3D%220%25%22%3E%3Cstop%20offset%3D%220%25%22%20stop-color%3D%22%23a855f7%22%2F%3E%3Cstop%20offset%3D%2250%25%22%20stop-color%3D%22%23f472b6%22%2F%3E%3Cstop%20offset%3D%22100%25%22%20stop-color%3D%22%23fb923c%22%2F%3E%3C%2FlinearGradient%3E%3ClinearGradient%20id%3D%22grad-dark%22%20x1%3D%220%25%22%20y1%3D%220%25%22%20x2%3D%22100%25%22%20y2%3D%220%25%22%3E%3Cstop%20offset%3D%220%25%22%20stop-color%3D%22%237c3aed%22%2F%3E%3Cstop%20offset%3D%2250%25%22%20stop-color%3D%22%23ec4899%22%2F%3E%3Cstop%20offset%3D%22100%25%22%20stop-color%3D%22%23f97316%22%2F%3E%3C%2FlinearGradient%3E%3C%2Fdefs%3E%3Cg%20fill-rule%3D%22evenodd%22%20clip-rule%3D%22evenodd%22%3E%3Cpath%20fill%3D%22url(%23grad-light)%22%20d%3D%22m34.5868%208.40061-9.6868-2.59556c-.6687-.17919-1.2108.23679-1.2108.92911v10.02854c0%20.6923.5421%201.3988%201.2108%201.578l9.6868%202.5955c.6687.1792%201.2109-.2368%201.2109-.9291v-10.02848c0-.69232-.5422-1.39882-1.2109-1.57801z%20m-9.6868-6.35625c-2.6749-.71674-4.8434.94718-4.8434%203.71647v10.02847c0%202.7693%202.1685%205.5953%204.8434%206.312l9.6868%202.5956c2.6749.7168%204.8434-.9472%204.8434-3.7165v-10.0284c0-2.76934-2.1685-5.59533-4.8434-6.31207z%22%2F%3E%3Cpath%20fill%3D%22url(%23grad-medium)%22%20d%3D%22m26.9812%2016.5707-12.1085-3.2444c-.6687-.1792-1.2109.2368-1.2109.9291v12.5356c0%20.6923.5422%201.3988%201.2109%201.578l12.1085%203.2445c.6687.1792%201.2108-.2368%201.2108-.9291v-12.5356c0-.6924-.5421-1.3989-1.2108-1.5781z%20m-12.1085-7.0051c-2.6749-.71674-4.8434.9472-4.8434%203.7165v12.5356c0%202.7693%202.1685%205.5953%204.8434%206.312l12.1085%203.2445c2.6749.7167%204.8433-.9472%204.8433-3.7165v-12.5356c0-2.7693-2.1684-5.5953-4.8433-6.312z%22%2F%3E%3Cpath%20fill%3D%22url(%23grad-dark)%22%20d%3D%22m19.3736%2024.7409-14.53021-3.8934c-.66873-.1792-1.21085.2368-1.21085.9291v15.0428c0%20.6923.54212%201.3988%201.21085%201.578l14.53021%203.8933c.6687.1792%201.2108-.2368%201.2108-.9291v-15.0427c0-.6923-.5421-1.3988-1.2108-1.578z%20m-14.53021-7.6541c-2.67493-.7167-4.84339.9472-4.84339%203.7165v15.0427c0%202.7693%202.16846%205.5953%204.84339%206.3121l14.53021%203.8933c2.6749.7168%204.8433-.9472%204.8433-3.7164v-15.0428c0-2.7693-2.1684-5.5953-4.8433-6.312z%22%2F%3E%3C%2Fg%3E%3C%2Fsvg%3E" type="image/svg+xml" />

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

function WebPageTools({ selectedScreenSize, setSelectedScreenSize, generatedCode, frameId }: any) {
  const { projectId } = useParams();
  const searchParams = useSearchParams();
  const currentFrameId = frameId || searchParams.get('frameId');

  const [finalCode, setFinalCode] = useState<string>();

  useEffect(() => {
    const cleanCode = (HTML_CODE.replace('{code}', generatedCode) || '')
      .replaceAll("```html", '')
      .replace('```', '')
      .replaceAll('html', '')
    setFinalCode(cleanCode);
  }, [generatedCode]);

  const ViewInNewTab = () => {
    window.open(`/view/${projectId}?mode=preview${currentFrameId ? `&frameId=${currentFrameId}` : ''}`, "_blank");
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