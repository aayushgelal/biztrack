// "use client";
// import { useState } from "react";
// import { Zap, Loader2, QrCode, Lock, User, Banknote, MessageSquare } from "lucide-react";
// import { QRCodeSVG } from "qrcode.react";
// import toast from "react-hot-toast";

// export default function FonepayTest() {
//   const [loading, setLoading] = useState(false);
//   const [result, setResult] = useState<any>(null);
  
//   // Dynamic Inputs
//   const [creds, setCreds] = useState({
//     username: "9848378159",
//     password: "Ankit#2059",
//     amount: "10.00",
//     remarks: "HaadiBistro_Test"
//   });

//   async function runTest() {
//     if (!creds.username || !creds.password || !creds.amount) {
//       return toast.error("Please fill all required fields");
//     }

//     setLoading(true);
//     setResult(null);
//     try {
//       const res = await fetch("/api/fonepay-proxy", {
//         method: "POST",
//         headers: { "Content-Type": "application/json" },
//         body: JSON.stringify({
//           username: creds.username,
//           password: creds.password,
//           amount: creds.amount,
//           billId: creds.remarks
//         })
//       });
//       const data = await res.json();
//       if (data.success) {
//         setResult(data);
//         toast.success("QR Generated!");
//       } else {
//         toast.error(data.error || "Login/QR Failed");
//       }
//     } catch (e) {
//       toast.error("Network Error");
//     } finally {
//       setLoading(false);
//     }
//   }

//   return (
//     <div className="min-h-screen bg-[#F2F2F7] p-6 pt-12 pb-20 flex flex-col items-center">
//       <div className="w-full max-w-md bg-white rounded-[32px] p-8 shadow-sm border border-white">
//       <QRCodeSVG 
//                   value={'00020101021226570011fonepay.com06066906440716222214000699601309084612614952045451530352454072000.005802NP5933GAUTAM DHOOD KHARID BIKRI KENDRA6009NEPALGUNJ623001084612614907067145770804food6304b88c'} 
//                   size={200}
//                   level="L" // SET TO LOW ERROR CORRECTION
//                   includeMargin={false}
//                 />
        
//         <div className="flex items-center gap-3 mb-8">
//           <div className="w-10 h-10 bg-blue-50 rounded-xl flex items-center justify-center text-[#007AFF]">
//             <QrCode size={24} />
//           </div>
//           <h1 className="text-xl font-black text-black tracking-tight">Proxy Lab</h1>
//         </div>

//         {/* INPUT FIELDS */}
//         <div className="space-y-4 mb-8">
//           <div className="grid grid-cols-2 gap-3">
//             <div className="space-y-1">
//               <label className="text-[10px] font-black text-gray-400 uppercase ml-1">Merchant User</label>
//               <div className="relative">
//                 <User size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-300" />
//                 <input 
//                   type="text" 
//                   value={creds.username}
//                   onChange={(e) => setCreds({...creds, username: e.target.value})}
//                   className="w-full bg-[#F2F2F7] rounded-xl py-2.5 pl-9 pr-3 text-xs font-bold outline-none focus:ring-2 focus:ring-blue-100" 
//                 />
//               </div>
//             </div>
//             <div className="space-y-1">
//               <label className="text-[10px] font-black text-gray-400 uppercase ml-1">Password</label>
//               <div className="relative">
//                 <Lock size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-300" />
//                 <input 
//                   type="password" 
//                   value={creds.password}
//                   onChange={(e) => setCreds({...creds, password: e.target.value})}
//                   className="w-full bg-[#F2F2F7] rounded-xl py-2.5 pl-9 pr-3 text-xs font-bold outline-none focus:ring-2 focus:ring-blue-100" 
//                 />
//               </div>
//             </div>
//           </div>

