"use client";

import { useState, useCallback } from "react";
import {
  registerDomain,
  resolveDomain,
  updateDomain,
  CONTRACT_ADDRESS,
} from "@/hooks/contract";
import { AnimatedCard } from "@/components/ui/animated-card";
import { Spotlight } from "@/components/ui/spotlight";
import { ShimmerButton } from "@/components/ui/shimmer-button";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";

// ── Icons ────────────────────────────────────────────────────

function SpinnerIcon() {
  return (
    <svg className="animate-spin" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
      <path d="M21 12a9 9 0 1 1-6.219-8.56" />
    </svg>
  );
}

function PackageIcon() {
  return (
    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M16.5 9.4 7.55 4.24" />
      <path d="M21 16V8a2 2 0 0 0-1-1.73l-7-4a2 2 0 0 0-2 0l-7 4A2 2 0 0 0 3 8v8a2 2 0 0 0 1 1.73l7 4a2 2 0 0 0 2 0l7-4A2 2 0 0 0 21 16z" />
      <polyline points="3.29 7 12 12 20.71 7" />
      <line x1="12" y1="22" x2="12" y2="12" />
    </svg>
  );
}

function RefreshIcon() {
  return (
    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M3 12a9 9 0 0 1 9-9 9.75 9.75 0 0 1 6.74 2.74L21 8" />
      <path d="M21 3v5h-5" />
      <path d="M21 12a9 9 0 0 1-9 9 9.75 9.75 0 0 1-6.74-2.74L3 16" />
      <path d="M8 16H3v5" />
    </svg>
  );
}

function SearchIcon() {
  return (
    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <circle cx="11" cy="11" r="8" />
      <path d="m21 21-4.3-4.3" />
    </svg>
  );
}

function CheckIcon() {
  return (
    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
      <polyline points="20 6 9 17 4 12" />
    </svg>
  );
}

function AlertIcon() {
  return (
    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <circle cx="12" cy="12" r="10" />
      <line x1="12" y1="8" x2="12" y2="12" />
      <line x1="12" y1="16" x2="12.01" y2="16" />
    </svg>
  );
}

// ── Styled Input ─────────────────────────────────────────────

function Input({
  label,
  ...props
}: { label: string } & React.InputHTMLAttributes<HTMLInputElement>) {
  return (
    <div className="space-y-2">
      <label className="block text-[11px] font-medium uppercase tracking-wider text-white/30">
        {label}
      </label>
      <div className="group rounded-xl border border-white/[0.06] bg-white/[0.02] p-px transition-all focus-within:border-[#7c6cf0]/30 focus-within:shadow-[0_0_20px_rgba(124,108,240,0.08)]">
        <input
          {...props}
          className="w-full rounded-[11px] bg-transparent px-4 py-3 font-mono text-sm text-white/90 placeholder:text-white/15 outline-none"
        />
      </div>
    </div>
  );
}

// ── Method Signature ─────────────────────────────────────────

function MethodSignature({
  name,
  params,
  returns,
  color,
}: {
  name: string;
  params: string;
  returns?: string;
  color: string;
}) {
  return (
    <div className="flex items-center gap-2 rounded-xl border border-white/[0.04] bg-white/[0.02] px-4 py-3 font-mono text-sm">
      <span style={{ color }} className="font-semibold">fn</span>
      <span className="text-white/70">{name}</span>
      <span className="text-white/20 text-xs">{params}</span>
      {returns && (
        <span className="ml-auto text-white/15 text-[10px]">{returns}</span>
      )}
    </div>
  );
}

// ── Main Component ───────────────────────────────────────────

type Tab = "resolve" | "register" | "update";

interface ContractUIProps {
  walletAddress: string | null;
  onConnect: () => void;
  isConnecting: boolean;
}

