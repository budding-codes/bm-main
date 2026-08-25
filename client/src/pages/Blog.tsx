import { useEffect, useState, type ReactNode } from 'react';
import { Link } from 'react-router-dom';
import { Helmet } from 'react-helmet-async';
import { ArrowUpRight, Clock3, PlayCircle, User } from 'lucide-react';
import { apiUrl } from '../lib/api';
import { canonicalUrl } from '../lib/site';

type BlogPost = {
	_id: string;
	title: string;
	description: string;
	author: string;
	thumbnailUrl?: string;
	youtubeUrl?: string;
	featured?: boolean;
	slug?: string;
	readingTimeMinutes?: number;
	createdAt: string;
};

const formatDate = (value: string) => new Date(value).toLocaleDateString('en-IN', {
	day: '2-digit',
	month: 'short',
	year: 'numeric'
});

const getReadTime = (post: BlogPost) => {
	if (post.readingTimeMinutes) {
		return `${post.readingTimeMinutes} min read`;
	}
	const words = post.description.trim().split(/\s+/).filter(Boolean).length;
	return `${Math.max(1, Math.ceil(words / 180))} min read`;
};

const PostLink = ({
	post,
	className,
	children
}: {
	post: BlogPost;
	className?: string;
	children: ReactNode;
}) => {
	if (!post.slug) {
		return <div className={className}>{children}</div>;
	}

	return (
		<Link to={`/blog/${post.slug}`} className={className}>
			{children}
		</Link>
	);
};

const ThumbnailFallback = ({ title }: { title: string }) => (
	<div className="flex h-full min-h-[220px] w-full flex-col justify-between bg-[radial-gradient(circle_at_top_left,_rgba(250,204,21,0.22),_transparent_42%),linear-gradient(135deg,_#111827_0%,_#0f172a_52%,_#111111_100%)] p-6 text-left text-white">
		<span className="w-fit rounded-full border border-yellow-400/30 bg-yellow-400/10 px-3 py-1 text-[11px] font-semibold uppercase tracking-[0.24em] text-yellow-300">
			Budding Mariners
		</span>
		<div>
			<p className="mb-3 max-w-[14rem] text-lg font-bold leading-snug text-white line-clamp-3">{title}</p>
			<p className="text-xs uppercase tracking-[0.28em] text-white/50">New maritime update</p>
		</div>
	</div>
);

