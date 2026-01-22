import Link from "next/link";
import { CiLinkedin } from "react-icons/ci";
import { FaTwitter } from "react-icons/fa";

export default function MinimalFooter() {
  return (
    <footer className="bg-background text-foreground font-light tracking-wide">
      <div className="max-w-7xl mx-auto px-6 py-12">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-8 items-start">
          <div className="flex items-center">
            <img src="/logo.svg" alt="Webyrix logo" className="w-10 h-10 mr-3" />
            <div className="text-3xl tracking-wide font-medium">Webyrix</div>
          </div>

          <div>
            <h4 className="text-md font-lg text-foreground mb-4">Product</h4>
            <ul className="space-y-3 text-sm text-muted-foreground">
              <li><Link href="#">Home</Link></li>
              <li><Link href="#">Features</Link></li>
              <li><Link href="#">Pricing</Link></li>
              <li><Link href="#">Students</Link></li>
            </ul>
          </div>

          <div>
            <h4 className="text-md font-lg text-foreground mb-4">Company</h4>
            <ul className="space-y-3 text-sm text-muted-foreground">
              <li><Link href="#">Terms</Link></li>
              <li><Link href="#">AI Policy</Link></li>
              <li><Link href="#">Privacy</Link></li>
            </ul>
          </div>

          <div>
            <h4 className="text-md font-lg text-foreground mb-4">Resources</h4>
            <ul className="space-y-3 text-sm text-muted-foreground">
              <li><Link href="#">Docs</Link></li>
              <li><Link href="#">FAQ</Link></li>
              <li><Link href="#">Community</Link></li>
            </ul>
          </div>

          <div>
            <h4 className="text-md font-lg text-foreground mb-4">Social</h4>
            <div className="flex space-x-4">
              <Link href="#" aria-label="Twitter" className="text-muted-foreground hover:text-foreground transition-colors">
                <FaTwitter className="h-5 w-5" />
              </Link>
              <Link href="#" aria-label="LinkedIn" className="text-muted-foreground hover:text-foreground transition-colors">
                <CiLinkedin className="h-6 w-6" />
              </Link>
            </div>
          </div>
        </div>

        <div className="mt-10 border-t border-border pt-6 text-sm text-muted-foreground">
          <div className="max-w-7xl mx-auto px-0 flex flex-col sm:flex-row justify-between items-center">
            <div>© {new Date().getFullYear()} Webyrix. All rights reserved.</div>
            
          </div>
        </div>
      </div>
    </footer>
  );
}
