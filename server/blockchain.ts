import { BlockchainRecord, BlockchainBlock, GradeAudit, DocumentType } from './types.js';
import { computeSha256, computeMerkleRoot, signDocumentHash } from './crypto.js';
import { db } from './db.js';

class BlockchainEngine {
  blocks: BlockchainBlock[] = [];
  recordsByHash: Map<string, BlockchainRecord> = new Map();
  // Authority addresses (simulating Ethereum accounts)
  readonly SCHOOL_ISSUER_ADDRESS = '0x71C7656EC7ab88b098defB751B7401B5f6d8976F';
  readonly DUDI_ISSUER_ADDRESS = '0x2546BcD3c84621e976D8185a91A922aE77ECEc30';
  readonly ZERO_ADDRESS = '0x0000000000000000000000000000000000000000';

  constructor() {
    this.createGenesisBlock();
    this.seedSampleCertificates();
  }

  private createGenesisBlock() {
    const genesisBlock: BlockchainBlock = {
      blockNumber: 0,
      previousHash: '0x0000000000000000000000000000000000000000000000000000000000000000',
      blockHash: '0x3a4f8d9b1c2e5a7f9a8b7c6d5e4f3a2b1c0d9e8f7a6b5c4d3e2f1a0b9c8d7e6f',
      timestamp: 1771234000000,
      merkleRoot: '0x0000000000000000000000000000000000000000000000000000000000000000',
      transactionsCount: 0,
      transactions: [],
      gradeAudits: [],
      miner: '0xConsortiumValidatorNode1',
    };
    this.blocks.push(genesisBlock);
  }

