import { useState, useRef, useEffect, memo } from 'react';
import { motion } from 'framer-motion';
import { ChevronLeft, ChevronRight } from 'lucide-react';

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

const getShortId = (url: string) => {
  const match = url.match(/shorts\/([a-zA-Z0-9_-]{11})/);
  return match ? match[1] : '';
};

const getEmbedLink = (url: string) => {
  const id = getShortId(url);
  return id ? `https://www.youtube.com/embed/${id}?autoplay=0` : '';
};

const YoutubeShortCard = memo(function YoutubeShortCard({
  video,
  index,
  centerIndex,
}: {
  video: (typeof youtubeShorts)[0];
  index: number;
  centerIndex: number;
}) {
  const [isVisible, setIsVisible] = useState(false);
  const [title, setTitle] = useState('Budding Mariners Short');
  const videoRef = useRef<HTMLDivElement>(null);
  const isCenter = index === centerIndex;

  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setIsVisible(true);
          observer.disconnect();
        }
      },
      { threshold: 0.25, rootMargin: '100px' }
    );

    if (videoRef.current) observer.observe(videoRef.current);
    return () => observer.disconnect();
  }, []);

  useEffect(() => {
    if (!isCenter || !isVisible) return;

    let cancelled = false;
    fetch(`https://www.youtube.com/oembed?url=${encodeURIComponent(video.link)}&format=json`)
      .then((res) => (res.ok ? res.json() : Promise.reject()))
      .then((data) => {
        if (!cancelled && data.title) setTitle(data.title);
      })
      .catch(() => {});

    return () => {
      cancelled = true;
    };
  }, [isCenter, isVisible, video.link]);

  const shortId = getShortId(video.link);

  return (
    <div
      ref={videoRef}
      className={`flex-shrink-0 w-56 md:w-64 h-80 md:h-96 rounded-2xl overflow-hidden cursor-pointer transition-all duration-500 snap-center border-4 ${
        isCenter
          ? 'shadow-2xl ring-4 ring-primary-400 scale-105 border-yellow-400'
          : 'grayscale hover:grayscale-75 scale-95 border-gray-700'
      }`}
      style={{ background: '#18181b' }}
    >
      <div className="relative h-full bg-gray-900 flex flex-col">
        {isVisible && isCenter ? (
          <iframe
            src={getEmbedLink(video.link)}
            title={title}
            width="100%"
            height="100%"
            loading="lazy"
            allow="accelerometer; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
            allowFullScreen
            style={{
              border: 0,
              borderRadius: '16px 16px 0 0',
              width: '100%',
              height: '75%',
              minHeight: '180px',
              background: '#000',
            }}
          />
        ) : (
          <img
            src={`https://img.youtube.com/vi/${shortId}/hqdefault.jpg`}
            alt={title}
            loading="lazy"
            decoding="async"
            width={480}
            height={360}
            className="w-full object-cover"
            style={{ height: '75%', minHeight: '180px' }}
          />
        )}

        <div className="flex-1 flex flex-col justify-end">
          <div className="p-3 md:p-4">
            <h3 className="text-white font-bold text-base md:text-lg mb-1 line-clamp-1">{title}</h3>
            <div className="flex items-center justify-end">
              <div className="flex items-center space-x-1">
                <div className="w-2 h-2 bg-red-500 rounded-full animate-pulse" />
                <span className="text-white/60 text-xs">SHORTS</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
});

export default function YoutubeShortsSection() {
  const [centerIndex, setCenterIndex] = useState(Math.floor(youtubeShorts.length / 2));
  const scrollContainerRef = useRef<HTMLDivElement>(null);

  const scrollToIndex = (index: number) => {
    if (!scrollContainerRef.current) return;
    const cardWidth = window.innerWidth < 768 ? 240 : 280;
    const container = scrollContainerRef.current;
    const scrollLeft = index * cardWidth - container.clientWidth / 2 + cardWidth / 2;
    container.scrollTo({ left: scrollLeft, behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToIndex(centerIndex);
  }, [centerIndex]);

  return (
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

        <div className="relative">
          <button
            type="button"
            onClick={() => setCenterIndex((prev) => Math.max(0, prev - 1))}
            className="absolute left-0 top-1/2 -translate-y-1/2 bg-black/70 hover:bg-black text-white p-2 rounded-full z-10"
            disabled={centerIndex === 0}
            aria-label="Previous short"
          >
            <ChevronLeft size={24} />
          </button>

          <button
            type="button"
            onClick={() => setCenterIndex((prev) => Math.min(youtubeShorts.length - 1, prev + 1))}
            className="absolute right-0 top-1/2 -translate-y-1/2 bg-black/70 hover:bg-black text-white p-2 rounded-full z-10"
            disabled={centerIndex === youtubeShorts.length - 1}
            aria-label="Next short"
          >
            <ChevronRight size={24} />
          </button>

          <div
            ref={scrollContainerRef}
            className="flex overflow-x-auto space-x-4 md:space-x-6 pb-6 scrollbar-hide snap-x snap-mandatory scroll-smooth px-8 mt-10"
          >
            {youtubeShorts.map((video, index) => (
              <YoutubeShortCard key={video.id} video={video} index={index} centerIndex={centerIndex} />
            ))}
          </div>
        </div>

        <div className="flex justify-center mt-4 md:mt-6 space-x-2">
          {youtubeShorts.map((_, index) => (
            <button
              key={index}
              type="button"
              onClick={() => setCenterIndex(index)}
              aria-label={`Go to short ${index + 1}`}
              className={`w-2 h-2 md:w-3 md:h-3 rounded-full transition-all duration-300 ${
                index === centerIndex ? 'bg-primary-400 scale-125' : 'bg-white/30 hover:bg-white/50'
              }`}
            />
          ))}
        </div>
      </div>
    </section>
  );
}
