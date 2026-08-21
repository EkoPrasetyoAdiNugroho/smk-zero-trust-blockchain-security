import React, { useState, useEffect } from 'react';
import {
  Cpu,
  Layers,
  CheckCircle2,
  RefreshCw,
  Hash,
  Clock,
  Shield,
  FileCheck,
  ChevronRight,
} from 'lucide-react';
import { api } from '../api';
import { BlockchainBlock } from '../types';

interface BlockchainExplorerProps {
  onVerifyHash?: (hash: string) => void;
}

export const BlockchainExplorer: React.FC<BlockchainExplorerProps> = ({ onVerifyHash }) => {
  const [blocks, setBlocks] = useState<BlockchainBlock[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedBlock, setSelectedBlock] = useState<BlockchainBlock | null>(null);

  const fetchBlocks = async () => {
    setLoading(true);
    try {
      const res = await api.getBlockchainBlocks();
      if (res.ok && res.data?.data) {
        setBlocks(res.data.data);
        if (!selectedBlock && res.data.data.length > 0) {
          setSelectedBlock(res.data.data[res.data.data.length - 1]);
        }
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchBlocks();
  }, []);

  return (
    <div id="blockchain-explorer-section" className="space-y-6">
      {/* Top Banner */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-xl font-bold text-slate-800 flex items-center space-x-2">
            <Cpu className="w-5 h-5 text-blue-600" />
            <span>EduChain Blockchain Explorer</span>
          </h2>
          <p className="text-xs text-slate-500">
            Buku besar terdistribusi konsorsium SMK & DUDI — Konsensus QBFT Proof-of-Authority (PoA)
          </p>
        </div>

        <button
          onClick={fetchBlocks}
          className="p-2.5 rounded-xl bg-white border border-slate-200 text-slate-600 hover:text-blue-600 hover:bg-slate-50 transition-colors self-start sm:self-auto flex items-center space-x-1.5 text-xs shadow-xs font-semibold"
        >
          <RefreshCw className={`w-3.5 h-3.5 ${loading ? 'animate-spin' : ''}`} />
          <span>Segarkan Data Blok</span>
        </button>
      </div>

      {/* Network Overview Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-white border border-slate-200 p-4 rounded-2xl shadow-xs">
          <div className="flex items-center space-x-2 text-xs text-slate-500 mb-1">
            <Layers className="w-4 h-4 text-blue-600" />
            <span>Total Blok Tertambang</span>
          </div>
          <p className="text-2xl font-bold font-mono text-slate-800">{blocks.length}</p>
          <p className="text-[10px] text-blue-600 font-medium mt-1">Blok Genesis s/d Blok #{blocks.length - 1}</p>
        </div>

        <div className="bg-white border border-slate-200 p-4 rounded-2xl shadow-xs">
          <div className="flex items-center space-x-2 text-xs text-slate-500 mb-1">
            <Shield className="w-4 h-4 text-blue-600" />
            <span>Mekanisme Konsensus</span>
          </div>
          <p className="text-sm font-bold text-slate-800">QBFT Consortium PoA</p>
          <p className="text-[10px] text-slate-500 mt-1">Finalitas Instan (1-Block Finality)</p>
        </div>

        <div className="bg-white border border-slate-200 p-4 rounded-2xl shadow-xs">
          <div className="flex items-center space-x-2 text-xs text-slate-500 mb-1">
            <FileCheck className="w-4 h-4 text-amber-600" />
            <span>Smart Contract</span>
          </div>
          <p className="text-xs font-mono font-bold text-amber-700 truncate">CertificateRegistry.sol</p>
          <p className="text-[10px] text-slate-500 mt-1">EVM Solidity ^0.8.24</p>
        </div>

        <div className="bg-white border border-slate-200 p-4 rounded-2xl shadow-xs">
          <div className="flex items-center space-x-2 text-xs text-slate-500 mb-1">
            <Cpu className="w-4 h-4 text-emerald-600" />
            <span>Validator Node</span>
          </div>
          <p className="text-xs font-mono font-bold text-emerald-700 truncate">0xConsortiumNode1</p>
          <p className="text-[10px] text-emerald-600 font-medium mt-1">Status: Active & Synced</p>
        </div>
      </div>

      {/* Blocks Visual Pipeline & Inspector */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Block Timeline List */}
        <div className="lg:col-span-1 bg-white border border-slate-200 rounded-2xl p-4 shadow-xs space-y-3">
          <h3 className="text-xs font-bold text-slate-600 uppercase tracking-wider">
            Daftar Blok Rantai (Terbaru → Terlama)
          </h3>
          <div className="space-y-2 max-h-[500px] overflow-y-auto pr-1">
            {blocks
              .slice()
              .reverse()
              .map((b) => {
                const isSelected = selectedBlock?.blockNumber === b.blockNumber;
                return (
                  <div
                    key={b.blockNumber}
                    onClick={() => setSelectedBlock(b)}
                    className={`p-3.5 rounded-xl cursor-pointer border transition-all ${
                      isSelected
                        ? 'bg-blue-50 border-blue-500 text-slate-800 shadow-xs'
                        : 'bg-slate-50 border-slate-200 text-slate-800 hover:border-slate-300'
                    }`}
                  >
                    <div className="flex items-center justify-between mb-1">
                      <span className="font-mono font-bold text-sm text-blue-600">
                        Blok #{b.blockNumber}
                      </span>
                      <span className="text-[10px] text-slate-400 font-mono">
                        {new Date(b.timestamp).toLocaleTimeString('id-ID')}
                      </span>
                    </div>
                    <p className="font-mono text-[10px] text-slate-500 truncate mb-1" title={b.blockHash}>
                      Hash: {b.blockHash}
                    </p>
                    <div className="flex items-center justify-between text-[11px]">
                      <span className="text-slate-500">
                        {b.transactionsCount} Tx | {b.gradeAudits?.length || 0} Grade Audit
                      </span>
                      <ChevronRight className="w-3.5 h-3.5 text-slate-400" />
                    </div>
                  </div>
                );
              })}
          </div>
        </div>

        {/* Block Detail Card */}
        <div className="lg:col-span-2 bg-white border border-slate-200 rounded-2xl p-6 shadow-xs space-y-6">
          {selectedBlock ? (
            <div className="space-y-6">
              <div className="flex items-center justify-between border-b border-slate-200 pb-4">
                <div>
                  <h3 className="text-lg font-bold text-slate-800 flex items-center space-x-2">
                    <Hash className="w-5 h-5 text-blue-600" />
                    <span>Rincian Blok #{selectedBlock.blockNumber}</span>
                  </h3>
                  <p className="text-xs text-slate-400 font-mono">
                    Waktu: {new Date(selectedBlock.timestamp).toLocaleString('id-ID')}
                  </p>
                </div>
                <span className="px-3 py-1 rounded-full bg-emerald-50 text-emerald-700 text-xs font-bold border border-emerald-200">
                  CONFIRMED & IMMUTABLE
                </span>
              </div>

              {/* Block Cryptographic Hashes */}
              <div className="bg-slate-50 p-4 rounded-xl border border-slate-200 space-y-2 text-xs font-mono">
                <div>
                  <span className="text-slate-400 block text-[10px]">CURRENT BLOCK HASH</span>
                  <span className="text-blue-700 font-bold break-all">{selectedBlock.blockHash}</span>
                </div>
                <div>
                  <span className="text-slate-400 block text-[10px]">PREVIOUS BLOCK HASH (CHAIN LINK)</span>
                  <span className="text-slate-600 break-all">{selectedBlock.previousHash}</span>
                </div>
                <div>
                  <span className="text-slate-400 block text-[10px]">MERKLE ROOT HASH</span>
                  <span className="text-amber-700 break-all">{selectedBlock.merkleRoot}</span>
                </div>
              </div>

              {/* Transactions inside this block */}
              <div className="space-y-3">
                <h4 className="text-xs font-bold text-slate-600 uppercase tracking-wider">
                  Transaksi Sertifikat / Ijazah dalam Blok ({selectedBlock.transactions.length})
                </h4>

                {selectedBlock.transactions.length === 0 && selectedBlock.gradeAudits.length === 0 ? (
                  <p className="text-xs text-slate-400 italic">
                    Blok Genesis (Tidak memuat transaksi payload).
                  </p>
                ) : (
                  <div className="space-y-3">
                    {selectedBlock.transactions.map((tx) => (
                      <div
                        key={tx.id}
                        className="bg-slate-50 p-4 rounded-xl border border-slate-200 space-y-2 text-xs"
                      >
                        <div className="flex items-center justify-between">
                          <span className="font-bold text-slate-800 text-sm">{tx.metadata.title}</span>
                          <span className="px-2 py-0.5 rounded bg-blue-50 text-blue-700 text-[10px] font-mono border border-blue-200 font-semibold">
                            {tx.documentType}
                          </span>
                        </div>

                        <div className="grid grid-cols-2 gap-2 text-[11px] text-slate-500">
                          <div>
                            Siswa: <strong className="text-slate-800">{tx.metadata.studentName}</strong>
                          </div>
                          <div>
                            NISN: <strong className="text-blue-700 font-mono">{tx.recipientNisn}</strong>
                          </div>
                          <div>
                            Penerbit: <strong className="text-amber-800">{tx.issuerRole}</strong>
                          </div>
                          <div>
                            No Dok: <strong className="text-slate-800">{tx.metadata.documentNumber}</strong>
                          </div>
                        </div>

                        <div className="pt-2 text-[10px] font-mono text-slate-500 space-y-0.5 break-all border-t border-slate-200">
                          <p>
                            TxHash: <span className="text-blue-700 font-semibold">{tx.transactionHash}</span>
                          </p>
                          <p>
                            DocHash: <span className="text-amber-700">{tx.documentHash}</span>
                          </p>
                          <p>
                            Signature: <span className="text-slate-600">{tx.signature}</span>
                          </p>
                        </div>

                        {onVerifyHash && (
                          <div className="pt-2 flex justify-end">
                            <button
                              onClick={() => onVerifyHash(tx.documentHash)}
                              className="px-3 py-1 bg-white hover:bg-blue-50 text-slate-700 hover:text-blue-700 text-xs font-semibold rounded-lg border border-slate-200 transition-colors"
                            >
                              Verifikasi Dokumen Ini di Portal
                            </button>
                          </div>
                        )}
                      </div>
                    ))}

                    {selectedBlock.gradeAudits?.map((ga) => (
                      <div
                        key={ga.id}
                        className="bg-slate-50 p-4 rounded-xl border border-blue-200 space-y-2 text-xs"
                      >
                        <div className="flex items-center justify-between">
                          <span className="font-bold text-slate-800">Grade Change Audit: {ga.subject}</span>
                          <span className="px-2 py-0.5 rounded bg-blue-50 text-blue-700 text-[10px] font-mono border border-blue-200 font-semibold">
                            SCORE AUDIT
                          </span>
                        </div>
                        <p className="text-slate-700">
                          Siswa: <strong>{ga.studentName}</strong> | Nilai: {ga.oldScore} → {ga.newScore}
                        </p>
                        <p className="text-slate-500 italic text-[11px]">Alasan: "{ga.reason}"</p>
                        <p className="text-[10px] font-mono text-blue-600 break-all">
                          TxHash: {ga.transactionHash}
                        </p>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>
          ) : (
            <div className="p-12 text-center text-slate-400 text-xs">Pilih blok untuk melihat detail.</div>
          )}
        </div>
      </div>
    </div>
  );
};
