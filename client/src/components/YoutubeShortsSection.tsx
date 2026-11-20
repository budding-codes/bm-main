import { useState, useRef, useEffect, memo } from 'react';
import { motion } from 'framer-motion';
import { ChevronLeft, ChevronRight, Instagram } from 'lucide-react';

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

const instagramReels = [
  { id: 31, link: 'https://www.instagram.com/reel/De4adZGtIuE/' },
  { id: 32, link: 'https://www.instagram.com/reel/DezPxNctWRA/' },
  { id: 33, link: 'https://www.instagram.com/reel/DernpafOUdE/' },
  { id: 34, link: 'https://www.instagram.com/reel/DejxRKJhu7W/' },
  { id: 35, link: 'https://www.instagram.com/reel/DeUNr4kADU-/' },
  { id: 36, link: 'https://www.instagram.com/reel/Dd_fNmChcoN/' },
];

const allVideos = [
  ...youtubeShorts.map((video) => ({ ...video, type: 'youtube' as const })),
  ...instagramReels.map((video) => ({ ...video, type: 'instagram' as const })),
];

type StoryVideo = (typeof allVideos)[number];

const getShortId = (url: string) => {
  const match = url.match(/shorts\/([a-zA-Z0-9_-]{11})/);
  return match ? match[1] : '';
};

const getReelId = (url: string) => {
  const match = url.match(/reel\/([a-zA-Z0-9_-]+)/);
  return match ? match[1] : '';
};

const getEmbedLink = (video: StoryVideo) => {
  if (video.type === 'instagram') {
    const reelId = getReelId(video.link);
    return reelId ? `https://www.instagram.com/reel/${reelId}/embed` : '';
  }
  const shortId = getShortId(video.link);
  return shortId ? `https://www.youtube.com/embed/${shortId}?autoplay=0` : '';
};

const StoryVideoCard = memo(function StoryVideoCard({
  video,
  index,
  centerIndex,
}: {
  video: StoryVideo;
  index: number;
  centerIndex: number;
}) {
  const [isVisible, setIsVisible] = useState(false);
  const [thumbError, setThumbError] = useState(false);
  const videoRef = useRef<HTMLDivElement>(null);
  const isCenter = index === centerIndex;
  const isInstagram = video.type === 'instagram';
  const accessibleTitle = `Budding Mariners ${isInstagram ? 'Instagram reel' : 'short video'} ${index + 1}`;

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
        <div className="flex-1 min-h-0">
          {isVisible && isCenter ? (
            <iframe
              src={getEmbedLink(video)}
              title={accessibleTitle}
              width="100%"
              height="100%"
              loading="lazy"
              scrolling={isInstagram ? 'no' : undefined}
              allow={
                isInstagram
                  ? 'autoplay; encrypted-media; picture-in-picture; fullscreen'
                  : 'accelerometer; clipboard-write; encrypted-media; gyroscope; picture-in-picture'
              }
              allowFullScreen
              className="w-full h-full min-h-[180px] bg-black rounded-t-2xl border-0"
            />
          ) : isInstagram ? (
            thumbError ? (
              <div className="w-full h-full min-h-[180px] flex flex-col items-center justify-center gap-3">
                <div className="w-14 h-14 rounded-full p-[2px] bg-gradient-to-tr from-yellow-300 via-pink-500 to-purple-600">
                  <div className="w-full h-full rounded-full bg-gray-900 flex items-center justify-center">
                    <Instagram className="text-white/70" size={24} />
                  </div>
                </div>
                <span className="text-white/50 text-xs">Instagram Reel</span>
              </div>
            ) : (
              <img
                src={`/reels/${getReelId(video.link)}.jpg`}
                alt={accessibleTitle}
                loading="lazy"
                decoding="async"
                className="w-full h-full min-h-[180px] object-cover"
                onError={() => setThumbError(true)}
              />
            )
          ) : (
            <img
              src={`https://img.youtube.com/vi/${getShortId(video.link)}/hqdefault.jpg`}
              alt={accessibleTitle}
              loading="lazy"
              decoding="async"
              width={480}
              height={360}
              className="w-full h-full min-h-[180px] object-cover"
            />
          )}
        </div>

        <div className="px-3 py-2 md:px-4 md:py-2 flex items-center justify-end shrink-0">
          <div className="flex items-center space-x-1">
            <div
              className={`w-2 h-2 rounded-full animate-pulse ${
                isInstagram
                  ? 'bg-gradient-to-tr from-yellow-300 via-pink-500 to-purple-600'
                  : 'bg-red-500'
              }`}
            />
            <span className="text-white/60 text-xs">{isInstagram ? 'REELS' : 'SHORTS'}</span>
          </div>
        </div>
      </div>
    </div>
  );
});

export default function YoutubeShortsSection() {
  const [centerIndex, setCenterIndex] = useState(Math.floor(allVideos.length / 2));
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
        <motion.span
          className="block text-2xl md:text-3xl lg:text-4xl font-bold text-center text-white mb-3"
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          viewport={{ once: true }}
        >
          Stories of Officers of <span className="text-primary-400">Budding Mariners</span>
        </motion.span>
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
            onClick={() => setCenterIndex((prev) => Math.min(allVideos.length - 1, prev + 1))}
            className="absolute right-0 top-1/2 -translate-y-1/2 bg-black/70 hover:bg-black text-white p-2 rounded-full z-10"
            disabled={centerIndex === allVideos.length - 1}
            aria-label="Next short"
          >
            <ChevronRight size={24} />
          </button>

          <div
            ref={scrollContainerRef}
            className="flex overflow-x-auto space-x-4 md:space-x-6 pb-6 scrollbar-hide snap-x snap-mandatory scroll-smooth px-8 mt-10"
          >
            {allVideos.map((video, index) => (
              <StoryVideoCard key={video.id} video={video} index={index} centerIndex={centerIndex} />
            ))}
          </div>
        </div>

        <div className="flex flex-wrap justify-center mt-4 md:mt-6 gap-x-2 gap-y-2">
          {allVideos.map((_, index) => (
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
