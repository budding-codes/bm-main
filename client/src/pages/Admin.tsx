import React, { useEffect, useState } from 'react';
import { Download, FileText, LogOut, PencilLine, Plus, RefreshCcw, Trash2 } from 'lucide-react';
import { apiUrl, buildAdminHeaders, getAdminToken, setAdminToken } from '../lib/api';

type Lead = {
  _id: string;
  name: string;
  phone: string;
  email?: string;
  called: string;
  interested: string;
};

type Blog = {
  _id: string;
  title: string;
  description: string;
  author: string;
  youtubeUrl?: string;
  thumbnailUrl?: string;
  featured: boolean;
  published: boolean;
  createdAt: string;
};

type BlogForm = {
  title: string;
  description: string;
  author: string;
  youtubeUrl: string;
  thumbnailUrl: string;
  featured: boolean;
  published: boolean;
};

const calledOptions = ['Not Yet', 'Called'];
const interestedOptions = ['Not Yet', 'Interested', 'Not Interested'];

const emptyBlogForm: BlogForm = {
  title: '',
  description: '',
  author: 'BM Team',
  youtubeUrl: '',
  thumbnailUrl: '',
  featured: false,
  published: true
};

const formatDate = (value: string) => new Date(value).toLocaleDateString('en-IN', {
  day: '2-digit',
  month: 'short',
  year: 'numeric'
});

