import React, { useEffect } from 'react';
import { Helmet } from 'react-helmet';
import { Download, FileText } from 'lucide-react';
import { canonicalUrl } from '../lib/site';

const materials = [
	{
		title: 'TS REHMAN (EXPECTED QUESTIONS)',
		download: 'https://drive.google.com/file/d/1PQ32fIjTQD789jfKtvXsFCr4HYvjiyzP/view?usp=drive_link',
	},
	{
		title: 'SIMS IMPORTANT QUESTIONS',
		download: 'https://drive.google.com/file/d/1IFhBIxXVfMkQFKiSb63_IKnI9mLNaGXU/view?usp=drive_link',
	},
	{
		title: 'SI UNITS',
		download: 'https://drive.google.com/file/d/1Pz0siRW99U-uHiN-N7qPrNzuKN2due_P/view?usp=drive_link',
	},
	{
		title: 'RIVERS & ORIGINS',
		download: 'https://drive.google.com/file/d/1_vrYdKpg11rqzg2KNhY9fRIGu2tVnWmA/view?usp=drive_link',
	},
	{
		title: 'REAGENTS & THEIR PROPERTIES',
		download: 'https://drive.google.com/file/d/1ZSRLJz9Fx-eYGgT9tUcRjpnXTb_yeX7A/view?usp=drive_link',
	},
	{
		title: 'QNA RELATED TO MERCHANT NAVY',
		download: 'https://drive.google.com/file/d/1l_JHcXnD7nJzCeU5WvGf4hQ2hpElL1nY/view?usp=drive_link',
	},
	{
		title: 'PYQs OF PHYSICS (SUBJECTIVE)',
		download: 'https://drive.google.com/file/d/1JF3GAJie7U3HJa8m7zRKpAKnfOjr5cWn/view?usp=drive_link',
	},
	{
		title: 'PYQS OF IOC',
		download: 'https://drive.google.com/file/d/1e6DJecA4McF_df6i4bPwH9mqp-HKLoS2/view?usp=drive_link',
	},
	{
		title: 'PSYCHOMETRY QUESTIONS',
		download: 'https://drive.google.com/file/d/1ujVMtAkimhcyI1j2pdgfOpPPQpA8EI2-/view?usp=drive_link',
	},
	{
		title: 'ORGANIC IMPORTANT REACTIONS',
		download: 'https://drive.google.com/file/d/1k1RpE7UWPoz764jSZTF_0uwIBpfRHOEh/view?usp=drive_link',
	},
	{
		title: 'MATHS IMPORTANT QUESTIONS',
		download: 'https://drive.google.com/file/d/1XdnfJ33jyGmPs6OfbZ4LsCSTJJ4FYhTZ/view?usp=drive_link',
	},
	{
		title: 'INTERVIEW QUESTIONS',
		download: 'https://drive.google.com/file/d/1TF5GgPsNO0g2VK5cHYc4WyRZm_QFjX_6/view?usp=drive_link',
	},
	{
		title: 'INTERVIEW QUESTIONS - 2',
		download: 'https://drive.google.com/file/d/1BjhAI85NQCIZdbTJdUEb0WWAUZCvtdlV/view?usp=drive_link',
	},
	{
		title: 'INDIAN PORTS',
		download: 'https://drive.google.com/file/d/1ctayIywpCtr173EHIYGaX0JtlLiQ14ZE/view?usp=drive_link',
	},
	{
		title: 'IMUCET SYLLABUS',
		download: 'https://drive.google.com/file/d/1xoRgnH16I6LhcqtQPF3Ti6gNkp_qCUrM/view?usp=drive_link',
	},
	{
		title: 'IMPORTANT PHYSICS DERIVATION',
		download: 'https://drive.google.com/file/d/18Orn75LITPVUhZK23s6ZCKkaa4dKfbLP/view?usp=drive_link',
	},
	{
		title: 'IMPORTANT MATHS FORMULA',
		download: 'https://drive.google.com/file/d/1FMeoG1Vl-AdOLF0kfQryppwoVrihK5Rr/view?usp=drive_link',
	},
	{
		title: 'GREAT EASTERN EXPECTED QUESTIONS',
		download: 'https://drive.google.com/file/d/1Kp8BF0KrK7HeEwyMEB3fjgNU7CVgfJ8F/view?usp=drive_link',
	},
	{
		title: 'GK IMPORTANT QUESTIONS',
		download: 'https://drive.google.com/file/d/1Qx2XmfrzpfPiyyhVBo4tu7s4AAnivzHn/view?usp=drive_link',
	},
	{
		title: 'GEOGRAPHY IMPORTANT QUESTIONS',
		download: 'https://drive.google.com/file/d/1lHhl_hjxIODO-z-ZXVsUZrve1PnuKuJD/view?usp=drive_link',
	},
	{
		title: 'FLEET IMPORTANT QUESTIONS',
		download: 'https://drive.google.com/file/d/1GkK-KJpcWwB1kpsJvM0D4iUs07Ix0OdY/view?usp=drive_link',
	},
	{
		title: 'ENGLISH IMPORTANT QUESTIONS',
		download: 'https://drive.google.com/file/d/1DsEzABPBzEgV-W9lYdITalSbUeFdqaWv/view?usp=drive_link',
	},
	{
		title: 'D’AMICO IMPORTANT QUESTIONS',
		download: 'https://drive.google.com/file/d/1Wk8mqtr33Na7zZuu_ir7cdxe76PhzhoQ/view?usp=drive_link',
	},
	{
		title: 'COUNTRY & THEIR CURRENCY',
		download: 'https://drive.google.com/file/d/1OtGqJC-4ybeAdII-sKhZCgNUov7ERBge/view?usp=drive_link',
	},
	{
		title: 'COUNTRY & THEIR CAPITAL',
		download: 'https://drive.google.com/file/d/1n0-4KRWJ06QSz7_-CFBq_-Af6Z6k4n_w/view?usp=drive_link',
	},
	{
		title: 'COUNTRY & THEIR CAPITAL - 2',
		download: 'https://drive.google.com/file/d/11_zvSZyVoW4p8OU_WNAmVzPwBzFGr_7y/view?usp=drive_link',
	},
	{
		title: 'COMPANY KNOWLEDGE',
		download: 'https://drive.google.com/file/d/16fUWPD6HZwcZFh-j0DFfJb1xfaoTNrQe/view?usp=drive_link',
	},
	{
		title: 'BIOSPHERE RESERVES',
		download: 'https://drive.google.com/file/d/1k_76n9WIOatpsJvGd8OGEXQ-AcRPK_b4/view?usp=drive_link',
	},
	{
		title: 'ANGLO EASTERN EXPECTED QUESTIONS',
		download: 'https://drive.google.com/file/d/1nUbCC0V1c8jNN51I8Xh24j6gw1volpZw/view?usp=drive_link',
	},
	{
		title: 'ALL ABOUT DNS',
		download: 'https://drive.google.com/file/d/11ui7N1SEXqdJzdnG8518sy9R777DRAd8/view?usp=drive_link',
	},
	{
		title: 'ALL ABOUT B.TECH',
		download: 'https://drive.google.com/file/d/1fkNiEUrtInuFcaHhZj1k0O-s5dVYN4rP/view?usp=drive_link',
	},
	{
		title: 'ALL ABOUT B.SC',
		download: 'https://drive.google.com/file/d/11Fe7RtVDWg--99m00LWSz1WS9fyHxYPa/view?usp=drive_link',
	},
	{
		title: '7 ISLANDS (EXPECTED QUESTIONS)',
		download: 'https://drive.google.com/file/d/1-RhjXwTWsw0bnPESQBwCu8diF234elM-/view?usp=drive_link',
	},
];

