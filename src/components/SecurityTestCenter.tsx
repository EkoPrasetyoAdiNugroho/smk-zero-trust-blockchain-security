import React, { useState } from 'react';
import {
  ShieldCheck,
  CheckCircle2,
  XCircle,
  Play,
  RefreshCw,
  Cpu,
  Lock,
  FileCheck,
  ChevronDown,
  ChevronUp,
} from 'lucide-react';
import confetti from 'canvas-confetti';
import { api } from '../api';
import { TestResult } from '../types';

export const SecurityTestCenter: React.FC = () => {
  const [running, setRunning] = useState(false);
  const [report, setReport] = useState<{
    summary: { total: number; passed: number; failed: number; timestamp: string };
    results: TestResult[];
  } | null>(null);
  const [expandedTest, setExpandedTest] = useState<string | null>(null);
  const [categoryFilter, setCategoryFilter] = useState('ALL');

  const handleRunTests = async () => {
    setRunning(true);
    try {
      const res = await api.runSecurityTests();
      if (res.ok && res.data) {
        setReport(res.data);
        if (res.data.summary.failed === 0) {
          confetti({
            particleCount: 70,
            spread: 70,
            origin: { y: 0.6 },
          });
        }
      }
    } catch (err) {
      console.error(err);
    } finally {
      setRunning(false);
    }
  };

  const filteredResults = report?.results.filter((t) => {
    if (categoryFilter === 'ALL') return true;
    return t.category === categoryFilter;
  });

  return (
    <div id="security-test-center-section" className="space-y-6">
      {/* Header */}
      <div className="bg-white border border-slate-200 rounded-2xl p-6 shadow-xs flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
        <div className="flex items-center space-x-4">
          <div className="w-12 h-12 rounded-xl bg-blue-50 border border-blue-200 flex items-center justify-center text-blue-600">
            <ShieldCheck className="w-6 h-6" />
          </div>
          <div>
            <div className="flex items-center space-x-2">
              <span className="px-2 py-0.5 rounded-full bg-blue-50 text-blue-700 text-[10px] font-bold border border-blue-200 uppercase">
                Zero Trust Verification Suite
              </span>
            </div>
            <h2 className="text-xl font-bold text-slate-800 mt-0.5">
              Pusat Pengujian Keamanan & Integritas Nyata
            </h2>
            <p className="text-xs text-slate-500">
              Eksekusi nyata terhadap kontrol RBAC/IDOR, SQLi, XSS, kebocoran secret, smart contract guard, audit nilai, dan deteksi manipulasi
            </p>
          </div>
        </div>

        <button
          id="run-all-security-tests-btn"
          onClick={handleRunTests}
          disabled={running}
          className="px-6 py-3 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-extrabold text-xs shadow-md shadow-blue-600/20 disabled:opacity-50 transition-all flex items-center space-x-2 shrink-0"
        >
          {running ? (
            <>
              <RefreshCw className="w-4 h-4 animate-spin" />
              <span>Mengeksekusi Pengujian...</span>
            </>
          ) : (
            <>
              <Play className="w-4 h-4 fill-white" />
              <span>Jalankan Semua Pengujian Keamanan</span>
            </>
          )}
        </button>
      </div>

      {/* Metrics Summary if tested */}
      {report && (
        <div className="grid grid-cols-1 sm:grid-cols-4 gap-4">
          <div className="bg-white border border-slate-200 p-4 rounded-2xl shadow-xs">
            <span className="text-xs text-slate-500 block mb-1">Total Skenario Uji</span>
            <span className="text-2xl font-bold font-mono text-slate-800">{report.summary.total} Test</span>
          </div>

          <div className="bg-white border border-emerald-200 p-4 rounded-2xl shadow-xs">
            <span className="text-xs text-emerald-700 font-semibold block mb-1">Lolos Pengujian</span>
            <span className="text-2xl font-bold font-mono text-emerald-700">
              {report.summary.passed} PASSED
            </span>
          </div>

          <div className="bg-white border border-rose-200 p-4 rounded-2xl shadow-xs">
            <span className="text-xs text-rose-700 font-semibold block mb-1">Gagal Pengujian</span>
            <span className="text-2xl font-bold font-mono text-rose-700">
              {report.summary.failed} FAILED
            </span>
          </div>

          <div className="bg-white border border-slate-200 p-4 rounded-2xl shadow-xs">
            <span className="text-xs text-slate-500 block mb-1">Integritas Keamanan</span>
            <span className="text-2xl font-bold font-mono text-blue-600">
              {Math.round((report.summary.passed / report.summary.total) * 100)}%
            </span>
          </div>
        </div>
      )}

      {/* Filter Tabs */}
      {report && (
        <div className="flex flex-wrap gap-2">
          {['ALL', 'SECURITY', 'BLOCKCHAIN', 'RBAC', 'INTEGRITY'].map((cat) => (
            <button
              key={cat}
              onClick={() => setCategoryFilter(cat)}
              className={`px-3.5 py-1.5 rounded-xl text-xs font-bold transition-all ${
                categoryFilter === cat
                  ? 'bg-blue-600 text-white shadow-md shadow-blue-600/20'
                  : 'bg-white text-slate-600 hover:text-slate-900 border border-slate-200 shadow-xs'
              }`}
            >
              {cat}
            </button>
          ))}
        </div>
      )}

      {/* Test List Accordion */}
      {report ? (
        <div className="space-y-3">
          {filteredResults?.map((test) => {
            const isPassed = test.status === 'PASSED';
            const isExpanded = expandedTest === test.testId;

            return (
              <div
                key={test.testId}
                className={`bg-white border rounded-2xl transition-all overflow-hidden shadow-xs ${
                  isPassed ? 'border-slate-200 hover:border-slate-300' : 'border-rose-200'
                }`}
              >
                <div
                  onClick={() => setExpandedTest(isExpanded ? null : test.testId)}
                  className="p-4 cursor-pointer flex items-center justify-between gap-4"
                >
                  <div className="flex items-center space-x-3">
                    <div
                      className={`w-8 h-8 rounded-lg flex items-center justify-center shrink-0 ${
                        isPassed
                          ? 'bg-emerald-50 text-emerald-700 border border-emerald-200'
                          : 'bg-rose-50 text-rose-700 border border-rose-200'
                      }`}
                    >
                      {isPassed ? <CheckCircle2 className="w-5 h-5" /> : <XCircle className="w-5 h-5" />}
                    </div>

                    <div>
                      <div className="flex items-center space-x-2">
                        <span className="font-mono font-bold text-xs text-blue-600">{test.testId}</span>
                        <span className="text-slate-300">|</span>
                        <span className="font-bold text-slate-800 text-xs">{test.name}</span>
                        <span className="px-2 py-0.5 rounded bg-slate-50 text-[10px] font-mono text-slate-500 border border-slate-200">
                          {test.evidenceId}
                        </span>
                      </div>
                      <p className="text-[11px] text-slate-500 mt-0.5">{test.description}</p>
                    </div>
                  </div>

                  <div className="flex items-center space-x-3 shrink-0">
                    <span className="text-[10px] font-mono text-slate-400">{test.executionTimeMs}ms</span>
                    <span
                      className={`px-2.5 py-0.5 rounded-full text-xs font-bold font-mono ${
                        isPassed
                          ? 'bg-emerald-50 text-emerald-700 border border-emerald-200'
                          : 'bg-rose-50 text-rose-700 border border-rose-200'
                      }`}
                    >
                      {test.status}
                    </span>
                    {isExpanded ? (
                      <ChevronUp className="w-4 h-4 text-slate-400" />
                    ) : (
                      <ChevronDown className="w-4 h-4 text-slate-400" />
                    )}
                  </div>
                </div>

                {isExpanded && (
                  <div className="p-4 bg-slate-50 border-t border-slate-200 space-y-3 text-xs">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                      <div className="bg-white p-3 rounded-xl border border-slate-200 space-y-1">
                        <span className="text-slate-500 font-bold block text-[10px]">
                          EXPECTED OUTCOME (Persyaratan {test.requirementId})
                        </span>
                        <p className="text-emerald-700 font-mono text-[11px] font-semibold">{test.expectedResult}</p>
                      </div>
                      <div className="bg-white p-3 rounded-xl border border-slate-200 space-y-1">
                        <span className="text-slate-500 font-bold block text-[10px]">
                          ACTUAL API & SMART CONTRACT EXECUTION
                        </span>
                        <p className="text-slate-800 font-mono text-[11px]">{test.actualResult}</p>
                      </div>
                    </div>

                    <div className="bg-white p-3 rounded-xl border border-slate-200 text-[11px] font-mono">
                      <span className="text-slate-500 font-bold block mb-1">TECHNICAL AUDIT DETAILS:</span>
                      <pre className="text-slate-800 overflow-x-auto whitespace-pre-wrap">
                        {JSON.stringify(test.details, null, 2)}
                      </pre>
                    </div>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      ) : (
        /* Empty State */
        <div className="bg-white border border-slate-200 rounded-2xl p-12 text-center space-y-4 shadow-xs">
          <div className="w-16 h-16 rounded-2xl bg-blue-50 border border-blue-200 flex items-center justify-center text-blue-600 mx-auto">
            <Lock className="w-8 h-8" />
          </div>
          <div className="max-w-md mx-auto space-y-1">
            <h3 className="text-base font-bold text-slate-800">Suite Pengujian Keamanan Siap Dijalankan</h3>
            <p className="text-xs text-slate-500">
              Klik tombol di atas untuk menjalankan pengujian otomatis terhadap API backend, smart contract anti-duplicate guard, RBAC/IDOR denial, dan verifikasi hash dokumen.
            </p>
          </div>
        </div>
      )}
    </div>
  );
};
