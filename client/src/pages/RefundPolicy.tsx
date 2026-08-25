import React from 'react';
import { Helmet } from 'react-helmet-async';
import { canonicalUrl } from '../lib/site';

const RefundPolicy = () => (
  <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 mb-12">
    <Helmet>
      <title>Refund Policy | Budding Mariners</title>
      <link rel="canonical" href={canonicalUrl('/refund-policy')} />
    </Helmet>
    <h1 className="text-3xl font-bold text-center mb-6">Refund Policy</h1>

    <div className="bg-white rounded-xl shadow-md border border-gray-200 p-8">
      <div className="prose prose-lg max-w-none text-gray-800">
        <p>
          At Budding Mariners, we aim to provide high-quality mentorship and guidance to aspiring Merchant Navy candidates.
          Due to the personalized nature of maritime career counselling and one-on-one mentorship, refunds are handled strictly
          as per the policy detailed below.
        </p>

        <h2>1. General Policy — No Refunds</h2>
        <p>
          All fees paid to Budding Mariners are strictly non-refundable and non-transferable under any circumstances,
          including but not limited to change of mind, dissatisfaction, scheduling issues, personal reasons, or inability
          to continue sessions. This is because mentorship time, resources, and mentor allocations are reserved in advance.
        </p>
        
        <p>This policy applies to (including but not limited to):</p>
        <ul>
          <li>One-on-one maritime mentorship sessions</li>
          <li>Career guidance or counselling packages</li>
          <li>Interview preparation sessions</li>
          <li>Bundled or promotional mentorship offers</li>
        </ul>

        <h2>2. Caution Deposit</h2>
        <p>
          A caution deposit must be submitted at the time of admission for security purposes. Any damages caused during the stay will be deducted from this amount.
        </p>
        <p>
          The caution deposit or any remaining balance will be refundable only if a one-month prior notice is given to the Hostel Administration.
        </p>
        <p>
          No refund will be provided in case of suspension.
        </p>

        <h2>3. Service Expectations & User Responsibility</h2>
        <p>
          We do not guarantee sponsorships, placements, medical clearance, or selection outcomes. The User is responsible for:
        </p>
        <ul>
          <li>Attending scheduled sessions on time</li>
          <li>Requesting rescheduling in advance (if applicable)</li>
          <li>Maintaining professional conduct with mentors</li>
        </ul>
        <p>
          Failure to attend or late cancellations will not qualify for any refund or compensation.
        </p>

        <h2>4. Dispute & Escalation</h2>
        <p>
          Although refunds are not provided, we are committed to resolving issues in a professional manner. For concerns,
          please contact:
          <a href="mailto:buddingmarinersstore@gmail.com"> buddingmarinersstore@gmail.com</a>
        </p>

        <p>We will respond within 7 working days and work towards a mutually agreeable solution wherever possible.</p>

        <p>You also agree not to initiate chargebacks, payment disputes, or defamation without first using our internal redressal mechanism.</p>

        <h2>5. Acknowledgment & Consent</h2>
        <p>
          By making a payment, you acknowledge that you have fully read, understood, and agreed to this Refund Policy,
          and accept that all payments are final.
        </p>

        <h2>6. Amendments</h2>
        <p>
          Budding Mariners reserves the right to revise or amend this Refund Policy at any time. Changes will be updated
          on this page along with the effective date.
        </p>

        <h2>Contact</h2>
        <p>
          For refund-related questions, contact:
          <a href="mailto:buddingmarinersstore@gmail.com"> buddingmarinersstore@gmail.com</a>
        </p>
      </div>
    </div>
  </div>
);

export default RefundPolicy;