//           <div className="space-y-1">
//             <label className="text-[10px] font-black text-gray-400 uppercase ml-1">Amount (NPR)</label>
//             <div className="relative">
//               <Banknote size={16} className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-300" />
//               <input 
//                 type="number" 
//                 placeholder="0.00"
//                 value={creds.amount}
//                 onChange={(e) => setCreds({...creds, amount: e.target.value})}
//                 className="w-full bg-[#F2F2F7] rounded-2xl py-4 pl-12 pr-4 text-xl font-black text-black outline-none" 
//               />
//             </div>
//           </div>

//           <div className="space-y-1">
//             <label className="text-[10px] font-black text-gray-400 uppercase ml-1">Remarks / Bill ID</label>
//             <div className="relative">
//               <MessageSquare size={16} className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-300" />
//               <input 
//                 type="text" 
//                 value={creds.remarks}
//                 onChange={(e) => setCreds({...creds, remarks: e.target.value})}
//                 className="w-full bg-[#F2F2F7] rounded-2xl py-3 pl-12 pr-4 text-sm font-bold text-black outline-none" 
//               />
//             </div>
//           </div>
//         </div>

//         <button 
//           onClick={runTest}
//           disabled={loading}
//           className="w-full bg-[#007AFF] text-white py-5 rounded-[24px] font-black text-lg shadow-lg shadow-blue-100 flex items-center justify-center gap-3 active:scale-95 transition-all"
//         >
//           {loading ? <Loader2 className="animate-spin" /> : "Generate Dynamic QR"}
//         </button>

//         {/* RESULTS SECTION */}
//         {result && (
//           <div className="mt-10 space-y-8 animate-in fade-in zoom-in-95 duration-500">
            
//             <div className="flex flex-col items-center">
//               <div className="p-5 bg-white rounded-[32px] shadow-2xl border border-gray-50">
//                 <QRCodeSVG 
//                   value={result.qrString} 
//                   size={200}
//                   level="L" // SET TO LOW ERROR CORRECTION
//                   includeMargin={false}
//                 />
//               </div>
//               <p className="mt-4 text-[10px] font-black text-blue-500 uppercase tracking-widest bg-blue-50 px-4 py-1.5 rounded-full">
//                 {result.terminalName}
//               </p>
//             </div>

//             <div className="p-5 bg-gray-50 rounded-[24px] space-y-3">
//               <div>
//                 <p className="text-[9px] font-black text-gray-400 uppercase tracking-widest mb-1">Raw EMV Message</p>
//                 <p className="text-[10px] break-all font-mono text-gray-600 bg-white p-3 rounded-xl border border-gray-100 leading-relaxed">
//                   {result.qrString}
//                 </p>
//               </div>
//               <div>
//                 <p className="text-[9px] font-black text-gray-400 uppercase tracking-widest mb-1">WebSocket ID</p>
//                 <p className="text-[9px] break-all font-mono text-emerald-600">
//                   {result.websocket}
//                 </p>
//               </div>
//             </div>
//           </div>
//         )}
//       </div>
//     </div>
//   );
// }
"use client";
import { useState, useEffect } from "react";
import { QRCodeSVG } from "qrcode.react";
import { 
  Zap, 
  Banknote, 
  MessageSquare, 
  ShieldCheck, 
  ArrowLeft,
  Info
} from "lucide-react";

