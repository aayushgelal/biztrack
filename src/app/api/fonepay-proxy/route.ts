// import { NextRequest, NextResponse } from "next/server";

// const FONEPAY_LOGIN_URL = "https://merchantapi-web.fonepay.com/authentication/login";
// const FONEPAY_QR_URL = "https://merchantapi-web.fonepay.com/merchantQr/receivePayment";

// // 1. Define specific types to satisfy TypeScript
// interface LoginResponse {
//   isSuccess: boolean;
//   accessToken: string;
//   terminalId: string;
// }

// // Helper: Performs the actual login
// async function performLogin(u: string, p: string): Promise<LoginResponse> {
//   const res = await fetch(FONEPAY_LOGIN_URL, {
//     method: "POST",
//     headers: { "Content-Type": "application/json" },
//     body: JSON.stringify({ username: u, password: p, secretKey: "", otpCode: "", recaptcha: "" }),
//   });
//   const data = await res.json();
//   if (!data.isSuccess) throw new Error("Fonepay Login Failed");
//   return data;
// }

// // Helper: Performs the QR request
// async function requestQR(token: string, tid: string, amt: string, bId: string) {
//   return await fetch(FONEPAY_QR_URL, {
//     method: "POST",
//     headers: { "Content-Type": "application/json", "Authorization": token },
//     body: JSON.stringify({
//       selectTerminal: parseInt(tid),
//       billId: bId || "manual_pos",
//       amount: parseFloat(amt).toFixed(2),
//       terminalId: parseInt(tid),
//       qrType: "FONEPAY"
//     }),
//   });
// }

// export async function POST(req: NextRequest) {
//   try {
//     // Explicitly type the incoming body
//     const body = await req.json();
//     const { username, password, amount, billId, token, terminalId } = body;

//     let currentToken = token;
//     let currentTerminalId = terminalId;
//     let qrRes: Response | null = null;

//     // STEP 1: Direct Attempt (If we have a token from the frontend)
//     if (currentToken && currentTerminalId) {
//       qrRes = await requestQR(currentToken, currentTerminalId, amount, billId);
//     }

//     // STEP 2: Logic Switch - If failed or no token, then Login
//     if (!qrRes || qrRes.status === 401) {
//       console.log("Session invalid or missing. Attempting login...");
//       const loginData = await performLogin(username, password);
      
//       currentToken = loginData.accessToken;
//       currentTerminalId = loginData.terminalId;
      
//       // Retry the generation immediately after login
//       qrRes = await requestQR(currentToken, currentTerminalId, amount, billId);
//     }

//     const qrData = await qrRes.json();

//     if (!qrData.qrMessage) throw new Error("Could not generate QR string");

//     return NextResponse.json({
//       success: true,
//       qrString: qrData.qrMessage,
//       terminalName: qrData.terminalName,
//       websocket: qrData.websocketId,
//       // Return these for LocalStorage persistence
//       newToken: currentToken,
//       newTerminalId: currentTerminalId
//     });

//   } catch (error: any) {
//     console.error("Proxy Error:", error.message);
//     return NextResponse.json({ success: false, error: error.message }, { status: 500 });
//   }
// }

import { NextRequest, NextResponse } from "next/server";

const FONEPAY_LOGIN_URL = "https://merchantapi-web.fonepay.com/authentication/login";
const FONEPAY_QR_URL = "https://merchantapi-web.fonepay.com/merchantQr/receivePayment";

export async function POST(req: NextRequest) {
  try {
    const { username, password, amount, billId, token, terminalId } = await req.json();

    // 1. Session Management Logic
    let activeToken = token;
    let tid = terminalId;

    if (!activeToken || !tid) {
      const loginRes = await fetch(FONEPAY_LOGIN_URL, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ username, password, secretKey: "", otpCode: "", recaptcha: "" }),
      });
      const loginData = await loginRes.json();
      if (!loginData.isSuccess) throw new Error("Auth Failed");
      activeToken = loginData.accessToken;
      tid = loginData.terminalId;
    }

    // 2. Request QR from Fonepay
    const qrRes = await fetch(FONEPAY_QR_URL, {
      method: "POST",
      headers: { "Content-Type": "application/json", "Authorization": activeToken },
      body: JSON.stringify({
        selectTerminal: parseInt(tid),
        billId: billId || "manual_pos",
        amount: parseFloat(amount).toFixed(2),
        terminalId: parseInt(tid),
        qrType: "FONEPAY"
      }),
    });

    const qrData = await qrRes.json();
    if (!qrData.qrMessage) throw new Error("Generation Failed");
    console.log(qrData.qrMessage)

    // 3. Return the exact JSON structure for the Soundbox
    return NextResponse.json({
      qrMessage: qrData.qrMessage,
      terminalName: qrData.terminalName,
      websocketId: qrData.websocketId,
      location: qrData.location,
      fonepayPanNumber: qrData.fonepayPanNumber,
      newToken: activeToken,
      newTerminalId: tid
    });

  } catch (error: any) {
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}