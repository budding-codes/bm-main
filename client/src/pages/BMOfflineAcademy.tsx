import React, { useState } from 'react';
import { Helmet } from 'react-helmet';
// Comment out or remove image imports for images you don't have yet
// import bmBanner from '../../assets/bm-banner.jpg'; // Placeholder for banner
// import bmBuilding from '../../assets/bm-building.jpg'; // Placeholder for building

// Dummy logo tiles (replace with real logos as needed)
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

import s1 from '../../assets/S1.jpg';
import s2 from '../../assets/S2.jpg';
import s3 from '../../assets/S3.jpg';
import s4 from '../../assets/S4.png';
import s5 from '../../assets/S5.png';
import s6 from '../../assets/S6.png';
import s7 from '../../assets/S7.png';
import s8 from '../../assets/S8.png';
import s9 from '../../assets/S9.png';

import building from '../../assets/Building 1.jpg';
import gouravf1 from '../../assets/Dr. Gourav Lalla.png';
import vanshikaf2 from '../../assets/Ms. Vanshika Kumar.png';
import rafif3 from '../../assets/Mr. Md Rafi.png';
import ojasf4 from '../../assets/Mr. Ojas Lalla.png';
import gauravf5 from '../../assets/Mr. Gaurav Yadav.png';
import priyanshu from '../../assets/Mr. Priyanshu Giri.png';

import parents from '../../assets/Parents.png';


// Add YouTube links for "Want to Know More" section
const wantToKnowMoreVideos = [
  'https://www.youtube.com/watch?v=to6Mb7eh1c8',
  'https://www.youtube.com/watch?v=dEmN-d6XqEk',
  'https://www.youtube.com/watch?v=DmERLSYhIOM',
];

// Add YouTube embed links for "Want to Know More" section
const wantToKnowMoreEmbeds = [
  'https://www.youtube.com/embed/to6Mb7eh1c8?si=a_JLxTDuiZgR6dcH',
  'https://www.youtube.com/embed/dEmN-d6XqEk?si=rCiOlaXgy4J3P0Zz',
  'https://www.youtube.com/embed/DmERLSYhIOM?si=pWckWtf83rpj3kM3',
];

// Helper to get YouTube thumbnail from link
const getYoutubeThumbnail = (url: string) => {
  const match = url.match(/v=([a-zA-Z0-9_-]{11})/);
  return match ? `https://img.youtube.com/vi/${match[1]}/hqdefault.jpg` : '';
};

const logoTiles = [
  cl1, cl2, cl3, cl4, cl5, cl6, cl7, cl10, cl11, cl12, cl13
];

// Faculty data for interactive section
const facultyList = [
  {
    name: 'Dr. Gourav Lalla',
    title: 'MBBS, DNB - Ophthalmologist',
    role: 'In-house Doctor (Ophthalmologist) at Budding Mariners.',
    description: `Guides students for Medicals, Psychometric Tests, and maintaining physical & mental fitness for sea life.`,
    img: gouravf1,
  },
  {
    name: 'Ms. Vanshika Kumar',
    title: 'Faculty – English, Communication & Personality Development',
    role: '',
    description: `5+ years of experience in helping students speak fluently and present confidently.`,
    img: vanshikaf2,
  },
  {
    name: 'Mr. Md Rafi',
    title: 'HOD – Maths & Physics, MNIT JAIPUR',
    role: '',
    description: `With over 13+ years of teaching experience, he is known for making tough concepts simple and exam-ready.`,
    img: rafif3,
  },
  {
    name: 'Mr. Ojas Lalla',
    title: 'Non-Technical Interview & Personal Growth',
    role: '',
    description: `Our founder mentors students in character building, mindset, and real-time interview strategies. He cracked a record-breaking 8 sponsorships of Torm, Scorpio, Synergy, Anglo Eastern, Fleet, Great Eastern, Wilhelmsen, and Goodwood during his DNS.`,
    img: ojasf4,
  },
  {
    name: 'Mr. Gaurav Yadav',
    title: 'HOD – General Aptitude, UPSC',
    role: '',
    description: `7+ years of teaching experience with expertise in speed-based problem solving for competitive exams.`,
    img: gauravf5,
  },
  {
    name: 'Mr. Priyanshu Giri',
    title: 'HOD – Chemistry, IIT MADRAS',
    role: '',
    description: `With 7+ years of experience, he is known for making Chemistry interesting and scoring through smart tricks and core understanding.`,
    img: priyanshu,
  },
];