  // Seed sample pre-issued certificates so verify portal works out-of-the-box
  private seedSampleCertificates() {
    // 1. Ijazah Budi Santoso
    const doc1Hash = 'a3f789bcde41209384756192837465abc12345def67890123456789abcdef012';
    const tx1Hash = '0x8f4d92a1c7b3e5f609123456789abcdef0123456789abcdef0123456789abcde';
    const doc1Record: BlockchainRecord = {
      id: 'bc-rec-01',
      documentId: 'doc-seed-01',
      documentHash: doc1Hash,
      transactionHash: tx1Hash,
      blockNumber: 1,
      issuerAddress: this.SCHOOL_ISSUER_ADDRESS,
      issuerRole: 'SEKOLAH',
      recipientNisn: '0051234567',
      documentType: 'IJAZAH',
      timestamp: Date.now() - 86400000 * 20,
      signature: signDocumentHash(doc1Hash),
      status: 'VALID',
      metadata: {
        title: 'Ijazah Kelulusan SMK Negeri 1 Educhain Teknologi',
        studentName: 'Budi Santoso',
        documentNumber: 'SMK-TKJ/2026/001-IJZ',
        academicYear: '2025/2026',
      },
    };
    this.recordsByHash.set(doc1Hash, doc1Record);

    // Save corresponding Document in DB
    db.documents.set('doc-seed-01', {
      id: 'doc-seed-01',
      documentType: 'IJAZAH',
      studentId: 'std-01',
      studentName: 'Budi Santoso',
      studentNisn: '0051234567',
      documentNumber: 'SMK-TKJ/2026/001-IJZ',
      title: 'Ijazah SMK - Budi Santoso (XII TKJ 1)',
      fileName: 'Ijazah_SMK_Budi_Santoso_2026.pdf',
      fileSize: 1048576,
      fileHash: doc1Hash,
      status: 'ISSUED',
      issuedBy: 'Dr. Ir. Hendro Wibowo, M.T.',
      authorizedBy: 'Dr. Ir. Hendro Wibowo, M.T.',
      transactionHash: tx1Hash,
      blockNumber: 1,
      createdAt: new Date(Date.now() - 86400000 * 20).toISOString(),
      updatedAt: new Date(Date.now() - 86400000 * 20).toISOString(),
      metadata: {
        gpa: 93.5,
        major: 'Teknik Komputer dan Jaringan',
        schoolName: 'SMK Negeri 1 Educhain Teknologi',
      },
    });

    // 2. Sertifikat PKL Budi Santoso (Issued by DUDI)
    const doc2Hash = 'b9c8d7e6f5a43210fedcba9876543210fedcba9876543210fedcba9876543210';
    const tx2Hash = '0x1c2b3a4f5e6d7c8b9a0f1e2d3c4b5a6f7e8d9c0b1a2f3e4d5c6b7a8f9e0d1c2b';
    const doc2Record: BlockchainRecord = {
      id: 'bc-rec-02',
      documentId: 'doc-seed-02',
      documentHash: doc2Hash,
      transactionHash: tx2Hash,
      blockNumber: 1,
      issuerAddress: this.DUDI_ISSUER_ADDRESS,
      issuerRole: 'DUDI',
      recipientNisn: '0051234567',
      documentType: 'SERTIFIKAT_PKL',
      timestamp: Date.now() - 86400000 * 15,
      signature: signDocumentHash(doc2Hash),
      status: 'VALID',
      metadata: {
        title: 'Sertifikat Praktik Kerja Lapangan (PKL) - Cloud Security Engineer Intern',
        studentName: 'Budi Santoso',
        documentNumber: 'PKL/NUSTECH/2026/042',
        academicYear: '2025/2026',
      },
    };
    this.recordsByHash.set(doc2Hash, doc2Record);

    db.documents.set('doc-seed-02', {
      id: 'doc-seed-02',
      documentType: 'SERTIFIKAT_PKL',
      studentId: 'std-01',
      studentName: 'Budi Santoso',
      studentNisn: '0051234567',
      documentNumber: 'PKL/NUSTECH/2026/042',
      title: 'Sertifikat PKL - Budi Santoso (PT Industri Nusantara Tech)',
      fileName: 'Sertifikat_PKL_Budi_Santoso_NusTech.pdf',
      fileSize: 845230,
      fileHash: doc2Hash,
      status: 'ISSUED',
      issuedBy: 'Raden Satria, S.T.',
      authorizedBy: 'Raden Satria, S.T.',
      dudiName: 'PT Industri Nusantara Tech',
      transactionHash: tx2Hash,
      blockNumber: 1,
      createdAt: new Date(Date.now() - 86400000 * 15).toISOString(),
      updatedAt: new Date(Date.now() - 86400000 * 15).toISOString(),
      metadata: {
        pklCompany: 'PT Industri Nusantara Tech',
        pklDuration: '6 Bulan (Juli - Desember 2025)',
        pklScore: 'A (Sangat Memuaskan - 96.0)',
      },
    });

    // Mine Block 1 containing seed certificates
    const block1: BlockchainBlock = {
      blockNumber: 1,
      previousHash: this.blocks[0].blockHash,
      blockHash: '0x' + computeSha256(this.blocks[0].blockHash + tx1Hash + tx2Hash),
      timestamp: Date.now() - 86400000 * 15,
      merkleRoot: computeMerkleRoot([tx1Hash, tx2Hash]),
      transactionsCount: 2,
      transactions: [doc1Record, doc2Record],
      gradeAudits: [],
      miner: '0xConsortiumValidatorNode1',
    };
    this.blocks.push(block1);
  }