const Admin: React.FC = () => {
  const [leads, setLeads] = useState<Lead[]>([]);
  const [blogs, setBlogs] = useState<Blog[]>([]);
  const [loading, setLoading] = useState(true);
  const [auth, setAuth] = useState(false);
  const [activeTab, setActiveTab] = useState<'leads' | 'blogs'>('leads');
  const [token, setToken] = useState('');
  const [login, setLogin] = useState({ email: '', password: '' });
  const [loginError, setLoginError] = useState('');
  const [blogError, setBlogError] = useState('');
  const [blogMessage, setBlogMessage] = useState('');
  const [submittingBlog, setSubmittingBlog] = useState(false);
  const [editingBlogId, setEditingBlogId] = useState('');
  const [blogForm, setBlogForm] = useState<BlogForm>(emptyBlogForm);
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 10;
  const totalPages = Math.ceil(leads.length / itemsPerPage);

  const resetBlogForm = () => {
    setEditingBlogId('');
    setBlogForm(emptyBlogForm);
  };

  const handleUnauthorized = () => {
    setAdminToken('');
    setToken('');
    setAuth(false);
    setLeads([]);
    setBlogs([]);
    setLoginError('Your session expired. Please log in again.');
  };

  const fetchLeads = async (authToken: string) => {
    try {
		const res = await fetch(apiUrl('/api/admin/leads'), {
		  headers: buildAdminHeaders(authToken)
		});
		if (res.status === 401) {
		  handleUnauthorized();
		  return;
		}
      if (!res.ok) throw new Error('Network response was not ok');
      const data = await res.json();
      setLeads((data.leads || []).map((u: any) => ({
        _id: u._id || u.id || u.phone,
        name: u.name,
        phone: u.phone,
        email: u.email || '-',
        called: u.called || 'Not Yet',
        interested: u.interested || 'Not Yet'
      })));
    } catch (err) {
      setLeads([]);
    }
  };

  const fetchBlogs = async (authToken: string) => {
    try {
      const res = await fetch(apiUrl('/api/admin/blogs'), {
        headers: buildAdminHeaders(authToken)
      });
      if (res.status === 401) {
        handleUnauthorized();
        return;
      }
      if (!res.ok) {
        throw new Error('Failed to fetch blogs');
      }
      const data = await res.json();
      setBlogs(data.blogs || []);
    } catch (error) {
      setBlogs([]);
      setBlogError('Unable to load blogs right now.');
    }
  };

  const loadAdminData = async (authToken: string) => {
    setLoading(true);
    setBlogError('');
    await Promise.all([fetchLeads(authToken), fetchBlogs(authToken)]);
    setLoading(false);
  };

  useEffect(() => {
    const storedToken = getAdminToken();
    if (!storedToken) {
      setLoading(false);
      return;
    }

    let isMounted = true;

    const validateSession = async () => {
      try {
        const response = await fetch(apiUrl('/api/admin/session'), {
          headers: buildAdminHeaders(storedToken)
        });
        if (!response.ok) {
          throw new Error('Session invalid');
        }
        if (!isMounted) {
          return;
        }
        setToken(storedToken);
        setAuth(true);
        await loadAdminData(storedToken);
      } catch (error) {
        if (!isMounted) {
          return;
        }
        setAdminToken('');
        setLoading(false);
      }
    };

    validateSession();

    return () => {
      isMounted = false;
    };
  }, []);

  const updateLead = async (id: string, field: 'called' | 'interested', value: string) => {
		const response = await fetch(apiUrl(`/api/admin/leads/${id}`), {
      method: 'PATCH',
		  headers: buildAdminHeaders(token, true),
      body: JSON.stringify({ [field]: value }),
    });
		if (response.status === 401) {
		  handleUnauthorized();
		  return;
		}
    setLeads(leads =>
      leads.map(lead => (lead._id === id ? { ...lead, [field]: value } : lead))
    );
  };

  // Export to Excel
  const exportToExcel = () => {
    const header = ['Name', 'Phone', 'Email', 'Called', 'Interested'];
    const rows = leads.map(l => [l.name, l.phone, l.email || '-', l.called, l.interested]);
    const csvContent =
      header.join(',') +
      '\n' +
      rows.map(row => row.map(field => `"${String(field).replace(/"/g, '""')}"`).join(',')).join('\n');
    const blob = new Blob([csvContent], { type: 'text/csv' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'leads.csv';
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    window.URL.revokeObjectURL(url);
  };

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoginError('');
    setLoading(true);

    try {
      const response = await fetch(apiUrl('/api/admin/login'), {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', Accept: 'application/json' },
        body: JSON.stringify({
          email: login.email,
          password: login.password
        })
      });

      const data = await response.json().catch(() => ({}));
      if (!response.ok || !data.token) {
        throw new Error(data.error || 'Invalid credentials');
      }

      setAdminToken(data.token);
      setToken(data.token);
      setAuth(true);
      setLoginError('');
      await loadAdminData(data.token);
    } catch (error) {
      setLoginError(error instanceof Error ? error.message : 'Unable to log in.');
      setAuth(false);
      setLoading(false);
    }
  };

  const submitBlog = async (event: React.FormEvent) => {
    event.preventDefault();
    setSubmittingBlog(true);
    setBlogError('');
    setBlogMessage('');

    try {
      const response = await fetch(
        apiUrl(editingBlogId ? `/api/admin/blogs/${editingBlogId}` : '/api/admin/blogs'),
        {
          method: editingBlogId ? 'PUT' : 'POST',
          headers: buildAdminHeaders(token, true),
          body: JSON.stringify(blogForm)
        }
      );

      const data = await response.json().catch(() => ({}));
      if (response.status === 401) {
        handleUnauthorized();
        return;
      }
      if (!response.ok) {
        throw new Error(data.error || 'Failed to save blog');
      }

      setBlogMessage(editingBlogId ? 'Blog updated.' : 'Blog created.');
      resetBlogForm();
      await fetchBlogs(token);
    } catch (error) {
      setBlogError(error instanceof Error ? error.message : 'Failed to save blog');
    } finally {
      setSubmittingBlog(false);
    }
  };

  const startEditingBlog = (blog: Blog) => {
    setActiveTab('blogs');
    setBlogMessage('');
    setBlogError('');
    setEditingBlogId(blog._id);
    setBlogForm({
      title: blog.title,
      description: blog.description,
      author: blog.author,
      youtubeUrl: blog.youtubeUrl || '',
      thumbnailUrl: blog.thumbnailUrl || '',
      featured: blog.featured,
      published: blog.published
    });
  };

  const deleteBlog = async (id: string) => {
    const confirmed = window.confirm('Delete this blog post?');
    if (!confirmed) {
      return;
    }

    setBlogError('');
    setBlogMessage('');
    try {
      const response = await fetch(apiUrl(`/api/admin/blogs/${id}`), {
        method: 'DELETE',
        headers: buildAdminHeaders(token)
      });
      const data = await response.json().catch(() => ({}));
      if (response.status === 401) {
        handleUnauthorized();
        return;
      }
      if (!response.ok) {
        throw new Error(data.error || 'Failed to delete blog');
      }

      if (editingBlogId === id) {
        resetBlogForm();
      }
      setBlogs((currentBlogs) => currentBlogs.filter((blog) => blog._id !== id));
      setBlogMessage('Blog deleted.');
    } catch (error) {
      setBlogError(error instanceof Error ? error.message : 'Failed to delete blog');
    }
  };

  const refreshAdminData = async () => {
    await loadAdminData(token);
  };

  const handlePageChange = (page: number) => {
    if (page >= 1 && page <= totalPages) {
      setCurrentPage(page);
    }
  };

  const paginatedLeads = leads.slice((currentPage - 1) * itemsPerPage, currentPage * itemsPerPage);

  if (!auth) {
    return (
      <div className="min-h-screen bg-black flex items-center justify-center ">
        <form
          onSubmit={handleLogin}
          className="bg-white rounded-xl shadow-lg p-8 w-full max-w-xs flex flex-col items-center"
        >
          <FileText className="w-8 h-8 text-yellow-400 mb-2" />
          <h2 className="font-bold text-xl text-black mb-4">Admin Login</h2>
          <input
            type="text"
            placeholder="Admin Email"
			value={login.email}
			onChange={e => setLogin(l => ({ ...l, email: e.target.value }))}
            className="w-full mb-3 px-4 py-2 rounded-lg border border-gray-300 text-black"
            required
          />
          <input
            type="password"
            placeholder="Password"
			value={login.password}
			onChange={e => setLogin(l => ({ ...l, password: e.target.value }))}
            className="w-full mb-3 px-4 py-2 rounded-lg border border-gray-300 text-black"
            required
          />
          {loginError && (
            <div className="mb-3 w-full text-red-600 text-sm text-center">{loginError}</div>
          )}
          <button
            type="submit"
            className="w-full bg-yellow-400 text-black font-bold py-2 rounded-lg hover:bg-yellow-500 transition disabled:opacity-60"
            disabled={loading}
          >
            {loading ? 'Signing in...' : 'Login'}
          </button>
        </form>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-black text-white flex flex-col">
      <header className="flex flex-col md:flex-row md:items-center md:justify-between px-6 py-4 border-b border-yellow-400 gap-4 md:gap-0">
        <div>
          <h1 className="text-2xl font-bold text-yellow-400">Admin Panel</h1>
          <p className="text-xs uppercase tracking-[0.28em] text-white/40">Secure leads and blog management</p>
        </div>
        <div className="flex gap-2 flex-wrap">
          <button
            onClick={refreshAdminData}
            className="flex items-center gap-2 bg-white/10 text-white px-4 py-2 rounded font-semibold hover:bg-white/15 transition"
          >
            <RefreshCcw className="w-4 h-4" /> Refresh
          </button>
          <button
            onClick={() => handleUnauthorized()}
            className="flex items-center gap-2 bg-white/10 text-yellow-400 px-4 py-2 rounded font-semibold hover:bg-yellow-400 hover:text-black transition"
          >
            <LogOut className="w-5 h-5" /> Logout
          </button>
        </div>
      </header>
      <main className="flex-1 p-6">
        <div className="mb-6 flex flex-wrap gap-3">
          <button
            type="button"
            onClick={() => setActiveTab('leads')}
            className={`rounded-full px-4 py-2 text-sm font-semibold transition ${activeTab === 'leads' ? 'bg-yellow-400 text-black' : 'bg-white/10 text-white hover:bg-white/15'}`}
          >
            Leads
          </button>
          <button
            type="button"
            onClick={() => setActiveTab('blogs')}
            className={`rounded-full px-4 py-2 text-sm font-semibold transition ${activeTab === 'blogs' ? 'bg-yellow-400 text-black' : 'bg-white/10 text-white hover:bg-white/15'}`}
          >
            Blogs
          </button>
        </div>
        {loading ? (
          <div className="text-center text-yellow-400">Loading admin data...</div>
        ) : activeTab === 'leads' ? (
          <div className="overflow-x-auto">
            <table className="min-w-full bg-[#18181b] rounded-xl">
              <thead>
                <tr>
                  <th className="px-4 py-2 text-left text-yellow-400">Name</th>
                  <th className="px-4 py-2 text-left text-yellow-400">Phone</th>
                  <th className="px-4 py-2 text-left text-yellow-400">Email</th>
                  <th className="px-4 py-2 text-left text-yellow-400">Called</th>
                  <th className="px-4 py-2 text-left text-yellow-400">Interested</th>
                </tr>
              </thead>
              <tbody>
                {paginatedLeads.map((lead) => (
                  <tr key={lead._id} className="border-b border-white/10">
                    <td className="px-4 py-2">{lead.name}</td>
                    <td className="px-4 py-2">{lead.phone}</td>
                    <td className="px-4 py-2">{lead.email || '-'}</td>
                    <td className="px-4 py-2">
                      <select
                        value={lead.called || 'Not Yet'}
                        onChange={e => updateLead(lead._id, 'called', e.target.value)}
                        className="px-2 py-1 rounded bg-black text-yellow-400 border border-yellow-400"
                      >
                        {calledOptions.map(opt => (
                          <option key={opt} value={opt}>{opt}</option>
                        ))}
                      </select>
                    </td>
                    <td className="px-4 py-2">
                      <select
                        value={lead.interested || 'Not Yet'}
                        onChange={e => updateLead(lead._id, 'interested', e.target.value)}
                        className="px-2 py-1 rounded bg-black text-yellow-400 border border-yellow-400"
                      >
                        {interestedOptions.map(opt => (
                          <option key={opt} value={opt}>{opt}</option>
                        ))}
                      </select>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
            {leads.length === 0 && (
              <div className="text-center text-white/60 mt-8">No leads found.</div>
            )}
            {/* Pagination Controls */}
            <div className="flex justify-between items-center mt-6">
              <button
                onClick={() => handlePageChange(currentPage - 1)}
                disabled={currentPage === 1}
                className="px-4 py-2 bg-yellow-400 text-black rounded font-semibold hover:bg-yellow-500 transition disabled:opacity-50"
              >
                Previous
              </button>
              <div className="text-white">
                Page {currentPage} of {totalPages}
              </div>
              <button
                onClick={() => handlePageChange(currentPage + 1)}
                disabled={currentPage === totalPages}
                className="px-4 py-2 bg-yellow-400 text-black rounded font-semibold hover:bg-yellow-500 transition disabled:opacity-50"
              >
                Next
              </button>
            </div>
            {/* Export to Excel button */}
            <div className="flex justify-end mt-6">
              <button
                onClick={exportToExcel}
                className="flex items-center gap-2 bg-yellow-400 text-black px-4 py-2 rounded font-semibold hover:bg-yellow-500 transition"
                style={{ minWidth: 160 }}
              >
                <Download className="w-5 h-5" /> Export to Excel
              </button>
            </div>
          </div>
        ) : (
          <div className="grid gap-6 xl:grid-cols-[minmax(0,420px)_minmax(0,1fr)]">
            <form onSubmit={submitBlog} className="rounded-2xl border border-white/10 bg-[#18181b] p-5">
              <div className="mb-5 flex items-start justify-between gap-4">
                <div>
                  <h2 className="text-xl font-bold text-yellow-400">{editingBlogId ? 'Edit Blog' : 'Create Blog'}</h2>
                  <p className="mt-1 text-sm text-white/55">YouTube links are optional. If provided, the backend captures the thumbnail automatically.</p>
                </div>
                {editingBlogId ? (
                  <button
                    type="button"
                    onClick={resetBlogForm}
                    className="rounded-full border border-white/10 px-3 py-1 text-xs font-semibold uppercase tracking-[0.2em] text-white/60 hover:border-white/30 hover:text-white"
                  >
                    Cancel
                  </button>
                ) : null}
              </div>

              <div className="space-y-4">
                <input
                  type="text"
                  value={blogForm.title}
                  onChange={(event) => setBlogForm((current) => ({ ...current, title: event.target.value }))}
                  placeholder="Blog title"
                  className="w-full rounded-xl border border-white/10 bg-black px-4 py-3 text-sm text-white outline-none transition focus:border-yellow-400"
                  required
                />
                <textarea
                  value={blogForm.description}
                  onChange={(event) => setBlogForm((current) => ({ ...current, description: event.target.value }))}
                  placeholder="Blog description"
                  className="min-h-[180px] w-full rounded-xl border border-white/10 bg-black px-4 py-3 text-sm text-white outline-none transition focus:border-yellow-400"
                  required
                />
                <input
                  type="text"
                  value={blogForm.author}
                  onChange={(event) => setBlogForm((current) => ({ ...current, author: event.target.value }))}
                  placeholder="Author name"
                  className="w-full rounded-xl border border-white/10 bg-black px-4 py-3 text-sm text-white outline-none transition focus:border-yellow-400"
                />
                <input
                  type="url"
                  value={blogForm.youtubeUrl}
                  onChange={(event) => setBlogForm((current) => ({ ...current, youtubeUrl: event.target.value }))}
                  placeholder="YouTube link (optional)"
                  className="w-full rounded-xl border border-white/10 bg-black px-4 py-3 text-sm text-white outline-none transition focus:border-yellow-400"
                />
                <input
                  type="url"
                  value={blogForm.thumbnailUrl}
                  onChange={(event) => setBlogForm((current) => ({ ...current, thumbnailUrl: event.target.value }))}
                  placeholder="Manual thumbnail URL (optional)"
                  className="w-full rounded-xl border border-white/10 bg-black px-4 py-3 text-sm text-white outline-none transition focus:border-yellow-400"
                />
                <label className="flex items-center gap-3 rounded-xl border border-white/10 bg-black px-4 py-3 text-sm text-white/80">
                  <input
                    type="checkbox"
                    checked={blogForm.featured}
                    onChange={(event) => setBlogForm((current) => ({ ...current, featured: event.target.checked }))}
                    className="h-4 w-4 accent-yellow-400"
                  />
                  Mark as featured post
                </label>
                <label className="flex items-center gap-3 rounded-xl border border-white/10 bg-black px-4 py-3 text-sm text-white/80">
                  <input
                    type="checkbox"
                    checked={blogForm.published}
                    onChange={(event) => setBlogForm((current) => ({ ...current, published: event.target.checked }))}
                    className="h-4 w-4 accent-yellow-400"
                  />
                  Publish immediately
                </label>
              </div>

              {blogError ? <p className="mt-4 text-sm text-red-400">{blogError}</p> : null}
              {blogMessage ? <p className="mt-4 text-sm text-emerald-400">{blogMessage}</p> : null}

              <button
                type="submit"
                className="mt-6 inline-flex items-center gap-2 rounded-xl bg-yellow-400 px-5 py-3 font-semibold text-black transition hover:bg-yellow-300 disabled:opacity-60"
                disabled={submittingBlog}
              >
                {editingBlogId ? <PencilLine className="h-4 w-4" /> : <Plus className="h-4 w-4" />}
                {submittingBlog ? 'Saving...' : editingBlogId ? 'Update blog' : 'Create blog'}
              </button>
            </form>

            <div className="space-y-4">
              {blogs.length === 0 ? (
                <div className="rounded-2xl border border-dashed border-white/10 bg-white/[0.03] px-6 py-10 text-center text-sm text-white/55">
                  No blogs yet. The public blog page will update as soon as you publish one.
                </div>
              ) : (
                blogs.map((blog) => (
                  <article key={blog._id} className="overflow-hidden rounded-2xl border border-white/10 bg-[#18181b]">
                    <div className="grid gap-0 md:grid-cols-[180px_minmax(0,1fr)]">
                      <div className="min-h-[160px] bg-[radial-gradient(circle_at_top_left,_rgba(250,204,21,0.25),_transparent_35%),linear-gradient(135deg,_#111827_0%,_#111111_100%)]">
                        {blog.thumbnailUrl ? (
                          <img src={blog.thumbnailUrl} alt={blog.title} className="h-full w-full object-cover" />
                        ) : (
                          <div className="flex h-full items-end p-4 text-sm font-semibold text-yellow-200">No thumbnail</div>
                        )}
                      </div>
                      <div className="p-5">
                        <div className="flex flex-wrap items-start justify-between gap-3">
                          <div>
                            <div className="mb-2 flex flex-wrap gap-2 text-[11px] uppercase tracking-[0.22em] text-white/45">
                              {blog.featured ? <span className="rounded-full bg-yellow-400 px-3 py-1 font-semibold text-black">Featured</span> : null}
                              <span className={`rounded-full px-3 py-1 font-semibold ${blog.published ? 'bg-emerald-400/15 text-emerald-300' : 'bg-white/10 text-white/60'}`}>
                                {blog.published ? 'Published' : 'Draft'}
                              </span>
                              <span>{formatDate(blog.createdAt)}</span>
                            </div>
                            <h3 className="text-xl font-bold text-white">{blog.title}</h3>
                            <p className="mt-2 text-sm text-white/65">By {blog.author}</p>
                          </div>
                          <div className="flex gap-2">
                            <button
                              type="button"
                              onClick={() => startEditingBlog(blog)}
                              className="inline-flex items-center gap-2 rounded-lg border border-white/10 px-3 py-2 text-sm font-semibold text-white/70 transition hover:border-yellow-400 hover:text-yellow-300"
                            >
                              <PencilLine className="h-4 w-4" /> Edit
                            </button>
                            <button
                              type="button"
                              onClick={() => deleteBlog(blog._id)}
                              className="inline-flex items-center gap-2 rounded-lg border border-red-500/20 px-3 py-2 text-sm font-semibold text-red-300 transition hover:bg-red-500/10"
                            >
                              <Trash2 className="h-4 w-4" /> Delete
                            </button>
                          </div>
                        </div>
                        <p className="mt-4 line-clamp-4 text-sm leading-7 text-white/65">{blog.description}</p>
                        {blog.youtubeUrl ? (
                          <a
                            href={blog.youtubeUrl}
                            target="_blank"
                            rel="noreferrer"
                            className="mt-4 inline-flex text-sm font-semibold text-yellow-300 hover:text-yellow-200"
                          >
                            Open YouTube link
                          </a>
                        ) : null}
                      </div>
                    </div>
                  </article>
                ))
              )}
            </div>
          </div>
        )}
      </main>
    </div>
  );
};

export default Admin;
