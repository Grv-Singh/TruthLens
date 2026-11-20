import React, { useRef, useState } from 'react';
import {
  CheckCircle2,
  Database,
  Fingerprint,
  Lock,
  SearchCheck,
  ShieldAlert,
  ShieldCheck,
  Sparkles,
  Upload,
} from 'lucide-react';
import type { SharedMediaContext, VaultItem, VaultVerifyResult } from '../types/truthlens';
import type { TruthLensClient } from '../lib/api';
import { createDemoImageFile, hexToBits64 } from '../lib/forensics';

interface VaultViewProps {
  client: TruthLensClient;
  sharedMedia: SharedMediaContext;
}

export const VaultView: React.FC<VaultViewProps> = ({ client, sharedMedia }) => {
  const [ownerId, setOwnerId] = useState('ankita.sinha@creator.in');
  const [title, setTitle] = useState('Verified Official Portrait — Origin Vault Proof');
  const [registerFile, setRegisterFile] = useState<File | null>(sharedMedia.file);
  const [registering, setRegistering] = useState(false);
  const [lastRegistered, setLastRegistered] = useState<VaultItem | null>(null);

  const [verifying, setVerifying] = useState(false);
  const [verifyResult, setVerifyResult] = useState<VaultVerifyResult | null>(null);

  const regInputRef = useRef<HTMLInputElement>(null);
  const verInputRef = useRef<HTMLInputElement>(null);

  const handleRegister = async (fileToUse?: File) => {
    const file = fileToUse ?? registerFile ?? (await createDemoImageFile('authentic-portrait'));
    setRegisterFile(file);
    setRegistering(true);
    try {
      const { item } = await client.registerVault(file, ownerId || 'anonymous@truthlens.in', title || file.name);
      setLastRegistered(item);
    } finally {
      setRegistering(false);
    }
  };

  const handleVerify = async (file: File) => {
    setVerifying(true);
    try {
      const res = await client.verifyVault(file);
      setVerifyResult(res);
    } finally {
      setVerifying(false);
    }
  };

  // Creates a slightly JPEG-compressed & subtly modified derivative of the latest registered file to demonstrate Hamming <= 10 match!
  const handleSimulateDerivativeMatch = async () => {
    let baseFile = registerFile;
    if (!baseFile) {
      baseFile = await createDemoImageFile('authentic-portrait');
      await handleRegister(baseFile);
    }
    const imgUrl = URL.createObjectURL(baseFile);
    const img = await new Promise<HTMLImageElement>((res, rej) => {
      const i = new Image();
      i.onload = () => res(i);
      i.onerror = rej;
      i.src = imgUrl;
    });
    URL.revokeObjectURL(imgUrl);

    const canvas = document.createElement('canvas');
    canvas.width = img.width;
    canvas.height = img.height;
    const ctx = canvas.getContext('2d')!;
    ctx.drawImage(img, 0, 0);
    // Simulate WhatsApp re-encode + tiny crop/overlay watermark (changes SHA-256 completely, keeps dHash within Hamming <= 10!)
    ctx.fillStyle = 'rgba(244, 63, 94, 0.75)';
    ctx.fillRect(16, canvas.height - 44, 210, 28);
    ctx.fillStyle = '#ffffff';
    ctx.font = 'bold 13px sans-serif';
    ctx.fillText('WHATSAPP RE-ENCODED COPY', 24, canvas.height - 25);

    const blob = await new Promise<Blob>((r) => canvas.toBlob((b) => r(b!), 'image/jpeg', 0.62));
    const derivativeFile = new File([blob], 'whatsapp_compressed_derivative.jpg', {
      type: 'image/jpeg',
    });
    await handleVerify(derivativeFile);
  };

  const queryBits = verifyResult ? hexToBits64(verifyResult.query_dhash) : '';
  const matchBits = verifyResult?.matched_record
    ? hexToBits64(verifyResult.matched_record.dhash)
    : '';

  return (
    <div className="space-y-6">
      <div>
        <div className="flex items-center gap-2 text-xs font-semibold uppercase tracking-wider text-[#10D4A2]">
          <Fingerprint className="h-4 w-4" />
          L1 — At Creation • Origin Derivative Vault (Qdrant Vector DB :6333)
        </div>
        <h2 className="mt-1 font-display text-2xl font-bold text-white">
          Prove What Is REAL Before It Is Faked
        </h2>
        <p className="mt-1 text-sm text-slate-400">
          Registers SHA-256 + 64-bit perceptual dHash into Qdrant collection{' '}
          <code className="text-[#10D4A2]">truthlens_vault</code>. Detects cropped, screenshot,
          KYC-reused, or WhatsApp-compressed derivatives within Hamming distance ≤ 10.
        </p>
      </div>

      <div className="grid gap-6 lg:grid-cols-12">
        {/* Register Panel */}
        <div className="rounded-2xl border border-white/10 bg-[#0b1229]/90 p-5 lg:col-span-6 space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="font-display text-lg font-bold text-white flex items-center gap-2">
              <Lock className="h-5 w-5 text-[#10D4A2]" />
              1. Register Authentic Original
            </h3>
            <code className="rounded bg-white/5 px-2 py-0.5 text-[11px] text-[#10D4A2]">
              POST /api/vault/register
            </code>
          </div>

          <div className="grid gap-3 sm:grid-cols-2">
            <div>
              <label className="block text-xs font-medium text-slate-300">Owner ID / Handle</label>
              <input
                value={ownerId}
                onChange={(e) => setOwnerId(e.target.value)}
                className="mt-1 w-full rounded-xl border border-white/10 bg-[#050919] px-3 py-2 text-sm text-white"
              />
            </div>
            <div>
              <label className="block text-xs font-medium text-slate-300">Asset Title</label>
              <input
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                className="mt-1 w-full rounded-xl border border-white/10 bg-[#050919] px-3 py-2 text-sm text-white"
              />
            </div>
          </div>

          <div
            onClick={() => regInputRef.current?.click()}
            className="cursor-pointer rounded-xl border border-dashed border-white/15 bg-[#050919]/70 p-4 text-center hover:border-[#10D4A2]/50"
          >
            <input
              ref={regInputRef}
              type="file"
              accept="image/*"
              className="hidden"
              onChange={(e) => {
                const f = e.target.files?.[0];
                if (f) setRegisterFile(f);
              }}
            />
            <Upload className="mx-auto h-5 w-5 text-[#10D4A2]" />
            <div className="mt-1 text-xs font-medium text-white">
              {registerFile ? registerFile.name : 'Choose original photo (or auto-use test original)'}
            </div>
          </div>

          <button
            onClick={() => handleRegister()}
            disabled={registering}
            className="w-full inline-flex items-center justify-center gap-2 rounded-xl bg-[#10D4A2] px-4 py-2.5 text-sm font-semibold text-[#050919] hover:bg-[#00e8ac] cursor-pointer"
          >
            <Database className="h-4 w-4" />
            {registering ? 'Hashing & Indexing in Qdrant...' : 'Seal in Origin Derivative Vault'}
          </button>

          {lastRegistered && (
            <div className="rounded-xl border border-[#10D4A2]/35 bg-[#10D4A2]/[0.07] p-3.5 text-xs space-y-1">
              <div className="flex items-center gap-1.5 font-semibold text-[#10D4A2]">
                <CheckCircle2 className="h-4 w-4" />
                Origin Certificate Sealed in truthlens_vault
              </div>
              <div className="font-mono text-[11px] text-slate-200 break-all">
                dHash: <span className="text-[#10D4A2]">{lastRegistered.dhash}</span>
              </div>
              <div className="font-mono text-[10px] text-slate-400 break-all">
                SHA-256: {lastRegistered.sha256}
              </div>
            </div>
          )}
        </div>

        {/* Verify Derivative Panel */}
        <div className="rounded-2xl border border-white/10 bg-[#0b1229]/90 p-5 lg:col-span-6 space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="font-display text-lg font-bold text-white flex items-center gap-2">
              <SearchCheck className="h-5 w-5 text-sky-400" />
              2. Verify Suspect / Derivative Copy
            </h3>
            <code className="rounded bg-white/5 px-2 py-0.5 text-[11px] text-sky-300">
              POST /api/vault/verify
            </code>
          </div>

          <div className="grid gap-3 sm:grid-cols-2">
            <button
              onClick={() => verInputRef.current?.click()}
              className="flex items-center justify-center gap-2 rounded-xl border border-white/15 bg-white/5 px-4 py-3 text-xs font-semibold text-white hover:bg-white/10 cursor-pointer"
            >
              <input
                ref={verInputRef}
                type="file"
                accept="image/*"
                className="hidden"
                onChange={(e) => {
                  const f = e.target.files?.[0];
                  if (f) handleVerify(f);
                }}
              />
              <Upload className="h-4 w-4 text-sky-400" />
              Upload Suspect Image
            </button>

            <button
              onClick={handleSimulateDerivativeMatch}
              disabled={verifying}
              className="flex items-center justify-center gap-2 rounded-xl border border-sky-400/35 bg-sky-500/15 px-4 py-3 text-xs font-semibold text-sky-200 hover:bg-sky-500/25 cursor-pointer"
            >
              <Sparkles className="h-4 w-4 text-sky-300" />
              1-Click Test Compressed Derivative
            </button>
          </div>

          {verifyResult ? (
            <div className="space-y-3">
              <div
                className={`rounded-xl border p-4 ${
                  verifyResult.match_found
                    ? 'border-[#10D4A2]/40 bg-[#10D4A2]/10'
                    : 'border-amber-500/35 bg-amber-500/10'
                }`}
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    {verifyResult.match_found ? (
                      <ShieldCheck className="h-6 w-6 text-[#10D4A2]" />
                    ) : (
                      <ShieldAlert className="h-6 w-6 text-amber-400" />
                    )}
                    <div>
                      <div className="font-display text-base font-bold text-white">
                        {verifyResult.verdict.replace('_', ' ')}
                      </div>
                      <div className="text-xs text-slate-300">
                        {verifyResult.matched_record
                          ? `Owner: ${verifyResult.matched_record.owner_id} (${verifyResult.matched_record.title})`
                          : 'No registered origin within Hamming distance ≤ 10'}
                      </div>
                    </div>
                  </div>
                  <div className="text-right">
                    <div className="font-mono text-xl font-bold text-[#10D4A2] tabular-nums">
                      d = {verifyResult.hamming_distance} / 64
                    </div>
                    <div className="text-[11px] text-slate-300 tabular-nums">
                      {verifyResult.similarity_pct}% perceptual match
                    </div>
                  </div>
                </div>
              </div>

              {/* 64-bit Visual Hamming Distance Matrix */}
              {verifyResult.matched_record && (
                <div className="rounded-xl border border-white/10 bg-[#050919] p-3.5">
                  <div className="mb-2 flex items-center justify-between text-[11px]">
                    <span className="font-semibold text-slate-300">
                      64-Bit Perceptual dHash Bitwise Comparison
                    </span>
                    <span className="font-mono text-[#10D4A2]">
                      Green = Match • Red = Altered Bit (Threshold ≤ 10)
                    </span>
                  </div>
                  <div className="grid grid-cols-16 gap-1">
                    {queryBits.split('').map((bit, i) => {
                      const differs = bit !== matchBits[i];
                      return (
                        <div
                          key={i}
                          title={`Bit ${i}: query=${bit}, vault=${matchBits[i]}`}
                          className={`flex h-5 items-center justify-center rounded font-mono text-[10px] ${
                            differs
                              ? 'bg-rose-500/80 text-white font-bold'
                              : 'bg-[#10D4A2]/20 text-[#10D4A2]'
                          }`}
                        >
                          {bit}
                        </div>
                      );
                    })}
                  </div>
                  <div className="mt-2 flex flex-wrap justify-between gap-2 font-mono text-[10px] text-slate-400">
                    <span>Query dHash: {verifyResult.query_dhash}</span>
                    <span>Vault dHash: {verifyResult.matched_record.dhash}</span>
                  </div>
                </div>
              )}
            </div>
          ) : (
            <div className="rounded-xl border border-white/8 bg-[#050919]/60 p-6 text-center text-xs text-slate-400">
              Click <strong className="text-sky-300">1-Click Test Compressed Derivative</strong> to
              watch TruthLens catch a WhatsApp re-encoded copy whose SHA-256 completely changed, yet
              matches its original owner inside Qdrant via 64-bit dHash!
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
