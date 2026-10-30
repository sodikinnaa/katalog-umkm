const BATAS_WAKTU_MS = 14500;

export class GalatAI extends Error {
  constructor(message, status = 502) {
    super(message);
    this.name = "GalatAI";
    this.status = status;
  }
}

function konfigurasi() {
  const endpoint = process.env.ENDPOINT?.trim();
  const apiKey = process.env.API_KEY?.trim();
  const model = process.env.AI_MODEL?.trim();

  if (!endpoint || !apiKey || !model) {
    throw new GalatAI("Layanan AI belum dikonfigurasi.", 503);
  }

  return {
    url: endpoint.endsWith("/chat/completions")
      ? endpoint
      : `${endpoint.replace(/\/$/, "")}/chat/completions`,
    apiKey,
    model,
  };
}

export async function panggilAI({ messages, maxTokens = 250 }) {
  const { url, apiKey, model } = konfigurasi();

  try {
    const response = await fetch(url, {
      method: "POST",
      headers: {
        Authorization: `Bearer ${apiKey}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        model,
        messages,
        max_tokens: Math.min(Math.max(maxTokens, 1), 400),
        temperature: 0.3,
      }),
      cache: "no-store",
      signal: AbortSignal.timeout(BATAS_WAKTU_MS),
    });

    if (!response.ok) {
      throw new GalatAI("Layanan AI sedang bermasalah. Silakan coba lagi.");
    }

    const data = await response.json();
    const hasil = data?.choices?.[0]?.message?.content?.trim();

    if (!hasil) {
      throw new GalatAI("AI tidak menghasilkan jawaban. Silakan coba lagi.");
    }

    return hasil;
  } catch (error) {
    if (error instanceof GalatAI) throw error;
    if (error?.name === "TimeoutError" || error?.name === "AbortError") {
      throw new GalatAI("AI terlalu lama merespons. Silakan coba lagi.", 504);
    }
    throw new GalatAI("Tidak dapat menghubungi layanan AI. Silakan coba lagi.");
  }
}
