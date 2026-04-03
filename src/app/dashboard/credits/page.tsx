"use client";
import { useState, useEffect } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { 
  Users, Search, Plus, RefreshCw, ChevronRight, 
  ChevronLeft, CheckCircle2, Wallet, Clock, X
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

  const { data: credits, status, refetch, isFetching } = useQuery({
    queryKey: ["customer-credits", user.id],
    queryFn: () => fetch(`/api/credits?userId=${user.id}`).then(res => res.json()),
    enabled: !!user.id,
  });

  const { data: ledgerData, isFetching: isFetchingLedger } = useQuery({
    queryKey: ["company-ledger", selectedCompany?.id],
    queryFn: () => fetch(`/api/records?creditId=${selectedCompany.id}`).then(res => res.json()),
    enabled: !!selectedCompany,
  });

  const settleMutation = useMutation({
    mutationFn: async (vars: { id: string, all: boolean }) => {
      const url = vars.all ? `/api/credits/settle-all?id=${vars.id}` : `/api/records/settle?id=${vars.id}`;
      const res = await fetch(url, { method: "POST" });
      if (!res.ok) throw new Error();
      return res.json();
    },
    onSuccess: (data, variables) => {
      queryClient.invalidateQueries({ queryKey: ["customer-credits"] });
      queryClient.invalidateQueries({ queryKey: ["company-ledger"] });
      if (variables.all) {
        setSelectedCompany((prev: any) => ({ ...prev, totalAmount: 0 }));
      } else {
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
       <RefreshCw size={28} className="text-emerald-500 animate-spin" />
    </div>
  );

  return (
    <div className="px-5 pt-10 pb-32 space-y-6 min-h-screen bg-[#F2F2F7]">
      <AnimatePresence mode="wait">
        {!selectedCompany ? (
          /* STAGE 1: DIRECTORY VIEW */
          <motion.div 
            key="directory"
            initial={{ opacity: 0, x: -15 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -15 }}
            className="space-y-6"
          >
            <header className="flex justify-between items-end px-1">
              <div>
                <h1 className="text-3xl font-black tracking-tighter text-emerald-600 leading-none">Ledger</h1>
                <p className="text-[9px] font-bold text-[#8E8E93] uppercase tracking-[0.12em] mt-1.5">
                  Credit History • Total Receivables
                </p>
              </div>
              <button onClick={() => refetch()} className="w-10 h-10 rounded-full bg-white shadow-sm flex items-center justify-center active:scale-90 transition-transform">
                <RefreshCw size={18} className={cn("text-black", isFetching && "animate-spin text-emerald-500")} />
              </button>
            </header>

            {/* Total receivable card synced with dashboard styles */}
            <div className="p-6 bg-white rounded-[24px] shadow-sm border-none">
              <div className="flex justify-between items-start mb-0.5">
                <p className="text-[#8E8E93] text-[10px] font-bold uppercase tracking-wider">Total Outstanding</p>
                <div className="px-2 py-0.5 rounded-full bg-red-50 text-red-500 text-[8px] font-black uppercase">Udharo</div>
              </div>
              <h2 className="text-4xl font-black text-red-500 tracking-tight">रू {totalOwedOverall.toLocaleString()}</h2>
            </div>

            <div className="space-y-3">
              <div className="flex items-center justify-between px-1">
                <h3 className="text-[10px] font-black text-[#8E8E93] uppercase tracking-[0.15em]">Directory</h3>
                <button onClick={() => setShowAddCompany(true)} className="text-emerald-600 text-[10px] font-black uppercase flex items-center gap-1">
                  <Plus size={14} strokeWidth={3} /> New Profile
                </button>
              </div>

              <div className="bg-white rounded-[18px] px-4 py-2.5 flex items-center gap-3 shadow-sm border border-gray-100/50">
                <Search size={16} className="text-gray-300" />
                <input 
                  type="text" placeholder="Search customer..." value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  className="bg-transparent border-none outline-none text-[13px] font-semibold w-full text-black placeholder:text-gray-300"
                />
              </div>

              <div className="space-y-2">
                {filteredCredits?.map((company: any) => (
                  <div 
                    key={company.id} onClick={() => setSelectedCompany(company)}
                    className="p-3.5 bg-white rounded-[22px] shadow-sm flex items-center justify-between active:scale-[0.98] transition-all"
                  >
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-full bg-red-50 text-red-500 flex items-center justify-center font-black text-sm">
                        {company.customerName[0].toUpperCase()}
                      </div>
                      <div>
                        <p className="text-[13px] font-semibold text-black leading-tight">{company.customerName}</p>
                        <p className="text-[10px] font-medium text-gray-400 mt-0.5">Owed: <span className="text-red-500 font-bold">रू {company.totalAmount.toLocaleString()}</span></p>
                      </div>
                    </div>
                    <ChevronRight size={16} className="text-gray-300" />
                  </div>
                ))}
              </div>
            </div>
          </motion.div>
        ) : (
          /* STAGE 2: DETAILED COMPANY LEDGER */
          <motion.div 
            key="ledger"
            initial={{ opacity: 0, x: 15 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: 15 }}
            className="space-y-6"
          >
            <button onClick={() => setSelectedCompany(null)} className="flex items-center gap-1 text-emerald-600 font-bold text-[10px] uppercase tracking-wider bg-white py-2 px-4 rounded-full shadow-sm active:scale-95 transition-all">
                <ChevronLeft size={16} strokeWidth={3} /> Directory
            </button>

            <div className="flex justify-between items-end bg-white p-6 rounded-[28px] shadow-sm border border-gray-50">
                <div>
                    <h2 className="text-2xl font-black tracking-tighter text-black leading-none">{selectedCompany.customerName}</h2>
                    <p className="text-[9px] font-bold text-gray-400 uppercase tracking-widest mt-2 leading-none">Total Debt</p>
                    <p className="text-3xl font-black text-red-500 mt-2 leading-none">रू {selectedCompany.totalAmount.toLocaleString()}</p>
                </div>
                {selectedCompany.totalAmount > 0 && (
                    <button 
                        onClick={() => setConfirmSettle({ id: selectedCompany.id, all: true })}
                        className="bg-emerald-500 text-white px-4 py-2.5 rounded-xl text-[10px] font-black uppercase shadow-lg shadow-emerald-100 active:scale-95 transition-all flex items-center gap-1.5"
                    >
                        <Wallet size={14} /> Settle
                    </button>
                )}
            </div>

            <div className="space-y-3">
                <div className="flex items-center justify-between px-2 text-emerald-500">
                    <h3 className="text-[10px] font-black uppercase tracking-widest text-black">Transaction Logs</h3>
                    <RefreshCw size={14} className={cn(isFetchingLedger && "animate-spin")} />
                </div>
                {ledgerData?.records?.map((record: any) => (
                    <div key={record.id} className="bg-white p-3.5 rounded-[22px] shadow-sm flex items-center justify-between">
                        <div className="flex items-center gap-3">
                            <div className={cn("w-9 h-9 rounded-full flex items-center justify-center", record.status === "SETTLED" ? "bg-emerald-50 text-emerald-500" : "bg-red-50 text-red-500")}>
                                {record.status === "SETTLED" ? <CheckCircle2 size={16} /> : <Clock size={16} />}
                            </div>
                            <div>
                                <p className="text-[13px] font-semibold text-black leading-tight">{record.description || "Counter Order"}</p>
                                <p className="text-[10px] text-gray-400 font-medium mt-0.5 tracking-tight">{formatDate(record.recordedAt, "MMM d, yyyy")}</p>
                            </div>
                        </div>
                        <div className="text-right">
                            <p className="text-[14px] font-bold text-red-500">रू {record.amount.toLocaleString()}</p>
                            {record.status !== "SETTLED" ? (
                                <button 
                                    onClick={() => setConfirmSettle({ id: record.id, all: false })}
                                    className="text-[8px] font-black text-emerald-600 uppercase mt-1 tracking-widest border border-emerald-100 px-2 py-0.5 rounded-lg"
                                >
                                    Settle
                                </button>
                            ) : (
                                <span className="text-[8px] font-black text-emerald-500 uppercase mt-1 tracking-widest flex items-center justify-end gap-1">
                                    Paid <CheckCircle2 size={10} strokeWidth={3} />
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
                <motion.div initial={{ scale: 0.95, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} exit={{ scale: 0.95, opacity: 0 }} className="relative w-full max-w-[280px] bg-white rounded-[32px] p-6 text-center shadow-2xl">
                    <div className="w-12 h-12 bg-emerald-50 text-emerald-600 rounded-full flex items-center justify-center mx-auto mb-4">
                        <Wallet size={24} />
                    </div>
                    <h3 className="text-lg font-black text-black tracking-tight leading-none">Confirm Payment?</h3>
                    <p className="text-[10px] font-bold text-gray-400 mt-2 px-2 uppercase tracking-wide leading-relaxed">
                        {confirmSettle.all ? "Mark entire company balance as collected?" : "Mark this entry as paid?"}
                    </p>
                    <div className="flex flex-col gap-2 mt-6">
                        <button 
                            onClick={() => settleMutation.mutate(confirmSettle)}
                            disabled={settleMutation.isPending}
                            className="w-full py-3.5 bg-emerald-500 text-white rounded-xl text-[10px] font-black uppercase tracking-widest shadow-lg shadow-emerald-100 active:scale-95 transition-all"
                        >
                            {settleMutation.isPending ? "Syncing..." : "Confirm"}
                        </button>
                        <button onClick={() => setConfirmSettle(null)} className="w-full py-2 text-[9px] font-black text-gray-400 uppercase tracking-widest">
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
            <motion.div initial={{ scale: 0.95, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} exit={{ scale: 0.95, opacity: 0 }} className="relative w-full max-w-sm bg-white rounded-[32px] p-8 shadow-2xl">
              <div className="flex justify-between items-center mb-6">
                <div>
                    <h2 className="text-xl font-black tracking-tighter">New Profile</h2>
                    <p className="text-[9px] font-black text-gray-400 uppercase tracking-widest">Register Ledger Account</p>
                </div>
                <button onClick={() => setShowAddCompany(false)} className="w-9 h-9 bg-gray-50 rounded-full flex items-center justify-center text-gray-400"><X size={18} strokeWidth={3} /></button>
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
                    <label className="text-[8px] font-black text-gray-400 uppercase ml-2 tracking-widest">Legal Name / Company</label>
                    <input name="name" required placeholder="e.g. Agrasar Co-operative" className="w-full bg-[#F2F2F7] border-none rounded-xl py-3 px-5 text-[13px] font-semibold placeholder:text-gray-300" />
                </div>
                <div className="space-y-1">
                    <label className="text-[8px] font-black text-gray-400 uppercase ml-2 tracking-widest">Contact Phone</label>
                    <input name="phone" placeholder="98XXXXXXXX" className="w-full bg-[#F2F2F7] border-none rounded-xl py-3 px-5 text-[13px] font-semibold placeholder:text-gray-300" />
                </div>
                <button type="submit" disabled={addCompanyMutation.isPending} className="w-full bg-emerald-500 text-white py-4 rounded-xl font-black text-[10px] uppercase tracking-widest shadow-lg shadow-emerald-100 active:scale-95 transition-all mt-2">
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