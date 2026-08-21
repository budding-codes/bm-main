import React, { useState, useRef, useEffect, lazy, Suspense } from 'react';
import { Helmet } from 'react-helmet';
import { canonicalUrl } from '../lib/site';
import { motion, useMotionValue, useTransform, PanInfo } from 'framer-motion';
import compass from '../../assets/optimized/compass-440w.webp';
import bg640 from '../../assets/optimized/BG Header-640w.webp';
import bg1024 from '../../assets/optimized/BG Header-1024w.webp';
import bg1920 from '../../assets/optimized/BG Header-1920w.webp';
import { Users, Building, Star, Laptop } from 'lucide-react';
import cl1 from '../../assets/optimized/CL1.webp';
import cl2 from '../../assets/optimized/CL2.webp';
import cl3 from '../../assets/optimized/CL3.webp';
import cl4 from '../../assets/optimized/CL4.webp';
import cl5 from '../../assets/optimized/CL5.webp';
import cl6 from '../../assets/optimized/CL6.webp';
import cl7 from '../../assets/optimized/CL7.webp';
import cl10 from '../../assets/optimized/CL10.webp';
import cl11 from '../../assets/optimized/CL11.webp';
import cl12 from '../../assets/optimized/CL12.webp';
import cl13 from '../../assets/optimized/CL13.webp';
import b1 from '../../assets/optimized/highestselections.webp';
import b2 from '../../assets/optimized/Selection.webp';
import b3 from '../../assets/optimized/mocktest.webp';
import s1 from '../../assets/optimized/S1.webp';
import s2 from '../../assets/optimized/S2.webp';
import s3 from '../../assets/optimized/S3.webp';
import s4 from '../../assets/optimized/S4.webp';
import s5 from '../../assets/optimized/S5.webp';
import s6 from '../../assets/optimized/S6.webp';
import s7 from '../../assets/optimized/S7.webp';
import s8 from '../../assets/optimized/S8.webp';
import s9 from '../../assets/optimized/S9.webp';

const YoutubeShortsSection = lazy(() => import('../components/YoutubeShortsSection'));


