import React, { useState, useRef, useEffect } from 'react';
import { Helmet } from 'react-helmet';
import { motion, useMotionValue, useTransform, PanInfo } from 'framer-motion';
import compass from '../../assets/compass.png';
import bg from '../../assets/BG Header.png';
import { ChevronLeft, ChevronRight, Play, Users, Building, Star, Laptop } from 'lucide-react';
import cl1 from '../../assets/CL1.png';
import cl2 from '../../assets/CL2.jpg';
import cl3 from '../../assets/CL3.png';
import cl4 from '../../assets/CL4.png';
import cl5 from '../../assets/CL5.png';
import cl6 from '../../assets/CL6.png';
import cl7 from '../../assets/CL7.png';
import cl10 from '../../assets/CL10.png';
import cl11 from '../../assets/CL11.png';
import cl12 from '../../assets/CL12.png';
import cl13 from '../../assets/CL13.jpg';
import b1 from '../../assets/highestselections.png';
import b2 from '../../assets/Selection.png';
import b3 from '../../assets/mocktest.png';


const Home = () => {
  // Move image more to the left by adjusting transform range
  const compassRotation = useMotionValue(0);
  const backgroundX = useTransform(compassRotation, [-90, 90], ['-30%', '0%']);

  const [centerIndex, setCenterIndex] = useState(0);
  const scrollContainerRef = useRef<HTMLDivElement>(null);

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

  // Only provide the link for each short
 const youtubeShorts = [
  { id: 1, link: 'https://youtube.com/shorts/-1sAw0gCnlQ?si=kbIwdLJtxNgo1CBu' },
  { id: 2, link: 'https://youtube.com/shorts/SjEg4VFtslo?si=Z4z6LqxKM9pdYOAY' },
  { id: 3, link: 'https://youtube.com/shorts/Pwj0hWIKb3Y?si=TID0l86PCCdvYPJi' },
  { id: 4, link: 'https://youtube.com/shorts/qcHX3DJQojk?si=ICGZT95cpbPd-pbm' },
  { id: 5, link: 'https://youtube.com/shorts/csRrcGrp9LA?si=ZonsNM_JndY9vTuC' },
  { id: 6, link: 'https://youtube.com/shorts/RRIwJO3N1Uk?si=jI4heQvMwzDGKLu2' },
  { id: 7, link: 'https://youtube.com/shorts/4nXr_wOW_Z8?si=RbCoPEJV__D2IQkV' },
  { id: 8, link: 'https://youtube.com/shorts/wecUMgjUD2c?si=qmqdcKmyWO2Ag6tc' },
  { id: 9, link: 'https://youtube.com/shorts/I9Rdo9IS0LA?si=p_xeRomexUQWuCEr' },
  { id: 10, link: 'https://youtube.com/shorts/mkc-7bMSdDg?si=9uN3RU3BrPTI5ccC' },
  { id: 11, link: 'https://youtube.com/shorts/if9C5YPmOPk?si=Y4CekEcCxMXPaK_U' },
  { id: 12, link: 'https://youtube.com/shorts/r4y3Wzd-Bhs?si=ZXxsJEV52HWd5V9C' },
  { id: 13, link: 'https://youtube.com/shorts/toboVC9ij-8?si=avNbzeLYVkHomHY-' },
  { id: 14, link: 'https://youtube.com/shorts/wjZcpjh5UpQ?si=NJ9c3FUqT9_-NZ0K' },
  { id: 15, link: 'https://youtube.com/shorts/P3Xpo0_Qb8Y?si=q46pki8Lqi9qH5Cm' },
  { id: 16, link: 'https://youtube.com/shorts/GdjSxMDRAlg?si=2qfQeOKD5u6LD246' },
  { id: 17, link: 'https://youtube.com/shorts/MWFcY3hU2rQ?si=EUaUNeZT-nasDgnR' },
  { id: 18, link: 'https://youtube.com/shorts/upL3QVUT-vI?si=eBxJZfAntXJ-WW0B' },
  { id: 19, link: 'https://youtube.com/shorts/J9TSQMT06do?si=OTepfLL7A8_v6i7n' },
  { id: 20, link: 'https://youtube.com/shorts/pXs9-gJQONQ?si=tUFrhwSZTW-bF6cQ' },
  { id: 21, link: 'https://youtube.com/shorts/G9o9BCzFfDo?si=NFan0go6Bkg2FKJP' },
  { id: 22, link: 'https://youtube.com/shorts/dR25NqMOGZM?si=fiobIAHpjqUaB_zK' },
  { id: 23, link: 'https://youtube.com/shorts/OyGMW2tCNnc?si=iyn9BPyKiHuk1PfK' },
  { id: 24, link: 'https://youtube.com/shorts/0UIMsxYiztM?si=erV6iBqVpV4mUL8N' },
  { id: 25, link: 'https://youtube.com/shorts/MaQQ1q0s33g?si=ge6TLTXWbY97rDDO' },
  { id: 26, link: 'https://youtube.com/shorts/0UIMsxYiztM?si=d-axFU3byAgDHVe-' },
  { id: 27, link: 'https://youtube.com/shorts/ZSZoPd8bucU?si=mmeo_VwOKPollYxw' },
  { id: 28, link: 'https://youtube.com/shorts/ZSZoPd8bucU?si=jbiNxCN8dkszimtl' },
  { id: 29, link: 'https://youtube.com/shorts/fawbP9OLOLU?si=TNCSpUVd3Jeoyaa2' },
  { id: 30, link: 'https://youtube.com/shorts/5wM0nkcbeJU?si=m0PBeAYPL5lzrm8p' },
];

  // Extract video ID from YouTube Shorts link
  const getShortId = (url: string) => {
    const match = url.match(/shorts\/([a-zA-Z0-9_-]{11})/);
    return match ? match[1] : '';
  };

  // Get embed link for Shorts
  const getEmbedLink = (url: string) => {
    const id = getShortId(url);
    return id ? `https://www.youtube.com/embed/${id}?autoplay=0` : '';
  };

  // Fetch video title using YouTube oEmbed API
  const useYoutubeTitle = (url: string) => {
    const [title, setTitle] = useState('Loading...');
    useEffect(() => {
      let cancelled = false;
      fetch(`https://www.youtube.com/oembed?url=${encodeURIComponent(url)}&format=json`)
        .then(res => res.ok ? res.json() : Promise.reject())
        .then(data => {
          if (!cancelled) setTitle(data.title || 'YouTube Short');
        })
        .catch(() => {
          if (!cancelled) setTitle('YouTube Short');
        });
      return () => { cancelled = true; };
    }, [url]);
    return title;
  };

  const handleCompassDrag = (event: MouseEvent | TouchEvent | PointerEvent, info: PanInfo) => {
    const deltaX = info.delta.x;
    const currentRotation = compassRotation.get();
    const newRotation = currentRotation + deltaX * 0.2;
    compassRotation.set(Math.max(-90, Math.min(90, newRotation)));
  };

  const handleShortsScroll = () => {
    if (!scrollContainerRef.current) return;

    const container = scrollContainerRef.current;
    const containerCenter = container.scrollLeft + container.clientWidth / 2;
    const cardWidth = 280;
    const newCenterIndex = Math.round(containerCenter / cardWidth);

    if (newCenterIndex !== centerIndex && newCenterIndex >= 0 && newCenterIndex < youtubeShorts.length) {
      setCenterIndex(newCenterIndex);
    }
  };

  // Helper to scroll to a given index and center it
  const scrollToIndex = (index: number) => {
    if (!scrollContainerRef.current) return;
    const cardWidth = window.innerWidth < 768 ? 240 : 280;
    const container = scrollContainerRef.current;
    const scrollLeft =
      index * cardWidth - container.clientWidth / 2 + cardWidth / 2;
    container.scrollTo({
      left: scrollLeft,
      behavior: 'smooth',
    });
  };

  // On mount, set center index to middle and scroll to it
  useEffect(() => {
    const middle = Math.floor(youtubeShorts.length / 2);
    setCenterIndex(middle);
    scrollToIndex(middle);
    // eslint-disable-next-line
  }, []);

  // When centerIndex changes, scroll to it
  useEffect(() => {
    scrollToIndex(centerIndex);
    // eslint-disable-next-line
  }, [centerIndex]);

  // Use the 14 imported logos for the moving banner
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
        <meta property="og:url" content="https://buddingmariners.com/" />
        <meta property="og:image" content="/assets/yellow on orange logomark.png" />
      </Helmet>
      
      {/* Hero Section */}
      <section className="relative h-[50vh] min-h-[400px] overflow-hidden bg-black">
        <motion.div
          className="absolute inset-0 w-[150%] h-full bg-cover bg-center"
          style={{
            backgroundImage: `url(${bg})`,
            x: backgroundX
          }}
        />
        <div className="absolute inset-0 bg-black/50" />
        <div className="relative z-10 h-full flex flex-col items-center justify-center text-center px-4">
          <div className="max-w-4xl mx-auto mb-4">
            <motion.h1
              className="text-2xl md:text-4xl lg:text-5xl font-bold text-white mb-3 font-geist"
              initial={{ opacity: 0, y: 50 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 1 }}
              style={{ fontFamily: 'Impact, Charcoal, sans-serif', letterSpacing: '0.039em' }}
            >
              Your Gateway to the
              <span
                className="text-primary-400 block font-geist"
                style={{ fontFamily: 'Impact, Charcoal, sans-serif', letterSpacing: '0.039em' }}
              >
                Merchant Navy
              </span>
            </motion.h1>
            <motion.p
              className="text-base md:text-lg lg:text-xl text-white/90 mb-4 font-poppins"
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 1, delay: 0.5 }}
            >
              Navigate your career with India's premier maritime education platform
            </motion.p>
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
          <motion.h2
            className="text-2xl md:text-3xl lg:text-4xl font-bold text-center text-white mb-12 font-geist"
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            viewport={{ once: true }}
          >
            Why is <span className="text-primary-400 font-geist">Budding Mariners</span> The Best for you?
          </motion.h2>
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
                  className="w-40 h-40 object-cover rounded-lg border-2 border-yellow-400"
                />
              </div>
              <h3 className="text-lg md:text-xl font-bold text-yellow-400 mb-3 font-geist">
                Highest Selections in Top Companies
              </h3>
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
                  className="w-40 h-40 object-cover rounded-lg border-2 border-yellow-400"
                />
              </div>
              <h3 className="text-lg md:text-xl font-bold text-yellow-400 mb-3 font-geist">
                Company-specific preparation by the company's ex-Sponsored Marines
              </h3>
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
                  className="w-40 h-40 object-cover rounded-lg border-2 border-yellow-400"
                />
              </div>
              <h3 className="text-lg md:text-xl font-bold text-yellow-400 mb-3 font-geist">
                Unlimited Mock Tests and Interviews
              </h3>
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
          <motion.h2
            className="text-2xl md:text-3xl lg:text-4xl font-bold text-center text-white mb-12 font-geist"
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            viewport={{ once: true }}
          >
            Our students and parents <span className="text-primary-400">love us</span>
          </motion.h2>
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
          <motion.h2
            className="text-2xl md:text-3xl lg:text-4xl font-bold text-center text-white mb-12 font-geist"
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            viewport={{ once: true }}
          >
            Our students have been <span className="text-primary-400">selected in...</span>
          </motion.h2>
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
                    className="max-w-full max-h-full object-contain"
                  />
                </div>
              ))}
            </motion.div>
          </div>
          {/* Remove static logos for mobile */}
        </div>
      </section>

      {/* YouTube Shorts Section */}
      // Optimized YouTube Shorts Section
