import React from 'react';
import { Helmet } from 'react-helmet-async';

const FAQs = () => (
  <div className="max-w-3xl mx-auto p-6">
    <Helmet>
      <title>FAQs | Budding Mariners</title>
      <meta name="robots" content="noindex, nofollow" />
    </Helmet>
    <h1 className="text-2xl font-bold mb-4">FAQs</h1>
    <div className="prose prose-sm">
      <h2>How do I register?</h2>
      <p>Visit our registration page and fill out the required details.</p>
      <h2>Who can join the mentorship program?</h2>
      <p>Students preparing for NEET and other medical entrance exams.</p>
      <h2>Is there a refund policy?</h2>
      <p>All payments are non-refundable as per our Refund Policy.</p>
      <h2>How do I contact support?</h2>
      <p>Email us at grievances.eyeconic@gmail.com for any queries or support.</p>
      {/* Add more FAQs as needed */}
    </div>
  </div>
);

export default FAQs;
