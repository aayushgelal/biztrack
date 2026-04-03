"use client";
import { useState, useEffect } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { 
  Users, Search, Plus, Phone, RefreshCw, ChevronRight, 
  AlertCircle, Building2, ChevronLeft, CheckCircle2, Wallet, Clock, X
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

  // 2. Fetch Individual Ledger (Only when a company is selected)
  const { data: ledgerData, isFetching: isFetchingLedger } = useQuery({
    queryKey: ["company-ledger", selectedCompany?.id],
    queryFn: () => fetch(`/api/records?creditId=${selectedCompany.id}`).then(res => res.json()),
    enabled: !!selectedCompany,
  });

  // 3. Settlement Mutation
  const settleMutation = useMutation({
    mutationFn: async (vars: { id: string, all: boolean }) => {
      const url = vars.all ? `/api/credits/settle-all?id=${vars.id}` : `/api/records/settle?id=${vars.id}`;
      const res = await fetch(url, { method: "POST" });
      if (!res.ok) throw new Error();
      return res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["customer-credits"] });
      queryClient.invalidateQueries({ queryKey: ["company-ledger"] });
      toast.success("Accounts Synchronized");
      setConfirmSettle(null);
    },
    onError: () => toast.error("Settlement failed")
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

            <motion.div className="ios-card p-7 bg-white shadow-[0_20px_50px_rgba(0,0,0,0.04)] border-none">
              <p className="text-black text-[11px] font-bold uppercase tracking-widest">Total Credit (Receivable)</p>
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
                    layoutId={company.id} key={company.id} onClick={() => setSelectedCompany(company)}
                    className="ios-card p-5 bg-white shadow-sm flex items-center justify-between active:scale-95 transition-all"
                  >
                    <div className="flex items-center gap-4">
                      <div className="w-12 h-12 rounded-2xl bg-red-50 text-red-500 flex items-center justify-center font-black text-lg">
                        {company.customerName[0].toUpperCase()}
                      </div>
                      <div>
                        <p className="text-[16px] font-black text-black tracking-tight leading-none">{company.customerName}</p>
                        <p className="text-[10px] font-bold text-gray-400 mt-1.5 uppercase">Owed: <span className="text-red-500 font-black">रू {company.totalAmount}</span></p>
                      </div>
                    </div>
                    <ChevronRight size={18} className="text-gray-300" />
                  </motion.div>
                ))}
              </div>
            </div>
          </motion.div>
        ) : (
          /* STAGE 2: INDIVIDUAL LEDGER VIEW */
          <motion.div 
            key="ledger"
            initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: 20 }}
            className="space-y-6"
          >
            <button onClick={() => setSelectedCompany(null)} className="flex items-center gap-1 text-[#007AFF] font-black text-xs uppercase tracking-widest">
                <ChevronLeft size={18} strokeWidth={3} /> Back to Directory
            </button>

            <div className="flex justify-between items-end bg-white p-7 rounded-[40px] shadow-sm border border-gray-100">
                <div>
                    <h2 className="text-3xl font-black tracking-tighter text-black">{selectedCompany.customerName}</h2>
                    <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest mt-1">Outstanding Balance</p>
                    <p className="text-4xl font-black text-red-500 mt-2">रू {selectedCompany.totalAmount.toLocaleString()}</p>
                </div>
                {selectedCompany.totalAmount > 0 && (
                    <button 
                        onClick={() => setConfirmSettle({ id: selectedCompany.id, all: true })}
                        className="bg-[#34C759] text-white px-4 py-2.5 rounded-2xl text-[10px] font-black uppercase shadow-lg shadow-green-100 active:scale-95 transition-all"
                    >
                        Settle All
                    </button>
                )}
            </div>

            <div className="space-y-3">
                <h3 className="text-xs font-black text-black uppercase tracking-[0.2em] ml-2">Transaction History</h3>
                {ledgerData?.records?.map((record: any) => (
                    <div key={record.id} className="bg-white p-5 rounded-[30px] shadow-sm flex items-center justify-between border border-gray-50/50">
                        <div className="flex items-center gap-4">
                            <div className={cn("w-10 h-10 rounded-xl flex items-center justify-center", record.status === "SETTLED" ? "bg-emerald-50 text-emerald-500" : "bg-red-50 text-red-500")}>
                                {record.status === "SETTLED" ? <CheckCircle2 size={18} /> : <Clock size={18} />}
                            </div>
                            <div>
                                <p className="text-sm font-bold text-black leading-tight">{record.description}</p>
                                <p className="text-[9px] font-black text-gray-400 uppercase tracking-tighter mt-0.5">{formatDate(record.recordedAt, "MMM d, yyyy")}</p>
                            </div>
                        </div>
                        <div className="text-right">
                            <p className="text-md font-black text-red-500">रू {record.amount.toLocaleString()}</p>
                            {record.status !== "SETTLED" ? (
                                <button 
                                    onClick={() => setConfirmSettle({ id: record.id, all: false })}
                                    className="text-[9px] font-black text-[#34C759] uppercase mt-1.5 tracking-widest"
                                >
                                    Settle Now
                                </button>
                            ) : (
                                <span className="text-[9px] font-black text-gray-300 uppercase mt-1.5 tracking-widest flex items-center justify-end gap-1">
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
                <motion.div initial={{ scale: 0.9, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} exit={{ scale: 0.9, opacity: 0 }} className="relative w-full max-w-[300px] bg-white rounded-[40px] p-8 text-center shadow-2xl">
                    <div className="w-14 h-14 bg-emerald-50 text-[#34C759] rounded-full flex items-center justify-center mx-auto mb-4">
                        <Wallet size={28} />
                    </div>
                    <h3 className="text-xl font-black text-black tracking-tight">Confirm Settlement?</h3>
                    <p className="text-[11px] font-bold text-gray-400 mt-2 px-2 leading-relaxed">
                        {confirmSettle.all ? "This will mark the ENTIRE company balance as collected." : "This will mark this specific credit entry as paid."}
                    </p>
                    <div className="flex flex-col gap-2 mt-8">
                        <button 
                            onClick={() => settleMutation.mutate(confirmSettle)}
                            className="w-full py-4 bg-[#34C759] text-white rounded-2xl text-[11px] font-black uppercase tracking-widest shadow-lg shadow-green-100"
                        >
                            Confirm Payment
                        </button>
                        <button onClick={() => setConfirmSettle(null)} className="w-full py-3 text-[10px] font-black text-gray-400 uppercase tracking-widest">
                            Cancel
                        </button>
                    </div>
                </motion.div>
            </div>
        )}
      </AnimatePresence>

      {/* Modal for Adding New Company Profile (Same as before) */}
    </div>
  );
}