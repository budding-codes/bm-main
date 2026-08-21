import type { SVGProps } from 'react';
import { Link } from 'react-router-dom';
import { Linkedin } from 'lucide-react';
import logo from '../../assets/optimized/yellow on orange logomark-120w.webp';

type SocialIconProps = SVGProps<SVGSVGElement> & {
  size?: number;
  strokeWidth?: number;
};

function InstagramIcon({ size = 24, strokeWidth = 2, ...props }: SocialIconProps) {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth={strokeWidth}
      strokeLinecap="round"
      strokeLinejoin="round"
      {...props}
    >
      <rect width="20" height="20" x="2" y="2" rx="5" ry="5" />
      <path d="M16 11.37A4 4 0 1 1 12.63 8 4 4 0 0 1 16 11.37z" />
      <line x1="17.5" x2="17.51" y1="6.5" y2="6.5" />
    </svg>
  );
}

function YoutubeIcon({ size = 24, strokeWidth = 2, ...props }: SocialIconProps) {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth={strokeWidth}
      strokeLinecap="round"
      strokeLinejoin="round"
      {...props}
    >
      <path d="M2.5 17a24.12 24.12 0 0 1 0-10 2 2 0 0 1 1.4-1.4 49.56 49.56 0 0 1 16.2 0A2 2 0 0 1 21.5 7a24.12 24.12 0 0 1 0 10 2 2 0 0 1-1.4 1.4 49.55 49.55 0 0 1-16.2 0A2 2 0 0 1 2.5 17" />
      <path d="m10 15 5-3-5-3z" />
    </svg>
  );
}

const SOCIAL_LINKS = [
  {
    name: 'LinkedIn',
    href: 'https://www.linkedin.com/company/buddingmariners/',
    icon: Linkedin,
    label: 'Follow Budding Mariners on LinkedIn',
  },
  {
    name: 'Instagram',
    href: 'https://www.instagram.com/bmonlineacademy/',
    icon: InstagramIcon,
    label: 'Follow Budding Mariners on Instagram',
  },
  {
    name: 'YouTube',
    href: 'https://www.youtube.com/c/MarineRSK',
    icon: YoutubeIcon,
    label: 'Subscribe to Budding Mariners on YouTube',
  },
] as const;

const Footer = () => {
  return (
    <footer className="bg-yellow-400 text-black border-t border-black/10">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-10 pb-4">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
          {/* Brand/Intro */}
          <div>
            <div className="flex items-center space-x-2 mb-3">
              <div className="bg-black p-2 rounded-full flex items-center justify-center">
                <img src={logo} alt="BM Logo" className="h-8 w-8 object-contain" />
              </div>
              <span className="font-bold text-lg font-geist">BUDDING MARINERS</span>
            </div>
            <div className="text-sm text-black/90 mb-4 font-poppins">
              Leading academy for aspiring merchant navy professionals with over <span className="font-bebas text-xl">5+</span> years of experience and <span className="font-bebas text-xl">3000+</span> successful students.
            </div>
            <nav aria-label="Social media links" className="flex items-center gap-2">
              {SOCIAL_LINKS.map(({ name, href, icon: Icon, label }) => (
                <a
                  key={name}
                  href={href}
                  target="_blank"
                  rel="noopener noreferrer"
                  aria-label={label}
                  title={label}
                  className="inline-flex h-9 w-9 items-center justify-center rounded-full text-black transition-colors duration-200 hover:bg-black/10 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-black/50 focus-visible:ring-offset-2 focus-visible:ring-offset-yellow-400"
                >
                  <Icon size={20} strokeWidth={1.75} aria-hidden="true" />
                </a>
              ))}
            </nav>
          </div>
          {/* Quick Links */}
          <div>
            <div className="font-bold mb-2 font-geist">Quick Links</div>
            <ul className="space-y-1 text-sm font-poppins">
              <li><Link to="/about" className="hover:underline">About Us</Link></li>
              <li><Link to="/blog" className="hover:underline">Blogs</Link></li>
              <li><Link to="/calculators" className="hover:underline">Calculators</Link></li>
              <li><Link to="/free-materials" className="hover:underline">Free Materials</Link></li>
            </ul>
          </div>
          {/* Services */}
          <div>
            <div className="font-bold mb-2">Services</div>
            <ul className="space-y-1 text-sm">
              <li><a href="/courses">Online Courses</a></li>
              <li><a href="/bm-offline-academy">Offline Batches</a></li>
              {/* <li>Test Series</li>
              <li>Consultation</li> */}
            </ul>
          </div>
          {/* Legal */}
          <div>
            <div className="font-bold mb-2 font-geist">Legal</div>
            <ul className="space-y-1 text-sm font-poppins">
              <li><Link to="/terms-of-use" className="hover:underline">Terms of use</Link></li>
              <li><Link to="/privacy-policy" className="hover:underline">Privacy policy</Link></li>
              <li><Link to="/refund-policy" className="hover:underline">Refund policy</Link></li>
              {/* <li><Link to="/faqs" className="hover:underline">FAQs</Link></li> */}
            </ul>
          </div>
        </div>
        <hr className="my-8 border-black/30" />
        <div className="text-center text-xs text-black/80 pb-2 font-poppins">
          © <span className="font-bebas">2025</span> Budding Mariners. All rights reserved.
        </div>
      </div>
    </footer>
  );
};

export default Footer;