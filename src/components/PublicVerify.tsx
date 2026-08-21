import React, { useState, useEffect } from 'react';
import {
  ShieldCheck,
  ShieldAlert,
  Search,
  Upload,
  FileCheck,
  CheckCircle2,
  XCircle,
  ExternalLink,
  Cpu,
  AlertTriangle,
  RefreshCw,
  Sparkles,
  Award,
} from 'lucide-react';
import { api, calculateClientSha256, readFileAsArrayBuffer } from '../api';

interface PublicVerifyProps {
  initialHash?: string;
  onOpenPreview?: (record: any) => void;
}

export const PublicVerify: React.FC<PublicVerifyProps> = ({
  initialHash = '',
  onOpenPreview,
}) => {
  const [hashInput, setHashInput] = useState(initialHash);
  const [fileName, setFileName] = useState('');
  const [fileSize, setFileSize] = useState<number | null>(null);
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<any>(null);
  const [computedFileHash, setComputedFileHash] = useState('');

  // Handle auto-verify if hash passed via props or URL params
  useEffect(() => {
    if (initialHash) {
      setHashInput(initialHash);
      handleVerify(initialHash);
    }
  }, [initialHash]);

  const handleVerify = async (hashToVerify?: string) => {
    const targetHash = (hashToVerify || hashInput || '').trim();
    if (!targetHash) return;

    setLoading(true);
    setResult(null);

    try {
      const res = await api.verifyDocumentByHash(targetHash);
      if (res.ok && res.data) {
        setResult(res.data);
      } else {
        setResult({
          status: 'INVALID',
          queriedHash: targetHash,
          error: res.message || 'Dokumen tidak valid atau belum terdaftar di blockchain.',
        });
      }
    } catch (err: any) {
      setResult({
        status: 'INVALID',
        queriedHash: targetHash,
        error: err.message || 'Gagal menghubungi validator blockchain konsorsium.',
      });
    } finally {
      setLoading(false);
    }
  };

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setFileName(file.name);
    setFileSize(file.size);
    setLoading(true);
    setResult(null);

    try {
      const buffer = await readFileAsArrayBuffer(file);
      // Browser-side WebCrypto SHA-256 calculation
      const hash = await calculateClientSha256(buffer);
      setComputedFileHash(hash);
      setHashInput(hash);
      await handleVerify(hash);
    } catch (err: any) {
      alert('Gagal membaca file untuk hashing: ' + err.message);
    } finally {
      setLoading(false);
    }
  };

  const setDemoSample = (type: 'AUTHENTIC_IJAZAH' | 'TAMPERED_IJAZAH' | 'AUTHENTIC_PKL') => {
    let hash = '';
    if (type === 'AUTHENTIC_IJAZAH') {
      hash = 'a3f789bcde41209384756192837465abc12345def67890123456789abcdef012';
      setFileName('Ijazah_SMK_Budi_Santoso_2026.pdf (Sample Dokumen Sah)');
    } else if (type === 'TAMPERED_IJAZAH') {
      // Changed 1 char '2' -> '3' at the end
      hash = 'a3f789bcde41209384756192837465abc12345def67890123456789abcdef013';
      setFileName('Ijazah_SMK_Budi_Santoso_2026_TAMPERED.pdf (Sample Manipulasi 1 Karakter)');
    } else {
      hash = 'b9c8d7e6f5a43210fedcba9876543210fedcba9876543210fedcba9876543210';
      setFileName('Sertifikat_PKL_Budi_Santoso_NusTech.pdf (Sample Mitra DUDI)');
    }

    setComputedFileHash(hash);
    setHashInput(hash);
    handleVerify(hash);
  };

  return (
    <div id="public-verify-portal" className="max-w-5xl mx-auto space-y-8 py-4">
      {/* Header Banner */}
      <div className="text-center space-y-3">
        <div className="inline-flex items-center space-x-2 px-3.5 py-1 rounded-full bg-blue-50 border border-blue-200 text-blue-700 text-xs font-semibold">
          <ShieldCheck className="w-4 h-4 text-blue-600" />
          <span>Portal Verifikasi Publik EduChain</span>
        </div>
        <h1 className="text-3xl font-extrabold text-slate-900 tracking-tight">
          Verifikasi Keabsahan Ijazah & Sertifikat PKL
        </h1>
        <p className="text-sm text-slate-600 max-w-2xl mx-auto leading-relaxed">
          Verifikasi integritas dokumen secara instan tanpa login. Sistem menghitung sidik jari kriptografis SHA-256 langsung di browser Anda dan mencocokkannya dengan buku besar blockchain konsorsium resmi.
        </p>
      </div>

      {/* Tamper Simulator Quick Demo Buttons */}
      <div className="bg-white border border-slate-200 rounded-2xl p-4 shadow-xs">
        <div className="flex items-center space-x-2 mb-3 text-xs font-bold text-blue-700">
          <Sparkles className="w-4 h-4 text-blue-600" />
          <span>Simulasi Uji Klinis Integritas:</span>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
          <button
            id="demo-authentic-btn"
            onClick={() => setDemoSample('AUTHENTIC_IJAZAH')}
            className="px-3.5 py-2.5 rounded-xl bg-emerald-50/70 hover:bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs font-medium transition-all text-left flex items-start space-x-2.5 group"
          >
            <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
            <div>
              <p className="font-bold text-slate-800 group-hover:text-emerald-900">1. Ijazah Sah</p>
              <p className="text-[11px] text-slate-500">Hash SHA-256 identik dengan blockchain</p>
            </div>
          </button>

          <button
            id="demo-tampered-btn"
            onClick={() => setDemoSample('TAMPERED_IJAZAH')}
            className="px-3.5 py-2.5 rounded-xl bg-rose-50/70 hover:bg-rose-50 border border-rose-200 text-rose-800 text-xs font-medium transition-all text-left flex items-start space-x-2.5 group"
          >
            <XCircle className="w-4 h-4 text-rose-600 shrink-0 mt-0.5" />
            <div>
              <p className="font-bold text-slate-800 group-hover:text-rose-900">2. Ijazah Manipulasi</p>
              <p className="text-[11px] text-rose-600">Ubah 1 karakter → terdeteksi palsu!</p>
            </div>
          </button>

          <button
            id="demo-dudi-btn"
            onClick={() => setDemoSample('AUTHENTIC_PKL')}
            className="px-3.5 py-2.5 rounded-xl bg-cyan-50/70 hover:bg-cyan-50 border border-cyan-200 text-cyan-800 text-xs font-medium transition-all text-left flex items-start space-x-2.5 group"
          >
            <Award className="w-4 h-4 text-cyan-600 shrink-0 mt-0.5" />
            <div>
              <p className="font-bold text-slate-800 group-hover:text-cyan-900">3. Sertifikat PKL DUDI</p>
              <p className="text-[11px] text-slate-500">Tanda tangan digital Mitra Industri</p>
            </div>
          </button>
        </div>
      </div>

      {/* Main Verification Input Box */}
      <div className="bg-white border border-slate-200 rounded-2xl p-6 shadow-xs space-y-6">
        {/* Drag-and-drop & File Selector */}
        <div className="border-2 border-dashed border-slate-300 hover:border-blue-500 rounded-xl p-6 text-center bg-slate-50/60 transition-colors relative group">
          <input
            id="public-verify-file-input"
            type="file"
            accept=".pdf,.png,.jpg,.jpeg"
            onChange={handleFileUpload}
            className="absolute inset-0 opacity-0 cursor-pointer w-full h-full"
          />
          <div className="flex flex-col items-center space-y-2 pointer-events-none">
            <div className="w-12 h-12 rounded-xl bg-blue-50 border border-blue-200 flex items-center justify-center text-blue-600 group-hover:scale-110 transition-transform">
              <Upload className="w-6 h-6" />
            </div>
            <p className="text-sm font-semibold text-slate-800">
              Pilih Dokumen PDF Ijazah atau Sertifikat PKL untuk Dihitung Hash-nya
            </p>
            <p className="text-xs text-slate-500">
              Perhitungan SHA-256 diproses 100% lokal di browser Anda via WebCrypto (Zero Data Upload).
            </p>
            {fileName && (
              <div className="mt-2 inline-flex items-center space-x-2 px-3 py-1 bg-white rounded-lg text-xs font-mono text-blue-700 border border-blue-200 shadow-xs">
                <FileCheck className="w-3.5 h-3.5 text-blue-600" />
                <span>{fileName}</span>
              </div>
            )}
          </div>
        </div>

        <div className="flex items-center space-x-4">
          <div className="h-px bg-slate-200 flex-1" />
          <span className="text-xs font-bold text-slate-400 uppercase">Atau Masukkan Hash Kriptografis</span>
          <div className="h-px bg-slate-200 flex-1" />
        </div>

        {/* Manual Hash Input */}
        <div className="space-y-2">
          <label className="text-xs font-bold text-slate-700">
            Nilai Hash SHA-256 Dokumen (64 Karakter Heksadesimal):
          </label>
          <div className="flex space-x-2">
            <div className="relative flex-1">
              <input
                id="public-verify-hash-input"
                type="text"
                value={hashInput}
                onChange={(e) => setHashInput(e.target.value)}
                placeholder="Contoh: a3f789bcde41209384756192837465abc12345def67890123456789abcdef012"
                className="w-full bg-white border border-slate-300 rounded-xl px-4 py-3 text-xs font-mono text-slate-800 placeholder-slate-400 focus:outline-none focus:border-blue-600 focus:ring-2 focus:ring-blue-600/20 font-medium"
              />
            </div>
            <button
              id="public-verify-submit-btn"
              onClick={() => handleVerify()}
              disabled={loading || !hashInput.trim()}
              className="px-6 py-3 bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs rounded-xl shadow-md shadow-blue-600/20 disabled:opacity-50 transition-all flex items-center space-x-2 shrink-0"
            >
              {loading ? (
                <>
                  <RefreshCw className="w-4 h-4 animate-spin" />
                  <span>Memverifikasi...</span>
                </>
              ) : (
                <>
                  <Search className="w-4 h-4" />
                  <span>Verifikasi Keabsahan</span>
                </>
              )}
            </button>
          </div>
        </div>
      </div>

      {/* Verification Result Display */}
      {result && (
        <div id="verification-result-card" className="space-y-4">
          {result.status === 'VALID' ? (
            /* VALID CERTIFICATE CARD */
            <div className="bg-white border-2 border-emerald-400 rounded-2xl p-6 shadow-xl space-y-6">
              <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 pb-4 border-b border-slate-200">
                <div className="flex items-center space-x-3">
                  <div className="w-12 h-12 rounded-xl bg-emerald-50 border border-emerald-200 flex items-center justify-center text-emerald-600">
                    <ShieldCheck className="w-7 h-7" />
                  </div>
                  <div>
                    <div className="flex items-center space-x-2">
                      <span className="px-2.5 py-0.5 rounded-full bg-emerald-600 text-white font-extrabold text-xs tracking-wider uppercase">
                        DOKUMEN SAH & TERVERIFIKASI
                      </span>
                    </div>
                    <h2 className="text-lg font-bold text-slate-900 mt-1">
                      {result.record?.metadata?.title || 'Ijazah Kelulusan Resmi'}
                    </h2>
                  </div>
                </div>
                {onOpenPreview && (
                  <button
                    onClick={() => onOpenPreview(result.record)}
                    className="px-4 py-2 rounded-xl bg-blue-600 hover:bg-blue-700 text-white text-xs font-semibold transition-colors flex items-center space-x-2 shadow-md shadow-blue-600/20"
                  >
                    <ExternalLink className="w-3.5 h-3.5" />
                    <span>Lihat Pratinjau Dokumen</span>
                  </button>
                )}
              </div>

              {/* Verified Details Grid */}
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 text-xs">
                <div className="bg-slate-50 p-3.5 rounded-xl border border-slate-200 space-y-1">
                  <p className="text-slate-500">Nama Peserta Didik</p>
                  <p className="font-bold text-slate-800 text-sm">
                    {result.record?.metadata?.studentName || '-'}
                  </p>
                </div>
                <div className="bg-slate-50 p-3.5 rounded-xl border border-slate-200 space-y-1">
                  <p className="text-slate-500">Nomor Induk Siswa Nasional (NISN)</p>
                  <p className="font-bold text-blue-700 font-mono text-sm">
                    {result.record?.recipientNisn || '-'}
                  </p>
                </div>
                <div className="bg-slate-50 p-3.5 rounded-xl border border-slate-200 space-y-1">
                  <p className="text-slate-500">Nomor Dokumen Resmi</p>
                  <p className="font-bold text-slate-800 font-mono text-sm">
                    {result.record?.metadata?.documentNumber || '-'}
                  </p>
                </div>
                <div className="bg-slate-50 p-3.5 rounded-xl border border-slate-200 space-y-1">
                  <p className="text-slate-500">Penerbit Dokumen</p>
                  <p className="font-bold text-blue-800">
                    {result.record?.issuerRole === 'DUDI' ? 'Mitra Industri DUDI' : 'Kepala Sekolah SMK'}
                  </p>
                </div>
                <div className="bg-slate-50 p-3.5 rounded-xl border border-slate-200 space-y-1">
                  <p className="text-slate-500">Waktu Penerbitan On-Chain</p>
                  <p className="font-bold text-slate-800 font-mono">
                    {new Date(result.record?.timestamp || Date.now()).toLocaleString('id-ID')}
                  </p>
                </div>
                <div className="bg-slate-50 p-3.5 rounded-xl border border-slate-200 space-y-1">
                  <p className="text-slate-500">Nomor Blok Blockchain</p>
                  <p className="font-bold text-cyan-700 font-mono">
                    Blok #{result.record?.blockNumber || 1}
                  </p>
                </div>
              </div>

              {/* Cryptographic Proof Data */}
              <div className="bg-slate-100 p-4 rounded-xl border border-slate-200 space-y-2 text-[11px] font-mono">
                <p className="text-slate-700 font-semibold flex items-center space-x-1.5">
                  <Cpu className="w-3.5 h-3.5 text-blue-600" />
                  <span>Bukti Kriptografis Smart Contract:</span>
                </p>
                <div className="space-y-1 text-slate-600">
                  <p className="break-all">
                    <span className="text-slate-400">Transaction Hash: </span>
                    <span className="text-emerald-700 font-semibold">{result.record?.transactionHash}</span>
                  </p>
                  <p className="break-all">
                    <span className="text-slate-400">Issuer Address: </span>
                    <span className="text-blue-700 font-semibold">{result.record?.issuerAddress}</span>
                  </p>
                  <p className="break-all">
                    <span className="text-slate-400">Digital Signature: </span>
                    <span className="text-slate-700">{result.record?.signature}</span>
                  </p>
                </div>
              </div>
            </div>
          ) : (
            /* INVALID / FALSIFIED ALERT CARD */
            <div className="bg-rose-50 border-2 border-rose-400 rounded-2xl p-6 shadow-xl space-y-4">
              <div className="flex items-start space-x-4">
                <div className="w-12 h-12 rounded-xl bg-rose-100 border border-rose-200 flex items-center justify-center text-rose-600 shrink-0">
                  <ShieldAlert className="w-7 h-7" />
                </div>
                <div className="space-y-1 flex-1">
                  <div className="inline-block px-3 py-1 rounded-full bg-rose-600 text-white font-extrabold text-xs tracking-wider uppercase shadow-xs">
                    INVALID / FALSIFIED DOCUMENT
                  </div>
                  <h2 className="text-lg font-bold text-rose-950">
                    Peringatan: Dokumen Tidak Terdaftar atau Terindikasi Manipulasi!
                  </h2>
                  <p className="text-xs text-rose-700 leading-relaxed">
                    Hash kriptografis SHA-256 yang diperiksa tidak ditemukan pada buku besar konsorsium blockchain resmi SMK Negeri 1 Educhain Teknologi.
                  </p>
                </div>
              </div>

              <div className="bg-white p-4 rounded-xl border border-rose-200 space-y-2 text-xs">
                <div className="flex items-center space-x-2 text-rose-700 font-semibold">
                  <AlertTriangle className="w-4 h-4 shrink-0" />
                  <span>Penyebab Kemungkinan:</span>
                </div>
                <ul className="list-disc list-inside text-slate-600 text-xs space-y-1 pl-2">
                  <li>Dokumen telah diubah atau dimanipulasi (perubahan 1 karakter/titik/nilai mengubah 100% hash SHA-256).</li>
                  <li>Dokumen belum resmi diterbitkan atau belum ditandatangani oleh Kepala Sekolah / Mitra DUDI.</li>
                  <li>File PDF bukan merupakan terbitan resmi dari Sistem Informasi Administrasi SMK.</li>
                </ul>
                <div className="pt-2 text-[11px] font-mono text-slate-500 break-all">
                  Hash yang diperiksa: <span className="text-rose-600 font-semibold">{result.queriedHash || hashInput}</span>
                </div>
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
};