const Home = () => {
  // Move image more to the left by adjusting transform range
  const compassRotation = useMotionValue(0);
  const backgroundX = useTransform(compassRotation, [-90, 90], ['-30%', '0%']);

  const AnimatedStat = ({ value, label, suffix = '' }: { value: number; label: string; suffix?: string }) => {
    const [count, setCount] = useState(0);
    const [hasAnimated, setHasAnimated] = useState(false);
    const ref = useRef<HTMLDivElement>(null);

    useEffect(() => {
      const observer = new IntersectionObserver(
        ([entry]) => {
          if (entry.isIntersecting && !hasAnimated) {
            setHasAnimated(true);
            const timer = setInterval(() => {
              setCount(prev => {
                const increment = Math.ceil(value / 50);
                if (prev + increment >= value) {
                  clearInterval(timer);
                  return value;
                }
                return prev + increment;
              });
            }, 40);
          }
        },
        { threshold: 0.5 }
      );

      if (ref.current) observer.observe(ref.current);
      return () => observer.disconnect();
    }, [value, hasAnimated]);

    return (
      <div ref={ref} className="text-center">
        <div className="text-3xl md:text-4xl lg:text-5xl font-bold text-primary-400 mb-2 font-bebas">
          {count.toLocaleString()}{suffix}
        </div>
        <div className="text-white text-xs md:text-sm lg:text-base font-medium font-poppins">{label}</div>
      </div>
    );
  };

  const handleCompassDrag = (_event: MouseEvent | TouchEvent | PointerEvent, info: PanInfo) => {
    const deltaX = info.delta.x;
    const currentRotation = compassRotation.get();
    const newRotation = currentRotation + deltaX * 0.2;
    compassRotation.set(Math.max(-90, Math.min(90, newRotation)));
  };

  const companyLogos = [
    { name: 'CL1', url: cl1 },
    { name: 'CL2', url: cl2 },
    { name: 'CL3', url: cl3 },
    { name: 'CL4', url: cl4 },
    { name: 'CL5', url: cl5 },
    { name: 'CL6', url: cl6 },
    { name: 'CL7', url: cl7 },
    // { name: 'CL8', url: cl8 },
    // { name: 'CL9', url: cl9 },
    { name: 'CL10', url: cl10 },
    { name: 'CL11', url: cl11 },
    { name: 'CL12', url: cl12 },
    { name: 'CL13', url: cl13 },
    // { name: 'CL14', url: cl14 },
  ];

  return (
    <div className="min-h-screen">
      <Helmet>
        <title>Budding Mariners | India's Best Maritime Education Platform</title>
        <meta name="description" content="Budding Mariners is India's leading maritime education platform. Get expert mentorship, top courses, and real success stories for your Merchant Navy career. Join the best marine academy for IMU CET, sponsorship, and placement support." />
        <meta name="keywords" content="Merchant Navy, Maritime Education, IMU CET, Marine Courses, Sponsorship, Marine Academy, Maritime Training, Budding Mariners, Best Marine Institute India" />
        <meta property="og:title" content="Budding Mariners | India's Best Maritime Education Platform" />
        <meta property="og:description" content="Join Budding Mariners for the best Merchant Navy courses, mentorship, and placement support. India's most trusted marine education platform." />
        <meta property="og:type" content="website" />
        <link rel="canonical" href={canonicalUrl('/')} />
        <meta property="og:url" content={canonicalUrl('/')} />
        <meta property="og:image" content="/assets/yellow on orange logomark.png" />
      </Helmet>
      
      {/* Hero Section — LCP image uses responsive WebP + fetchpriority */}
      <section className="relative h-[50vh] min-h-[400px] overflow-hidden bg-black">
        <motion.div className="absolute inset-0 w-[150%] h-full" style={{ x: backgroundX }}>
          <picture>
            <source media="(max-width: 640px)" srcSet={bg640} type="image/webp" />
            <source media="(max-width: 1024px)" srcSet={bg1024} type="image/webp" />
            <img
              src={bg1920}
              alt=""
              width={1920}
              height={1080}
              fetchPriority="high"
              decoding="async"
              className="h-full w-full object-cover object-center"
            />
          </picture>
        </motion.div>
        <div className="absolute inset-0 bg-black/50" />
        <div className="relative z-10 h-full flex flex-col items-center justify-center text-center px-4">
          <div className="max-w-4xl mx-auto mb-4">
            <span
              className="block text-2xl md:text-4xl lg:text-5xl font-bold text-white mb-3 font-geist"
              style={{ fontFamily: 'Impact, Charcoal, sans-serif', letterSpacing: '0.039em' }}
            >
              Your Gateway to the
              <span
                className="text-primary-400 block font-geist"
                style={{ fontFamily: 'Impact, Charcoal, sans-serif', letterSpacing: '0.039em' }}
              >
                Merchant Navy
              </span>
            </span>
            <p className="text-base md:text-lg lg:text-xl text-white/90 mb-4 font-poppins">
              Navigate your career with India's premier maritime education platform
            </p>
          </div>
        </div>

        {/* Compass Wheel */}
        <motion.div
          className="absolute z-20"
          drag
          dragConstraints={{ left: 0, right: 0, top: 0, bottom: 0 }}
          onDrag={handleCompassDrag}
          whileHover={{ scale: 1.1 }}
          whileDrag={{ scale: 0.95 }}
          dragElastic={0}
          style={{
            rotate: compassRotation,
            bottom: 'calc(-9vw + 3rem)', // Adjusted for better positioning
            left: '43%',
            transform: 'translateX(-50%)'
          }}
        >
          <div className="w-[18vw] h-[18vw] min-w-[100px] min-h-[100px] max-w-[220px] max-h-[220px] flex items-center justify-center relative select-none">
            <img
              src={compass}
              alt="Compass"
              width={220}
              height={220}
              decoding="async"
              className="h-full w-full object-contain"
              draggable={false}
            />
          </div>
        </motion.div>
      </section>

      {/* Statistics Section */}
      <section className="py-12 md:py-16 lg:py-20 bg-black relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-r from-navy-900/80 to-navy-700/80"></div>
        <div className="relative z-10 max-w-7xl mx-auto px-4">
          <motion.div
            className="grid grid-cols-2 md:grid-cols-4 gap-6 md:gap-8 lg:gap-12"
            initial={{ opacity: 0, y: 50 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
            viewport={{ once: true }}
          >
            <AnimatedStat value={5} label="Years of Experience" suffix="+" />
            <AnimatedStat value={3000} label="Students Trained" suffix="+" />
            <AnimatedStat value={2500} label="Students Selected" suffix="+" />
            <AnimatedStat value={100000} label="Merchant Navy Aspirants Community" suffix="+" />
          </motion.div>
        </div>
      </section>

      {/* Why Budding Mariners Section */}
      <section className="py-12 md:py-16 lg:py-20 bg-black border-t border-b border-white/10">
        <div className="max-w-7xl mx-auto px-4">
          <motion.span
            className="block text-2xl md:text-3xl lg:text-4xl font-bold text-center text-white mb-12 font-geist"
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            viewport={{ once: true }}
          >
            Why is <span className="text-primary-400 font-geist">Budding Mariners</span> The Best for you?
          </motion.span>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 md:gap-12">
            {/* Feature 1 */}
            <motion.div
              className="text-center bg-[#18181b] rounded-xl border border-white/10 p-6 flex flex-col items-center"
              initial={{ opacity: 0, y: 50 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.1 }}
              viewport={{ once: true }}
            >
              <div className="mb-6 flex justify-center">
                <img 
                  src={b1}
                  alt="Highest Selections in Top Companies"
                  width={160}
                  height={160}
                  loading="lazy"
                  decoding="async"
                  className="w-40 h-40 object-cover rounded-lg border-2 border-yellow-400"
                />
              </div>
              <span className="block text-lg md:text-xl font-bold text-yellow-400 mb-3 font-geist">
                Highest Selections in Top Companies
              </span>
              <p className="text-white/80 text-sm md:text-base font-poppins">
                Our proven track record speaks for itself with maximum placements in leading maritime companies
              </p>
            </motion.div>
            {/* Feature 2 */}
            <motion.div
              className="text-center bg-[#18181b] rounded-xl border border-white/10 p-6 flex flex-col items-center"
              initial={{ opacity: 0, y: 50 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.2 }}
              viewport={{ once: true }}
            >
              <div className="mb-6 flex justify-center">
                <img 
                  src={b2}
                  alt="Company-specific preparation by the company's ex-Sponsored Marines"
                  width={160}
                  height={160}
                  loading="lazy"
                  decoding="async"
                  className="w-40 h-40 object-cover rounded-lg border-2 border-yellow-400"
                />
              </div>
              <span className="block text-lg md:text-xl font-bold text-yellow-400 mb-3 font-geist">
                Company-specific preparation by the company's ex-Sponsored Marines
              </span>
              <p className="text-white/80 text-sm md:text-base font-poppins">
                Learn from industry experts who have sailed with the companies you aspire to join
              </p>
            </motion.div>
            {/* Feature 3 */}
            <motion.div
              className="text-center bg-[#18181b] rounded-xl border border-white/10 p-6 flex flex-col items-center"
              initial={{ opacity: 0, y: 50 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.3 }}
              viewport={{ once: true }}
            >
              <div className="mb-6 flex justify-center">
                <img 
                  src={b3}
                  alt="Unlimited Mock Tests and Interviews"
                  width={160}
                  height={160}
                  loading="lazy"
                  decoding="async"
                  className="w-40 h-40 object-cover rounded-lg border-2 border-yellow-400"
                />
              </div>
              <span className="block text-lg md:text-xl font-bold text-yellow-400 mb-3 font-geist">
                Unlimited Mock Tests and Interviews
              </span>
              <p className="text-white/80 text-sm md:text-base font-poppins">
                Practice makes perfect - unlimited access to mock tests and interview sessions
              </p>
            </motion.div>
          </div>
        </div>
      </section>

      {/* Students and Parents Love Us Section */}
      <section className="py-12 md:py-16 lg:py-20 bg-black border-b border-white/10">
        <div className="max-w-7xl mx-auto px-4">
          <motion.span
            className="block text-2xl md:text-3xl lg:text-4xl font-bold text-center text-white mb-12 font-geist"
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            viewport={{ once: true }}
          >
            Our students and parents <span className="text-primary-400">love us</span>
          </motion.span>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-6 md:gap-8">
            {/* Stat 1 */}
            <motion.div
              className="text-center bg-[#18181b] rounded-xl border border-white/10 p-6 flex flex-col items-center"
              initial={{ opacity: 0, y: 50 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.1 }}
              viewport={{ once: true }}
            >
              <div className="mb-4 flex justify-center">
                <Users className="w-12 h-12 md:w-16 md:h-16 text-primary-400" />
              </div>
              <div className="text-2xl md:text-3xl font-bold text-yellow-400 mb-2 font-bebas">75,000+</div>
              <p className="text-white/80 text-sm md:text-base font-medium font-poppins">Students</p>
              <p className="text-white/60 text-xs md:text-sm">Student Community</p>
            </motion.div>
            {/* Stat 2 */}
            <motion.div
              className="text-center bg-[#18181b] rounded-xl border border-white/10 p-6 flex flex-col items-center"
              initial={{ opacity: 0, y: 50 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.2 }}
              viewport={{ once: true }}
            >
              <div className="mb-4 flex justify-center">
                <Building className="w-12 h-12 md:w-16 md:h-16 text-primary-400" />
              </div>
              <div className="text-2xl md:text-3xl font-bold text-yellow-400 mb-2 font-bebas">25+</div>
              <p className="text-white/80 text-sm md:text-base font-medium font-poppins">Companies</p>
              <p className="text-white/60 text-xs md:text-sm">Have Sponsored our Students</p>
            </motion.div>
            {/* Stat 3 */}
            <motion.div
              className="text-center bg-[#18181b] rounded-xl border border-white/10 p-6 flex flex-col items-center"
              initial={{ opacity: 0, y: 50 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.3 }}
              viewport={{ once: true }}
            >
              <div className="mb-4 flex justify-center">
                <Star className="w-12 h-12 md:w-16 md:h-16 text-yellow-400" />
              </div>
              <div className="text-2xl md:text-3xl font-bold text-yellow-400 mb-2">Highest Rated</div>
              <p className="text-white/80 text-sm md:text-base font-medium font-poppins">Faculty and Mentors</p>
            </motion.div>
            {/* Stat 4 */}
            <motion.div
              className="text-center bg-[#18181b] rounded-xl border border-white/10 p-6 flex flex-col items-center"
              initial={{ opacity: 0, y: 50 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.4 }}
              viewport={{ once: true }}
            >
              <div className="mb-4 flex justify-center">
                <Laptop className="w-12 h-12 md:w-16 md:h-16 text-primary-400" />
              </div>
              <div className="text-2xl md:text-3xl font-bold text-yellow-400 mb-2 font-bebas">A-Z</div>
              <p className="text-white/80 text-sm md:text-base font-medium font-poppins">Guidance</p>
              <p className="text-white/60 text-xs md:text-sm">From Career Entry to Advancement</p>
            </motion.div>
          </div>
        </div>
      </section>

      {/* Students Selected In Section */}
      <section className="py-12 md:py-16 lg:py-20 bg-black border-b border-white/10">
        <div className="max-w-7xl mx-auto px-4">
          <motion.span
            className="block text-2xl md:text-3xl lg:text-4xl font-bold text-center text-white mb-12 font-geist"
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            viewport={{ once: true }}
          >
            Our students have been <span className="text-primary-400">selected in...</span>
          </motion.span>
          {/* Moving Logo Banner */}
          <div className="relative overflow-hidden">
            <motion.div
              className="flex space-x-8 md:space-x-12"
              animate={{
                x: [0, -companyLogos.length * 200] // 200px per logo for smooth loop
              }}
              transition={{
                x: {
                  repeat: Infinity,
                  repeatType: "loop",
                  duration: 30,
                  ease: "linear",
                },
              }}
            >
              {[...companyLogos, ...companyLogos].map((company, index) => (
                <div
                  key={`${company.name}-${index}`}
                  className="flex-shrink-0 flex items-center justify-center bg-white rounded-lg p-4 md:p-6 shadow-md border border-white/10"
                  style={{ minWidth: '200px', height: '100px' }}
                >
                  <img
                    src={company.url}
                    alt={company.name}
                    width={200}
                    height={100}
                    loading="lazy"
                    decoding="async"
                    className="max-w-full max-h-full object-contain"
                  />
                </div>
              ))}
            </motion.div>
          </div>
          {/* Remove static logos for mobile */}
        </div>
      </section>

      {/* Past Selections Section */}
      <section className="bg-black py-8 border-b border-white/10">
        <span className="block text-xl font-bold text-center text-yellow-400 mb-6 uppercase tracking-wide">
          Our Past Selections...
        </span>
        <div className="relative overflow-hidden">
          <div
            className="flex items-center gap-8 md:gap-12"
            style={{
              animation: 'marqueePastSelectionsHome 30s linear infinite',
              width: 'fit-content',
            }}
          >
            {[...Array(2)].fill([s1, s2, s3, s4, s5, s6, s7, s8, s9]).flat().map((img: string, idx: number) => (
              <div
                key={idx}
                className="flex-shrink-0 flex items-center justify-center"
                style={{ minWidth: '200px', height: '200px' }}
              >
                <img
                  src={img}
                  alt={`Past Selection ${idx + 1}`}
                  width={300}
                  height={200}
                  loading="lazy"
                  decoding="async"
                  className="max-w-full max-h-full object-contain rounded"
                  style={{ maxHeight: 200, maxWidth: 300 }}
                />
              </div>
            ))}
          </div>
        </div>
        <style>{`
          @keyframes marqueePastSelectionsHome {
            0% { transform: translateX(0); }
            100% { transform: translateX(-50%); }
          }
        `}</style>
      </section>

      <Suspense fallback={<div className="py-12 bg-black min-h-[200px]" aria-hidden="true" />}>
        <YoutubeShortsSection />
      </Suspense>

      {/* CTA Section */}
      <section className="py-12 md:py-16 lg:py-20 bg-primary-400">
        <div className="max-w-4xl mx-auto text-center px-4 sm:px-6 lg:px-8">
          <motion.span
            className="block text-2xl md:text-3xl lg:text-4xl font-bold text-black mb-4 md:mb-6"
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            viewport={{ once: true }}
          >
            Ready to Start Your Maritime Journey?
          </motion.span>
          <motion.p
            className="text-lg md:text-xl text-black/80 mb-6 md:mb-8"
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.2 }}
            viewport={{ once: true }}
          >
            Join thousands of successful maritime professionals who started their journey with us
          </motion.p>
          <motion.div
            className="flex flex-col sm:flex-row gap-4 justify-center"
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.4 }}
            viewport={{ once: true }}
          >
            <a
              href="/courses"
              className="bg-black text-primary-400 px-6 md:px-8 py-3 md:py-4 rounded-full font-semibold hover:bg-navy-800 transition-colors flex items-center justify-center"
            >
              Explore Courses
            </a>
            <a
              href="https://docs.google.com/forms/d/e/1FAIpQLSfplFAt9uFYYr9r5LDg4-0sP6IpfgZ0bjjOogXFtpODXRTVQw/viewform"
              target="_blank"
              rel="noopener noreferrer"
              className="border-2 border-black text-black px-6 md:px-8 py-3 md:py-4 rounded-full font-semibold hover:bg-black hover:text-primary-400 transition-colors flex items-center justify-center"
            >
              Get Free Consultation
            </a>
          </motion.div>
        </div>
      </section>
    </div>
  );
};


export default Home;