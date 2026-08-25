import React, { useState } from 'react';
import { Helmet } from 'react-helmet-async';
import { GraduationCap, FileText, CheckCircle } from 'lucide-react';
import { canonicalUrl } from '../lib/site';

const courseCards = [
	{
		id: 'dns',
		title: 'DNS (Diploma in Nautical Science)',
		duration: '1 Year',
		fee: '₹3,50,000',
		badge: 'POPULAR',
		highlight: true,
		description: 'Best for 12th PCM pass-outs. 100% placement support. IMU-CET required.',
	},
	{
		id: 'dme',
		title: 'DME (Diploma Marine Engineering)',
		duration: '2 Years',
		fee: '₹4,00,000',
		highlight: false,
		description: 'For diploma/engineering holders. Direct entry to engine department.',
	},
	{
		id: 'stcw',
		title: 'STCW Basic Safety Training',
		duration: '1 Month',
		fee: '₹15,000',
		highlight: false,
		description: 'Mandatory for all seafarers. Includes all 4 basic safety courses.',
	},
	{
		id: 'eto',
		title: 'ETO (Electro Technical Officer)',
		duration: '4 Months',
		fee: '₹1,50,000',
		highlight: false,
		description: 'For electrical/electronics graduates. Join as ship\'s ETO.',
	},
];

const sponsorshipCompanies = [
	'Maersk Line',
	'MSC Shipping',
	'Anglo Eastern',
	'Fleet Management',
	'Synergy Group',
	'Wilhelmsen',
	'Thome Group',
	'Bernhard Schulte',
];

