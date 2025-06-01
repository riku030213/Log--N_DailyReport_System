// Firebase 認証とGoogle Sheets APIの連携用
import { getAuth, onAuthStateChanged } from "https://www.gstatic.com/firebasejs/11.8.1/firebase-auth.js";

// デプロイ済みのGoogle Apps Script Web App URL（必ず自身のプロジェクトURLに差し替えてください）
const SHEETS_WEBHOOK_URL = "https://script.google.com/macros/s/AKfycbyYIOS9ML7SxGjQx3IxTZcL0hUk4cD_pV9vOwNO3l9_f7B9AzjWQqG7lV7OgVdK5DYcmA/exec";

// ユーザーのログイン状態を取得し、認証済みならメールアドレスを取得
export function getUserEmail(callback) {
  const auth = getAuth();
  onAuthStateChanged(auth, (user) => {
    if (user) {
      callback(user.email);
    } else {
      alert("ログインセッションが失われました。");
      window.location.href = "login.html";
    }
  });
}

// 分→時:分形式に変換（例: 1.5 => "1時30分"）
function convertBreakTime(decimal) {
  const hours = Math.floor(decimal);
  const minutes = Math.round((decimal - hours) * 60);
  return `${hours}時${minutes === 0 ? "00" : minutes}分`;
}

// Google Sheetsにデータを送信する関数
export function sendToSpreadsheet(email, mode, time, date, breakTimeDecimal) {
  const formattedBreak = convertBreakTime(breakTimeDecimal);
  const payload = {
    email,       // アカウント識別用
    mode,        // "start" or "end"
    time,        // 送信時刻（例："10時05分"）
    date,        // 送信日（例："2025年06月01日"）
    breakTime: formattedBreak // 例："1時30分"
  };

  fetch(SHEETS_WEBHOOK_URL, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(payload)
  })
    .then(res => res.text())
    .then(responseText => {
      console.log("シート送信成功:", responseText);
    })
    .catch(err => {
      console.error("シート送信エラー:", err);
      alert("スプレッドシートへの送信に失敗しました。");
    });
}
