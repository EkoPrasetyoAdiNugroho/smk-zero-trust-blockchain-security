import React, { useState, useEffect } from 'react';
import { X, Award, CheckCircle2, Shield, Printer, ExternalLink } from 'lucide-react';
import QRCode from 'qrcode';
import { DocumentRecord } from '../types';
import { useLanguage } from '../i18n/LanguageContext';

interface CertificateModalProps {
  isOpen: boolean;
  onClose: () => void;
  document: DocumentRecord | any | null;
  onVerifyInPortal?: (hash: string) => void;
}

export const CertificateModal: React.FC<CertificateModalProps> = ({
  isOpen,
  onClose,
  document,
  onVerifyInPortal,
}) => {
  const { t, language } = useLanguage();
  const [qrUrl, setQrUrl] = useState<string>('');

  // Extract normalized fields safely supporting both DocumentRecord & BlockchainRecord
  const fileHash = document?.fileHash || document?.documentHash || '';
  const docTitle =
    document?.title ||
    document?.metadata?.title ||
    (document?.documentType === 'SERTIFIKAT_PKL'
      ? (language === 'id' ? 'Sertifikat Praktik Kerja Lapangan' : 'Industrial Internship Certificate')
      : (language === 'id' ? 'Ijazah Kelulusan SMK' : 'SMK Graduation Diploma'));
  const docNumber =
    document?.documentNumber || document?.metadata?.documentNumber || 'SMK-TKJ/2026/001-IJZ';
  const studentName =
    document?.studentName || document?.metadata?.studentName || (language === 'id' ? 'Peserta Didik' : 'Student Candidate');
  const studentNisn =
    document?.studentNisn || document?.recipientNisn || document?.metadata?.studentNisn || '0051234567';
  const txHash = document?.transactionHash || '';
  const blockNum = document?.blockNumber || 1;
  const docCreatedAt = document?.createdAt || document?.timestamp || new Date().toISOString();
  const docStatus = document?.status || 'ISSUED';
  const isPkl = document?.documentType === 'SERTIFIKAT_PKL';
  const isIjazah = !isPkl && (document?.documentType === 'IJAZAH' || !document?.documentType);

  useEffect(() => {
    if (fileHash) {
      const verifyUrl = `${window.location.origin}/?tab=verify&hash=${fileHash}`;
      QRCode.toDataURL(verifyUrl, { width: 140, margin: 1 })
        .then((url) => setQrUrl(url))
        .catch(() => setQrUrl(''));
    }
  }, [fileHash]);

  if (!isOpen || !document) return null;

  let formattedDate = language === 'id' ? '29 Juli 2026' : 'July 29, 2026';
  try {
    const d = new Date(docCreatedAt);
    if (!isNaN(d.getTime())) {
      formattedDate = d.toLocaleDateString(language === 'id' ? 'id-ID' : 'en-US', {
        day: 'numeric',
        month: 'long',
        year: 'numeric',
      });
    }
  } catch {
    formattedDate = language === 'id' ? '29 Juli 2026' : 'July 29, 2026';
  }

  return (
    <div
      id="certificate-modal-overlay"
      className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 backdrop-blur-xs p-3 sm:p-6 overflow-y-auto"
      onClick={(e) => {
        if (e.target === e.currentTarget) onClose();
      }}
    >
      <div
        id="certificate-modal-container"
        className="bg-white border border-slate-200 rounded-2xl max-w-3xl w-full my-auto shadow-2xl overflow-hidden flex flex-col text-slate-800 max-h-[92vh]"
      >
        {/* Top Header Bar */}
        <div className="bg-slate-50 px-5 py-3.5 border-b border-slate-200 flex items-center justify-between shrink-0">
          <div className="flex items-center space-x-3">
            <div className="w-8 h-8 rounded-lg bg-blue-50 border border-blue-200 flex items-center justify-center text-blue-600 shrink-0">
              <Award className="w-5 h-5" />
            </div>
            <div>
              <h3 className="font-bold text-slate-900 text-sm truncate max-w-xs sm:max-w-md">
                {language === 'id' ? 'Pratinjau Dokumen Resmi: ' : 'Official Document Preview: '}{docTitle}
              </h3>
              <p className="text-[11px] text-slate-500 font-mono">
                {language === 'id' ? 'No. Dokumen: ' : 'Doc No: '}{docNumber}
              </p>
            </div>
          </div>
          <button
            id="close-cert-modal-btn"
            onClick={onClose}
            className="p-1.5 rounded-lg text-slate-400 hover:text-slate-700 hover:bg-slate-100 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Scrollable Modal Content */}
        <div className="overflow-y-auto flex-1">
          {/* Certificate Paper Canvas */}
          <div className="p-4 sm:p-6 bg-slate-100/70 flex justify-center border-b border-slate-200">
            <div
              id="official-certificate-paper"
              className="w-full max-w-2xl bg-white text-slate-900 rounded-xl p-6 sm:p-8 shadow-md border-4 border-double border-slate-300 relative overflow-hidden font-serif"
            >
              {/* Watermark */}
              <div className="absolute inset-0 pointer-events-none opacity-5 flex items-center justify-center">
                <Shield className="w-96 h-96 text-blue-600" />
              </div>

              {/* School Header */}
              <div className="text-center border-b-2 border-slate-200 pb-3 mb-5 relative z-10">
                <p className="text-[9px] sm:text-[10px] tracking-[0.2em] uppercase font-sans text-slate-500 font-bold">
                  {language === 'id'
                    ? 'Kementerian Pendidikan Dasar dan Menengah Republik Indonesia'
                    : 'Ministry of Primary and Secondary Education of the Republic of Indonesia'}
                </p>
                <h1 className="text-lg sm:text-xl font-bold text-slate-900 tracking-wide mt-1 uppercase font-serif">
                  SMK NEGERI 1 EDUCHAIN TEKNOLOGI
                </h1>
                <p className="text-[11px] font-sans text-slate-600 mt-0.5 font-medium">
                  {language === 'id' ? 'Kompetensi Keahlian: ' : 'Vocational Major: '}{document?.metadata?.major || 'Teknik Komputer dan Jaringan'}
                </p>
                <p className="text-[10px] font-mono text-blue-700 mt-1 font-bold">
                  {language === 'id' ? 'NOMOR DOKUMEN: ' : 'DOCUMENT NUMBER: '}{docNumber}
                </p>
              </div>

              {/* Main Statement */}
              <div className="text-center my-5 relative z-10 space-y-3">
                <h2 className="text-xl sm:text-2xl font-bold text-slate-900 tracking-widest uppercase underline decoration-slate-300 decoration-1 underline-offset-8">
                  {isIjazah ? (language === 'id' ? 'I J A Z A H' : 'D I P L O M A') : isPkl ? (language === 'id' ? 'SERTIFIKAT PRAKTIK KERJA LAPANGAN' : 'INTERNSHIP CERTIFICATE') : (language === 'id' ? 'TRANSKRIP NILAI' : 'ACADEMIC TRANSCRIPT')}
                </h2>

                <p className="text-xs text-slate-600 italic font-serif max-w-lg mx-auto">
                  {isIjazah
                    ? (language === 'id'
                        ? 'Menyatakan bahwa peserta didik yang tercantum di bawah ini telah menyelesaikan seluruh program pembelajaran dan dinyatakan:'
                        : 'Certifies that the student listed below has completed all educational curriculum programs and is declared:')
                    : isPkl
                    ? (language === 'id'
                        ? 'Menyatakan bahwa peserta didik di bawah ini telah menyelesaikan Praktik Kerja Lapangan dengan hasil memuaskan:'
                        : 'Certifies that the student listed below has successfully completed industrial internship practice with distinction:')
                    : (language === 'id'
                        ? 'Daftar capaian nilai akademik peserta didik selama menempuh pendidikan:'
                        : 'Official academic grade records for the student during their course of study:')}
                </p>

                {/* Student Identity Box */}
                <div className="my-3 py-2 border-y border-slate-200 font-sans">
                  <p className="text-lg sm:text-xl font-bold text-slate-900 font-serif tracking-wide">
                    {studentName}
                  </p>
                  <div className="flex justify-center space-x-6 text-xs text-slate-500 mt-1 font-mono">
                    <span>NISN: <strong className="text-slate-800">{studentNisn}</strong></span>
                    <span>{language === 'id' ? 'Tahun Ajaran: ' : 'Academic Year: '}<strong className="text-slate-800">2025/2026</strong></span>
                  </div>
                </div>

                {isIjazah && (
                  <div className="py-1.5 inline-block px-8 bg-emerald-50 border border-emerald-200 rounded-lg">
                    <span className="text-base sm:text-lg font-bold text-emerald-700 tracking-widest uppercase font-sans">
                      {language === 'id' ? 'L U L U S' : 'G R A D U A T E D'}
                    </span>
                  </div>
                )}

                {isPkl && (
                  <div className="text-xs font-sans text-slate-800 space-y-1">
                    <p>{language === 'id' ? 'Mitra Industri: ' : 'Industrial Partner: '}<strong>{document?.dudiName || document?.metadata?.pklCompany || 'PT Industri Nusantara Tech'}</strong></p>
                    <p>{language === 'id' ? 'Durasi: ' : 'Duration: '}<strong>{document?.metadata?.pklDuration || (language === 'id' ? '6 Bulan (Juli - Desember 2025)' : '6 Months (July - December 2025)')}</strong></p>
                    <p>{language === 'id' ? 'Predikat: ' : 'Grade: '}<strong className="text-emerald-700">{document?.metadata?.pklScore || (language === 'id' ? 'A (Sangat Memuaskan)' : 'A (Distinction)')}</strong></p>
                  </div>
                )}
              </div>

              {/* Footer Signatures & QR Code */}
              <div className="grid grid-cols-2 gap-4 items-end mt-6 pt-3 border-t border-slate-200 font-sans relative z-10">
                {/* QR Code & Blockchain Hash */}
                <div className="flex items-center space-x-2.5">
                  {qrUrl && (
                    <div className="bg-white p-1 rounded border border-slate-200 shadow-xs shrink-0">
                      <img src={qrUrl} alt="Verify QR" className="w-16 h-16 sm:w-20 sm:h-20" />
                    </div>
                  )}
                  <div className="text-[9px] text-slate-800 space-y-0.5 font-mono overflow-hidden">
                    <p className="font-bold flex items-center space-x-1 text-emerald-700">
                      <CheckCircle2 className="w-3 h-3 text-emerald-600 shrink-0" />
                      <span>Blockchain Verified</span>
                    </p>
                    <p className="truncate text-slate-500" title={fileHash}>
                      Hash: {fileHash ? fileHash.slice(0, 14) + '...' : '-'}
                    </p>
                    <p className="text-slate-500">{language === 'id' ? `Blok #${blockNum}` : `Block #${blockNum}`}</p>
                  </div>
                </div>

                {/* Digital Signature Box */}
                <div className="text-center">
                  <p className="text-[10px] text-slate-500">Bandung, {formattedDate}</p>
                  <p className="text-[10px] sm:text-[11px] font-bold text-slate-800 mt-0.5">
                    {isPkl
                      ? (language === 'id' ? 'Pimpinan Mitra Industri DUDI' : 'Director of Industrial Partner')
                      : (language === 'id' ? 'Kepala Sekolah,' : 'School Principal,')}
                  </p>
                  <div className="h-8 flex items-center justify-center my-0.5">
                    <span className="text-[9px] font-mono px-2 py-0.5 bg-blue-50 text-blue-700 border border-blue-200 rounded font-semibold">
                      {language === 'id' ? '[Terkonfirmasi Tanda Tangan Digital]' : '[Digitally Signed & Certified]'}
                    </span>
                  </div>
                  <p className="text-xs font-bold text-slate-900 underline">
                    {document?.authorizedBy || document?.issuedBy || 'Dr. Ir. Hendro Wibowo, M.T.'}
                  </p>
                  <p className="text-[9px] text-slate-500 font-mono">
                    {isPkl ? 'Direktur Talent Development' : 'NIP. 197003151995011002'}
                  </p>
                </div>
              </div>
            </div>
          </div>

          {/* Technical Blockchain Credentials */}
          <div className="bg-slate-50 p-4 sm:p-5 border-t border-slate-200 space-y-3">
            <div className="bg-white p-3.5 rounded-xl border border-slate-200 text-xs font-mono space-y-2">
              <div className="flex items-center justify-between text-slate-500">
                <span className="font-semibold text-slate-800 font-sans">
                  {language === 'id' ? 'Kredensial Keabsahan Blockchain (EduChain)' : 'Blockchain Authenticity Credentials (EduChain)'}
                </span>
                <span className="px-2 py-0.5 rounded-full bg-emerald-50 text-emerald-700 text-[10px] font-bold border border-emerald-200 font-sans">
                  STATUS: {docStatus}
                </span>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-2 pt-1 text-[11px]">
                <div>
                  <span className="text-slate-500">Digest SHA-256: </span>
                  <span className="text-blue-700 break-all font-semibold">{fileHash || '-'}</span>
                </div>
                <div>
                  <span className="text-slate-500">Transaction Hash: </span>
                  <span className="text-slate-800 break-all">{txHash || (language === 'id' ? 'Terdaftar pada Block Ledger' : 'Registered on Block Ledger')}</span>
                </div>
              </div>
            </div>

            <div className="flex flex-wrap items-center justify-between gap-3 pt-1">
              <button
                type="button"
                onClick={() => window.print()}
                className="px-4 py-2 rounded-xl bg-white hover:bg-slate-100 text-slate-700 text-xs font-semibold transition-colors flex items-center space-x-2 border border-slate-200 shadow-xs"
              >
                <Printer className="w-4 h-4 text-slate-500" />
                <span>{language === 'id' ? 'Cetak / Simpan PDF' : 'Print / Save as PDF'}</span>
              </button>

              {onVerifyInPortal && fileHash && (
                <button
                  type="button"
                  onClick={() => {
                    onClose();
                    onVerifyInPortal(fileHash);
                  }}
                  className="px-4 py-2 rounded-xl bg-blue-600 hover:bg-blue-700 text-white text-xs font-bold transition-colors flex items-center space-x-2 shadow-md shadow-blue-600/20"
                >
                  <ExternalLink className="w-4 h-4" />
                  <span>{language === 'id' ? 'Uji Verifikasi di Portal Publik' : 'Verify in Public Portal'}</span>
                </button>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
