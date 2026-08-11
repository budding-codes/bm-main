import React from 'react';
import { Helmet } from 'react-helmet';
import ojas from '../../assets/ojas.png';
import shahwanaz from '../../assets/shahnawaz.png';
import ourstory from '../../assets/optimized/our story-800w.webp';

const founders = [
	{
		name: 'Ojas Lalla',
		title: 'CEO & Founder',
		image: ojas,
		bio: `Ojas Lalla, born in Jodhpur and shaped by his formative years in Jaipur, is a man of diverse passions and pursuits. His early love for cricket saw him competing at the under-14 nationals, but his true calling lay in the seas. Driven by an unwavering aspiration to join the merchant navy from class 11, Ojas excelled through numerous sponsorship exams and interviews with esteemed companies such as Anglo Eastern, Torm Tankers, and Fleet Management. Despite clearing the NDA written exams, his focus remained steadfast on maritime adventures. He honed his skills at Tolani Maritime Institute, eventually selecting Torm Tankers for his DNS

Partnering with Shahnawaz, Ojas founded Budding Mariners, and over the past three years, he has successfully trained and sponsored over 1,500+ seafarers for various shipping companies, leaving an indelible mark on the maritime industry.`,
	},
	{
		name: 'Shahnawaz',
		title: 'COO & Co-Founder',
		image: shahwanaz,
		bio: `Shahnawaz, a determined young man from the small village of Selampur in Uttar Pradesh, grew up with his two brothers and sister in a modest home. Initially studying in a Hindi medium school, he harbored dreams of joining the NDA. After clearing the written exams but taking a one-year break, his aspirations shifted towards the merchant navy. Despite facing several setbacks, Shahnawaz's relentless hard work and perseverance paid off.

He successfully cleared the sponsorship with WSM and enrolled in Tolani Maritime Institute, India's premier college for maritime studies. His dedication and resilience led him to realize his dreams, and alongside his co-founder Ojas, he established Budding Mariners, a venture dedicated to shaping the futures of aspiring seafarers.`,
	},
];

const About = () => (
	<div className="min-h-screen bg-black text-white">
		<Helmet>
			<title>About Budding Mariners | India's Trusted Maritime Academy</title>
			<meta name="description" content="Learn about Budding Mariners, India's most trusted maritime education platform. Meet our founders, discover our mission, vision, and commitment to transparency and excellence in marine training." />
			<meta name="keywords" content="About Budding Mariners, Maritime Academy, Marine Education, Merchant Navy, Marine Founders, Marine Training, Best Marine Institute India" />
			<meta property="og:title" content="About Budding Mariners | India's Trusted Maritime Academy" />
			<meta property="og:description" content="Discover the story, mission, and vision behind Budding Mariners, India's leading marine education platform." />
			<meta property="og:type" content="website" />
			<meta property="og:url" content="https://buddingmariners.com/about" />
			<meta property="og:image" content="/assets/yellow on orange logomark.png" />
		</Helmet>

		{/* About Us Header */}
		<section className="pt-28 pb-2 text-center">
			<h1 className="text-3xl md:text-4xl font-extrabold mb-1 text-white font-geist">
				About Us
			</h1>
			<p className="text-white/80 text-sm max-w-2xl mx-auto mb-2 font-poppins">
				Discover the story behind Budding Mariners and our mission to transform
				maritime education.
			</p>
		</section>

		{/* Our Story */}
		<section className="max-w-5xl mx-auto flex flex-col md:flex-row items-center gap-10 pb-12 px-4">
			<div className="flex-1">
				<h2 className="text-2xl font-bold mb-4 text-white font-geist">Our Story</h2>
				<p className="text-white/80 mb-4 font-poppins">
					Founded in 2021 by Ojas Lalla and Shahnawaz, Budding Mariners has rapidly ascended to become India’s leading academy for aspiring merchant navy professionals. Our academy is recognized for its unwavering commitment to transparency, excellence, and the genuine guidance we provide to our students.
				</p>
				<p className="text-white/80 font-poppins">
					With over <span className="font-bebas">1,500+</span> successful selections into prestigious maritime universities across the country, Budding Mariners stands as a beacon of trust in an industry often plagued by misinformation and fraud. We believe in empowering the next generation of seafarers by equipping them with the knowledge and tools they need to navigate their careers with confidence.
				</p>
			</div>
			<div className="flex-1 flex justify-center">
				<img
					src= {ourstory}
					alt="Our Story"
					className="rounded-xl w-full max-w-xs object-cover border-4 border-yellow-400"
				/>
			</div>
		</section>

		{/* Mission & Vision */}
		<section className="max-w-5xl mx-auto flex flex-col md:flex-row gap-8 pb-16 px-4">
			<div className="flex-1 bg-yellow-400 text-black rounded-xl p-8 shadow-lg">
				<h3 className="text-2xl font-bold mb-2">Mission</h3>
				<p>
					Our mission at Budding Mariners is to cultivate a new generation of maritime professionals who are well-informed, well-prepared, and ready to excel in the global maritime industry. We are dedicated to providing our students with accurate, reliable, and actionable guidance that helps them make informed decisions about their careers, ensuring their success in a competitive and ever-evolving field.
				</p>
			</div>
			<div className="flex-1 bg-yellow-400 text-black rounded-xl p-8 shadow-lg">
				<h3 className="text-2xl font-bold mb-2">Vision</h3>
				<p>
					We envision a future where Budding Mariners is synonymous with excellence in maritime education and training. Our goal is to be the premier destination for aspiring merchant navy professionals, not just in India, but globally. We aim to set new standards in maritime education, fostering a community of seafarers who are not only skilled and knowledgeable but also ethical and committed to the values of transparency and integrity.
				</p>
			</div>
		</section>

		{/* About the Founders */}
		<section className="max-w-5xl mx-auto pb-20 px-4">
			<h2 className="text-3xl md:text-4xl font-extrabold text-center mb-12 text-white">
				About the Founders
			</h2>
			<div className="flex flex-col gap-16">
				{founders.map((founder, idx) => (
					<div
						key={founder.name}
						className={`flex flex-col md:flex-row items-center gap-10 ${idx % 2 === 1 ? 'md:flex-row-reverse' : ''}`}
					>
						<div className="flex-1 flex flex-col w-full">
							<h3 className="text-2xl font-bold mb-2 text-white">{founder.name}</h3>
							<div className="mb-4">
								<span className="bg-yellow-400 text-black px-3 py-1 rounded-full font-semibold text-sm">
									{founder.title}
								</span>
							</div>
							{/* Mobile: Show image next, then bio */}
							<div className="block md:hidden mb-4 flex justify-center">
								<div className="w-56 h-56 rounded-xl border-4 border-yellow-400 overflow-hidden flex items-center justify-center bg-black">
									<img
										src={founder.image}
										alt={founder.name}
										className="object-cover w-full h-full"
									/>
								</div>
							</div>
							<p className="text-white/80 whitespace-pre-line">{founder.bio}</p>
						</div>
						{/* Desktop: Image on side, fit to bio height */}
						<div className="flex-1 hidden md:flex justify-center items-stretch">
							<div className="w-72 h-80 rounded-xl border-4 border-yellow-400 overflow-hidden flex items-center justify-center bg-black">
								<img
									src={founder.image}
									alt={founder.name}
									className="object-cover w-full h-full"
								/>
							</div>
						</div>
					</div>
				))}
			</div>
		</section>
	</div>
);

export default About;