<section className="py-12 md:py-16 lg:py-20 bg-black relative">
  <div className="max-w-7xl mx-auto px-4">
    <motion.h2
      className="text-2xl md:text-3xl lg:text-4xl font-bold text-center text-white mb-3"
      initial={{ opacity: 0, y: 30 }}
      whileInView={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.6 }}
      viewport={{ once: true }}
    >
      Stories of Officers of <span className="text-primary-400">Budding Mariners</span>
    </motion.h2>
    <p className="text-center text-white/70 mb-8 md:mb-12">Success stories from our maritime community</p>

    {/* Arrows */}
    <div className="relative">
      <button
        onClick={() => setCenterIndex(prev => Math.max(0, prev - 1))}
        className="absolute left-0 top-1/2 -translate-y-1/2 bg-black/70 hover:bg-black text-white p-2 rounded-full z-10"
        disabled={centerIndex === 0}
      >
        <ChevronLeft size={24} />
      </button>

      <button
        onClick={() => setCenterIndex(prev => Math.min(youtubeShorts.length - 1, prev + 1))}
        className="absolute right-0 top-1/2 -translate-y-1/2 bg-black/70 hover:bg-black text-white p-2 rounded-full z-10"
        disabled={centerIndex === youtubeShorts.length - 1}
      >
        <ChevronRight size={24} />
      </button>

      {/* Scrollable Cards */}
      <div
        ref={scrollContainerRef}
        className="flex overflow-x-auto space-x-4 md:space-x-6 pb-6 scrollbar-hide snap-x snap-mandatory scroll-smooth px-8 mt-10"
      >
        {youtubeShorts.map((video, index) => {
          const title = useYoutubeTitle(video.link);
          const [isVisible, setIsVisible] = useState(false);
          const videoRef = useRef(null);

          useEffect(() => {
            const observer = new IntersectionObserver(
              ([entry]) => {
                if (entry.isIntersecting) {
                  setIsVisible(true);
                  observer.disconnect();
                }
              },
              { threshold: 0.25 }
            );

            if (videoRef.current) observer.observe(videoRef.current);
            return () => observer.disconnect();
          }, []);

          return (
            <motion.div
              key={video.id}
              ref={videoRef}
              className={`flex-shrink-0 w-56 md:w-64 h-80 md:h-96 rounded-2xl overflow-hidden cursor-pointer transition-all duration-500 snap-center border-4 ${
                index === centerIndex
                  ? 'shadow-2xl ring-4 ring-primary-400 scale-105 border-yellow-400'
                  : 'grayscale hover:grayscale-75 scale-95 border-gray-700'
              }`}
              style={{ background: '#18181b' }}
            >
              <div className="relative h-full bg-gray-900 flex flex-col">
                {isVisible ? (
                  <iframe
                    src={getEmbedLink(video.link)}
                    title={title}
                    width="100%"
                    height="100%"
                    allow="accelerometer; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                    allowFullScreen
                    style={{
                      border: 0,
                      borderRadius: '16px 16px 0 0',
                      width: '100%',
                      height: '75%',
                      minHeight: '180px',
                      background: '#000'
                    }}
                  />
                ) : (
                  <div
                    style={{
                      height: '75%',
                      backgroundImage: `url(https://img.youtube.com/vi/${getShortId(video.link)}/hqdefault.jpg)`,
                      backgroundSize: 'cover',
                      backgroundPosition: 'center'
                    }}
                  />
                )}

                <div className="flex-1 flex flex-col justify-end">
                  <div className="p-3 md:p-4">
                    <h3 className="text-white font-bold text-base md:text-lg mb-1 line-clamp-1">{title}</h3>
                    <div className="flex items-center justify-end">
                      <div className="flex items-center space-x-1">
                        <div className="w-2 h-2 bg-red-500 rounded-full animate-pulse"></div>
                        <span className="text-white/60 text-xs">SHORTS</span>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </motion.div>
          );
        })}
      </div>
    </div>

    {/* Dot Indicators */}
    <div className="flex justify-center mt-4 md:mt-6 space-x-2">
      {youtubeShorts.map((_, index) => (
        <button
          key={index}
          onClick={() => setCenterIndex(index)}
          className={`w-2 h-2 md:w-3 md:h-3 rounded-full transition-all duration-300 ${
            index === centerIndex ? 'bg-primary-400 scale-125' : 'bg-white/30 hover:bg-white/50'
          }`}
        />
      ))}
    </div>
  </div>
</section>

      {/* CTA Section */}
      <section className="py-12 md:py-16 lg:py-20 bg-primary-400">
        <div className="max-w-4xl mx-auto text-center px-4 sm:px-6 lg:px-8">
          <motion.h2
            className="text-2xl md:text-3xl lg:text-4xl font-bold text-black mb-4 md:mb-6"
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            viewport={{ once: true }}
          >
            Ready to Start Your Maritime Journey?
          </motion.h2>
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