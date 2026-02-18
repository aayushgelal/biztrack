"use client";
import { useState } from "react";
import { QRCodeSVG } from "qrcode.react";
import { QrCode, ClipboardPaste, Smartphone, CheckCircle2, Loader2 } from "lucide-react";

export default function QRLab() {
  const [qrString, setQrString] = useState("");
  const [amount, setAmount] = useState("");
  const [wsUrl, setWsUrl] = useState("");
  const [status, setStatus] = useState("Waiting for input...");

  const handlePaste = async () => {
    try {
      const text = await navigator.clipboard.readText();
      setQrString(text);
      setStatus("QR Code Generated! Scan now.");
    } catch (err) {
      alert("Failed to read clipboard");
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 flex items-center justify-center p-6">
      <div className="max-w-md w-full space-y-6">
        
        {/* HEADER */}
        <div className="text-center space-y-2">
          <div className="inline-flex items-center justify-center w-12 h-12 bg-blue-600 rounded-xl text-white shadow-lg shadow-blue-200 mb-2">
            <QrCode size={24} />
          </div>
          <h1 className="text-2xl font-black text-slate-900 tracking-tight">BIZTRACK <span className="text-blue-600">LAB</span></h1>
          <p className="text-slate-500 text-sm font-medium uppercase tracking-wider">Internal QR Validator</p>
        </div>

        {/* INPUT CARD */}
        <div className="bg-white rounded-[32px] p-8 shadow-xl border border-slate-100 space-y-6">
          <div className="space-y-4">
            <button 
              onClick={handlePaste}
              className="w-full flex items-center justify-center gap-2 bg-slate-900 text-white py-4 rounded-2xl font-bold hover:bg-slate-800 transition-all active:scale-95 shadow-lg shadow-slate-200"
            >
              <ClipboardPaste size={18} />
              PASTE FROM SERIAL
            </button>
            
            <textarea
              className="w-full h-24 bg-slate-50 border-2 border-slate-100 rounded-2xl p-4 text-xs font-mono text-slate-600 focus:border-blue-500 focus:outline-none transition-colors"
              placeholder="Or paste the raw 000201... string here"
              value={qrString}
              onChange={(e) => setQrString(e.target.value)}
            />
          </div>

          {/* QR DISPLAY AREA */}
          {qrString ? (
            <div className="flex flex-col items-center py-6 space-y-6 animate-in fade-in zoom-in duration-300">
              <div className="bg-white p-6 rounded-[40px] shadow-2xl border-8 border-slate-50">
                <QRCodeSVG value={qrString} size={220} level="H" includeMargin />
              </div>
              
              <div className="flex items-center gap-2 px-4 py-2 bg-emerald-50 text-emerald-700 rounded-full">
                <CheckCircle2 size={14} />
                <span className="text-xs font-black uppercase tracking-widest">{status}</span>
              </div>
            </div>
          ) : (
            <div className="py-12 flex flex-col items-center justify-center text-slate-300 border-4 border-dashed border-slate-50 rounded-[40px]">
              <Smartphone size={48} strokeWidth={1} className="mb-2" />
              <p className="text-sm font-bold uppercase tracking-widest">Awaiting String</p>
            </div>
          )}
        </div>

        {/* STATUS FOOTER */}
        <p className="text-center text-[10px] text-slate-400 font-bold uppercase tracking-[0.2em]">
          BizTrack Terminal v1.2 • Lab Edition
        </p>
      </div>
    </div>
  );
}