const reviews = [
  { text: "Budding Mariners Academy is truly India's #1. The faculty is amazing, especially Mr. Rafi for Maths and Physics!", author: "Aryan K." },
  { text: "The offline classroom experience is fantastic! It's a great space to dream, grow, and succeed.", author: "Priya S." },
  { text: "I love the structured approach to IMU-CET preparation. The daily practice papers really help.", author: "Rohan M." },
  { text: "The 1:1 unlimited mock interviews are a game-changer. It boosted my confidence so much!", author: "Aisha N." },
  { text: "Ojas Lalla's sessions on personal growth and interview strategies are incredibly insightful. He cracked 8 sponsorships, wow!", author: "Sameer A." },
  { text: "The hostel facility is top-notch, with nutritious meals and 24x7 security. Feels like a second home.", author: "Deepak R." },
  { text: "Ms. Vanshika Kumar is brilliant for English and communication. I feel much more confident speaking now.", author: "Anjali P." },
  { text: "The daily schedule keeps us disciplined and focused. PT and self-study hours are well-balanced.", author: "Krish V." },
  { text: "The cheat sheets for quick revision are a lifesaver, especially before exams.", author: "Sara H." },
  { text: "Dr. Gourav Lalla's guidance on medicals and psychometric tests is invaluable. He really cares about our fitness for sea life.", author: "Vivek B." },
  { text: "The selection ratio of 95% really speaks for itself. They deliver on their promises!", author: "Geetika L." },
  { text: "Budding Mariners has helped over 1500+ students, and I can see why. Their personalized system works.", author: "Rahul C." },
  { text: "The daily interactive classes make learning fun and engaging, covering all subjects thoroughly.", author: "Ishaan D." },
  { text: "The BM Khazana on the app is a hidden gem – so much extra material for company-specific prep!", author: "Nidhi G." },
  { text: "Trustworthy and results-driven. Budding Mariners truly lives up to its reputation as India's #1 for Merchant Navy prep.", author: "Arjun T." },
  { text: "Budding Mariners mein aake bahut accha laga. Offline classes kaafi helpful hain.", author: "Sameer K." },
  { text: "Faculty sab bahut experienced hain, aur real-life field experience bhi share karte hain.", author: "Tanya R." },
  { text: "IMU CET ki taiyari ekdum structured hai, mock tests se bahut fayda hua.", author: "Vikram S." },
  { text: "Hostel ki facility superb hai, 3 time nutritious veg meal milti hai.", author: "Avinash G." },
  { text: "Ojas sir ne interview ke liye mast prepare karaya, unka experience zabardast hai.", author: "Kartik J." },
  { text: "Daily schedule se routine set ho gaya hai, self-study ke liye bhi time milta hai.", author: "Pooja M." },
  { text: "BM app pe sab available hai – notes, recordings, sab kuch ek jagah.", author: "Rishi P." },
  { text: "Medical guidance ke liye Dr. Gourav Lalla sir hain, tension free rahte hain hum.", author: "Suresh C." },
  { text: "Parent-Teacher meets bhi hoti hain bi-weekly, parents ko bhi update rehta hai.", author: "Neha V." },
  { text: "Humare sir, Mr. Gaurav Yadav, aptitude ke liye best hain, speed-based problem solving sikhate hain.", author: "Amit L." },
];