export default function BizTrackPOS() {
  const [amount, setAmount] = useState("500.00");
  const [remarks, setRemarks] = useState("Payment_At_Bistro");
  const [qrString, setQrString] = useState("");

  // 1. THE CRC-16 CCITT (0xFFFF) ENGINE
  // This is the mathematical "seal" that makes the QR valid for Fonepay/NepalPay
  const calculateCRC = (data: string) => {
    let crc = 0xFFFF;
    const polynomial = 0x1021;
    for (let i = 0; i < data.length; i++) {
      crc ^= data.charCodeAt(i) << 8;
      for (let j = 0; j < 8; j++) {
        if ((crc & 0x8000) !== 0) {
          crc = (crc << 1) ^ polynomial;
        } else {
          crc <<= 1;
        }
      }
    }
    return (crc & 0xFFFF).toString(16).toUpperCase().padStart(4, "0");
  };

  // 2. TAG-LENGTH-VALUE (TLV) FORMATTER
  const formatTag = (id: string, value: string) => {
    const len = value.length.toString().padStart(2, "0");
    return `${id}${len}${value}`;
  };
  
// // 3. THE ETERNAL GENERATOR LOGIC (CORRECTED)
// const generateDynamicQR = () => {
//   let payload = "000201"; 
//   payload += formatTag("01", "12"); // Dynamic Mode
  
//   // Merchant Identity
//   payload += formatTag("26", "0011fonepay.com07162222140006996013");
  
//   payload += formatTag("52", "5451"); 
//   payload += formatTag("53", "524");  

//   // Dynamic Amount
//   const formattedAmount = parseFloat(amount || "0").toFixed(2);
//   payload += formatTag("54", formattedAmount);
  
//   payload += formatTag("58", "NP"); 
//   payload += formatTag("59", "GAUTAM DHOOD KHARID BIKRI KENDRA"); 
//   payload += formatTag("60", "Janaki RM"); 

//   // --- THE FIX: NESTED SUB-TAGS ---
//   // Sub-Tag 01: PRN/Remarks (This is what triggers the notification text)
//   const subTag01 = formatTag("01", remarks || "BIZTRACK_POS"); 
//   // Sub-Tag 07: Terminal ID (This tells the bank which specific device got paid)
//   const subTag07 = formatTag("07", "0706714577");             
  
//   // Combine them and then wrap them in Tag 62
//   const tag62Value = subTag01 + subTag07;
//   payload += formatTag("62", tag62Value);
//   // --- END OF FIX ---

//   payload += "6304"; 
//   const finalCRC = calculateCRC(payload);
  
//   setQrString(payload + finalCRC);
// };

// 3. THE BIZTRACK "ETERNAL" GENERATOR
const generateDynamicQR = () => {
  // Start with Standard EMVCo Header
  let payload = "000201"; 
  
  // Tag 01: 12 (Dynamic) is essential for merchant-side SMS triggers
  payload += formatTag("01", "12"); 
  
  // Tag 26: Merchant Identity (Your Gautam Dhood ID)
  payload += formatTag("26", "0011fonepay.com07162222140006996013");
  
  payload += formatTag("52", "5411"); // MCC: Retail
  payload += formatTag("53", "524");  // Currency: NPR
  
  // Tag 54: Amount (Injected)
  const formattedAmount = parseFloat(amount || "0").toFixed(2);
  payload += formatTag("54", formattedAmount);
  
  payload += formatTag("58", "NP"); // Country
  payload += formatTag("59", "GAUTAM DHOOD KHARID BIKRI KENDRA"); 
  payload += formatTag("60", "Janaki RM"); 

  // --- TAG 62: THE NOTIFICATION ENGINE ---
  // Order matters for the SMS Gateway: Terminal ID first, then Reference.
  const tid = "0706714577";
  const subTag07 = formatTag("07", tid); // Terminal ID
  const subTag01 = formatTag("01", remarks || "POS_PAY"); // PRN/Remarks
  
  const tag62Value = subTag07 + subTag01; 
  payload += formatTag("62", tag62Value);

  // Tag 63: CRC Seal
  payload += "6304"; 
  const finalCRC = calculateCRC(payload);
  
  setQrString(payload + finalCRC);
};

  useEffect(() => {
    generateDynamicQR();
  }, [amount, remarks]);

  return (
    <div className="min-h-screen bg-[#F2F2F7] p-4 flex flex-col items-center justify-center font-sans">
      
      {/* HEADER */}
      <div className="w-full max-w-sm flex items-center justify-between mb-6 px-2">
        <button className="p-2 bg-white rounded-full shadow-sm active:scale-90 transition-all">
          <ArrowLeft size={20} />
        </button>
        <div className="flex items-center gap-1.5">
          <Zap size={16} className="text-[#007AFF]" fill="currentColor" />
          <span className="text-sm font-black tracking-tighter uppercase">BizTrack Terminal</span>
        </div>
        <div className="w-10" /> {/* Spacer */}
      </div>

      {/* POS MAIN CARD */}
      <div className="w-full max-w-sm bg-white rounded-[40px] shadow-2xl shadow-blue-900/5 p-8 border border-white relative overflow-hidden">
        
        {/* TOP BADGE */}
        <div className="flex justify-center mb-8">
          <div className="bg-emerald-50 text-emerald-600 text-[9px] font-black uppercase tracking-widest px-4 py-1.5 rounded-full flex items-center gap-2">
            <ShieldCheck size={12} /> SECURE FONEPAY GATEWAY
          </div>
        </div>

        {/* INPUT SECTION */}
        <div className="space-y-6 mb-10">
          <div className="text-center space-y-1">
            <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest">Enter Amount</p>
            <div className="relative flex items-center justify-center">
              <span className="text-2xl font-black text-gray-300 mr-2">रू</span>
              <input 
                type="number" 
                value={amount}
                onChange={(e) => setAmount(e.target.value)}
                className="w-32 text-4xl font-black text-black outline-none border-b-2 border-transparent focus:border-blue-500 transition-colors text-center"
              />
            </div>
          </div>

          <div className="bg-[#F2F2F7] rounded-2xl p-4 flex items-center gap-3">
            <MessageSquare size={18} className="text-gray-400" />
            <input 
              type="text" 
              placeholder="Add Remarks..."
              value={remarks}
              onChange={(e) => setRemarks(e.target.value)}
              className="bg-transparent w-full text-xs font-bold outline-none text-gray-600"
            />
          </div>
        </div>

        {/* QR SECTION */}
        <div className="flex flex-col items-center bg-gray-50 rounded-[32px] p-6 border border-gray-100">
          <div className="bg-white p-3 rounded-2xl shadow-sm mb-4 border border-gray-50">
            <QRCodeSVG 
              value={qrString} 
              size={180} 
              level="L" // Set to Low for better scanning on hardware displays
              includeMargin={false} 
            />
          </div>
          <div className="flex items-center gap-2 mb-2">
            <span className="text-[10px] font-black text-gray-300">SUPPORTS</span>
            <div className="flex gap-3 opacity-40 grayscale">
               <span className="text-[10px] font-black text-red-600">fonepay</span>
               <span className="text-[10px] font-black text-blue-800">NepalPay</span>
            </div>
          </div>
        </div>

        {/* COMING SOON BADGE */}
        <div className="mt-8 pt-6 border-t border-gray-50 text-center">
          <div className="bg-black text-white py-3 px-6 rounded-2xl text-[10px] font-black uppercase tracking-widest flex items-center justify-center gap-2 animate-pulse">
             BizTrack Hardware POS Coming Soon
          </div>
        </div>
      </div>

      {/* FOOTER INFO */}
      <div className="mt-8 flex items-center gap-2 text-gray-400">
        <Info size={14} />
        <p className="text-[10px] font-bold uppercase tracking-wider">Merchant: Gautam Dhood Kendra</p>
      </div>
    </div>
  );
}


