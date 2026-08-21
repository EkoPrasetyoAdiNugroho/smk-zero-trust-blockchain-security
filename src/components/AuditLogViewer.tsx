import React, { useState, useEffect } from 'react';
import {
  Layers,
  ShieldAlert,
  AlertTriangle,
  Info,
  RefreshCw,
  Search,
  Download,
  Filter,
} from 'lucide-react';
import { api } from '../api';
import { AuditLog } from '../types';

export const AuditLogViewer: React.FC = () => {
  const [logs, setLogs] = useState<AuditLog[]>([]);
  const [loading, setLoading] = useState(true);
  const [severityFilter, setSeverityFilter] = useState('ALL');
  const [eventTypeFilter, setEventTypeFilter] = useState('ALL');
  const [searchTerm, setSearchTerm] = useState('');

  const fetchLogs = async () => {
    setLoading(true);
    try {
      const res = await api.getAuditLogs({
        severity: severityFilter !== 'ALL' ? severityFilter : undefined,
        eventType: eventTypeFilter !== 'ALL' ? eventTypeFilter : undefined,
      });
      if (res.ok && res.data?.data) {
        setLogs(res.data.data);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchLogs();
  }, [severityFilter, eventTypeFilter]);

  const filteredLogs = logs.filter((log) => {
    if (!searchTerm) return true;
    const term = searchTerm.toLowerCase();
    return (
      log.details.toLowerCase().includes(term) ||
      log.eventType.toLowerCase().includes(term) ||
      log.ipAddress.toLowerCase().includes(term) ||
      (log.actorUsername && log.actorUsername.toLowerCase().includes(term))
    );
  });

  const getSeverityBadge = (severity: string) => {
    switch (severity) {
      case 'CRITICAL':
        return (
          <span className="inline-flex items-center space-x-1 px-2.5 py-0.5 rounded-full bg-rose-50 text-rose-700 border border-rose-200 text-[10px] font-bold font-mono">
            <ShieldAlert className="w-3 h-3" />
            <span>CRITICAL</span>
          </span>
        );
      case 'WARNING':
        return (
          <span className="inline-flex items-center space-x-1 px-2.5 py-0.5 rounded-full bg-amber-50 text-amber-800 border border-amber-200 text-[10px] font-bold font-mono">
            <AlertTriangle className="w-3 h-3" />
            <span>WARNING</span>
          </span>
        );
      default:
        return (
          <span className="inline-flex items-center space-x-1 px-2.5 py-0.5 rounded-full bg-blue-50 text-blue-700 border border-blue-200 text-[10px] font-bold font-mono">
            <Info className="w-3 h-3" />
            <span>INFO</span>
          </span>
        );
    }
  };

  const exportLogsAsJson = () => {
    const dataStr = 'data:text/json;charset=utf-8,' + encodeURIComponent(JSON.stringify(logs, null, 2));
    const downloadAnchor = document.createElement('a');
    downloadAnchor.setAttribute('href', dataStr);
    downloadAnchor.setAttribute('download', `smk_audit_logs_${Date.now()}.json`);
    document.body.appendChild(downloadAnchor);
    downloadAnchor.click();
    downloadAnchor.remove();
  };

  return (
    <div id="audit-log-viewer-section" className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-xl font-bold text-slate-800 flex items-center space-x-2">
            <Layers className="w-5 h-5 text-blue-600" />
            <span>Sistem Audit Trail & Security Event Logs</span>
          </h2>
          <p className="text-xs text-slate-500">
            Pencatatan real-time terhadap seluruh aktivitas autentikasi, otorisasi RBAC, deteksi manipulasi, dan perubahan data
          </p>
        </div>

        <div className="flex items-center space-x-2">
          <button
            onClick={exportLogsAsJson}
            className="px-3 py-2 rounded-xl bg-white border border-slate-200 text-slate-700 hover:text-blue-600 hover:bg-slate-50 text-xs font-semibold flex items-center space-x-1.5 transition-colors shadow-xs"
          >
            <Download className="w-3.5 h-3.5" />
            <span>Ekspor JSON</span>
          </button>
          <button
            onClick={fetchLogs}
            className="p-2 rounded-xl bg-white border border-slate-200 text-slate-600 hover:text-blue-600 hover:bg-slate-50 transition-colors shadow-xs"
            title="Refresh Logs"
          >
            <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
          </button>
        </div>
      </div>

      {/* Filters */}
      <div className="bg-white border border-slate-200 rounded-2xl p-4 flex flex-wrap items-center gap-3 shadow-xs">
        <div className="relative flex-1 min-w-[200px]">
          <input
            type="text"
            placeholder="Cari dalam log (IP, event, aktor, detail)..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3.5 py-2 pl-9 text-xs text-slate-800 placeholder-slate-400 focus:outline-none focus:border-blue-600 font-medium"
          />
          <Search className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
        </div>

        <div className="flex items-center space-x-2">
          <Filter className="w-4 h-4 text-slate-400 shrink-0" />
          <select
            value={severityFilter}
            onChange={(e) => setSeverityFilter(e.target.value)}
            className="bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-xs text-slate-800 focus:outline-none focus:border-blue-600 font-medium"
          >
            <option value="ALL">Semua Tingkat Keparahan</option>
            <option value="CRITICAL">CRITICAL (Ancaman / Pelanggaran)</option>
            <option value="WARNING">WARNING (Peringatan)</option>
            <option value="INFO">INFO (Operasional Normal)</option>
          </select>

          <select
            value={eventTypeFilter}
            onChange={(e) => setEventTypeFilter(e.target.value)}
            className="bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-xs text-slate-800 focus:outline-none focus:border-blue-600 font-medium"
          >
            <option value="ALL">Semua Tipe Event</option>
            <option value="LOGIN_SUCCESS">LOGIN_SUCCESS</option>
            <option value="LOGIN_FAILED">LOGIN_FAILED</option>
            <option value="AUTHZ_DENIED">AUTHZ_DENIED (RBAC/IDOR)</option>
            <option value="TAMPER_DETECTED">TAMPER_DETECTED (Manipulasi)</option>
            <option value="BLOCKCHAIN_ISSUED">BLOCKCHAIN_ISSUED</option>
            <option value="GRADE_UPDATED">GRADE_UPDATED</option>
            <option value="RATE_LIMITED">RATE_LIMITED</option>
          </select>
        </div>
      </div>

      {/* Logs Table */}
      <div className="bg-white border border-slate-200 rounded-2xl overflow-hidden shadow-xs">
        {loading ? (
          <div className="p-12 text-center text-slate-500 flex flex-col items-center space-y-2">
            <RefreshCw className="w-6 h-6 animate-spin text-blue-600" />
            <span className="text-xs">Memuat audit trail...</span>
          </div>
        ) : filteredLogs.length === 0 ? (
          <div className="p-12 text-center text-slate-500 text-xs">
            Tidak ada log aktivitas yang cocok dengan kriteria filter.
          </div>
        ) : (
          <div className="overflow-x-auto max-h-[600px]">
            <table className="w-full text-left text-xs text-slate-700">
              <thead className="bg-slate-50 text-slate-600 uppercase font-semibold border-b border-slate-200 text-[10px] tracking-wider sticky top-0 z-10 backdrop-blur-sm">
                <tr>
                  <th className="px-5 py-3.5">Waktu & Severity</th>
                  <th className="px-5 py-3.5">Event Type & Endpoint</th>
                  <th className="px-5 py-3.5">Aktor & Role</th>
                  <th className="px-5 py-3.5">IP Address</th>
                  <th className="px-5 py-3.5">Detail Peristiwa</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 font-medium font-mono text-[11px]">
                {filteredLogs.map((log) => (
                  <tr key={log.id} className="hover:bg-slate-50/80 transition-colors">
                    <td className="px-5 py-3.5">
                      <div className="text-slate-800 font-sans text-[11px]">
                        {new Date(log.timestamp).toLocaleString('id-ID')}
                      </div>
                      <div className="mt-1">{getSeverityBadge(log.severity)}</div>
                    </td>
                    <td className="px-5 py-3.5">
                      <div className="font-bold text-slate-900 font-mono">{log.eventType}</div>
                      <div className="text-[10px] text-slate-500 truncate max-w-xs">{log.endpoint}</div>
                    </td>
                    <td className="px-5 py-3.5 font-sans">
                      <div className="font-semibold text-slate-800">{log.actorUsername || 'Anonymous'}</div>
                      <div className="text-[10px] text-blue-600 font-mono">{log.actorRole || 'PUBLIC'}</div>
                    </td>
                    <td className="px-5 py-3.5 text-slate-500">{log.ipAddress}</td>
                    <td className="px-5 py-3.5 font-sans text-xs text-slate-700 max-w-md break-words">
                      {log.details}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
};
