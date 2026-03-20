import React, { useEffect, useState } from 'react';
import { FileText, LogOut, Download } from 'lucide-react';

const ADMIN_ID = 'admin@bmpromo.com';
const ADMIN_PASS = 'bmpromoadmin$';

type Lead = {
  _id: string;
  name: string;
  phone: string;
  email?: string;
  called: string;
  interested: string;
};

const calledOptions = ['Not Yet', 'Called'];
const interestedOptions = ['Not Yet', 'Interested', 'Not Interested'];

const API_BASE = import.meta.env.VITE_API_BASE_URL || 'https://bm-promo.onrender.com';

const Admin: React.FC = () => {
  const [leads, setLeads] = useState<Lead[]>([]);
  const [loading, setLoading] = useState(true);
  const [auth, setAuth] = useState(false);
  const [login, setLogin] = useState({ id: '', pass: '' });
  const [loginError, setLoginError] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 10;
  const totalPages = Math.ceil(leads.length / itemsPerPage);

  // Fetch leads from backend
  const fetchLeads = async () => {
    setLoading(true);
    try {
      const res = await fetch(`${API_BASE}/api/admin/leads`, {
        headers: { Accept: 'application/json' }
      });
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
    setLoading(false);
  };

  useEffect(() => {
    if (auth) fetchLeads();
  }, [auth]);

  // Update lead status
  const updateLead = async (id: string, field: 'called' | 'interested', value: string) => {
    await fetch(`${API_BASE}/api/admin/leads/${id}`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ [field]: value }),
    });
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

  // Login handler
  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();
    if (
      login.id.trim().toLowerCase() === ADMIN_ID.toLowerCase() &&
      login.pass === ADMIN_PASS
    ) {
      setAuth(true);
      setLoginError('');
    } else {
      setLoginError('Invalid credentials');
    }
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
            value={login.id}
            onChange={e => setLogin(l => ({ ...l, id: e.target.value }))}
            className="w-full mb-3 px-4 py-2 rounded-lg border border-gray-300 text-black"
            required
          />
          <input
            type="password"
            placeholder="Password"
            value={login.pass}
            onChange={e => setLogin(l => ({ ...l, pass: e.target.value }))}
            className="w-full mb-3 px-4 py-2 rounded-lg border border-gray-300 text-black"
            required
          />
          {loginError && (
            <div className="mb-3 w-full text-red-600 text-sm text-center">{loginError}</div>
          )}
          <button
            type="submit"
            className="w-full bg-yellow-400 text-black font-bold py-2 rounded-lg hover:bg-yellow-500 transition"
          >
            Login
          </button>
        </form>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-black text-white flex flex-col">
      <header className="flex flex-col md:flex-row md:items-center md:justify-between px-6 py-4 border-b border-yellow-400 gap-4 md:gap-0">
        <h1 className="text-2xl font-bold text-yellow-400">Admin Panel - Leads</h1>
        <div className="flex gap-2 flex-wrap">
          <button
            onClick={() => setAuth(false)}
            className="flex items-center gap-2 bg-white/10 text-yellow-400 px-4 py-2 rounded font-semibold hover:bg-yellow-400 hover:text-black transition"
          >
            <LogOut className="w-5 h-5" /> Logout
          </button>
        </div>
      </header>
      <main className="flex-1 p-6">
        {loading ? (
          <div className="text-center text-yellow-400">Loading leads...</div>
        ) : (
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
        )}
      </main>
    </div>
  );
};

export default Admin;
