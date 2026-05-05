import { useEffect, useMemo, useState } from 'react';
import { Helmet } from 'react-helmet';
import imageOne from '../../assets/1.png';
import imageTwo from '../../assets/2.png';
import imageThree from '../../assets/3.png';
import imageFour from '../../assets/4.png';
import imageFive from '../../assets/5.png';
import skSir from '../../assets/Landing Page.png';
import img6 from '../../assets/6.png';
import img7 from '../../assets/7.png';
import img8 from '../../assets/8.png';
import img9 from '../../assets/9.png';
import img10 from '../../assets/10.png';
import img11 from '../../assets/11.png';
import img12 from '../../assets/12.png';
import img13 from '../../assets/13.png';


const paymentUrl = 'https://pages.razorpay.com/pl_Sj1CI7qR9MejPw/view';
const targetDate = new Date('2026-05-07T23:59:59+05:30').getTime();

const selectionImages = [
  img6,
  img7,
  img8,
  img9,
  img10,
  img11,
  img12,
  img13,
];

const useCountdown = () => {
  const getRemaining = () => {
    const difference = Math.max(targetDate - Date.now(), 0);
    return {
      days: Math.floor(difference / (1000 * 60 * 60 * 24)),
      hours: Math.floor((difference / (1000 * 60 * 60)) % 24),
      minutes: Math.floor((difference / (1000 * 60)) % 60),
      seconds: Math.floor((difference / 1000) % 60),
    };
  };

  const [remaining, setRemaining] = useState(getRemaining);

  useEffect(() => {
    const timer = window.setInterval(() => setRemaining(getRemaining()), 1000);
    return () => window.clearInterval(timer);
  }, []);

  return remaining;
};

const CountdownBox = ({ value, label, compact = false }: { value: number; label: string; compact?: boolean }) => (
  <div className={`${compact ? 'h-8 min-w-[2rem] rounded-md px-1.5 sm:h-9 sm:min-w-10 sm:px-2' : 'h-20 w-full min-w-0 rounded-xl px-1 sm:h-32 sm:min-w-[132px] sm:w-auto sm:rounded-2xl md:h-40 md:min-w-[164px] md:rounded-[1.6rem]'} flex flex-col items-center justify-center border border-red-500/20 bg-[#320907] text-center shadow-[inset_0_0_40px_rgba(255,0,0,0.08)]`}>
    <span className={`${compact ? 'text-lg sm:text-xl' : 'text-2xl sm:text-6xl md:text-7xl'} font-extrabold leading-none text-[#ef2424]`}>{String(value).padStart(compact ? 1 : 2, '0')}</span>
    {!compact && <span className="mt-2 text-[9px] font-semibold uppercase tracking-[0.18em] text-white/70 sm:mt-3 sm:text-xs md:text-sm">{label}</span>}
  </div>
);

const ExactImageSection = ({ src, alt, className = '', href }: { src: string; alt: string; className?: string; href?: string }) => (
  <section className={`bg-black ${className}`}>
    <div className="mx-auto max-w-[1366px]">
      {href ? (
        <a href={href} target="_blank" rel="noopener noreferrer" className="block">
          <img src={src} alt={alt} className="block w-full select-none object-contain" draggable="false" />
        </a>
      ) : (
        <img src={src} alt={alt} className="block w-full select-none object-contain" draggable="false" />
      )}
    </div>
  </section>
);

const GangwarOffer = () => {
  const remaining = useCountdown();
  const units = useMemo(
    () => [
      { value: remaining.days, label: 'Days' },
      { value: remaining.hours, label: 'Hours' },
      { value: remaining.minutes, label: 'Mins' },
      { value: remaining.seconds, label: 'Secs' },
    ],
    [remaining]
  );

  return (
    <section className="bg-black px-4 py-12 text-white sm:py-16 lg:py-20">
      <div className="mx-auto max-w-[1210px] rounded-[2rem] border-[3px] border-[#ef2424] bg-[#090908] px-5 py-10 shadow-[0_0_40px_rgba(239,36,36,0.12)] sm:rounded-[2.8rem] sm:px-10 md:px-16 md:py-16 lg:px-20">
        <div className="text-center">
          <h2 className="text-3xl font-extrabold uppercase tracking-tight text-white sm:text-5xl lg:text-6xl">
            GET AT A <span className="text-[#ef2424]">75%</span> DISCOUNT
          </h2>
          {/* <p className="mt-4 text-sm font-semibold uppercase tracking-[0.18em] text-white/60 sm:text-base">Timer until 7th May</p> */}
        </div>

        <div className="mt-10 grid grid-cols-4 gap-3 sm:flex sm:flex-wrap sm:items-center sm:justify-center sm:gap-7 md:mt-14">
          {units.map((unit) => (
            <CountdownBox key={unit.label} value={unit.value} label={unit.label} />
          ))}
        </div>

        <a
          href={paymentUrl}
          target="_blank"
          rel="noopener noreferrer"
          className="mx-auto mt-10 flex min-h-[74px] max-w-5xl items-center justify-center rounded-full border border-[#ef2424] bg-gradient-to-r from-[#260504] via-[#3b100d] to-[#5d1715] px-5 text-center text-xl font-extrabold text-white shadow-[inset_0_0_32px_rgba(255,255,255,0.04),0_0_28px_rgba(239,36,36,0.18)] transition hover:scale-[1.01] sm:text-3xl"
        >
          Get Your IMUCET Dhurandhar Package Rs. 500/- <span className="ml-3 text-white/70 line-through">Rs. 2000/-</span>
        </a>

        <p className="mt-8 text-center text-lg font-extrabold uppercase tracking-[0.18em] text-[#ef2424] sm:text-2xl">More Than 90% Paper Repeat Rate!</p>
      </div>
    </section>
  );
};

