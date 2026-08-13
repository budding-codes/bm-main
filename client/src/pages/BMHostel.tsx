import React, { useState } from 'react';
import { Helmet } from 'react-helmet';
import { canonicalUrl } from '../lib/site';

// Import hostel-specific images
// import hostelMain from '../../assets/hostel-main.jpg';
// import hostelAmenity1 from '../../assets/hostel-amenity1.jpg';
// import hostelAmenity2 from '../../assets/hostel-amenity2.jpg';
// import hostelAmenity3 from '../../assets/hostel-amenity3.jpg';
import parents from '../../assets/Parents.png';

import hostelvideo from '../../assets/IMG_1768.mp4';
import timing from '../../assets/Timings.png';
import givenotgive from '../../assets/Give Not Give.png';

// Company logos (reuse from BMOfflineAcademy if needed)
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

const logoTiles = [
  cl1, cl2, cl3, cl4, cl5, cl6, cl7, cl10, cl11, cl12, cl13
];

// Hostel amenities images
// Remove actual images, keep as placeholder
const amenitiesImages = [
  // Placeholder: add hostel amenity images here in future
];

// Hostel reviews
const reviews = [
  { text: "The hostel is super clean and safe. 24x7 security and nutritious meals make it feel like home!", author: "Deepak R." },
  { text: "Study hours with supervision helped me stay focused. The warden is always available for help.", author: "Priya S." },
  { text: "The best part is the daily routine and discipline. I made great friends and memories here.", author: "Aryan K." },
  { text: "Parents get regular updates and the staff is very supportive. Highly recommended!", author: "Neha V." },
  { text: "The rooms are spacious and the food is healthy. I never felt homesick!", author: "Avinash G." },
];

// YouTube videos for hostel life
const hostelVideos = [
  'https://www.youtube.com/watch?v=9IcZRS2AfK4',
  'https://www.youtube.com/watch?v=5BebPB4MAmw',
  'https://www.youtube.com/watch?v=_sVoBYAEkSg',
  'https://www.youtube.com/watch?v=372-IZDZWLc',
];

const getYoutubeThumbnail = (url: string) => {
  const match = url.match(/v=([a-zA-Z0-9_-]{11})/);
  return match ? `https://img.youtube.com/vi/${match[1]}/hqdefault.jpg` : '';
};

