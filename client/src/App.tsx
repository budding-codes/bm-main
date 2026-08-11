import { lazy, Suspense, useEffect, useRef } from 'react';
import { Routes, Route, useLocation } from 'react-router-dom';
import { trackPageView } from './lib/gtag';
import Navbar from './components/Navbar';
import Footer from './components/Footer';
import Home from './pages/Home';

const Courses = lazy(() => import('./pages/Courses'));
const About = lazy(() => import('./pages/About'));
const Calculators = lazy(() => import('./pages/Calculators'));
const Blog = lazy(() => import('./pages/Blog'));
const BlogPost = lazy(() => import('./pages/BlogPost'));
const CollegeForms = lazy(() => import('./pages/CollegeForms'));
const FreeMaterials = lazy(() => import('./pages/FreeMaterials'));
const AdminApp = lazy(() => import('./admin/AdminApp'));
const BMOfflineAcademy = lazy(() => import('./pages/BMOfflineAcademy'));
const BMHostel = lazy(() => import('./pages/BMHostel'));
const TermsOfUse = lazy(() => import('./pages/TermsOfUse'));
const PrivacyPolicy = lazy(() => import('./pages/PrivacyPolicy'));
const RefundPolicy = lazy(() => import('./pages/RefundPolicy'));
const FAQs = lazy(() => import('./pages/FAQs'));

function RouteFallback() {
  return (
    <div className="flex min-h-[40vh] items-center justify-center bg-black" aria-busy="true" aria-label="Loading page">
      <div className="h-8 w-8 animate-spin rounded-full border-2 border-primary-400 border-t-transparent" />
    </div>
  );
}

function App() {
  const location = useLocation();
  const isInitialPageView = useRef(true);

  useEffect(() => {
    const pagePath = `${location.pathname}${location.search}`;

    if (isInitialPageView.current) {
      isInitialPageView.current = false;
      return;
    }

    trackPageView(pagePath);
  }, [location]);

  const isPromoPage = location.pathname === '/imucet-dhurandhar';
  const isAdminPage = location.pathname.startsWith('/admin');
  const hideChrome = isPromoPage || isAdminPage;

  return (
    <div className={`min-h-screen ${isAdminPage ? 'bg-black' : 'bg-white'}`}>
      {!hideChrome && <Navbar />}
      <main className={hideChrome ? 'pt-0' : 'pt-[104px]'}>
        <Suspense fallback={<RouteFallback />}>
          <Routes>
            <Route path="/" element={<Home />} />
            <Route path="/courses" element={<Courses />} />
            <Route path="/about" element={<About />} />
            <Route path="/calculators" element={<Calculators />} />
            <Route path="/blog" element={<Blog />} />
            <Route path="/blog/:slug" element={<BlogPost />} />
            <Route path="/college-forms" element={<CollegeForms />} />
            <Route path="/free-materials" element={<FreeMaterials />} />
            <Route path="/admin/*" element={<AdminApp />} />
            <Route path="/bm-offline-academy" element={<BMOfflineAcademy />} />
            <Route path="/bm-hostel" element={<BMHostel />} />
            <Route path="/terms-of-use" element={<TermsOfUse />} />
            <Route path="/privacy-policy" element={<PrivacyPolicy />} />
            <Route path="/refund-policy" element={<RefundPolicy />} />
            <Route path="/faqs" element={<FAQs />} />
          </Routes>
        </Suspense>
      </main>
      {!hideChrome && <Footer />}
    </div>
  );
}

export default App;
