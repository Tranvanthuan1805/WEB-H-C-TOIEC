import { useAppStore } from "@/store/useAppStore";

async function send(token: string, chatId: string, text: string) {
  if (!token || !chatId) return;
  try {
    await fetch(`https://api.telegram.org/bot${token}/sendMessage`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ chat_id: chatId, text, parse_mode: "HTML" }),
    });
  } catch {}
}

const ts = () =>
  new Date().toLocaleTimeString("vi-VN", { hour: "2-digit", minute: "2-digit" });

export function tgNotify(text: string) {
  const { telegramToken, telegramChatId } = useAppStore.getState();
  // fire-and-forget — does not block UI
  send(telegramToken, telegramChatId, `${text}\n⏰ ${ts()}`);
}