export default function ContractUI({ walletAddress, onConnect, isConnecting }: ContractUIProps) {
  const [activeTab, setActiveTab] = useState<Tab>("resolve");
  const [error, setError] = useState<string | null>(null);
  const [txStatus, setTxStatus] = useState<string | null>(null);

  const [registerDomainVal, setRegisterDomainVal] = useState("");
  const [registerIp, setRegisterIp] = useState("");
  const [isRegistering, setIsRegistering] = useState(false);

  const [updateDomainVal, setUpdateDomainVal] = useState("");
  const [updateIp, setUpdateIp] = useState("");
  const [isUpdating, setIsUpdating] = useState(false);

  const [resolveDomainVal, setResolveDomainVal] = useState("");
  const [isResolving, setIsResolving] = useState(false);
  const [resolvedIp, setResolvedIp] = useState<string | null>(null);

  const truncate = (addr: string) => `${addr.slice(0, 6)}...${addr.slice(-4)}`;

  const handleRegisterDomain = useCallback(async () => {
    if (!walletAddress) return setError("Connect wallet first");
    if (!registerDomainVal.trim() || !registerIp.trim()) return setError("Fill in all fields");
    setError(null);
    setIsRegistering(true);
    setTxStatus("Awaiting signature...");
    try {
      await registerDomain(walletAddress, registerDomainVal.trim(), registerIp.trim());
      setTxStatus("Domain registered on-chain!");
      setRegisterDomainVal("");
      setRegisterIp("");
      setTimeout(() => setTxStatus(null), 5000);
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : "Transaction failed");
      setTxStatus(null);
    } finally {
      setIsRegistering(false);
    }
  }, [walletAddress, registerDomainVal, registerIp]);

  const handleUpdateDomain = useCallback(async () => {
    if (!walletAddress) return setError("Connect wallet first");
    if (!updateDomainVal.trim() || !updateIp.trim()) return setError("Fill in all fields");
    setError(null);
    setIsUpdating(true);
    setTxStatus("Awaiting signature...");
    try {
      await updateDomain(walletAddress, updateDomainVal.trim(), updateIp.trim());
      setTxStatus("Domain updated on-chain!");
      setUpdateDomainVal("");
      setUpdateIp("");
      setTimeout(() => setTxStatus(null), 5000);
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : "Transaction failed");
      setTxStatus(null);
    } finally {
      setIsUpdating(false);
    }
  }, [walletAddress, updateDomainVal, updateIp]);

  const handleResolveDomain = useCallback(async () => {
    if (!resolveDomainVal.trim()) return setError("Enter a domain name");
    setError(null);
    setIsResolving(true);
    setResolvedIp(null);
    try {
      const result = await resolveDomain(resolveDomainVal.trim(), walletAddress || undefined);
      if (result) {
        setResolvedIp(String(result));
      } else {
        setError("Domain not found");
      }
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : "Query failed");
    } finally {
      setIsResolving(false);
    }
  }, [resolveDomainVal, walletAddress]);

  const tabs: { key: Tab; label: string; icon: React.ReactNode; color: string }[] = [
    { key: "resolve", label: "Resolve", icon: <SearchIcon />, color: "#4fc3f7" },
    { key: "register", label: "Register", icon: <PackageIcon />, color: "#7c6cf0" },
    { key: "update", label: "Update", icon: <RefreshIcon />, color: "#fbbf24" },
  ];

  return (
    <div className="w-full max-w-2xl animate-fade-in-up-delayed">
      {/* Toasts */}
      {error && (
        <div className="mb-4 flex items-start gap-3 rounded-xl border border-[#f87171]/15 bg-[#f87171]/[0.05] px-4 py-3 backdrop-blur-sm animate-slide-down">
          <span className="mt-0.5 text-[#f87171]"><AlertIcon /></span>
          <div className="min-w-0 flex-1">
            <p className="text-sm font-medium text-[#f87171]/90">Error</p>
            <p className="text-xs text-[#f87171]/50 mt-0.5 break-all">{error}</p>
          </div>
          <button onClick={() => setError(null)} className="shrink-0 text-[#f87171]/30 hover:text-[#f87171]/70 text-lg leading-none">&times;</button>
        </div>
      )}

      {txStatus && (
        <div className="mb-4 flex items-center gap-3 rounded-xl border border-[#34d399]/15 bg-[#34d399]/[0.05] px-4 py-3 backdrop-blur-sm shadow-[0_0_30px_rgba(52,211,153,0.05)] animate-slide-down">
          <span className="text-[#34d399]">
            {txStatus.includes("on-chain") || txStatus.includes("updated") ? <CheckIcon /> : <SpinnerIcon />}
          </span>
          <span className="text-sm text-[#34d399]/90">{txStatus}</span>
        </div>
      )}

      {/* Main Card */}
      <Spotlight className="rounded-2xl">
        <AnimatedCard className="p-0" containerClassName="rounded-2xl">
          {/* Header */}
          <div className="flex items-center justify-between border-b border-white/[0.06] px-6 py-4">
            <div className="flex items-center gap-3">
              <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-gradient-to-br from-[#7c6cf0]/20 to-[#4fc3f7]/20 border border-white/[0.06]">
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-[#7c6cf0]">
                  <path d="M14 18V6a2 2 0 0 0-2-2H4a2 2 0 0 0-2 2v11a1 1 0 0 0 1 1h2" />
                  <path d="M15 18H9" />
                  <path d="M19 18h2a1 1 0 0 0 1-1v-3.65a1 1 0 0 0-.22-.624l-3.48-4.35A1 1 0 0 0 17.52 8H14" />
                  <circle cx="17" cy="18" r="2" />
                  <circle cx="7" cy="18" r="2" />
                </svg>
              </div>
              <div>
                <h3 className="text-sm font-semibold text-white/90">Decentralized DNS</h3>
                <p className="text-[10px] text-white/25 font-mono mt-0.5">{truncate(CONTRACT_ADDRESS)}</p>
              </div>
            </div>
            <Badge variant="info" className="text-[10px]">Soroban</Badge>
          </div>

          {/* Tabs */}
          <div className="flex border-b border-white/[0.06] px-2">
            {tabs.map((t) => (
              <button
                key={t.key}
                onClick={() => { setActiveTab(t.key); setError(null); setResolvedIp(null); }}
                className={cn(
                  "relative flex items-center gap-2 px-5 py-3.5 text-sm font-medium transition-all",
                  activeTab === t.key ? "text-white/90" : "text-white/35 hover:text-white/55"
                )}
              >
                <span style={activeTab === t.key ? { color: t.color } : undefined}>{t.icon}</span>
                {t.label}
                {activeTab === t.key && (
                  <span
                    className="absolute bottom-0 left-2 right-2 h-[2px] rounded-full transition-all"
                    style={{ background: `linear-gradient(to right, ${t.color}, ${t.color}66)` }}
                  />
                )}
              </button>
            ))}
          </div>

          {/* Tab Content */}
          <div className="p-6">
            {/* Resolve */}
            {activeTab === "resolve" && (
              <div className="space-y-5">
                <MethodSignature name="resolve" params="(domain: Symbol)" returns="-> Symbol" color="#4fc3f7" />
                <Input label="Domain Name" value={resolveDomainVal} onChange={(e) => setResolveDomainVal(e.target.value)} placeholder="e.g. mysite" />
                <ShimmerButton onClick={handleResolveDomain} disabled={isResolving} shimmerColor="#4fc3f7" className="w-full">
                  {isResolving ? <><SpinnerIcon /> Resolving...</> : <><SearchIcon /> Resolve Domain</>}
                </ShimmerButton>

                {resolvedIp && (
                  <div className="rounded-xl border border-[#34d399]/20 bg-[#34d399]/[0.05] p-4 animate-fade-in-up">
                    <div className="flex items-center justify-between mb-3">
                      <span className="text-[10px] font-medium uppercase tracking-wider text-white/25">Resolved IP</span>
                      <Badge variant="success">
                        <span className="h-1.5 w-1.5 rounded-full bg-[#34d399] mr-1.5" />
                        Found
                      </Badge>
                    </div>
                    <div className="font-mono text-lg text-[#34d399]/90 break-all">{resolvedIp}</div>
                  </div>
                )}
              </div>
            )}

            {/* Register */}
            {activeTab === "register" && (
              <div className="space-y-5">
                <MethodSignature name="register" params="(domain: Symbol, owner: Address, ip: Symbol)" color="#7c6cf0" />
                <Input label="Domain Name" value={registerDomainVal} onChange={(e) => setRegisterDomainVal(e.target.value)} placeholder="e.g. mysite" />
                <Input label="IP Address" value={registerIp} onChange={(e) => setRegisterIp(e.target.value)} placeholder="e.g. 192.168.1.1" />
                {walletAddress ? (
                  <ShimmerButton onClick={handleRegisterDomain} disabled={isRegistering} shimmerColor="#7c6cf0" className="w-full">
                    {isRegistering ? <><SpinnerIcon /> Registering...</> : <><PackageIcon /> Register Domain</>}
                  </ShimmerButton>
                ) : (
                  <button
                    onClick={onConnect}
                    disabled={isConnecting}
                    className="w-full rounded-xl border border-dashed border-[#7c6cf0]/20 bg-[#7c6cf0]/[0.03] py-4 text-sm text-[#7c6cf0]/60 hover:border-[#7c6cf0]/30 hover:text-[#7c6cf0]/80 active:scale-[0.99] transition-all disabled:opacity-50"
                  >
                    Connect wallet to register domains
                  </button>
                )}
              </div>
            )}

            {/* Update */}
            {activeTab === "update" && (
              <div className="space-y-5">
                <MethodSignature name="update" params="(domain: Symbol, owner: Address, new_ip: Symbol)" color="#fbbf24" />
                <Input label="Domain Name" value={updateDomainVal} onChange={(e) => setUpdateDomainVal(e.target.value)} placeholder="e.g. mysite" />
                <Input label="New IP Address" value={updateIp} onChange={(e) => setUpdateIp(e.target.value)} placeholder="e.g. 10.0.0.1" />

                {walletAddress ? (
                  <ShimmerButton onClick={handleUpdateDomain} disabled={isUpdating} shimmerColor="#fbbf24" className="w-full">
                    {isUpdating ? <><SpinnerIcon /> Updating...</> : <><RefreshIcon /> Update Domain IP</>}
                  </ShimmerButton>
                ) : (
                  <button
                    onClick={onConnect}
                    disabled={isConnecting}
                    className="w-full rounded-xl border border-dashed border-[#fbbf24]/20 bg-[#fbbf24]/[0.03] py-4 text-sm text-[#fbbf24]/60 hover:border-[#fbbf24]/30 hover:text-[#fbbfyellow]/80 active:scale-[0.99] transition-all disabled:opacity-50"
                  >
                    Connect wallet to update domains
                  </button>
                )}
              </div>
            )}
          </div>

          {/* Footer */}
          <div className="border-t border-white/[0.04] px-6 py-3 flex items-center justify-between">
            <p className="text-[10px] text-white/15">Decentralized DNS &middot; Soroban</p>
            <div className="flex items-center gap-2">
              <span className="flex items-center gap-1.5">
                <span className="h-1 w-1 rounded-full bg-[#4fc3f7]" />
                <span className="font-mono text-[9px] text-white/15">Resolve</span>
              </span>
              <span className="text-white/10 text-[8px]">&rarr;</span>
              <span className="flex items-center gap-1.5">
                <span className="h-1 w-1 rounded-full bg-[#7c6cf0]" />
                <span className="font-mono text-[9px] text-white/15">Register</span>
              </span>
              <span className="text-white/10 text-[8px]">&rarr;</span>
              <span className="flex items-center gap-1.5">
                <span className="h-1 w-1 rounded-full bg-[#fbbf24]" />
                <span className="font-mono text-[9px] text-white/15">Update</span>
              </span>
            </div>
          </div>
        </AnimatedCard>
      </Spotlight>
    </div>
  );
}