const BMHostel = () => {
  return (
    <div className="min-h-screen bg-black text-white font-sans">
      <Helmet>
        <title>BM's Hostel | Best Hostel for Merchant Navy Aspirants</title>
        <meta name="description" content="BM's Hostel offers the best facilities for Merchant Navy aspirants: safe, hygienic, nutritious meals, and 24x7 support. Live, learn, and thrive with Budding Mariners." />
        <meta name="keywords" content="BM Hostel, Merchant Navy Hostel, Maritime Hostel, Hostel Jaipur, Best Hostel for Students" />
        <meta property="og:title" content="BM's Hostel | Best Hostel for Merchant Navy Aspirants" />
        <meta property="og:description" content="BM's Hostel: Safe, hygienic, and supportive environment for Merchant Navy aspirants." />
        <meta property="og:type" content="website" />
        <link rel="canonical" href={canonicalUrl('/bm-hostel')} />
        <meta property="og:url" content={canonicalUrl('/bm-hostel')} />
        <meta property="og:image" content="/assets/yellow on orange logomark.png" />
      </Helmet>

      {/* Header */}
      <section className="pt-32 pb-4 text-center bg-black">
        <h1 className="text-3xl md:text-4xl font-extrabold mb-1 text-white uppercase tracking-wide font-geist">
          Budding Mariners Hostel
        </h1>
        <div className="text-lg md:text-2xl font-bold text-yellow-400 mb-2 font-geist">
          Live, Learn & Thrive
        </div>
        <div className="inline-block bg-red-600 text-white font-bold px-4 py-2 rounded mb-3 text-base md:text-lg font-geist">
          INDIA'S #1 HOSTEL FOR MERCHANT NAVY ASPIRANTS
        </div>
        <div className="text-white/80 text-base md:text-lg mb-2 font-poppins">
          Comfort. <span className="text-yellow-400 font-bold font-geist">Discipline.</span> Success.
        </div>
      </section>
      {/* Hostel Stats */}
      <section className="bg-black py-6">
        <div className="max-w-3xl mx-auto flex flex-col md:flex-row justify-center items-center gap-6">
          <div className="flex-1 flex flex-col items-center">
            <div className="text-4xl md:text-5xl font-extrabold text-white mb-1 font-bebas">24x7</div>
            <div className="text-yellow-400 text-center text-base md:text-lg font-semibold font-poppins">Warden & Security</div>
          </div>
          <div className="flex-1 flex flex-col items-center">
            <div className="text-4xl md:text-5xl font-extrabold text-white mb-1 font-bebas">100%</div>
            <div className="text-yellow-400 text-center text-base md:text-lg font-semibold font-poppins">Under CCTV Supervision</div>
          </div>
          <div className="flex-1 flex flex-col items-center">
            <div className="text-4xl md:text-5xl font-extrabold text-white mb-1 font-bebas">3X</div>
            <div className="text-yellow-400 text-center text-base md:text-lg font-semibold font-poppins">Best Quality Meals Every day</div>
          </div>
        </div>
      </section>

      {/* Logo Tiles */}
      <section className="bg-black py-8">
        <h2 className="text-xl font-bold text-center text-yellow-400 mb-6 uppercase tracking-wide">
          Our Students Are Placed In...
        </h2>
        <div className="relative overflow-hidden">
          <div 
            className="flex items-center gap-8 md:gap-12"
            style={{
              animation: 'scroll 30s linear infinite',
              width: 'fit-content'
            }}
          >
            {[...logoTiles, ...logoTiles].map((logo, idx) => (
              <div
                key={idx}
                className="flex-shrink-0 flex items-center justify-center bg-white rounded-lg p-4 md:p-6 shadow-md border border-white/10"
                style={{ minWidth: '200px', height: '100px' }}
              >
                <img
                  src={logo}
                  alt={`Company ${idx + 1}`}
                  className="max-w-full max-h-full object-contain"
                />
              </div>
            ))}
          </div>
        </div>
        <style>{`
          @keyframes scroll {
            0% { transform: translateX(0); }
            100% { transform: translateX(-50%); }
          }
        `}</style>
      </section>

      {/* Hostel Amenities */}
      <section className="bg-black py-8">
        <div className="max-w-4xl mx-auto flex flex-col md:flex-row items-center gap-8 px-2 md:px-4">
          {/* Left: Heading and bullet points */}
          <div className="flex-1 w-full min-w-0 flex items-center justify-center">
            <div
              className="bg-[#0a2540] rounded-3xl border-8 border-[#2351d5] p-4 md:p-8 flex flex-col justify-center"
              style={{
                minHeight: 320,
                minWidth: 0,
                maxWidth: 400,
                width: '100%',
                height: 320,
                boxSizing: 'border-box',
              }}
            >
              <h2 className="text-xl md:text-3xl font-extrabold text-yellow-400 mb-2 leading-tight" style={{ lineHeight: 1.15 }}>
                What Students<br />Really Need –<br />And We Provide?
              </h2>
              <div className="font-bold text-white mb-2 text-base md:text-lg">Comfort Meets Discipline</div>
              <ul className="list-disc pl-5 text-white/90 text-sm md:text-base space-y-2">
                <li>Fully furnished shared rooms (bed, mattress, table, cupboard)</li>
                <li>Hygienic environment with daily cleaning</li>
                <li>Nutritious vegetarian meals – breakfast, lunch, dinner</li>
              </ul>
            </div>
          </div>
          {/* Right: Video */}
          <div className="flex-1 flex items-center justify-center w-full min-w-0">
            <div
              className="rounded-3xl border-8 border-[#2351d5] bg-[#18181b] flex items-center justify-center"
              style={{
                minHeight: 320,
                minWidth: 0,
                maxWidth: 400,
                width: '100%',
                height: 320,
                boxSizing: 'border-box',
              }}
            >
              <video
                src={hostelvideo}
                controls
                autoPlay
                muted
                loop
                className="object-cover w-full h-full rounded-2xl"
                style={{ borderRadius: 24, background: '#232323', width: '100%', height: '100%' }}
                poster=""
              />
            </div>
          </div>
        </div>
      </section>

      {/* Structured Daily Routine Section */}
      <section className="bg-black py-8">
        <h2 className="text-2xl md:text-3xl font-extrabold text-yellow-400 text-center mb-6">
          Structured Daily Routine for Maximum Productivity
        </h2>
        <div className="flex justify-center px-2">
          <img
            src={timing}
            alt="Structured Daily Routine"
            className="rounded-2xl shadow-lg border-4 border-white w-full max-w-[700px] h-auto"
            style={{ objectFit: 'contain' }}
          />
        </div>
      </section>

      {/* Fees Details */}
      <section className="bg-black py-8">
        <h2 className="text-2xl font-bold text-center text-yellow-400 mb-4 uppercase tracking-wide">
          Fees Details
        </h2>
        <div className="flex flex-col items-center">
          <a
            href="https://docs.google.com/forms/d/e/1FAIpQLSfplFAt9uFYYr9r5LDg4-0sP6IpfgZ0bjjOogXFtpODXRTVQw/viewform"
            target="_blank"
            rel="noopener noreferrer"
            className="bg-green-500 text-white font-bold text-lg px-8 py-4 rounded-full mb-2 hover:bg-green-600 transition"
            style={{ display: 'inline-block', textDecoration: 'none' }}
          >
            HOSTEL FEES FOR 3 MONTHS = Rs. 30,000/-
          </a>
          <div className="text-white/60 font-semibold text-base">No Hidden Costs.</div>
        </div>
      </section>

      {/* Parents Section */}
      <section className="bg-[#0a2540] py-8">
        <div className="max-w-4xl mx-auto flex flex-col md:flex-row gap-8 items-center px-2 md:px-4">
          <div className="flex-1 w-full min-w-0">
            <h2 className="text-2xl font-bold text-white mb-2">Parents, We've Got You Covered...</h2>
            <ul className="list-disc pl-6 text-white/80 space-y-2">
              <li>Warden contact for instant updates</li>
              <li>Security of aspirants is our #1 priority</li>
              <li>Focus on character building & discipline</li>
            </ul>
          </div>
          <div className="flex-1 flex justify-center w-full min-w-0">
            <div className="bg-gray-800 rounded-xl border-4 border-yellow-400 w-full max-w-xs h-40 flex items-center justify-center overflow-hidden">
              <img
                src={parents}
                alt="Parents"
                className="object-contain w-full h-full"
              />
            </div>
          </div>
        </div>
        {/* Below the parents section, show the "Give Not Give" image */}
        <div className="flex justify-center mt-8 px-2">
          <img
            src={givenotgive}
            alt="What We Provide and Not Provide"
            className="rounded-2xl shadow-lg border-4 border-white w-full max-w-[700px] h-auto"
            style={{ objectFit: 'contain' }}
          />
        </div>
      </section>

      {/* Location Section */}
      <section className="bg-black py-8">
        <div className="max-w-4xl mx-auto flex flex-col md:flex-row gap-8 items-center px-2 md:px-4">
          <div className="flex-1 w-full min-w-0">
            <h2 className="text-2xl font-bold text-yellow-400 mb-2">Location</h2>
            <div className="mb-2">
              <span className="font-bold text-white">Address:</span>{' '}
              <span className="text-white/80">
                Ground Floor, Garhwal Tower I, Arcadia Greens Rd, Vaishali Estate, Jaipur, Rajasthan 302012
              </span>
            </div>
            <div className="mb-2">
              <span className="font-bold text-white">Phone:</span>{' '}
              <span className="text-yellow-400">9799009509</span>
            </div>
          </div>
          <div className="flex-1 flex justify-center w-full min-w-0">
            <div className="bg-gray-800 rounded-xl border-4 border-yellow-400 w-full max-w-xs h-40 flex items-center justify-center text-yellow-400 text-lg font-bold">
              <iframe
                title="BM Hostel Location"
                src="https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d3559.9999999999995!2d75.78999999999999!3d26.912999999999997!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x0%3A0x0!2zMjbCsDU0JzQ2LjgiTiA3NcKwNDcnMjMuOSJF!5e0!3m2!1sen!2sin!4v1680000000000!5m2!1sen!2sin"
                width="100%"
                height="100%"
                style={{ border: 0, borderRadius: 12, minHeight: 120 }}
                allowFullScreen={false}
                loading="lazy"
                referrerPolicy="no-referrer-when-downgrade"
              />
            </div>
          </div>
        </div>
      </section>

      {/* CTA Red Banner */}
      <div className="w-full bg-red-600 text-white font-bold text-center py-4 text-lg md:text-xl">
        <div>Want to book your hostel seat?</div>
        <a
          href="https://docs.google.com/forms/d/e/1FAIpQLSfplFAt9uFYYr9r5LDg4-0sP6IpfgZ0bjjOogXFtpODXRTVQw/viewform"
          target="_blank"
          rel="noopener noreferrer"
          className="inline-block mt-2 bg-white text-red-600 px-6 py-2 rounded-full font-bold hover:bg-yellow-400 hover:text-black transition"
        >
          Click Here To Apply Now
        </a>
      </div>

      {/* Hostel Life Videos */}
      <section className="bg-black py-8">
        <h2 className="text-xl font-bold text-center text-yellow-400 mb-4 uppercase tracking-wide">
          Hostel Life at BM
        </h2>
        <div className="flex flex-wrap justify-center gap-4 px-2">
          {hostelVideos.map((yt, idx) => (
            <div
              key={idx}
              className="bg-gray-800 rounded-lg shadow border border-white/10 flex flex-col items-center justify-center cursor-pointer overflow-hidden"
              style={{ width: 260, height: 180 }}
              onClick={() => window.open(yt, '_blank', 'noopener')}
            >
              <img
                src={getYoutubeThumbnail(yt)}
                alt="YouTube Video"
                className="object-cover w-full h-[120px]"
                style={{ borderRadius: '8px 8px 0 0' }}
              />
              <div className="text-yellow-400 font-bold text-xs text-center px-2 py-1 w-full bg-black">
                Watch on YouTube
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* What Our Hostel Residents Say - Marquee */}
      <section className="bg-black py-8">
        <h2 className="text-xl font-bold text-center text-yellow-400 mb-4 uppercase tracking-wide">
          What Our Hostel Residents Say?
        </h2>
        <div className="relative overflow-hidden">
          <div
            className="flex items-center gap-8"
            style={{
              animation: 'marqueeReviews 60s linear infinite',
              width: 'fit-content',
            }}
          >
            {[...reviews, ...reviews].map((review, idx) => (
              <div
                key={idx}
                className="flex-shrink-0 bg-[#18181b] rounded-xl border border-white/10 shadow p-4 min-w-[320px] max-w-xs mx-2"
                style={{ width: 320 }}
              >
                <div className="text-yellow-400 mb-2">★★★★★</div>
                <div className="text-white/90 text-base mb-2 leading-snug">{review.text}</div>
                <div className="text-xs text-white/60 text-right">- {review.author}</div>
              </div>
            ))}
          </div>
          <style>{`
            @keyframes marqueeReviews {
              0% { transform: translateX(0); }
              100% { transform: translateX(-50%); }
            }
          `}</style>
        </div>
      </section>
    </div>
  );
};

export default BMHostel;