// "use client";
// import { useState, useEffect, useRef } from "react";
// import { Zap, Loader2, QrCode, Lock, User, Banknote, MessageSquare, Volume2 } from "lucide-react";
// import { QRCodeSVG } from "qrcode.react";
// import toast from "react-hot-toast";

// export default function FonepayTest() {
//   const [loading, setLoading] = useState(false);
//   const [result, setResult] = useState<any>(null);
//   const audioRef = useRef<HTMLAudioElement | null>(null);

//   const [creds, setCreds] = useState({
//     username: "9848378159",
//     password: "Ankit#2059",
//     amount: "10.00",
//     remarks: "HaadiBistro_Test"
//   });

//   // // 1. Initialize Audio for the Alert
//   // useEffect(() => {
//   //   audioRef.current = new Audio("/sounds/payment-success.mp3");
//   //   audioRef.current.load();
//   // }, []);

//   // 2. WebSocket Listener for Real-Time "Paid" Alert
//   useEffect(() => {
//     if (!result?.websocket) return;
//     console.log(result)

//     const ws = new WebSocket(result.websocket);

//     ws.onmessage = (event) => {
//       try {
//         const data = JSON.parse(event.data);
//         console.log(data)
//         // Fonepay sends SUCCESS status or responseCode 0
//         if (data.status === "SUCCESS" || data.responseCode === "0") {
//           toast.success(`PAYMENT RECEIVED: NPR ${data.amount}`, {
//             duration: 8000,
//             icon: '💰',
//             style: { borderRadius: '20px', background: '#10B981', color: '#fff', fontWeight: 'bold' }
//           });
//         }
//       } catch (e) {
//         console.error("WS Parse Error:", e);
//       }
//     };