const Blog = () => {
	const [blogs, setBlogs] = useState<BlogPost[]>([]);
	const [loading, setLoading] = useState(true);
	const [error, setError] = useState('');

	useEffect(() => {
		let isMounted = true;

		const fetchBlogs = async () => {
			setLoading(true);
			setError('');

			try {
				const response = await fetch(apiUrl('/api/blogs'), {
					headers: { Accept: 'application/json' }
				});

				if (!response.ok) {
					throw new Error('Failed to load blogs.');
				}

				const data = await response.json();
				if (isMounted) {
					setBlogs(data.blogs || []);
				}
			} catch (fetchError) {
				if (isMounted) {
					setError('Blogs are unavailable right now. Please try again shortly.');
					setBlogs([]);
				}
			} finally {
				if (isMounted) {
					setLoading(false);
				}
			}
		};

		fetchBlogs();

		return () => {
			isMounted = false;
		};
	}, []);

	const featuredPost = blogs.find((post) => post.featured) || blogs[0];
	const gridPosts = featuredPost ? blogs.filter((post) => post._id !== featuredPost._id) : blogs;

	return (
		<div className="min-h-screen bg-black text-white flex flex-col">
			<Helmet>
				<title>Maritime Blog & Insights | Latest Merchant Navy News | Budding Mariners</title>
				<meta name="description" content="Read the latest blog articles, guides, and news on maritime education, Merchant Navy careers, sponsorships, and industry trends. Stay updated with Budding Mariners." />
				<meta name="keywords" content="Maritime Blog, Merchant Navy News, Marine Education, Shipping Industry, Marine Careers, Budding Mariners Blog" />
				<meta property="og:title" content="Maritime Blog & Insights | Latest Merchant Navy News | Budding Mariners" />
				<meta property="og:description" content="Stay updated with the latest maritime trends, guides, and insights from Budding Mariners." />
				<meta property="og:type" content="website" />
				<link rel="canonical" href={canonicalUrl('/blog')} />
				<meta property="og:url" content={canonicalUrl('/blog')} />
				<meta property="og:image" content="/assets/yellow on orange logomark.png" />
			</Helmet>

			<section className="relative overflow-hidden border-b border-white/10 bg-[radial-gradient(circle_at_top_right,_rgba(250,204,21,0.17),_transparent_24%),radial-gradient(circle_at_bottom_left,_rgba(234,88,12,0.18),_transparent_22%),linear-gradient(180deg,_#050505_0%,_#0b0b0b_100%)] pt-28 pb-14 text-center">
				<div className="absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-yellow-400/40 to-transparent" />
				<div className="mx-auto max-w-3xl px-4">
					<p className="mb-4 text-xs font-semibold uppercase tracking-[0.38em] text-yellow-400/80">BM Blog</p>
					<h1 className="font-geist text-4xl font-extrabold md:text-5xl">Maritime Insights</h1>
					<p className="mx-auto mt-4 max-w-2xl text-sm leading-7 text-white/70 md:text-base">
						Fresh guidance, career notes, and academy updates for students planning their path into the merchant navy.
					</p>
				</div>
			</section>

			<div className="mx-auto flex w-full max-w-6xl flex-1 flex-col px-4 py-10 md:px-6 md:py-14">
				{loading ? (
					<div className="grid gap-8 lg:grid-cols-[1.2fr_0.8fr]">
						<div className="min-h-[420px] animate-pulse rounded-[28px] border border-white/10 bg-white/5" />
						<div className="grid gap-6 md:grid-cols-2 lg:grid-cols-1">
							{Array.from({ length: 2 }).map((_, index) => (
								<div key={index} className="min-h-[220px] animate-pulse rounded-[24px] border border-white/10 bg-white/5" />
							))}
						</div>
					</div>
				) : error ? (
					<div className="rounded-[28px] border border-red-400/20 bg-red-500/10 px-6 py-10 text-center text-sm text-red-100">
						{error}
					</div>
				) : blogs.length === 0 ? (
					<div className="rounded-[28px] border border-white/10 bg-white/[0.03] px-6 py-16 text-center">
						<p className="text-sm uppercase tracking-[0.3em] text-yellow-400/70">No blogs yet</p>
						<h2 className="mt-4 font-geist text-3xl font-bold text-white">Fresh articles will appear here soon.</h2>
						<p className="mx-auto mt-4 max-w-xl text-sm leading-7 text-white/60">
							The admin panel is connected now, so newly published posts will show up here automatically.
						</p>
					</div>
				) : (
					<>
						{featuredPost && (
							<section className="grid gap-8 lg:grid-cols-[1.2fr_0.8fr]">
								<PostLink
									post={featuredPost}
									className="overflow-hidden rounded-[28px] border border-white/10 bg-white/[0.04] shadow-[0_20px_80px_rgba(0,0,0,0.35)] transition hover:border-yellow-400/30"
								>
									<article className="h-full">
									<div className="grid h-full md:grid-cols-[1.05fr_0.95fr]">
										<div className="min-h-[280px] bg-neutral-900 md:min-h-full">
											{featuredPost.thumbnailUrl ? (
												<img src={featuredPost.thumbnailUrl} alt={featuredPost.title} className="h-full w-full object-cover" />
											) : (
												<ThumbnailFallback title={featuredPost.title} />
											)}
										</div>
										<div className="flex flex-col justify-between p-6 md:p-8">
											<div>
												<div className="mb-4 flex flex-wrap items-center gap-3 text-xs uppercase tracking-[0.24em] text-white/45">
													<span className="rounded-full bg-yellow-400 px-3 py-1 font-semibold tracking-[0.2em] text-black">Featured</span>
													<span>{formatDate(featuredPost.createdAt)}</span>
												</div>
												<h2 className="font-geist text-3xl font-bold leading-tight text-white md:text-4xl">{featuredPost.title}</h2>
												<p className="mt-4 text-sm leading-7 text-white/72 md:text-base">{featuredPost.description}</p>
											</div>
											<div className="mt-6 flex flex-wrap items-center gap-4 border-t border-white/10 pt-5 text-xs text-white/55">
												<span className="flex items-center gap-2"><User className="h-4 w-4 text-yellow-400" />{featuredPost.author}</span>
												<span className="flex items-center gap-2"><Clock3 className="h-4 w-4 text-yellow-400" />{getReadTime(featuredPost)}</span>
												{featuredPost.youtubeUrl ? (
													<span
														onClick={(event) => {
															event.preventDefault();
															window.open(featuredPost.youtubeUrl, '_blank', 'noreferrer');
														}}
														className="ml-auto inline-flex items-center gap-2 rounded-full border border-yellow-400/40 bg-yellow-400/10 px-4 py-2 text-[11px] font-semibold uppercase tracking-[0.24em] text-yellow-300 transition hover:bg-yellow-400 hover:text-black"
													>
														<PlayCircle className="h-4 w-4" />
														Watch video
														<ArrowUpRight className="h-4 w-4" />
													</span>
												) : null}
											</div>
										</div>
									</div>
									</article>
								</PostLink>
								<div className="grid gap-6 md:grid-cols-2 lg:grid-cols-1">
									{gridPosts.slice(0, 2).map((post) => (
										<PostLink
											key={post._id}
											post={post}
											className="overflow-hidden rounded-[24px] border border-white/10 bg-white/[0.04] transition hover:border-yellow-400/30"
										>
										<article>
											<div className="h-44 bg-neutral-900">
												{post.thumbnailUrl ? (
													<img src={post.thumbnailUrl} alt={post.title} className="h-full w-full object-cover" />
												) : (
													<ThumbnailFallback title={post.title} />
												)}
											</div>
											<div className="p-5">
												<p className="text-[11px] uppercase tracking-[0.26em] text-white/45">{formatDate(post.createdAt)}</p>
												<h3 className="mt-3 line-clamp-2 font-geist text-xl font-bold text-white">{post.title}</h3>
												<p className="mt-3 line-clamp-3 text-sm leading-6 text-white/65">{post.description}</p>
											</div>
										</article>
										</PostLink>
									))}
								</div>
							</section>
						)}

						<section className="mt-10 grid gap-6 md:grid-cols-2 xl:grid-cols-3">
							{gridPosts.slice(featuredPost ? 2 : 0).map((post) => (
								<PostLink
									key={post._id}
									post={post}
									className="group flex h-full flex-col overflow-hidden rounded-[24px] border border-white/10 bg-white/[0.04] transition hover:-translate-y-1 hover:border-yellow-400/30 hover:bg-white/[0.06]"
								>
								<article className="flex h-full flex-col">
									<div className="h-52 bg-neutral-900">
										{post.thumbnailUrl ? (
											<img src={post.thumbnailUrl} alt={post.title} className="h-full w-full object-cover transition duration-500 group-hover:scale-[1.03]" />
										) : (
											<ThumbnailFallback title={post.title} />
										)}
									</div>
									<div className="flex flex-1 flex-col p-5">
										<div className="flex items-center justify-between gap-3 text-[11px] uppercase tracking-[0.24em] text-white/40">
											<span>{formatDate(post.createdAt)}</span>
											<span>{getReadTime(post)}</span>
										</div>
										<h3 className="mt-4 line-clamp-2 font-geist text-2xl font-bold leading-tight text-white">{post.title}</h3>
										<p className="mt-4 line-clamp-4 flex-1 text-sm leading-7 text-white/68">{post.description}</p>
										<div className="mt-6 flex items-center justify-between gap-3 border-t border-white/10 pt-4 text-sm text-white/55">
											<span className="flex items-center gap-2"><User className="h-4 w-4 text-yellow-400" />{post.author}</span>
											<span className="text-[11px] uppercase tracking-[0.22em] text-white/35">
												{post.slug ? 'Read article' : 'Article'}
											</span>
										</div>
									</div>
								</article>
								</PostLink>
							))}
						</section>
					</>
				)}
			</div>
		</div>
	);
};

export default Blog;