  // Issue Certificate (Smart contract `issueCertificate` function execution)
  issueCertificate(params: {
    documentId: string;
    documentHash: string;
    recipientNisn: string;
    documentType: DocumentType;
    issuerRole: 'SEKOLAH' | 'DUDI';
    issuerAddress: string;
    metadata: {
      title: string;
      studentName: string;
      documentNumber: string;
      academicYear: string;
    };
  }): { success: boolean; transactionHash?: string; blockNumber?: number; error?: string } {
    const { documentId, documentHash, recipientNisn, documentType, issuerRole, issuerAddress, metadata } = params;

    // Smart Contract Rule 1: Anti-duplicate check
    if (this.recordsByHash.has(documentHash)) {
      return {
        success: false,
        error: 'REVERT: Certificate with this cryptographic hash has already been issued on-chain (Anti-Duplicate Guard)',
      };
    }

    // Smart Contract Rule 2: Issuer Authority Validation
    if (issuerRole === 'DUDI' && documentType !== 'SERTIFIKAT_PKL') {
      return {
        success: false,
        error: 'REVERT: DUDI partner is only authorized to issue SERTIFIKAT_PKL (Role Boundary Guard)',
      };
    }
    if (issuerRole === 'SEKOLAH' && documentType === 'SERTIFIKAT_PKL') {
      return {
        success: false,
        error: 'REVERT: School admin cannot issue DUDI industrial certificate directly without DUDI co-sign',
      };
    }

    // Generate Transaction Hash & Signature
    const now = Date.now();
    const txHash = '0x' + computeSha256(`${documentHash}:${recipientNisn}:${issuerAddress}:${now}`);
    const signature = signDocumentHash(documentHash);

    const record: BlockchainRecord = {
      id: `bc-rec-${Date.now()}`,
      documentId,
      documentHash,
      transactionHash: txHash,
      blockNumber: this.blocks.length,
      issuerAddress,
      issuerRole,
      recipientNisn,
      documentType,
      timestamp: now,
      signature,
      status: 'VALID',
      metadata,
    };

    // Store record
    this.recordsByHash.set(documentHash, record);
    db.blockchainRecords.set(record.id, record);

    // Mine new Block for this transaction
    const prevBlock = this.blocks[this.blocks.length - 1];
    const newBlock: BlockchainBlock = {
      blockNumber: this.blocks.length,
      previousHash: prevBlock.blockHash,
      blockHash: '0x' + computeSha256(prevBlock.blockHash + txHash + now),
      timestamp: now,
      merkleRoot: computeMerkleRoot([txHash]),
      transactionsCount: 1,
      transactions: [record],
      gradeAudits: [],
      miner: '0xConsortiumValidatorNode1',
    };
    this.blocks.push(newBlock);

    return {
      success: true,
      transactionHash: txHash,
      blockNumber: newBlock.blockNumber,
    };
  }

  // Record Grade Change on Blockchain (Audit Trail)
  recordGradeChangeOnChain(gradeAudit: GradeAudit): string {
    const now = Date.now();
    const txHash =
      '0x' +
      computeSha256(
        `GRADE_AUDIT:${gradeAudit.gradeId}:${gradeAudit.studentId}:${gradeAudit.oldScore}->${gradeAudit.newScore}:${now}`
      );
    gradeAudit.transactionHash = txHash;

    const prevBlock = this.blocks[this.blocks.length - 1];
    const newBlock: BlockchainBlock = {
      blockNumber: this.blocks.length,
      previousHash: prevBlock.blockHash,
      blockHash: '0x' + computeSha256(prevBlock.blockHash + txHash + now),
      timestamp: now,
      merkleRoot: computeMerkleRoot([txHash]),
      transactionsCount: 0,
      transactions: [],
      gradeAudits: [gradeAudit],
      miner: '0xConsortiumValidatorNode1',
    };
    this.blocks.push(newBlock);
    return txHash;
  }

  // Verify Certificate by Hash (Public Verifier)
  verifyCertificate(hash: string): {
    status: 'VALID' | 'INVALID / FALSIFIED DOCUMENT';
    record?: BlockchainRecord;
    verificationDetails?: {
      isHashFound: boolean;
      isSignatureValid: boolean;
      blockConfirmed: boolean;
      issuerAddress: string;
      recipientNisn: string;
      documentNumber: string;
      issuedAt: string;
    };
  } {
    const cleanHash = hash.trim().toLowerCase();
    const record = this.recordsByHash.get(cleanHash);

    if (!record || record.status !== 'VALID') {
      return {
        status: 'INVALID / FALSIFIED DOCUMENT',
      };
    }

    return {
      status: 'VALID',
      record,
      verificationDetails: {
        isHashFound: true,
        isSignatureValid: true,
        blockConfirmed: true,
        issuerAddress: record.issuerAddress,
        recipientNisn: record.recipientNisn,
        documentNumber: record.metadata.documentNumber,
        issuedAt: new Date(record.timestamp).toISOString(),
      },
    };
  }

  // Get Transaction details by TxHash or Id
  getTransaction(txIdOrHash: string): BlockchainRecord | undefined {
    for (const record of this.recordsByHash.values()) {
      if (record.id === txIdOrHash || record.transactionHash.toLowerCase() === txIdOrHash.toLowerCase()) {
        return record;
      }
    }
    return undefined;
  }
}

export const blockchain = new BlockchainEngine();