const FreeMaterials = () => {
	useEffect(() => {
		// Remove horizontal scroll from navbar on this page
		const navMobileBar = document.querySelector(
			'.md\\:hidden.items-center.border-b.border-yellow-400.h-10'
		);
		if (navMobileBar) {
			(navMobileBar as HTMLElement).style.overflowX = 'auto';
			(navMobileBar as HTMLElement).style.maxWidth = '100vw';
		}
		// Remove horizontal scroll from parent if any
		document.body.style.overflowX = 'hidden';
		return () => {
			document.body.style.overflowX = '';
		};
	}, []);

	return (
		<div className="min-h-screen bg-black text-white flex flex-col">
			<Helmet>
				<title>Free Maritime Study Materials & PDFs | Budding Mariners</title>
				<meta name="description" content="Download free study materials, PDFs, and resources for Merchant Navy and maritime education. Curated by Budding Mariners for aspiring seafarers." />
				<meta name="keywords" content="Free Maritime Materials, Merchant Navy PDFs, Marine Study Material, Download Marine Resources, Budding Mariners Free" />
				<meta property="og:title" content="Free Maritime Study Materials & PDFs | Budding Mariners" />
				<meta property="og:description" content="Download free study materials and PDFs for Merchant Navy and marine education from Budding Mariners." />
				<meta property="og:type" content="website" />
				<link rel="canonical" href={canonicalUrl('/free-materials')} />
				<meta property="og:url" content={canonicalUrl('/free-materials')} />
				<meta property="og:image" content="/assets/yellow on orange logomark.png" />
			</Helmet>

			{/* Header */}
			<section className="pt-28 pb-6 text-center">
				<h1 className="text-3xl md:text-4xl font-extrabold mb-2 font-geist">
					Free Study Materials
				</h1>
				<p className="text-white/80 text-base max-w-2xl mx-auto font-poppins">
					Download a curated collection of educational PDFs on various topics.
				</p>
			</section>

			{/* Materials Grid */}
			<section className="max-w-5xl mx-auto w-full py-10 px-2 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
				{materials.map((mat, idx) => (
					<div
						key={idx}
						className="bg-white rounded-xl shadow p-5 flex flex-col border border-gray-100 relative"
					>
						<div className="flex items-center mb-3">
							<span className="flex items-center bg-gray-100 text-gray-700 px-2 py-1 rounded-full text-xs font-semibold">
								<FileText className="w-4 h-4 mr-1" />
								PDF
							</span>
						</div>
						<div className="font-bold text-base text-black mb-6">
							{idx === 0 && "TS REHMAN (EXPECTED QUESTIONS)"}
							{idx === 1 && "SIMS IMPORTANT QUESTIONS"}
							{idx === 2 && "SI UNITS"}
							{idx === 3 && "RIVERS & ORIGINS"} 
							{idx === 4 && "REAGENTS & THEIR PROPERTIES"}
							{idx === 5 && "QNA RELATED TO MERCHANT NAVY"}
							{idx === 6 && "PYQS OF PHYSICS (SUBJECTIVE)"}
							{idx === 7 && "PYQS OF IOC"}
							{idx === 8 && "PSYCHOMETRY QUESTIONS"}
							{idx === 9 && "ORGANIC IMPORTANT REACTIONS"}
							{idx === 10 && "MATHS IMPORTANT QUESTIONS"}
							{idx === 11 && "INTERVIEW QUESTIONS"}
							{idx === 12 && "INTERVIEW QUESTIONS - 2"}
							{idx === 13 && "INDIAN PORTS"}
							{idx === 14 && "IMUCET SYLLABUS"}
							{idx === 15 && "IMPORTANT PHYSICS DERIVATION"}
							{idx === 16 && "IMPORTANT MATHS FORMULA"}
							{idx === 17 && "GREAT EASTERN EXPECTED QUESTIONS"}
							{idx === 18 && "GK IMPORTANT QUESTIONS"}
							{idx === 19 && "GEOGRAPHY IMPORTANT QUESTIONS"}
							{idx === 20 && "FLEET IMPORTANT QUESTIONS"}
							{idx === 21 && "ENGLISH IMPORTANT QUESTIONS"}
							{idx === 22 && "D’AMICO IMPORTANT QUESTIONS"}
							{idx === 23 && "COUNTRY & THEIR CURRENCY"}
							{idx === 24 && "COUNTRY & THEIR CAPITAL"}
							{idx === 25 && "COUNTRY & THEIR CAPITAL - 2"}
							{idx === 26 && "COMPANY KNOWLEDGE"}
							{idx === 27 && "BIOSPHERE RESERVES"}
							{idx === 28 && "ANGLO EASTERN EXPECTED QUESTIONS"}
							{idx === 29 && "ALL ABOUT DNS"}
							{idx === 30 && "ALL ABOUT B.TECH"}
							{idx === 31 && "ALL ABOUT B.SC"}
							{idx === 32 && "7 ISLANDS (EXPECTED QUESTIONS)"}
						</div>
						<a
							href={mat.download}
							target="_blank"
							rel="noopener noreferrer"
							className="w-full bg-black text-yellow-400 py-2 rounded font-bold flex items-center justify-center gap-2 hover:bg-yellow-400 hover:text-black transition"
						>
							<Download className="w-4 h-4" />
							Download Free
						</a>
					</div>
				))}
			</section>
		</div>
	);
};

export default FreeMaterials;
