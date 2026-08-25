import React from 'react';
import { Helmet } from 'react-helmet-async';
import { canonicalUrl } from '../lib/site';

const TermsOfUse = () => (
	<div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 mb-12">
		<Helmet>
			<title>Terms of Use | Budding Mariners</title>
			<link rel="canonical" href={canonicalUrl('/terms-of-use')} />
		</Helmet>
		<h1 className="text-3xl font-bold text-center mb-6">Terms &amp; Conditions</h1>

		<div className="bg-white rounded-xl shadow-md border border-gray-200 p-8">
			<div className="prose prose-lg max-w-none text-gray-800">
				<p>
					Welcome to Budding Mariners ("Platform", "we", "us", or "our") – a one-to-one mentorship platform
					designed to guide aspiring Merchant Navy candidates and budding mariners throughout their career-building
					journey. These Terms and Conditions ("Terms") govern your access to and use of our website, platform, and services.
				</p>

				<p>
					Please read these Terms carefully before using our services. By accessing or using our Platform, you
					agree to be bound by these Terms. If you do not agree, please do not access or use our services.
				</p>

				<h2>1. Acceptance of Terms</h2>
				<p>
					By registering on or accessing our Platform, you agree to be legally bound by these Terms. You also
					confirm that you are above 18 years of age or using the Platform under the guidance of a parent or legal
					guardian. You confirm that you have read and understood all our Legal Documents, including the Privacy
					Policy, User Service Agreements, Terms and Conditions, Refund Policy and any future amendments.
				</p>

				<h2>2. Eligibility</h2>
				<p>
					Our Platform is intended for students preparing for Merchant Navy career pathways such as GP Rating,
					ETO, DNS (UG Course), GME, and other maritime examinations or interview processes. You must provide accurate information during registration.
				</p>

				<h2>3. Account Registration and Security</h2>
				<p>To access mentorship sessions, you may need to create an account. You agree to:</p>
				<ol>
					<li>Provide accurate, genuine, and up-to-date personal information.</li>
					<li>Maintain the confidentiality of your login credentials.</li>
					<li>Inform us immediately in case of any unauthorized access or security breach.</li>
				</ol>
				<p>You are responsible for all activities performed through your account.</p>

				<h2>4. Services Offered</h2>
				<p>Budding Mariners provides personalized maritime mentorship services including but not limited to:</p>
				<ol>
					<li>One-on-one mentorship sessions with maritime professionals</li>
					<li>Guidance for Merchant Navy entry processes</li>
					<li>Interview preparation and soft-skills training</li>
					<li>Fitness, medical, and document readiness guidance</li>
					<li>Career planning and pathway selection for Deck, Engine, and Ratings</li>
				</ol>
				<p>We may modify or discontinue services at any time without prior notice.</p>

				<h2>5. User Conduct</h2>
				<p>You agree not to:</p>
				<ul>
					<li>Provide fake or misleading personal or academic information</li>
					<li>Use the Platform for any illegal or unauthorized purpose</li>
					<li>Harass or misbehave with mentors, counselors, or other students</li>
					<li>Record, distribute, or misuse session content or study materials</li>
					<li>
						Defame or spread misinformation about the Company, mentors, or its affiliates publicly
						(social media, forums) or privately in ways that harm reputation or business interests
					</li>
				</ul>
				<p>Violation of these terms may result in suspension or permanent termination of your account without refund.</p>

				<h2>6. Intellectual Property Rights</h2>
				<p>
					All maritime guidance content, training modules, mentorship strategies, branding, and study materials
					on the Platform belong to  by Budding Mariners or its licensors. You are given a limited, non-exclusive,
					non-transferable license to use this content strictly for personal learning and career preparation.
				</p>

				<h2>7. Pricing and Payments</h2>
				<p>
					All mentorship program fees are clearly listed on the Platform. By enrolling, you agree to pay the associated charges.
					All payments are final except as stated under our Refund Policy.
				</p>

				<h2>8. Refund and Cancellation</h2>
				<p>
					Refunds are governed strictly by our Refund Policy. Please review it carefully before making any payment.
				</p>

				<h2>9. Third-Party Tools and Services</h2>
				<p>
					We may use external tools for scheduling, video sessions, payment processing, notifications, or analytics.
					Your use of such tools will be subject to their independent Terms and Policies.
				</p>

				<h2>10. Limitation of Liability</h2>
				<p>
					We do not guarantee selection, sponsorship, sea-time availability, placement, or job security in the
					Merchant Navy. We are not responsible for indirect, incidental, or consequential damages arising from
					your use of the Platform.
				</p>

				<h2>11. Disclaimer</h2>
				<p>
					The mentorship services provided are for guidance and educational support only. The Platform is provided
					on an "as-is" and "as-available" basis without any warranties or guarantees.
				</p>

				<h2>12. Termination</h2>
				<p>
					We may suspend or terminate your access to the Platform in case of misconduct, violations, or harmful activity.
				</p>

				<h2>13. Governing Law and Jurisdiction</h2>
				<p>These Terms shall be governed by the laws of India. All disputes fall under the jurisdiction of Jaipur, Rajasthan courts.</p>

				<h2>14. Changes to Terms</h2>
				<p>
					We reserve the right to update or modify these Terms at any time. Changes will be posted here with an updated “Effective Date.”
				</p>

				<h2>15. Contact Us</h2>
				<p>
					If you have any questions or concerns regarding these Terms, feel free to contact us at:
					<a href="mailto:buddingmarinersstore@gmail.com"> buddingmarinersstore@gmail.com</a>
				</p>
			</div>
		</div>
	</div>
);

export default TermsOfUse;
