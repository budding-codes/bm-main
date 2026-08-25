import React, { useState } from 'react';
import { Helmet } from 'react-helmet-async';
import { canonicalUrl } from '../lib/site';
import { motion } from 'framer-motion';
import { Clock, Users, Star, BookOpen, CheckCircle, User, Award } from 'lucide-react';
import image1 from '../../assets/course1.png';
import image2 from '../../assets/course2.png';
import image3 from '../../assets/DNS.png';
import image4 from '../../assets/sctw.png';
import image5 from '../../assets/Marine engg.png';
import image6 from '../../assets/optimized/roadmap-800w.webp';

const Courses = () => {
  const [activeTab, setActiveTab] = useState('all');

  const courseCategories = [
    { id: 'all', label: 'All Courses' },
    { id: 'offline', label: 'Offline Courses' },
    { id: 'online', label: 'Online Courses' },
    { id: 'crash', label: 'Crash Courses' },
    { id: 'live', label: 'Live Classes' },
  ];

  const courses = [
    {
      id: 1,
      title: 'Fateh GP Rating',
      type: 'offline',
      duration: '3 months',
      students: '200+',
      rating: 4.8,
      image: image2,
      features: [
        'Interview Training',
        'Written Training',
        'Forms Notification'
      ],
      badge: 'yellow'
    },
    {
      id: 2,
      title: 'Nurture Batch',
      type: 'offline',
      duration: '1 year',
      students: '100+',
      rating: 5.0,
      image: image1,
      features: [
        'For 11th Standard Students',
        'IMUCET Top Rankers Batch',
        'Boards + Merchant Navy Entrance Prep'
      ],
      badge: 'green'
    },
    {
      id: 3,
      title: 'Foundation Batch',
      type: 'offline',
      duration: '1 year',
      students: '300+',
      rating: 4.9,
      image: image3,
      features: [
        'For 12th Standard Students',
        'The Best Batch for Merchant Navy Success',
        'Boards + Merchant Navy Entrance Prep'
      ],
      badge: 'purple'
    },
    {
      id: 4,
      title: 'Sponsorship Batch',
      type: 'offline',
      duration: '2 months',
      students: '150+',
      rating: 4.7,
      image: image6,
      features: [
        'For IMUCET Rankers',
        'Prepare for February 2026 Batch',
        'Fastest Form Notifications'
      ],
      badge: 'yellow'
    },
    {
      id: 5,
      title: 'Udaan Batch',
      type: 'offline',
      duration: '4 months',
      students: '120+',
      rating: 4.6,
      image: image5,
      features: [
        'Special Batch for Improvement/NIOS Students',
        'Get Your Dream Merchant Navy Sponsorship',
        'Personalised hand holding for Sponsorship Process'
      ],
      badge: 'blue'
    }
    // {
    //   id: 6,
    //   title: 'STCW/Basic Safety Training',
    //   type: 'offline',
    //   duration: '1 month',
    //   students: '100+',
    //   rating: 4.5,
    //   image: image4,
    //   features: [
    //     'Fire Fighting',
    //     'First Aid',
    //     'Personal Survival'
    //   ],
    //   badge: 'red'
    // }
  ];

  const badgeColors: Record<string, string> = {
    green: 'bg-green-500 text-white',
    yellow: 'bg-yellow-400 text-black',
    purple: 'bg-purple-500 text-white',
    blue: 'bg-blue-500 text-white',
    red: 'bg-red-500 text-white'
  };

  const filteredCourses = activeTab === 'all' 
    ? courses 
    : courses.filter(course => course.type === activeTab);

  return (
    <div className="min-h-screen bg-black">
      <Helmet>
        <title>Merchant Navy Courses | Best Maritime Training in India | Budding Mariners</title>
        <meta name="description" content="Explore the best Merchant Navy courses in India at Budding Mariners. Offline & online batches, expert faculty, 100% placement support, and industry-oriented training for your maritime career." />
        <meta name="keywords" content="Merchant Navy Courses, Maritime Training, Marine Courses India, IMU CET, GP Rating, DNS, STCW, Marine Engineering, Best Marine Academy" />
        <meta property="og:title" content="Merchant Navy Courses | Best Maritime Training in India | Budding Mariners" />
        <meta property="og:description" content="Join Budding Mariners for top-rated Merchant Navy courses, mentorship, and placement support. India's best marine education platform." />
        <meta property="og:type" content="website" />
        <link rel="canonical" href={canonicalUrl('/courses')} />
        <meta property="og:url" content={canonicalUrl('/courses')} />
        <meta property="og:image" content="/assets/yellow on orange logomark.png" />
      </Helmet>
      {/* Header */}
      <section className="pt-28 pb-2 text-center">
        <h1 className="text-3xl md:text-4xl font-extrabold mb-1 text-white font-geist">BM Academy</h1>
        <p className="text-white/80 text-sm mb-2 font-poppins">
          Personal Mentorship. Industry-oriented Training. 100% Placement Support.
        </p>
        <div className="flex flex-wrap justify-center gap-8 mb-2 mt-4">
          <div className="text-center">
            <div className="text-yellow-400 text-2xl font-bold font-bebas">500+</div>
            <div className="text-white/80 text-xs font-poppins">Students Trained</div>
          </div>
          <div className="text-center">
            <div className="text-yellow-400 text-2xl font-bold font-bebas">15+</div>
            <div className="text-white/80 text-xs font-poppins">Expert Faculty</div>
          </div>
          <div className="text-center">
            <div className="text-yellow-400 text-2xl font-bold font-bebas">97%</div>
            <div className="text-white/80 text-xs font-poppins">Placement Rate</div>
          </div>
        </div>
      </section>

      {/* Course Categories */}
      <section className="bg-black py-6">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex flex-wrap justify-center gap-4">
          {courseCategories.map((category) => (
            <button
              key={category.id}
              onClick={() => setActiveTab(category.id)}
              className={`px-6 py-2 rounded-full font-semibold text-base shadow transition-all duration-200 ${
                activeTab === category.id
                  ? 'bg-yellow-400 text-black'
                  : 'bg-gray-800 text-white hover:bg-yellow-400 hover:text-black'
              }`}
            >
              {category.label}
            </button>
          ))}
        </div>
      </section>

      {/* Courses Grid */}
      <section className="bg-black py-10">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {filteredCourses.map((course, index) => (
              <motion.div
                key={course.id}
                className="bg-white rounded-xl shadow-lg overflow-hidden flex flex-col border border-gray-200"
                initial={{ opacity: 0, y: 30 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: index * 0.1 }}
              >
                <div className="relative">
                  <div className="w-full h-40 bg-white flex items-center justify-center">
                    <img 
                      src={course.image} 
                      alt={course.title}
                      className="w-full h-full object-cover"
                    />
                  </div>
                  <div className="absolute top-3 left-3">
                    <span className={`px-3 py-1 rounded-full text-xs font-bold uppercase ${badgeColors[course.badge]}`}>
                      {course.badge === 'green' && 'Nurture'}
                      {course.badge === 'yellow' && (course.title === 'Fateh GP Rating' ? 'GP Rating' : 'Sponsorship')}
                      {course.badge === 'purple' && 'Foundation'}
                      {course.badge === 'blue' && 'Udaan'}
                      {course.badge === 'red' && 'STCW'}
                    </span>
                  </div>
                  <div className="absolute top-3 right-3 flex items-center bg-white/90 px-2 py-1 rounded-full">
                    <Star className="h-4 w-4 text-yellow-400 fill-current" />
                    <span className="text-xs font-bold ml-1">{course.rating}</span>
                  </div>
                </div>
                <div className="flex-1 flex flex-col p-5">
                  <h3 className="font-bold text-lg mb-2 text-gray-900">{course.title}</h3>
                  <div className="flex items-center text-xs text-gray-600 mb-2 gap-4">
                    <span className="flex items-center gap-1"><Clock className="h-4 w-4" />{course.duration}</span>
                    <span className="flex items-center gap-1"><Users className="h-4 w-4" />{course.students}</span>
                  </div>
                  <div className="flex flex-wrap gap-2 mb-3">
                    {course.features.map((feature, idx) => (
                      <span 
                        key={idx}
                        className="bg-gray-100 text-gray-700 px-2 py-1 rounded-full text-xs"
                      >
                        {feature}
                      </span>
                    ))}
                  </div>
                  <a
                    href="https://docs.google.com/forms/d/e/1FAIpQLSfplFAt9uFYYr9r5LDg4-0sP6IpfgZ0bjjOogXFtpODXRTVQw/viewform" // placeholder link
                    target="_blank"
                    rel="noopener noreferrer"
                    className="w-full bg-black text-yellow-400 py-2 rounded-lg font-semibold hover:bg-yellow-400 hover:text-black transition-colors flex items-center justify-center gap-2 mt-auto"
                  >
                    <BookOpen className="h-5 w-5" />
                    <span>Enroll Now</span>
                  </a>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Why Choose Section */}
      <section className="bg-black py-12">
        <div className="max-w-4xl mx-auto text-center">
          <h2 className="text-2xl md:text-3xl font-bold text-white mb-8">Why Choose BM Offline Academy?</h2>
          <div className="flex flex-col md:flex-row justify-center gap-8">
            <div className="flex-1 flex flex-col items-center">
              <User className="h-10 w-10 text-yellow-400 mb-2" />
              <div className="text-lg font-bold text-white mb-1">Expert Faculty</div>
              <div className="text-white/70 text-sm">Learn from experienced mariners and industry professionals.</div>
            </div>
            <div className="flex-1 flex flex-col items-center">
              <Award className="h-10 w-10 text-yellow-400 mb-2" />
              <div className="text-lg font-bold text-white mb-1">Comprehensive Curriculum</div>
              <div className="text-white/70 text-sm">Industry-aligned courses with practical training and certification.</div>
            </div>
            <div className="flex-1 flex flex-col items-center">
              <CheckCircle className="h-10 w-10 text-yellow-400 mb-2" />
              <div className="text-lg font-bold text-white mb-1">Placement Support</div>
              <div className="text-white/70 text-sm">100% placement assistance with top shipping companies.</div>
            </div>
          </div>
        </div>
      </section>

      
    </div>
  );
};

export default Courses;