const SelectionCarousel = () => (
  <section className="overflow-hidden bg-black py-10 text-white sm:py-14">
    <h2 className="mb-8 bg-gradient-to-r from-[#ff6a00] via-[#ef2b24] to-[#c7003d] bg-clip-text text-center text-4xl font-extrabold text-transparent sm:text-5xl lg:text-7xl">
      Our Selections - 2025 Domination
    </h2>
    <div className="relative overflow-hidden border-y border-white/10 py-6">
      <div className="imucet-selection-marquee flex w-max items-center gap-8">
        {[...selectionImages, ...selectionImages].map((image, index) => (
          <div key={`${image}-${index}`} className="flex h-48 w-48 shrink-0 items-center justify-center rounded-2xl bg-[#111] p-3 shadow-[0_0_28px_rgba(255,255,255,0.08)] sm:h-56 sm:w-56">
            <img src={image} alt={`Selected student ${index + 1}`} className="max-h-full max-w-full rounded-xl object-contain" />
          </div>
        ))}
      </div>
    </div>
  </section>
);

const StickyPromoFooter = () => {
  const remaining = useCountdown();

  return (
    <div className="fixed inset-x-0 bottom-0 z-50 border-t border-red-500/30 bg-[#650808] text-white shadow-[0_-12px_32px_rgba(0,0,0,0.55)]">
      <div className="relative mx-auto flex min-h-[76px] max-w-[1366px] items-center gap-2 pl-[72px] pr-2 py-2 sm:justify-between sm:gap-3 sm:pl-44 sm:pr-6 lg:pr-10">
        <img src={skSir} alt="SK Sir" className="absolute bottom-0 left-0 h-full w-16 object-cover object-top sm:w-40" />
        <div className="hidden text-sm font-semibold text-white/85 md:block lg:text-base">Hurry Up!! Time is running out.</div>
        <div className="flex min-w-0 flex-1 items-center justify-center gap-1 overflow-hidden sm:flex-none sm:gap-2">
          <CountdownBox compact value={remaining.days} label="Days" />
          <CountdownBox compact value={remaining.hours} label="Hours" />
          <CountdownBox compact value={remaining.minutes} label="Mins" />
          <CountdownBox compact value={remaining.seconds} label="Secs" />
        </div>
        <div className="hidden text-center text-sm font-bold uppercase tracking-wide text-white/80 md:block">
          GET AT <span className="text-[#ef2424]">75%</span> DISCOUNT
        </div>
        <a
          href={paymentUrl}
          target="_blank"
          rel="noopener noreferrer"
          className="w-[136px] shrink-0 rounded-full border border-red-400/60 bg-gradient-to-r from-[#a8191b] to-[#750909] px-2.5 py-2 text-center text-[10px] font-extrabold leading-tight text-white shadow-[inset_0_0_20px_rgba(255,255,255,0.08)] transition hover:bg-[#c32124] sm:w-auto sm:px-7 sm:py-3 sm:text-sm lg:text-base"
        >
          Get Your IMUCET Topper Package Rs. 500/-
        </a>
      </div>
    </div>
  );
};

const IMUCETDhurandhar = () => (
  <div className="min-h-screen bg-black pb-24 font-poppins text-white">
    <Helmet>
      <title>IMUCET Dhurandhar Package | Budding Mariners</title>
      <meta name="description" content="Get the IMUCET Dhurandhar package at 75% discount with mock tests, probable questions, and SK Sir approved preparation." />
    </Helmet>
    <ExactImageSection src={imageOne} alt="Mission IMUCET 2026 approved package" />
    <ExactImageSection src={imageTwo} alt="75 percent discount call to action" href={paymentUrl} />
    <ExactImageSection src={imageThree} alt="What will you get in the pack" />
    <GangwarOffer />
    <SelectionCarousel />
    <ExactImageSection src={imageFour} alt="Things you will get" />
    <ExactImageSection src={imageFive} alt="IMUCET 2025 results and reviews" className="pb-6" />
    <StickyPromoFooter />
    <style>{`
      @keyframes imucetSelectionMarquee {
        0% { transform: translateX(0); }
        100% { transform: translateX(-50%); }
      }

      .imucet-selection-marquee {
        animation: imucetSelectionMarquee 28s linear infinite;
      }
    `}</style>
  </div>
);

export default IMUCETDhurandhar;