import { useState, useEffect } from 'react';
import { Routes, Route, useLocation } from 'react-router-dom';
import { AnimatePresence } from 'framer-motion';
import Navbar from './components/Navbar';
import Footer from './components/Footer';
import Loader from './components/Loader';
import Home from './pages/Home';
import Courses from './pages/Courses';
import About from './pages/About';
import Calculators from './pages/Calculators';
import Blog from './pages/Blog';
import CollegeForms from './pages/CollegeForms';
import FreeMaterials from './pages/FreeMaterials';
import Admin from './pages/Admin';
import BMOfflineAcademy from './pages/BMOfflineAcademy';
import BMHostel from './pages/BMHostel';
import TermsOfUse from './pages/TermsOfUse';
import PrivacyPolicy from './pages/PrivacyPolicy';
import RefundPolicy from './pages/RefundPolicy';
import FAQs from './pages/FAQs';
import IMUCETDhurandhar from './pages/IMUCETDhurandhar';

function App() {
  const location = useLocation();
  const [loading, setLoading] = useState(location.pathname === '/');
  const isPromoPage = location.pathname === '/imucet-dhurandhar';

  // Show loader only when visiting the home page
  useEffect(() => {
    if (location.pathname === '/') {
      setLoading(true);
    }
  }, [location.pathname]);

  const handleLoaderComplete = () => {
    setLoading(false);
  };

  return (
    <div className="min-h-screen bg-white">
      <AnimatePresence mode="wait">
        {loading && <Loader key="loader" onComplete={handleLoaderComplete} />}
      </AnimatePresence>
      
      {!isPromoPage && <Navbar />}
      <main className={isPromoPage ? 'pt-0' : 'pt-[104px]'}>
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/courses" element={<Courses />} />
          <Route path="/about" element={<About />} />
          <Route path="/calculators" element={<Calculators />} />
          <Route path="/blog" element={<Blog />} />
          <Route path="/college-forms" element={<CollegeForms />} />
          <Route path="/free-materials" element={<FreeMaterials />} />
          <Route path="/admin" element={<Admin />} />
          <Route path="/bm-offline-academy" element={<BMOfflineAcademy />} />
          <Route path="/bm-hostel" element={<BMHostel />} />
          <Route path="/terms-of-use" element={<TermsOfUse />} />
          <Route path="/privacy-policy" element={<PrivacyPolicy />} />
          <Route path="/refund-policy" element={<RefundPolicy />} />
          <Route path="/faqs" element={<FAQs />} />
          <Route path="/imucet-dhurandhar" element={<IMUCETDhurandhar />} />
        </Routes>
      </main>
      {!isPromoPage && <Footer />}
    </div>
  );
}

export default App;