//     return () => ws.close();
//   }, [result]);

//   async function runTest() {
//     if (!creds.username || !creds.password || !creds.amount) {
//       return toast.error("Please fill all required fields");
//     }

//     setLoading(true);
//     setResult(null);

//     try {
//       // Get stored session data to avoid unnecessary logins
//       const savedToken = localStorage.getItem("fonepay_token");
//       const savedTid = localStorage.getItem("fonepay_tid");

//       const res = await fetch("/api/fonepay-proxy", {
//         method: "POST",
//         headers: { "Content-Type": "application/json" },
//         body: JSON.stringify({
//           ...creds,
//           token: savedToken,
//           terminalId: savedTid
//         })
//       });

//       const data = await res.json();
      
//       if (data.success) {
//         // Save new session data if provided by proxy
//         if (data.newToken) localStorage.setItem("fonepay_token", data.newToken);
//         if (data.newTerminalId) localStorage.setItem("fonepay_tid", data.newTerminalId);

//         setResult(data);
//         toast.success("QR Generated & Live Listening...");
//       } else {
//         toast.error(data.error || "Generation Failed");
//       }
//     } catch (e) {
//       toast.error("Network Error");
//     } finally {
//       setLoading(false);
//     }
//   }

//   return (
//     <div className="min-h-screen bg-[#F2F2F7] p-6 pt-12 pb-20 flex flex-col items-center">
//       <div className="w-full max-w-md bg-white rounded-[32px] p-8 shadow-sm border border-white">
        
//         <div className="flex items-center justify-between mb-8">
//           <div className="flex items-center gap-3">
//             <div className="w-10 h-10 bg-blue-50 rounded-xl flex items-center justify-center text-[#007AFF]">
//               <QrCode size={24} />
//             </div>
//             <h1 className="text-xl font-black text-black tracking-tight">Proxy Lab</h1>
//           </div>
//           {result?.websocket && (
//              <div className="flex items-center gap-2 text-emerald-500 bg-emerald-50 px-3 py-1 rounded-full">
//                 <Volume2 size={14} className="animate-pulse" />
//                 <span className="text-[10px] font-bold uppercase">Live</span>
//              </div>
//           )}
//         </div>