const BMOfflineAcademy = () => {
  const [selectedFaculty, setSelectedFaculty] = useState(0);

  return (
    <div className="min-h-screen bg-black text-white font-sans">
      <Helmet>
        <title>BM Offline Academy | India's #1 Academy for Merchant Navy Aspirants</title>
        <meta name="description" content="Join BM Offline Academy for IMU-CET & Sponsorship Prep. India's #1 Academy for Merchant Navy Aspirants. Highest selection ratio, top faculty, and real results." />
        <meta name="keywords" content="BM Offline Academy, Merchant Navy, IMU CET, Sponsorship, Maritime Academy, Offline Classes, Best Marine Academy" />
        <meta property="og:title" content="BM Offline Academy | India's #1 Academy for Merchant Navy Aspirants" />
        <meta property="og:description" content="BM Offline Academy: India's best for IMU-CET & Sponsorship. 42% of all India Merchant Navy cadets are from BM." />
        <meta property="og:type" content="website" />
        <meta property="og:url" content="https://buddingmariners.com/bm-offline-academy" />
        <meta property="og:image" content="/assets/yellow on orange logomark.png" />
      </Helmet>

      {/* Header */}
      <section className="pt-32 pb-4 text-center bg-black">
        <h1 className="text-3xl md:text-4xl font-extrabold mb-1 text-white uppercase tracking-wide font-geist">
          Budding Mariners Academy
        </h1>
        <div className="text-lg md:text-2xl font-bold text-yellow-400 mb-2 font-geist">
          Offline Classes for IMU-CET & Sponsorship Prep
        </div>
        <div className="inline-block bg-red-600 text-white font-bold px-4 py-2 rounded mb-3 text-base md:text-lg font-geist">
          INDIA'S #1 ACADEMY FOR MERCHANT NAVY ASPIRANTS
        </div>
        <div className="text-white/80 text-base md:text-lg mb-2 font-poppins">
          Structured. <span className="text-yellow-400 font-bold font-geist">Smart.</span> Successful.
        </div>
      </section>

      {/* Stats */}
      <section className="bg-black py-6">
        <div className="max-w-3xl mx-auto flex flex-col md:flex-row justify-center items-center gap-6">
          <div className="flex-1 flex flex-col items-center">
            <div className="text-4xl md:text-5xl font-extrabold text-white mb-1 font-bebas">42%</div>
            <div className="text-yellow-400 text-center text-base md:text-lg font-semibold font-poppins">of All India Merchant Navy Cadets are from BM</div>
          </div>
          <div className="flex-1 flex flex-col items-center">
            <div className="text-4xl md:text-5xl font-extrabold text-white mb-1 font-bebas">85%</div>
            <div className="text-yellow-400 text-center text-base md:text-lg font-semibold font-poppins">Selection Ratio Over The Last 4 Years</div>
          </div>
          <div className="flex-1 flex flex-col items-center">
            <div className="text-4xl md:text-5xl font-extrabold text-white mb-1 font-bebas">25+</div>
            <div className="text-yellow-400 text-center text-base md:text-lg font-semibold font-poppins">Shipping Company Sponsorships Cracked by BM Students</div>
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
        <style jsx>{`
          @keyframes scroll {
            0% { transform: translateX(0); }
            100% { transform: translateX(-50%); }
          }
        `}</style>
      </section>

      {/* What You'll Learn */}
      <section className="bg-black py-8">
        <h2 className="text-xl font-bold text-center text-yellow-400 mb-4 uppercase">What You’ll Learn?</h2>
        <div className="max-w-4xl mx-auto flex flex-col md:flex-row items-center gap-8 px-4">
          <div className="flex-1">
            <ul className="space-y-3 text-white text-base">
              <li>
                <span className="font-bold text-yellow-400">•</span> <span className="font-bold">Daily Interactive Classes</span>
                <br />
                <span className="text-white/80">Physics, Chemistry, Maths, Aptitude, English & GK - made easy.</span>
              </li>
              <li>
                <span className="font-bold text-yellow-400">•</span> <span className="font-bold">Smart Prep Modules</span>
                <br />
                <span className="text-white/80">Company-specific material, cheat sheets & shortcut tricks.</span>
              </li>
              <li>
                <span className="font-bold text-yellow-400">•</span> <span className="font-bold">Live Doubt Solving</span>
                <br />
                <span className="text-white/80">No question goes unanswered.</span>
              </li>
              <li>
                <span className="font-bold text-yellow-400">•</span> <span className="font-bold">Mock Tests that Simulate Reality</span>
                <br />
                <span className="text-white/80">Chapter-wise. Subject-wise. Full-length.</span>
              </li>
              <li>
                <span className="font-bold text-yellow-400">•</span> <span className="font-bold">BM Khazana: Our Secret Sauce</span>
                <br />
                <span className="text-white/80">Motivational content, ship knowledge boosters, and success strategies.</span>
              </li>
            </ul>
          </div>
          <div className="flex-1 flex justify-center">
            <div
              className="rounded-3xl border-8 border-[#2351d5] bg-[#18181b] flex items-center justify-center"
              style={{ width: 340, height: 340, maxWidth: '90vw', maxHeight: '70vw' }}
            >
              <img
                src={building}
                alt="BM Academy Building"
                className="object-cover w-full h-full rounded-2xl"
                style={{ borderRadius: 24 }}
              />
            </div>
          </div>
        </div>
      </section>

      {/* Red Banner */}
      <div className="w-full bg-red-600 text-white font-bold text-center py-2 text-base md:text-lg overflow-hidden">
        <div 
          className="flex items-center whitespace-nowrap"
          style={{
            animation: 'marqueeRed 25s linear infinite',
            width: 'fit-content'
          }}
        >
          {Array(8).fill(0).map((_, i) => (
            <React.Fragment key={i}>
              <span className="mx-8">Led by a team of Marine Officers, IITians, Psychologists & Doctors</span>
              <span className="mx-8 text-yellow-400">✦</span>
            </React.Fragment>
          ))}
        </div>
        <style jsx>{`
          @keyframes marqueeRed {
            0% { transform: translateX(0); }
            100% { transform: translateX(-50%); }
          }
        `}</style>
      </div>

      

      {/* Past Selections */}
      <section className="bg-black py-8">
        <h2 className="text-xl font-bold text-center text-yellow-400 mb-4 uppercase tracking-wide">
          Our Past Selections...
        </h2>
        <div className="relative overflow-hidden">
          <div 
            className="flex items-center gap-8 md:gap-12"
            style={{
              animation: 'marqueePastSelections 30s linear infinite',
              width: 'fit-content'
            }}
          >
            {[...Array(2)].fill([s1, s2, s3, s4, s5, s6, s7, s8, s9]).flat().map((img, idx) => (
              <div
                key={idx}
                className="flex-shrink-0 flex items-center justify-center"
                style={{ minWidth: '200px', height: '200px' }}
              >
                <img
                  src={img}
                  alt={`Past Selection ${idx + 1}`}
                  className="max-w-full max-h-full object-contain rounded"
                  style={{ maxHeight: 200, maxWidth: 300 }}
                />
              </div>
            ))}
          </div>
        </div>
        <style jsx>{`
          @keyframes marqueePastSelections {
            0% { transform: translateX(0); }
            100% { transform: translateX(-50%); }
          }
        `}</style>
      </section>

      {/* Faculty Section */}
      <section className="bg-black py-12">
        <h2 className="text-xl font-bold text-center text-yellow-400 mb-8 uppercase tracking-wide">
          Meet The Faculty That Makes Your Dream Come True...
        </h2>
        <div className="flex flex-wrap justify-center gap-8 px-2 mb-8">
          {facultyList.map((faculty, idx) => (
            <div key={idx} className="flex flex-col items-center">
              <button
                onClick={() => setSelectedFaculty(idx)}
                className={`flex flex-col items-center justify-center rounded-2xl border-4 transition-all duration-200
                  ${selectedFaculty === idx
                    ? 'border-yellow-400 bg-white'
                    : 'border-gray-700 bg-gray-800 grayscale opacity-70 hover:opacity-100 hover:grayscale-0'
                }`}
                style={{
                  width: 220,
                  height: 280,
                  boxShadow: selectedFaculty === idx ? '0 0 0 4px #fde047' : undefined,
                  outline: 'none',
                  padding: 0,
                }}
                aria-label={faculty.name}
              >
                <div className="w-full h-[200px] flex items-center justify-center rounded-t-xl overflow-hidden">
                  <img
                    src={faculty.img}
                    alt={faculty.name}
                    className={`object-contain w-full h-[240px] transition-all duration-200
                      ${selectedFaculty === idx ? '' : 'grayscale'}`}
                    style={{
                      filter: selectedFaculty === idx ? 'none' : 'grayscale(100%)',
                      borderBottom: selectedFaculty === idx ? '2px solid #fde047' : '2px solid #444',
                    }}
                  />
                </div>
                <div className={`w-full px-2 py-2 text-center text-base font-semibold
                  ${selectedFaculty === idx ? 'text-black' : 'text-white/80'}`}>
                  {faculty.name}
                </div>
              </button>
              {/* Show description below the selected mentor in mobile view */}
              {selectedFaculty === idx && (
                <div className="block md:hidden w-full mt-2 bg-[#18181b] rounded-xl border-2 border-yellow-400 p-4 text-center shadow-lg">
                  <div className="text-lg font-bold text-yellow-400 mb-1">{faculty.name}</div>
                  <div className="text-white font-semibold mb-1">{faculty.title}</div>
                  {faculty.role && (
                    <div className="text-white/80 text-sm mb-2">{faculty.role}</div>
                  )}
                  <div className="text-white/90 text-base">{faculty.description}</div>
                </div>
              )}
            </div>
          ))}
        </div>
        {/* Desktop view remains unchanged */}
        <div className="hidden md:block max-w-2xl mx-auto bg-[#18181b] rounded-xl border-2 border-yellow-400 p-6 text-center shadow-lg">
          <div className="text-xl font-bold text-yellow-400 mb-1">{facultyList[selectedFaculty].name}</div>
          <div className="text-white font-semibold mb-1">{facultyList[selectedFaculty].title}</div>
          {facultyList[selectedFaculty].role && (
            <div className="text-white/80 text-sm mb-2">{facultyList[selectedFaculty].role}</div>
          )}
          <div className="text-white/90 text-base">{facultyList[selectedFaculty].description}</div>
        </div>
        <div className="text-center text-xs text-white/80 mt-4">50+ Company-specific experts</div>
      </section>

      {/* Admissions Marquee Banner */}
      <div className="w-full bg-red-600 text-white font-bold text-center py-2 text-base md:text-lg overflow-hidden">
        <div
          className="flex items-center whitespace-nowrap"
          style={{
            animation: 'marqueeAdmissions 30s linear infinite',
            width: 'fit-content'
          }}
        >
          {Array(8).fill(0).map((_, i) => (
            <React.Fragment key={i}>
              <span className="mx-8">Batch Starting Soon... Want to Enquire?</span>
              <span className="mx-8">Next Batch Starting Soon... Want to Enquire?</span>
              <span className="mx-8">Admissions Open... Want to Enquire?</span>
              <span className="mx-8 text-yellow-400">✦</span>
            </React.Fragment>
          ))}
        </div>
        <style jsx>{`
          @keyframes marqueeAdmissions {
            0% { transform: translateX(0); }
            100% { transform: translateX(-50%); }
          }
        `}</style>
      </div>

      {/* Beyond the Books */}
      <section className="bg-black py-8">
        <h2 className="text-xl font-bold text-center text-yellow-400 mb-4 uppercase tracking-wide">
          Beyond the Books...
        </h2>
        <div className="flex flex-col md:flex-row justify-center items-stretch gap-8 max-w-4xl mx-auto px-4">
          <div className="flex-1 flex flex-col items-center text-center">
            <div className="text-5xl mb-2">🧑‍💼</div>
            <div className="font-bold text-white mb-1">Interview & Personality Training</div>
            <div className="text-white/80 text-sm">By mentors who've cracked 8+ sponsorships themselves!</div>
          </div>
          <div className="flex-1 flex flex-col items-center text-center">
            <div className="text-5xl mb-2">🧠</div>
            <div className="font-bold text-white mb-1">Mental & Physical Fitness Prep</div>
            <div className="text-white/80 text-sm">Guidance from in-house doctors & psychometric trainers.</div>
          </div>
          <div className="flex-1 flex flex-col items-center text-center">
            <div className="text-5xl mb-2">📱</div>
            <div className="font-bold text-white mb-1">Budding Mariners App Access</div>
            <div className="text-white/80 text-sm">All your notices, classes, tests, PYQs, and more in your pocket.</div>
          </div>
        </div>
      </section>

      {/* Parents Section */}
      <section className="bg-[#0a2540] py-8">
        <div className="max-w-4xl mx-auto flex flex-col md:flex-row gap-8 items-center px-4">
          <div className="flex-1">
            <h2 className="text-2xl font-bold text-white mb-2">Parents, We've Got You Covered...</h2>
            <ul className="list-disc pl-6 text-white/80 space-y-2">
              <li>Fortnightly Parent-Teacher Meetings</li>
              <li>Transparent progress tracking</li>
              <li>Focus on character building & discipline</li>
            </ul>
          </div>
          <div className="flex-1 flex justify-center">
            <div className="bg-gray-800 rounded-xl border-4 border-yellow-400 w-full max-w-xs h-40 flex items-center justify-center overflow-hidden">
              <img
                src={parents}
                alt="Parents"
                className="object-contain w-full h-full"
              />
            </div>
          </div>
        </div>
      </section>

      {/* Location Section */}
      <section className="bg-black py-8">
        <div className="max-w-4xl mx-auto flex flex-col md:flex-row gap-8 items-center px-4">
          <div className="flex-1">
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
          <div className="flex-1 flex justify-center">
            <div className="bg-gray-800 rounded-xl border-4 border-yellow-400 w-full max-w-xs h-40 flex items-center justify-center text-yellow-400 text-lg font-bold">
              <iframe
                title="BM Academy Location"
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
        <div>Want to start preparing for your dream Merchant Navy life?</div>
        <a
          href="https://docs.google.com/forms/d/e/1FAIpQLSfplFAt9uFYYr9r5LDg4-0sP6IpfgZ0bjjOogXFtpODXRTVQw/viewform"
          target="_blank"
          rel="noopener noreferrer"
          className="inline-block mt-2 bg-white text-red-600 px-6 py-2 rounded-full font-bold hover:bg-yellow-400 hover:text-black transition"
        >
          Click Here To Apply Now
        </a>
      </div>

      {/* Want to Know More (YouTube Videos) */}
      <section className="bg-black py-8">
        <h2 className="text-xl font-bold text-center text-yellow-400 mb-4 uppercase tracking-wide">
          Want to Know More?
        </h2>
        <div className="flex flex-wrap justify-center gap-4 px-2">
          {wantToKnowMoreEmbeds.map((yt, idx) => (
            <div
              key={idx}
              className="bg-gray-800 rounded-lg shadow border border-white/10 flex flex-col items-center justify-center overflow-hidden"
              style={{ width: 320, height: 200 }}
            >
              <iframe
                width="100%"
                height="170"
                src={yt}
                title={`YouTube video ${idx + 1}`}
                frameBorder="0"
                allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
                referrerPolicy="strict-origin-when-cross-origin"
                allowFullScreen
                style={{ borderRadius: '8px 8px 0 0', background: '#000' }}
              />
              <div className="text-yellow-400 font-bold text-xs text-center px-2 py-1 w-full bg-black">
                Watch here
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* What Our Students Say - Marquee */}
      <section className="bg-black py-8">
        <h2 className="text-xl font-bold text-center text-yellow-400 mb-4 uppercase tracking-wide">
          What Our Students Say About Us?
        </h2>
        <div className="relative overflow-hidden">
          <div
            className="flex items-center gap-8"
            style={{
              animation: 'marqueeReviews 80s linear infinite',
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

export default BMOfflineAcademy;

