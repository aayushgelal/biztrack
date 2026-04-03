"use client";
import { useState, useEffect } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { 
  Users, Search, Plus, Phone, RefreshCw, ChevronRight, 
  AlertCircle, ChevronLeft, CheckCircle2, Wallet, Clock, X
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { cn, formatDate } from "@/lib/utils";
import toast from "react-hot-toast";

export default function CreditLedgerPage() {
  const queryClient = useQueryClient();
  const [search, setSearch] = useState("");
  const [showAddCompany, setShowAddCompany] = useState(false);
  const [selectedCompany, setSelectedCompany] = useState<any>(null);
  const [confirmSettle, setConfirmSettle] = useState<{id: string, all: boolean} | null>(null);
  const [user, setUser] = useState({ id: "", businessName: "" });

  useEffect(() => {
    const stored = localStorage.getItem("biztrack_user");
    if (stored) setUser(JSON.parse(stored));
  }, []);

  // 1. Fetch Main Directory
  const { data: credits, status, refetch, isFetching } = useQuery({
    queryKey: ["customer-credits", user.id],
    queryFn: () => fetch(`/api/credits?userId=${user.id}`).then(res => res.json()),
    enabled: !!user.id,
  });

  // 2. Fetch Individual Ledger
  const { data: ledgerData, isFetching: isFetchingLedger } = useQuery({
    queryKey: ["company-ledger", selectedCompany?.id],
    queryFn: () => fetch(`/api/records?creditId=${selectedCompany.id}`).then(res => res.json()),
    enabled: !!selectedCompany,
  });

  // 3. Settlement Mutation with Dynamic Refresh Logic
  const settleMutation = useMutation({
    mutationFn: async (vars: { id: string, all: boolean }) => {
      const url = vars.all ? `/api/credits/settle-all?id=${vars.id}` : `/api/records/settle?id=${vars.id}`;
      const res = await fetch(url, { method: "POST" });
      if (!res.ok) throw new Error();
      return res.json();
    },
    onSuccess: (data, variables) => {
      // Invalidate queries to fetch fresh data for the background
      queryClient.invalidateQueries({ queryKey: ["customer-credits"] });
      queryClient.invalidateQueries({ queryKey: ["company-ledger"] });

      // REFRESH TOTAL DEBT LOCALLY:
      if (variables.all) {
        // If "Settle All", reset state to 0
        setSelectedCompany((prev: any) => ({ ...prev, totalAmount: 0 }));
      } else {
        // If single settlement, subtract that record's amount from the current view
        const recordToSettle = ledgerData?.records?.find((r: any) => r.id === variables.id);
        if (recordToSettle) {
          setSelectedCompany((prev: any) => ({
            ...prev,
            totalAmount: Math.max(0, prev.totalAmount - recordToSettle.amount)
          }));
        }
      }

      toast.success("Accounts Synchronized");
      setConfirmSettle(null);
    },
    onError: () => toast.error("Settlement failed")
  });

  // 4. Add Company Profile Mutation
  const addCompanyMutation = useMutation({
    mutationFn: async (formData: { name: string; phone: string }) => {
      const res = await fetch("/api/credits", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ customerName: formData.name, customerPhone: formData.phone }),
      });
      if (!res.ok) throw new Error();
      return res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["customer-credits"] });
      toast.success("Profile Created");
      setShowAddCompany(false);
    }
  });

  const filteredCredits = credits?.filter((c: any) => 
    c.customerName.toLowerCase().includes(search.toLowerCase())
  );

  const totalOwedOverall = credits?.reduce((acc: number, curr: any) => acc + curr.totalAmount, 0) || 0;

  if (status === "pending" && !user.id) return (
    <div className="min-h-screen bg-[#F2F2F7] flex items-center justify-center">
       <RefreshCw size={32} className="text-[#007AFF] animate-spin" />
    </div>
  );

  return (
    <div className="px-6 pt-12 pb-32 space-y-8 min-h-screen bg-[#F2F2F7]">
      <AnimatePresence mode="wait">
        {!selectedCompany ? (
          /* STAGE 1: DIRECTORY VIEW */
          <motion.div 
            key="directory"
            initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }}
            className="space-y-8"
          >
            <header className="flex justify-between items-center">
              <div>
                <h1 className="text-4xl font-black tracking-tighter text-black">Ledger</h1>
                <p className="text-[10px] font-black text-[#8E8E93] uppercase tracking-[0.15em] mt-0.5">
                  Credit History • {user.businessName}
                </p>
              </div>
              <button onClick={() => refetch()} className="w-11 h-11 rounded-full bg-white shadow-sm flex items-center justify-center">
                <RefreshCw size={20} className={cn("text-black", isFetching && "animate-spin")} />
              </button>
            </header>

            <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="ios-card p-7 bg-white shadow-[0_20px_50px_rgba(0,0,0,0.04)] border-none">
              <div className="flex justify-between items-start mb-1">
                <p className="text-black text-[11px] font-bold uppercase tracking-widest">Total Outstanding</p>
                <div className="px-2 py-0.5 rounded-full bg-red-50 text-red-600 text-[9px] font-black uppercase tracking-tighter">Receivable</div>
              </div>
              <h2 className="text-5xl font-black text-red-500 mt-1">रू {totalOwedOverall.toLocaleString()}</h2>
            </motion.div>

            <div className="space-y-4">
              <div className="flex items-center justify-between px-1">
                <h3 className="text-xs font-black text-black uppercase tracking-[0.2em]">Directory</h3>
                <button onClick={() => setShowAddCompany(true)} className="text-[#007AFF] text-[10px] font-black uppercase flex items-center gap-1">
                  <Plus size={14} strokeWidth={3} /> New Profile
                </button>
              </div>

              <div className="bg-white rounded-2xl px-4 py-3 flex items-center gap-3 shadow-sm border border-gray-100/50">
                <Search size={18} className="text-gray-300" />
                <input 
                  type="text" placeholder="Search customer..." value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  className="bg-transparent border-none outline-none text-sm font-bold w-full text-black placeholder:text-gray-300"
                />
              </div>

              <div className="space-y-3">
                {filteredCredits?.map((company: any) => (
                  <motion.div 
                    layout key={company.id} onClick={() => setSelectedCompany(company)}
                    className="ios-card p-5 bg-white shadow-sm flex items-center justify-between active:scale-[0.98] transition-all"
                  >
                    <div className="flex items-center gap-4">
                      <div className="w-12 h-12 rounded-2xl bg-red-50 text-red-500 flex items-center justify-center font-black text-lg">
                        {company.customerName[0].toUpperCase()}
                      </div>
                      <div>
                        <p className="text-[16px] font-black text-black tracking-tight leading-none">{company.customerName}</p>
                        <p className="text-[10px] font-bold text-gray-400 mt-1.5 uppercase tracking-tighter">Owed: <span className="text-red-500 font-black">रू {company.totalAmount.toLocaleString()}</span></p>
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                        <span className="text-[8px] font-black text-gray-300 uppercase">View</span>
                        <ChevronRight size={18} className="text-gray-300" />
                    </div>
                  </motion.div>
                ))}
              </div>
            </div>
          </motion.div>
        ) : (
          /* STAGE 2: DETAILED COMPANY LEDGER */
          <motion.div 
            key="ledger"
            initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: 20 }}
            className="space-y-6"
          >
            <button onClick={() => setSelectedCompany(null)} className="flex items-center gap-1 text-[#007AFF] font-black text-[10px] uppercase tracking-widest bg-white py-2 px-4 rounded-full shadow-sm active:scale-95 transition-all">
                <ChevronLeft size={16} strokeWidth={3} /> Back to Directory
            </button>

            <div className="flex justify-between items-end bg-white p-7 rounded-[40px] shadow-sm border border-gray-100">
                <div>
                    <h2 className="text-3xl font-black tracking-tighter text-black leading-none">{selectedCompany.customerName}</h2>
                    <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest mt-2 leading-none">Total Debt</p>
                    <p className="text-4xl font-black text-red-500 mt-2 leading-none">रू {selectedCompany.totalAmount.toLocaleString()}</p>
                </div>
                {selectedCompany.totalAmount > 0 && (
                    <button 
                        onClick={() => setConfirmSettle({ id: selectedCompany.id, all: true })}
                        className="bg-[#34C759] text-white px-5 py-3 rounded-2xl text-[10px] font-black uppercase shadow-lg shadow-green-100 active:scale-95 transition-all flex items-center gap-2"
                    >
                        <Wallet size={14} /> Settle All
                    </button>
                )}
            </div>

            <div className="space-y-3">
                <div className="flex items-center justify-between px-2">
                    <h3 className="text-xs font-black text-black uppercase tracking-[0.2em]">Transaction Logs</h3>
                    <RefreshCw size={14} className={cn("text-gray-300", isFetchingLedger && "animate-spin")} />
                </div>
                {ledgerData?.records?.map((record: any) => (
                    <div key={record.id} className="bg-white p-5 rounded-[30px] shadow-sm flex items-center justify-between border border-gray-50/50">
                        <div className="flex items-center gap-4">
                            <div className={cn("w-10 h-10 rounded-xl flex items-center justify-center", record.status === "SETTLED" ? "bg-emerald-50 text-emerald-500" : "bg-red-50 text-red-500 shadow-inner")}>
                                {record.status === "SETTLED" ? <CheckCircle2 size={18} /> : <Clock size={18} />}
                            </div>
                            <div>
                                <p className="text-sm font-bold text-black leading-tight">{record.description || "Counter Order"}</p>
                                <p className="text-[9px] font-black text-gray-400 uppercase tracking-tighter mt-1">{formatDate(record.recordedAt, "MMM d, yyyy")}</p>
                            </div>
                        </div>
                        <div className="text-right">
                            <p className="text-md font-black text-red-500">रू {record.amount.toLocaleString()}</p>
                            {record.status !== "SETTLED" ? (
                                <button 
                                    onClick={() => setConfirmSettle({ id: record.id, all: false })}
                                    className="text-[9px] font-black text-[#34C759] uppercase mt-2 tracking-widest border border-emerald-100 px-3 py-1 rounded-full active:bg-emerald-50 transition-colors"
                                >
                                    Settle Now
                                </button>
                            ) : (
                                <span className="text-[9px] font-black text-[#34C759] uppercase mt-2 tracking-widest flex items-center justify-end gap-1">
                                    Settled <CheckCircle2 size={10} strokeWidth={3} />
                                </span>
                            )}
                        </div>
                    </div>
                ))}
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* DIALOG: SETTLEMENT CONFIRMATION */}
      <AnimatePresence>
        {confirmSettle && (
            <div className="fixed inset-0 z-[200] flex items-center justify-center p-6">
                <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} onClick={() => setConfirmSettle(null)} className="absolute inset-0 bg-black/40 backdrop-blur-sm" />
                <motion.div initial={{ scale: 0.9, opacity: 0, y: 20 }} animate={{ scale: 1, opacity: 1, y: 0 }} exit={{ scale: 0.9, opacity: 0, y: 20 }} className="relative w-full max-w-[300px] bg-white rounded-[40px] p-8 text-center shadow-2xl border border-gray-50">
                    <div className="w-16 h-16 bg-emerald-50 text-[#34C759] rounded-full flex items-center justify-center mx-auto mb-5">
                        <Wallet size={32} />
                    </div>
                    <h3 className="text-xl font-black text-black tracking-tight leading-none">Confirm Payment?</h3>
                    <p className="text-[11px] font-bold text-gray-400 mt-3 px-2 leading-relaxed uppercase tracking-widest">
                        {confirmSettle.all ? "Mark ENTIRE company balance as collected?" : "Mark this specific entry as paid?"}
                    </p>
                    <div className="flex flex-col gap-2 mt-8">
                        <button 
                            onClick={() => settleMutation.mutate(confirmSettle)}
                            disabled={settleMutation.isPending}
                            className="w-full py-4 bg-[#34C759] text-white rounded-[24px] text-[11px] font-black uppercase tracking-widest shadow-xl shadow-green-100 active:scale-95 transition-all"
                        >
                            {settleMutation.isPending ? "Syncing..." : "Confirm Settlement"}
                        </button>
                        <button onClick={() => setConfirmSettle(null)} className="w-full py-3 text-[10px] font-black text-gray-400 uppercase tracking-[0.2em] mt-2">
                            Cancel
                        </button>
                    </div>
                </motion.div>
            </div>
        )}
      </AnimatePresence>

      {/* Modal for Adding New Company Profile */}
      <AnimatePresence>
        {showAddCompany && (
          <div className="fixed inset-0 z-[100] flex items-center justify-center p-6">
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} onClick={() => setShowAddCompany(false)} className="absolute inset-0 bg-black/40 backdrop-blur-sm" />
            <motion.div initial={{ scale: 0.9, opacity: 0, y: 20 }} animate={{ scale: 1, opacity: 1, y: 0 }} exit={{ scale: 0.9, opacity: 0, y: 20 }} className="relative w-full max-w-sm bg-white rounded-[40px] p-8 shadow-2xl">
              <div className="flex justify-between items-center mb-8">
                <div>
                    <h2 className="text-2xl font-black tracking-tighter">New Profile</h2>
                    <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest">Register Ledger Account</p>
                </div>
                <button onClick={() => setShowAddCompany(false)} className="w-10 h-10 bg-gray-50 rounded-full flex items-center justify-center text-gray-400"><XIcon size={20} /></button>
              </div>

              <form onSubmit={(e) => {
                  e.preventDefault();
                  const fd = new FormData(e.currentTarget);
                  addCompanyMutation.mutate({ 
                    name: fd.get("name") as string, 
                    phone: fd.get("phone") as string 
                  });
              }} className="space-y-4">
                <div className="space-y-1">
                    <label className="text-[9px] font-black text-gray-400 uppercase ml-3 tracking-widest leading-none">Legal Name / Company</label>
                    <input name="name" required placeholder="e.g. Agrasar Co-operative" className="w-full bg-[#F2F2F7] border-none rounded-2xl py-4 px-6 text-sm font-bold placeholder:text-gray-300" />
                </div>
                <div className="space-y-1">
                    <label className="text-[9px] font-black text-gray-400 uppercase ml-3 tracking-widest leading-none">Contact Phone</label>
                    <input name="phone" placeholder="98XXXXXXXX" className="w-full bg-[#F2F2F7] border-none rounded-2xl py-4 px-6 text-sm font-bold placeholder:text-gray-300" />
                </div>
                <button type="submit" disabled={addCompanyMutation.isPending} className="w-full bg-[#007AFF] text-white py-5 rounded-[24px] font-black text-xs uppercase tracking-[0.2em] shadow-xl shadow-blue-100 active:scale-95 transition-all mt-4">
                    {addCompanyMutation.isPending ? "Syncing..." : "Create Account"}
                </button>
              </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}

const XIcon = ({ size }: { size: number }) => (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round"><path d="M18 6 6 18"/><path d="m6 6 12 12"/></svg>
);