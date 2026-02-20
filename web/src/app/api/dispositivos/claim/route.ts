import { NextResponse } from "next/server";

// DEPRECATED — replaced by QR code pairing flow (POST /api/pairing/confirm)
export async function POST() {
  return NextResponse.json(
    { error: "Este endpoint foi descontinuado. Atualize o app KidsPC para a versão mais recente." },
    { status: 410 }
  );
}