//         {/* INPUT FIELDS */}
//         <div className="space-y-4 mb-8">
//           <div className="grid grid-cols-2 gap-3">
//             <div className="space-y-1">
//               <label className="text-[10px] font-black text-gray-400 uppercase ml-1">Merchant User</label>
//               <div className="relative">
//                 <User size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-300" />
//                 <input 
//                   type="text" 
//                   value={creds.username}
//                   onChange={(e) => setCreds({...creds, username: e.target.value})}
//                   className="w-full bg-[#F2F2F7] rounded-xl py-2.5 pl-9 pr-3 text-xs font-bold outline-none focus:ring-2 focus:ring-blue-100" 
//                 />
//               </div>
//             </div>
//             <div className="space-y-1">
//               <label className="text-[10px] font-black text-gray-400 uppercase ml-1">Password</label>
//               <div className="relative">
//                 <Lock size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-300" />
//                 <input 
//                   type="password" 
//                   value={creds.password}
//                   onChange={(e) => setCreds({...creds, password: e.target.value})}
//                   className="w-full bg-[#F2F2F7] rounded-xl py-2.5 pl-9 pr-3 text-xs font-bold outline-none focus:ring-2 focus:ring-blue-100" 
//                 />
//               </div>
//             </div>
//           </div>

//           <div className="space-y-1">
//             <label className="text-[10px] font-black text-gray-400 uppercase ml-1">Amount (NPR)</label>
//             <div className="relative">
//               <Banknote size={16} className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-300" />
//               <input 
//                 type="number" 
//                 placeholder="0.00"
//                 value={creds.amount}
//                 onChange={(e) => setCreds({...creds, amount: e.target.value})}
//                 className="w-full bg-[#F2F2F7] rounded-2xl py-4 pl-12 pr-4 text-xl font-black text-black outline-none" 
//               />
//             </div>
//           </div>

//           <div className="space-y-1">
//             <label className="text-[10px] font-black text-gray-400 uppercase ml-1">Remarks / Bill ID</label>
//             <div className="relative">
//               <MessageSquare size={16} className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-300" />
//               <input 
//                 type="text" 
//                 value={creds.remarks}
//                 onChange={(e) => setCreds({...creds, remarks: e.target.value})}
//                 className="w-full bg-[#F2F2F7] rounded-2xl py-3 pl-12 pr-4 text-sm font-bold text-black outline-none" 
//               />
//             </div>
//           </div>
//         </div>

//         <button 
//           onClick={runTest}
//           disabled={loading}
//           className="w-full bg-[#007AFF] text-white py-5 rounded-[24px] font-black text-lg shadow-lg shadow-blue-100 flex items-center justify-center gap-3 active:scale-95 transition-all"
//         >
//           {loading ? <Loader2 className="animate-spin" /> : "Generate Dynamic QR"}
//         </button>

//         {/* RESULTS SECTION */}
//         {result && (
//           <div className="mt-10 space-y-8 animate-in fade-in zoom-in-95 duration-500">
//             <div className="flex flex-col items-center">
//               <div className="p-5 bg-white rounded-[32px] shadow-2xl border border-gray-50">
//                 <QRCodeSVG 
//                   value={result.qrString} 
//                   size={200}
//                   level="L"
//                   includeMargin={false}
//                 />
//               </div>
//               <p className="mt-4 text-[10px] font-black text-blue-500 uppercase tracking-widest bg-blue-50 px-4 py-1.5 rounded-full">
//                 {result.terminalName}
//               </p>
//             </div>

//             <div className="p-5 bg-gray-50 rounded-[24px] space-y-3">
//               <div>
//                 <p className="text-[9px] font-black text-gray-400 uppercase tracking-widest mb-1">Status</p>
//                 <p className="text-[10px] font-bold text-emerald-600 flex items-center gap-2">
//                    <Zap size={10} fill="currentColor"/> Listening for payment...
//                 </p>
//               </div>
//               <div>
//                 <p className="text-[9px] font-black text-gray-400 uppercase tracking-widest mb-1">WebSocket Path</p>
//                 <p className="text-[8px] break-all font-mono text-gray-400">
//                   {result.websocket}
//                 </p>
//               </div>
//             </div>
//           </div>
//         )}
//       </div>
//     </div>
//   );
// }