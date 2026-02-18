"use client";
import { useState, useEffect } from "react";
import { QRCodeSVG } from "qrcode.react";
import { Zap, Banknote, MessageSquare, ShieldCheck, Info } from "lucide-react";

export default function BizTrackFinal() {
  const [amount, setAmount] = useState("10.00");
  const [remarks, setRemarks] = useState("BIZ101"); // Keep this short for SMS safety
  const [qrString, setQrString] = useState("");

  const calculateCRC = (data: string) => {
    let crc = 0xFFFF;
    const polynomial = 0x1021;
    for (let i = 0; i < data.length; i++) {
      crc ^= data.charCodeAt(i) << 8;
      for (let j = 0; j < 8; j++) {
        if ((crc & 0x8000) !== 0) crc = (crc << 1) ^ polynomial;
        else crc <<= 1;
      }
    }
    return (crc & 0xFFFF).toString(16).toUpperCase().padStart(4, "0");
  };

  const formatTag = (id: string, value: string) => {
    const len = value.length.toString().padStart(2, "0");
    return `${id}${len}${value}`;
  };

  const generateFinalQR = () => {
    // 1. BACK TO STATIC: We use '11' to keep the SMS gateway happy.
    // We will try to 'force' the amount by placing Tag 54 in a specific order.
    let payload = "000201010211"; 
    
    // 2. Merchant Identity - EXACTLY 35 chars as per your working string
    payload += "26350011fonepay.com07162222140006996013";
    
    // 3. THE GOLDEN PADDING: Matching your working 5204/5303 DNA
    payload += "52045411"; 
    payload += "5303524";  
    
    // 4. THE AMOUNT INJECTION (Tag 54)
    const formattedAmount = parseFloat(amount || "0").toFixed(2);
    payload += formatTag("54", formattedAmount);
    
    payload += "5802NP"; 
    payload += "5933GAUTAM DHOOD KHARID  BIKRI KENDRA"; 
    payload += "6009Janaki RM"; 
  
    // 5. THE "HOLY GRAIL" SMS TRIGGER (Tag 62)
    // We match your working string EXACTLY: 62 + 10 (length) + 07 (subtag) + 06 (length) + TID
    // We do NOT add remarks here. Adding even one extra byte often kills the SMS.
    payload += "62100706714577"; 
  
    // 6. SEAL WITH CRC
    payload += "6304"; 
    const finalCRC = calculateCRC(payload);
    
    setQrString(payload + finalCRC);
  };
  useEffect(() => {
    generateFinalQR();
  }, [amount, remarks]);

  return (
    <div className="min-h-screen bg-[#F2F2F7] p-6 flex flex-col items-center justify-center">
      <div className="w-full max-w-sm bg-white rounded-[40px] shadow-2xl p-8 border border-white">
        
        <div className="flex justify-center mb-6">
          <div className="bg-blue-50 text-blue-600 text-[10px] font-black px-4 py-1.5 rounded-full flex items-center gap-2">
            <Zap size={12} fill="currentColor"/> BIZTRACK SMS-READY POS
          </div>
        </div>

        <div className="space-y-4 mb-8">
          <div className="bg-gray-50 rounded-2xl p-4">
            <p className="text-[10px] font-bold text-gray-400 uppercase mb-1">Amount (NPR)</p>
            <input 
              type="number" 
              value={amount}
              onChange={(e) => setAmount(e.target.value)}
              className="w-full bg-transparent text-3xl font-black text-black outline-none"
            />
          </div>

          <div className="bg-gray-50 rounded-2xl p-4">
            <p className="text-[10px] font-bold text-gray-400 uppercase mb-1">Remarks</p>
            <input 
              type="text" 
              value={remarks}
              onChange={(e) => setRemarks(e.target.value)}
              className="w-full bg-transparent text-sm font-bold text-black outline-none"
            />
          </div>
        </div>

        <div className="flex flex-col items-center bg-gray-900 rounded-[32px] p-6">
          <div className="bg-white p-3 rounded-2xl mb-4">
            <QRCodeSVG value={qrString} size={180} />
          </div>
          <p className="text-[9px] font-bold text-white/40 tracking-widest uppercase">Scan with Fonepay / eSewa</p>
        </div>

      </div>
      <p className="mt-6 text-[10px] font-bold text-gray-400 uppercase tracking-widest">Merchant: Gautam Dhood Kendra</p>
    </div>
  );
}