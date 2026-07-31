import { useCallback, useEffect, useState } from 'react';
import { Download, RefreshCcw } from 'lucide-react';
import { useAdminAuth } from '../AdminAuthContext';
import { adminFetch } from '../../lib/api';
import { calledOptions, interestedOptions, type Lead } from '../../types/lead';

export default function LeadsPage() {
  const { token, handleUnauthorized } = useAdminAuth();
  const [leads, setLeads] = useState<Lead[]>([]);
  const [loading, setLoading] = useState(true);
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 10;
  const totalPages = Math.max(1, Math.ceil(leads.length / itemsPerPage));

  const fetchLeads = useCallback(async () => {
    setLoading(true);
    try {
      const data = await adminFetch<{ leads: Lead[] }>('/api/admin/leads', {
        token,
        onUnauthorized: handleUnauthorized
      });

      setLeads(
        (data.leads || []).map((lead) => ({
          _id: lead._id,
          name: lead.name,
          phone: lead.phone,
          email: lead.email || '-',
          called: lead.called || 'Not Yet',
          interested: lead.interested || 'Not Yet'
        }))
      );
    } catch {
      setLeads([]);
    } finally {
      setLoading(false);
    }
  }, [token, handleUnauthorized]);

  useEffect(() => {
    fetchLeads();
  }, [fetchLeads]);

  const updateLead = async (id: string, field: 'called' | 'interested', value: string) => {
    try {
      await adminFetch(`/api/admin/leads/${id}`, {
        method: 'PATCH',
        token,
        body: { [field]: value },
        onUnauthorized: handleUnauthorized
      });

      setLeads((current) =>
        current.map((lead) => (lead._id === id ? { ...lead, [field]: value } : lead))
      );
    } catch {
      // Keep the previous value if the request failed.
    }
  };

  const exportToExcel = () => {
    const header = ['Name', 'Phone', 'Email', 'Called', 'Interested'];
    const rows = leads.map((lead) => [lead.name, lead.phone, lead.email || '-', lead.called, lead.interested]);
    const csvContent =
      header.join(',') +
      '\n' +
      rows.map((row) => row.map((field) => `"${String(field).replace(/"/g, '""')}"`).join(',')).join('\n');

    const blob = new Blob([csvContent], { type: 'text/csv' });
    const url = window.URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = 'leads.csv';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    window.URL.revokeObjectURL(url);
  };

  const paginatedLeads = leads.slice((currentPage - 1) * itemsPerPage, currentPage * itemsPerPage);

  return (
    <div>
      <div className="mb-6 flex flex-wrap items-center justify-between gap-3">
        <div>
          <h1 className="text-2xl font-bold text-yellow-400">Leads</h1>
          <p className="mt-1 text-xs uppercase tracking-[0.28em] text-white/40">
            {leads.length} total · page {currentPage} of {totalPages}
          </p>
        </div>
        <div className="flex gap-2">
          <button
            type="button"
            onClick={fetchLeads}
            className="inline-flex items-center gap-2 rounded bg-white/10 px-4 py-2 font-semibold text-white transition hover:bg-white/15"
          >
            <RefreshCcw className="h-4 w-4" /> Refresh
          </button>
          <button
            type="button"
            onClick={exportToExcel}
            className="inline-flex items-center gap-2 rounded bg-yellow-400 px-4 py-2 font-semibold text-black transition hover:bg-yellow-500"
          >
            <Download className="h-4 w-4" /> Export to Excel
          </button>
        </div>
      </div>

      {loading ? (
        <div className="text-center text-yellow-400">Loading leads...</div>
      ) : (
        <>
          <div className="overflow-x-auto">
            <table className="min-w-full rounded-xl bg-[#18181b]">
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
                        onChange={(event) => updateLead(lead._id, 'called', event.target.value)}
                        className="rounded border border-yellow-400 bg-black px-2 py-1 text-yellow-400"
                      >
                        {calledOptions.map((option) => (
                          <option key={option} value={option}>
                            {option}
                          </option>
                        ))}
                      </select>
                    </td>
                    <td className="px-4 py-2">
                      <select
                        value={lead.interested || 'Not Yet'}
                        onChange={(event) => updateLead(lead._id, 'interested', event.target.value)}
                        className="rounded border border-yellow-400 bg-black px-2 py-1 text-yellow-400"
                      >
                        {interestedOptions.map((option) => (
                          <option key={option} value={option}>
                            {option}
                          </option>
                        ))}
                      </select>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {leads.length === 0 ? (
            <div className="mt-8 text-center text-white/60">No leads found.</div>
          ) : null}

          <div className="mt-6 flex items-center justify-between">
            <button
              type="button"
              onClick={() => setCurrentPage((page) => Math.max(1, page - 1))}
              disabled={currentPage === 1}
              className="rounded bg-yellow-400 px-4 py-2 font-semibold text-black transition hover:bg-yellow-500 disabled:opacity-50"
            >
              Previous
            </button>
            <div className="text-white">
              Page {currentPage} of {totalPages}
            </div>
            <button
              type="button"
              onClick={() => setCurrentPage((page) => Math.min(totalPages, page + 1))}
              disabled={currentPage === totalPages}
              className="rounded bg-yellow-400 px-4 py-2 font-semibold text-black transition hover:bg-yellow-500 disabled:opacity-50"
            >
              Next
            </button>
          </div>
        </>
      )}
    </div>
  );
}
