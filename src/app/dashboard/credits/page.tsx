"use client";
import { useState, useEffect } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import {
  Search, Plus, RefreshCw, ChevronRight,
  ChevronLeft, CheckCircle2, Wallet, Clock, X, ArrowDownCircle, ArrowUpCircle
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { cn, formatDate } from "@/lib/utils";
import toast from "react-hot-toast";

export default function CreditLedgerPage() {
  const queryClient = useQueryClient();
  const [search, setSearch] = useState("");
  const [showAddCompany, setShowAddCompany] = useState(false);
  const [selectedCompany, setSelectedCompany] = useState<any>(null);
  const [confirmSettle, setConfirmSettle] = useState<{ id: string; all: boolean } | null>(null);
  const [user, setUser] = useState({ id: "", businessName: "" });
  // Filter tabs in directory: ALL | LINA | DINA
  const [dirFilter, setDirFilter] = useState<"ALL" | "LINA" | "DINA">("ALL");

  useEffect(() => {
    const stored = localStorage.getItem("biztrack_user");
    if (stored) setUser(JSON.parse(stored));
  }, []);

  const { data: credits, status, refetch, isFetching } = useQuery({
    queryKey: ["customer-credits", user.id],
    queryFn: () => fetch(`/api/credits?userId=${user.id}`).then(r => r.json()),
    enabled: !!user.id,
  });

  const { data: ledgerData, isFetching: isFetchingLedger } = useQuery({
    queryKey: ["company-ledger", selectedCompany?.id],
    queryFn: () => fetch(`/api/records?creditId=${selectedCompany.id}`).then(r => r.json()),
    enabled: !!selectedCompany,
  });

  const settleMutation = useMutation({
    mutationFn: async (vars: { id: string; all: boolean }) => {
      const url = vars.all
        ? `/api/credits/settle-all?id=${vars.id}`
        : `/api/records/settle?id=${vars.id}`;
      const res = await fetch(url, { method: "POST" });
      if (!res.ok) throw new Error();
      return res.json();
    },
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ["customer-credits"] });
      queryClient.invalidateQueries({ queryKey: ["company-ledger"] });
      if (variables.all) setSelectedCompany((p: any) => ({ ...p, linaAmount: 0, dinaAmount: 0, totalAmount: 0 }));
      toast.success("भुक्तानी गरियो ✓");
      setConfirmSettle(null);
    },
    onError: () => toast.error("भुक्तानी असफल"),
  });

  const addCompanyMutation = useMutation({
    mutationFn: async (data: { name: string; phone: string }) => {
      const res = await fetch("/api/credits", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ customerName: data.name, customerPhone: data.phone }),
      });
      if (!res.ok) throw new Error();
      return res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["customer-credits"] });
      toast.success("खाता बनाइयो");
      setShowAddCompany(false);
    },
  });

  const filtered = credits?.filter((c: any) => {
    const matchSearch = c.customerName.toLowerCase().includes(search.toLowerCase());
    if (dirFilter === "LINA") return matchSearch && c.linaAmount > 0;
    if (dirFilter === "DINA") return matchSearch && c.dinaAmount > 0;
    return matchSearch;
  });

  // Aggregate totals
  const totalLina = credits?.reduce((a: number, c: any) => a + (c.linaAmount ?? 0), 0) ?? 0;
  const totalDina = credits?.reduce((a: number, c: any) => a + (c.dinaAmount ?? 0), 0) ?? 0;

  return (
    <div className="px-5 pt-10 pb-32 space-y-6 min-h-screen bg-[#F2F2F7]">
      <AnimatePresence mode="wait">
        {!selectedCompany ? (
          /* ── DIRECTORY ── */
          <motion.div
            key="directory"
            initial={{ opacity: 0, x: -15 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -15 }}
            className="space-y-6"
          >
            <header className="flex justify-between items-end px-1">
              <div>
                <h1 className="text-3xl font-black tracking-tighter text-emerald-600 leading-none">उधारो</h1>
                <p className="text-[9px] font-bold text-[#8E8E93] uppercase tracking-[0.12em] mt-1.5">
                  {user.businessName} • Ledger
                </p>
              </div>
              <button onClick={() => refetch()} className="w-10 h-10 rounded-full bg-white shadow-sm flex items-center justify-center active:scale-90 transition-transform">
                <RefreshCw size={18} className={cn("text-black", isFetching && "animate-spin text-emerald-500")} />
              </button>
            </header>

            {/* Lina / Dina summary cards */}
            <div className="grid grid-cols-2 gap-3">
              <motion.div
                initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}
                className="p-5 bg-white rounded-[22px] shadow-sm"
              >
                <div className="flex items-center gap-1.5 mb-1">
                  <ArrowDownCircle size={14} className="text-emerald-500" />
                  <p className="text-[9px] font-black text-gray-400 uppercase tracking-widest">लिन बाँकी</p>
                </div>
                <h2 className="text-2xl font-black text-emerald-500 tracking-tight">रू {totalLina.toLocaleString()}</h2>
                <p className="text-[8px] text-emerald-400 font-bold uppercase mt-1">हामीले लिनु छ</p>
              </motion.div>

              <motion.div
                initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0, transition: { delay: 0.05 } }}
                className="p-5 bg-white rounded-[22px] shadow-sm"
              >
                <div className="flex items-center gap-1.5 mb-1">
                  <ArrowUpCircle size={14} className="text-red-500" />
                  <p className="text-[9px] font-black text-gray-400 uppercase tracking-widest">दिन बाँकी</p>
                </div>
                <h2 className="text-2xl font-black text-red-500 tracking-tight">रू {totalDina.toLocaleString()}</h2>
                <p className="text-[8px] text-red-400 font-bold uppercase mt-1">हामीले दिनु छ</p>
              </motion.div>
            </div>

            {/* Directory */}
            <div className="space-y-3">
              <div className="flex items-center justify-between px-1">
                <h3 className="text-[10px] font-black text-[#8E8E93] uppercase tracking-[0.15em]">Directory</h3>
                <button
                  onClick={() => setShowAddCompany(true)}
                  className="text-emerald-600 text-[10px] font-black uppercase flex items-center gap-1"
                >
                  <Plus size={14} strokeWidth={3} /> New
                </button>
              </div>

              <div className="bg-white rounded-[18px] px-4 py-2.5 flex items-center gap-3 shadow-sm">
                <Search size={16} className="text-gray-300" />
                <input
                  value={search}
                  onChange={e => setSearch(e.target.value)}
                  placeholder="खोज्नुहोस्..."
                  className="bg-transparent outline-none text-[13px] font-semibold w-full text-black placeholder:text-gray-300"
                />
              </div>

              {/* Filter tabs */}
              <div className="flex gap-2">
                {(["ALL", "LINA", "DINA"] as const).map(f => (
                  <button
                    key={f}
                    onClick={() => setDirFilter(f)}
                    className={cn(
                      "px-3 py-1.5 rounded-xl text-[10px] font-black uppercase tracking-wider transition-all",
                      dirFilter === f
                        ? f === "LINA" ? "bg-emerald-500 text-white" : f === "DINA" ? "bg-red-500 text-white" : "bg-gray-800 text-white"
                        : "bg-white text-gray-400"
                    )}
                  >
                    {f === "ALL" ? "सबै" : f === "LINA" ? "लिन बाँकी" : "दिन बाँकी"}
                  </button>
                ))}
              </div>

              <div className="space-y-2">
                {filtered?.map((company: any) => {
                  const hasLina = (company.linaAmount ?? 0) > 0;
                  const hasDina = (company.dinaAmount ?? 0) > 0;
                  return (
                    <div
                      key={company.id}
                      onClick={() => setSelectedCompany(company)}
                      className="p-3.5 bg-white rounded-[22px] shadow-sm flex items-center justify-between active:scale-[0.98] transition-all"
                    >
                      <div className="flex items-center gap-3">
                        <div className={cn(
                          "w-10 h-10 rounded-full flex items-center justify-center font-black text-sm",
                          hasLina && !hasDina ? "bg-emerald-50 text-emerald-600"
                            : hasDina && !hasLina ? "bg-red-50 text-red-500"
                            : "bg-gray-100 text-gray-500"
                        )}>
                          {company.customerName[0].toUpperCase()}
                        </div>
                        <div>
                          <p className="text-[13px] font-semibold text-black leading-tight">{company.customerName}</p>
                          <div className="flex gap-2 mt-0.5">
                            {hasLina && (
                              <span className="text-[10px] font-bold text-emerald-500">
                                ↓ रू {(company.linaAmount ?? 0).toLocaleString()}
                              </span>
                            )}
                            {hasDina && (
                              <span className="text-[10px] font-bold text-red-500">
                                ↑ रू {(company.dinaAmount ?? 0).toLocaleString()}
                              </span>
                            )}
                            {!hasLina && !hasDina && (
                              <span className="text-[10px] font-bold text-gray-400">सफा खाता</span>
                            )}
                          </div>
                        </div>
                      </div>
                      <ChevronRight size={16} className="text-gray-300" />
                    </div>
                  );
                })}
              </div>
            </div>
          </motion.div>
        ) : (
          /* ── DETAIL LEDGER ── */
          <motion.div
            key="ledger"
            initial={{ opacity: 0, x: 15 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: 15 }}
            className="space-y-6"
          >
            <button
              onClick={() => setSelectedCompany(null)}
              className="flex items-center gap-1 text-emerald-600 font-bold text-[10px] uppercase tracking-wider bg-white py-2 px-4 rounded-full shadow-sm active:scale-95 transition-all"
            >
              <ChevronLeft size={16} strokeWidth={3} /> Directory
            </button>

            {/* Company balance card */}
            <div className="bg-white p-5 rounded-[28px] shadow-sm">
              <h2 className="text-xl font-black tracking-tighter text-black">{selectedCompany.customerName}</h2>
              {selectedCompany.customerPhone && (
                <p className="text-[10px] text-gray-400 font-semibold mt-0.5">{selectedCompany.customerPhone}</p>
              )}

              <div className="grid grid-cols-2 gap-3 mt-4">
                {/* Lina */}
                <div className="bg-emerald-50 rounded-2xl px-4 py-3">
                  <p className="text-[8px] font-black text-emerald-400 uppercase tracking-widest">लिन बाँकी</p>
                  <p className="text-[9px] text-emerald-400 font-semibold">हामीले लिनु छ</p>
                  <p className="text-xl font-black text-emerald-600 mt-1">रू {(selectedCompany.linaAmount ?? 0).toLocaleString()}</p>
                </div>
                {/* Dina */}
                <div className="bg-red-50 rounded-2xl px-4 py-3">
                  <p className="text-[8px] font-black text-red-400 uppercase tracking-widest">दिन बाँकी</p>
                  <p className="text-[9px] text-red-400 font-semibold">हामीले दिनु छ</p>
                  <p className="text-xl font-black text-red-500 mt-1">रू {(selectedCompany.dinaAmount ?? 0).toLocaleString()}</p>
                </div>
              </div>

              {((selectedCompany.linaAmount ?? 0) > 0 || (selectedCompany.dinaAmount ?? 0) > 0) && (
                <button
                  onClick={() => setConfirmSettle({ id: selectedCompany.id, all: true })}
                  className="w-full mt-4 bg-emerald-500 text-white py-3 rounded-2xl text-[11px] font-black uppercase tracking-widest shadow-lg shadow-emerald-100 active:scale-95 transition-all flex items-center justify-center gap-2"
                >
                  <Wallet size={14} /> सबै भुक्तानी गर्नुहोस्
                </button>
              )}
            </div>

            {/* Transaction logs */}
            <div className="space-y-3">
              <div className="flex items-center justify-between px-1">
                <h3 className="text-[10px] font-black text-black uppercase tracking-widest">Transaction Logs</h3>
                <RefreshCw size={14} className={cn("text-gray-400", isFetchingLedger && "animate-spin text-emerald-500")} />
              </div>

              {ledgerData?.records?.map((record: any) => {
                const isLina = record.creditDirection === "LINA" || !record.creditDirection;
                const isSettled = record.status === "SETTLED";
                return (
                  <div key={record.id} className="bg-white p-3.5 rounded-[22px] shadow-sm flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <div className={cn(
                        "w-9 h-9 rounded-full flex items-center justify-center",
                        isSettled ? "bg-gray-100 text-gray-400"
                          : isLina ? "bg-emerald-50 text-emerald-500"
                          : "bg-red-50 text-red-500"
                      )}>
                        {isSettled ? <CheckCircle2 size={16} /> : isLina ? <ArrowDownCircle size={16} /> : <ArrowUpCircle size={16} />}
                      </div>
                      <div>
                        <p className="text-[13px] font-semibold text-black leading-tight">
                          {record.description || (isLina ? "लिन बाँकी" : "दिन बाँकी")}
                        </p>
                        <div className="flex items-center gap-2 mt-0.5">
                          <span className={cn(
                            "text-[8px] font-black uppercase px-1.5 py-0.5 rounded-md",
                            isLina ? "bg-emerald-50 text-emerald-500" : "bg-red-50 text-red-500"
                          )}>
                            {isLina ? "लिन" : "दिन"}
                          </span>
                          <p className="text-[10px] text-gray-400 font-medium tracking-tight">
                            {formatDate(record.recordedAt, "MMM d, yyyy")}
                          </p>
                        </div>
                      </div>
                    </div>
                    <div className="text-right">
                      <p className={cn("text-[14px] font-bold", isLina ? "text-emerald-500" : "text-red-500")}>
                        रू {record.amount.toLocaleString()}
                      </p>
                      {!isSettled ? (
                        <button
                          onClick={() => setConfirmSettle({ id: record.id, all: false })}
                          className="text-[8px] font-black text-emerald-600 uppercase mt-1 tracking-widest border border-emerald-100 px-2 py-0.5 rounded-lg"
                        >
                          Settle
                        </button>
                      ) : (
                        <span className="text-[8px] font-black text-gray-400 uppercase flex items-center justify-end gap-1 mt-1">
                          Paid <CheckCircle2 size={10} strokeWidth={3} />
                        </span>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Settlement confirm dialog */}
      <AnimatePresence>
        {confirmSettle && (
          <div className="fixed inset-0 z-[200] flex items-center justify-center p-6">
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} onClick={() => setConfirmSettle(null)} className="absolute inset-0 bg-black/40 backdrop-blur-sm" />
            <motion.div initial={{ scale: 0.95, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} exit={{ scale: 0.95, opacity: 0 }} className="relative w-full max-w-[280px] bg-white rounded-[32px] p-6 text-center shadow-2xl">
              <div className="w-12 h-12 bg-emerald-50 text-emerald-600 rounded-full flex items-center justify-center mx-auto mb-4">
                <Wallet size={24} />
              </div>
              <h3 className="text-lg font-black text-black tracking-tight">भुक्तानी गर्ने?</h3>
              <p className="text-[10px] font-bold text-gray-400 mt-2 px-2 uppercase tracking-wide leading-relaxed">
                {confirmSettle.all ? "यस व्यक्तिको सबै बाँकी रकम भुक्तानी गर्ने?" : "यो entry भुक्तानी भयो भनी mark गर्ने?"}
              </p>
              <div className="flex flex-col gap-2 mt-6">
                <button
                  onClick={() => settleMutation.mutate(confirmSettle)}
                  disabled={settleMutation.isPending}
                  className="w-full py-3.5 bg-emerald-500 text-white rounded-xl text-[10px] font-black uppercase tracking-widest shadow-lg shadow-emerald-100 active:scale-95 transition-all"
                >
                  {settleMutation.isPending ? "..." : "पक्का छ"}
                </button>
                <button onClick={() => setConfirmSettle(null)} className="w-full py-2 text-[9px] font-black text-gray-400 uppercase tracking-widest">
                  रद्द गर्नुहोस्
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* Add company modal */}
      <AnimatePresence>
        {showAddCompany && (
          <div className="fixed inset-0 z-[100] flex items-center justify-center p-6">
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} onClick={() => setShowAddCompany(false)} className="absolute inset-0 bg-black/40 backdrop-blur-sm" />
            <motion.div initial={{ scale: 0.95, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} exit={{ scale: 0.95, opacity: 0 }} className="relative w-full max-w-sm bg-white rounded-[32px] p-8 shadow-2xl">
              <div className="flex justify-between items-center mb-6">
                <div>
                  <h2 className="text-xl font-black tracking-tighter">नयाँ खाता</h2>
                  <p className="text-[9px] font-black text-gray-400 uppercase tracking-widest">Register Ledger Account</p>
                </div>
                <button onClick={() => setShowAddCompany(false)} className="w-9 h-9 bg-gray-50 rounded-full flex items-center justify-center text-gray-400">
                  <X size={18} strokeWidth={3} />
                </button>
              </div>
              <form
                onSubmit={e => {
                  e.preventDefault();
                  const fd = new FormData(e.currentTarget);
                  addCompanyMutation.mutate({ name: fd.get("name") as string, phone: fd.get("phone") as string });
                }}
                className="space-y-4"
              >
                <div className="space-y-1">
                  <label className="text-[8px] font-black text-gray-400 uppercase ml-2 tracking-widest">नाम / कम्पनी</label>
                  <input name="name" required placeholder="e.g. राम बहादुर / Agrasar Co-op" className="w-full bg-[#F2F2F7] rounded-xl py-3 px-5 text-[13px] font-semibold placeholder:text-gray-300 outline-none" />
                </div>
                <div className="space-y-1">
                  <label className="text-[8px] font-black text-gray-400 uppercase ml-2 tracking-widest">फोन नम्बर</label>
                  <input name="phone" placeholder="98XXXXXXXX" className="w-full bg-[#F2F2F7] rounded-xl py-3 px-5 text-[13px] font-semibold placeholder:text-gray-300 outline-none" />
                </div>
                <button type="submit" disabled={addCompanyMutation.isPending} className="w-full bg-emerald-500 text-white py-4 rounded-xl font-black text-[10px] uppercase tracking-widest shadow-lg shadow-emerald-100 active:scale-95 transition-all mt-2">
                  {addCompanyMutation.isPending ? "..." : "खाता बनाउनुहोस्"}
                </button>
              </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}