const CollegeForms = () => {
	const [form, setForm] = useState({
		name: '',
		email: '',
		phone: '',
		course: '',
		education: '',
		age: '',
		state: '',
	});
	const [sponsorship, setSponsorship] = useState({
		name: '',
		email: '',
		phone: '',
		companies: [] as string[],
	});
	const [submitted, setSubmitted] = useState<'application' | 'sponsorship' | null>(null);

	const handleFormChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
		setForm({ ...form, [e.target.name]: e.target.value });
	};

	const handleSponsorshipChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
		setSponsorship({ ...sponsorship, [e.target.name]: e.target.value });
	};

	const handleCompanyToggle = (company: string) => {
		setSponsorship((prev) => ({
			...prev,
			companies: prev.companies.includes(company)
				? prev.companies.filter((c) => c !== company)
				: [...prev.companies, company],
		}));
	};

	const handleFormSubmit = (e: React.FormEvent) => {
		e.preventDefault();
		setSubmitted('application');
	};

	const handleSponsorshipSubmit = (e: React.FormEvent) => {
		e.preventDefault();
		setSubmitted('sponsorship');
	};

	return (
		<div className="min-h-screen bg-black text-white flex flex-col">
			<Helmet>
				<title>Apply for Merchant Navy Courses & Sponsorships | Budding Mariners</title>
				<meta name="description" content="Apply online for top Merchant Navy courses and company sponsorships. Fast, transparent, and expert-guided application process at Budding Mariners." />
				<meta name="keywords" content="Merchant Navy Application, Marine Sponsorship, Apply Online, Maritime Courses, Budding Mariners Admission" />
				<meta property="og:title" content="Apply for Merchant Navy Courses & Sponsorships | Budding Mariners" />
				<meta property="og:description" content="Apply for maritime courses and company sponsorships with Budding Mariners. Fast, transparent, and expert-guided process." />
				<meta property="og:type" content="website" />
				<link rel="canonical" href={canonicalUrl('/college-forms')} />
				<meta property="og:url" content={canonicalUrl('/college-forms')} />
				<meta property="og:image" content="/assets/yellow on orange logomark.png" />
			</Helmet>

			{/* Header */}
			<section className="pt-28 pb-4 text-center">
				<h1 className="text-3xl md:text-4xl font-extrabold mb-1 font-geist">Admissions & Applications</h1>
				<p className="text-white/80 text-sm mb-6 font-poppins">
					Apply for maritime courses and company sponsorships to kickstart your seafaring career
				</p>
			</section>

			{/* Available Courses */}
			<section className="max-w-6xl mx-auto w-full mb-10">
				<h2 className="text-2xl font-bold text-center mb-6">Available Courses</h2>
				<div className="flex flex-col md:flex-row gap-6 justify-center items-stretch px-2">
					{courseCards.map((course) => (
						<div
							key={course.id}
							className={`flex-1 bg-[#18181b] rounded-xl border border-white/10 p-6 flex flex-col justify-between min-w-[260px] max-w-xs mx-auto ${
								course.highlight ? 'ring-2 ring-yellow-400' : ''
							}`}
						>
							<div>
								<div className="flex items-center mb-2">
									<GraduationCap className="w-5 h-5 text-yellow-400 mr-2" />
									<span className="font-bold text-lg">{course.title}</span>
									{course.badge && (
										<span className="ml-2 bg-yellow-400 text-black text-xs font-bold px-2 py-1 rounded-full">
											{course.badge}
										</span>
									)}
								</div>
								<div className="text-white/80 text-xs mb-2">{course.description}</div>
								<div className="flex items-center gap-4 text-xs text-white/60">
									<span>Duration: <span className="font-semibold text-white">{course.duration}</span></span>
									<span>Fee: <span className="font-semibold text-yellow-400">{course.fee}</span></span>
								</div>
							</div>
							<button className="mt-6 w-full bg-yellow-400 text-black font-bold py-2 rounded hover:bg-yellow-500 transition">
								Apply Now
							</button>
						</div>
					))}
				</div>
			</section>

			{/* Course Application Form */}
			<section className="flex justify-center mb-10 px-2">
				<div className="bg-white rounded-xl shadow-lg p-8 w-full max-w-xl flex flex-col items-center">
					<div className="flex items-center gap-2 mb-4">
						<FileText className="w-6 h-6 text-yellow-400" />
						<span className="font-bold text-lg text-black">Course Application Form</span>
					</div>
					{submitted === 'application' ? (
						<div className="text-center py-8">
							<CheckCircle className="h-16 w-16 text-green-500 mx-auto mb-4" />
							<h4 className="text-xl font-bold text-black mb-2">Application Submitted!</h4>
							<p className="text-gray-700">We'll contact you within 24 hours to discuss your application.</p>
						</div>
					) : (
						<form className="w-full" onSubmit={handleFormSubmit}>
							<div className="mb-4">
								<label className="block text-gray-700 text-sm mb-1">Full Name</label>
								<input
									type="text"
									name="name"
									value={form.name}
									onChange={handleFormChange}
									className="w-full px-4 py-2 rounded-lg border border-gray-300 focus:ring-2 focus:ring-yellow-400 focus:border-transparent"
									required
								/>
							</div>
							<div className="mb-4 grid grid-cols-1 md:grid-cols-2 gap-4">
								<div>
									<label className="block text-gray-700 text-sm mb-1">Email</label>
									<input
										type="email"
										name="email"
										value={form.email}
										onChange={handleFormChange}
										className="w-full px-4 py-2 rounded-lg border border-gray-300 focus:ring-2 focus:ring-yellow-400 focus:border-transparent"
										required
									/>
								</div>
								<div>
									<label className="block text-gray-700 text-sm mb-1">Phone</label>
									<input
										type="tel"
										name="phone"
										value={form.phone}
										onChange={handleFormChange}
										className="w-full px-4 py-2 rounded-lg border border-gray-300 focus:ring-2 focus:ring-yellow-400 focus:border-transparent"
										required
									/>
								</div>
							</div>
							<div className="mb-4">
								<label className="block text-gray-700 text-sm mb-1">Select Course</label>
								<select
									name="course"
									value={form.course}
									onChange={handleFormChange}
									className="w-full px-4 py-2 rounded-lg border border-gray-300 focus:ring-2 focus:ring-yellow-400 focus:border-transparent"
									required
								>
									<option value="">Choose a course</option>
									{courseCards.map((c) => (
										<option key={c.id} value={c.id}>{c.title}</option>
									))}
								</select>
							</div>
							<div className="mb-4 grid grid-cols-1 md:grid-cols-2 gap-4">
								<div>
									<label className="block text-gray-700 text-sm mb-1">Education</label>
									<input
										type="text"
										name="education"
										value={form.education}
										onChange={handleFormChange}
										className="w-full px-4 py-2 rounded-lg border border-gray-300 focus:ring-2 focus:ring-yellow-400 focus:border-transparent"
										required
									/>
								</div>
								<div>
									<label className="block text-gray-700 text-sm mb-1">Age</label>
									<input
										type="number"
										name="age"
										value={form.age}
										onChange={handleFormChange}
										className="w-full px-4 py-2 rounded-lg border border-gray-300 focus:ring-2 focus:ring-yellow-400 focus:border-transparent"
										required
									/>
								</div>
							</div>
							<div className="mb-6">
								<label className="block text-gray-700 text-sm mb-1">State</label>
								<input
									type="text"
									name="state"
									value={form.state}
									onChange={handleFormChange}
									className="w-full px-4 py-2 rounded-lg border border-gray-300 focus:ring-2 focus:ring-yellow-400 focus:border-transparent"
									required
								/>
							</div>
							<button
								type="submit"
								className="w-full bg-black text-yellow-400 font-bold py-3 rounded-lg hover:bg-yellow-400 hover:text-black transition"
							>
								Submit Application
							</button>
						</form>
					)}
				</div>
			</section>

			{/* Company Sponsorship Program */}
			<section className="text-center mb-4">
				<h2 className="text-lg font-bold text-yellow-400 mb-2">Company Sponsorship Program</h2>
				<p className="text-white/80 text-sm mb-4">
					Get recommended for leading shipping companies and boost your placement chances.
				</p>
			</section>

			{/* Sponsorship Application */}
			<section className="flex justify-center mb-16 px-2">
				<div className="bg-white rounded-xl shadow-lg p-8 w-full max-w-xl flex flex-col items-center">
					<div className="flex items-center gap-2 mb-4">
						<FileText className="w-6 h-6 text-yellow-400" />
						<span className="font-bold text-lg text-black">Sponsorship Application</span>
					</div>
					{submitted === 'sponsorship' ? (
						<div className="text-center py-8">
							<CheckCircle className="h-16 w-16 text-green-500 mx-auto mb-4" />
							<h4 className="text-xl font-bold text-black mb-2">Sponsorship Request Submitted!</h4>
							<p className="text-gray-700">We'll help you connect with your preferred shipping companies.</p>
						</div>
					) : (
						<form className="w-full" onSubmit={handleSponsorshipSubmit}>
							<div className="mb-4">
								<label className="block text-gray-700 text-sm mb-1">Full Name</label>
								<input
									type="text"
									name="name"
									value={sponsorship.name}
									onChange={handleSponsorshipChange}
									className="w-full px-4 py-2 rounded-lg border border-gray-300 focus:ring-2 focus:ring-yellow-400 focus:border-transparent"
									required
								/>
							</div>
							<div className="mb-4 grid grid-cols-1 md:grid-cols-2 gap-4">
								<div>
									<label className="block text-gray-700 text-sm mb-1">Email</label>
									<input
										type="email"
										name="email"
										value={sponsorship.email}
										onChange={handleSponsorshipChange}
										className="w-full px-4 py-2 rounded-lg border border-gray-300 focus:ring-2 focus:ring-yellow-400 focus:border-transparent"
										required
									/>
								</div>
								<div>
									<label className="block text-gray-700 text-sm mb-1">Phone</label>
									<input
										type="tel"
										name="phone"
										value={sponsorship.phone}
										onChange={handleSponsorshipChange}
										className="w-full px-4 py-2 rounded-lg border border-gray-300 focus:ring-2 focus:ring-yellow-400 focus:border-transparent"
										required
									/>
								</div>
							</div>
							<div className="mb-6">
								<label className="block text-gray-700 text-sm mb-2">Preferred Companies</label>
								<div className="grid grid-cols-1 md:grid-cols-2 gap-2">
									{sponsorshipCompanies.map((company) => (
										<label key={company} className="flex items-center gap-2 text-gray-700 text-sm cursor-pointer">
											<input
												type="checkbox"
												checked={sponsorship.companies.includes(company)}
												onChange={() => handleCompanyToggle(company)}
												className="rounded border-gray-300 text-yellow-400 focus:ring-yellow-400"
											/>
											<span>{company}</span>
										</label>
									))}
								</div>
							</div>
							<button
								type="submit"
								className="w-full bg-yellow-400 text-black font-bold py-3 rounded-lg hover:bg-yellow-500 transition"
								disabled={sponsorship.companies.length === 0}
							>
								Apply for Sponsorship
							</button>
						</form>
					)}
				</div>
			</section>
		</div>
	);
};

export default CollegeForms;