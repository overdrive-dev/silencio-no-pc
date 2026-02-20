"use client";

import { useUser } from "@clerk/nextjs";
import { useSearchParams } from "next/navigation";
import { useState, useEffect, Suspense } from "react";
import Link from "next/link";
import { LinkIcon, CheckCircleIcon, ExclamationTriangleIcon } from "@heroicons/react/24/outline";

type Status = "loading" | "invalid" | "expired" | "ready" | "confirming" | "success" | "error";

function VincularContent() {
  const { user, isLoaded } = useUser();
  const searchParams = useSearchParams();
  const code = searchParams.get("code") || "";

  const [status, setStatus] = useState<Status>("loading");
  const [errorMsg, setErrorMsg] = useState("");
  const [errorCode, setErrorCode] = useState("");
  const [deviceName, setDeviceName] = useState("");

  // Validate the code on mount
  useEffect(() => {
    if (!code) {
      setStatus("invalid");
      return;
    }
    if (!isLoaded) return;

    async function validateCode() {
      try {
        const res = await fetch(`/api/pairing/check?code=${encodeURIComponent(code)}`);
        const data = await res.json();

        if (data.status === "pending") {
          setStatus("ready");
        } else if (data.status === "confirmed") {
          setStatus("success");
          setDeviceName("Dispositivo já vinculado");
        } else if (data.status === "expired") {
          setStatus("expired");
        } else {
          setStatus("invalid");
        }
      } catch {
        setStatus("invalid");
      }
    }

    validateCode();
  }, [code, isLoaded]);

  const handleConfirm = async () => {
    setStatus("confirming");
    setErrorMsg("");
    setErrorCode("");

    try {
      const res = await fetch("/api/pairing/confirm", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ code }),
      });
      const data = await res.json();

      if (!res.ok) {
        setErrorMsg(data.error || "Erro ao vincular.");
        setErrorCode(data.code || "");
        setStatus("error");
        return;
      }

      setDeviceName(data.device_name || "Novo PC");
      setStatus("success");
    } catch {
      setErrorMsg("Erro de conexão. Tente novamente.");
      setStatus("error");
    }
  };

  if (!isLoaded) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <div className="animate-spin size-6 border-2 border-violet-500 border-t-transparent rounded-full" />
      </div>
    );
  }

  return (
    <div className="flex items-center justify-center min-h-[60vh] px-4">
      <div className="w-full max-w-md">
        {/* Invalid code */}
        {status === "invalid" && (
          <div className="rounded-2xl border border-slate-200 bg-white p-8 shadow-sm text-center space-y-4">
            <div className="inline-flex items-center justify-center size-14 rounded-2xl bg-red-50">
              <ExclamationTriangleIcon className="size-7 text-red-500" />
            </div>
            <h1 className="text-xl font-display font-bold text-slate-900">
              Código inválido
            </h1>
            <p className="text-sm text-slate-500">
              O código de pareamento não foi encontrado.
              Gere um novo código no app KidsPC instalado no dispositivo.
            </p>
            <Link
              href="/dispositivos"
              className="inline-flex items-center gap-2 rounded-lg bg-slate-100 px-5 py-2.5 text-sm font-medium text-slate-700 hover:bg-slate-200 transition"
            >
              Ir para Dispositivos
            </Link>
          </div>
        )}

        {/* Expired */}
        {status === "expired" && (
          <div className="rounded-2xl border border-slate-200 bg-white p-8 shadow-sm text-center space-y-4">
            <div className="inline-flex items-center justify-center size-14 rounded-2xl bg-amber-50">
              <ExclamationTriangleIcon className="size-7 text-amber-500" />
            </div>
            <h1 className="text-xl font-display font-bold text-slate-900">
              Código expirado
            </h1>
            <p className="text-sm text-slate-500">
              Este código já expirou. Gere um novo código no app KidsPC
              instalado no dispositivo.
            </p>
            <Link
              href="/dispositivos"
              className="inline-flex items-center gap-2 rounded-lg bg-slate-100 px-5 py-2.5 text-sm font-medium text-slate-700 hover:bg-slate-200 transition"
            >
              Ir para Dispositivos
            </Link>
          </div>
        )}

        {/* Loading */}
        {status === "loading" && (
          <div className="rounded-2xl border border-slate-200 bg-white p-8 shadow-sm text-center space-y-4">
            <div className="animate-spin size-6 border-2 border-violet-500 border-t-transparent rounded-full mx-auto" />
            <p className="text-sm text-slate-500">Verificando código...</p>
          </div>
        )}

        {/* Ready to confirm */}
        {(status === "ready" || status === "confirming") && (
          <div className="rounded-2xl border border-slate-200 bg-white p-8 shadow-sm text-center space-y-5">
            <div className="inline-flex items-center justify-center size-14 rounded-2xl bg-[#EDF2FF]">
              <LinkIcon className="size-7 text-[#4A7AFF]" />
            </div>
            <h1 className="text-xl font-display font-bold text-slate-900">
              Vincular dispositivo
            </h1>
            <p className="text-sm text-slate-500">
              Deseja vincular este dispositivo à conta de{" "}
              <strong className="text-slate-700">
                {user?.primaryEmailAddress?.emailAddress || user?.firstName || "sua conta"}
              </strong>
              ?
            </p>
            <div className="rounded-xl bg-slate-50 border border-slate-200 p-4">
              <div className="flex items-center justify-between text-sm">
                <span className="text-slate-500">Código</span>
                <code className="font-mono font-bold text-violet-600">{code}</code>
              </div>
            </div>
            <button
              onClick={handleConfirm}
              disabled={status === "confirming"}
              className="w-full rounded-lg bg-gradient-to-r from-violet-600 to-pink-500 py-3 text-sm font-semibold text-white shadow-sm shadow-violet-500/20 hover:shadow-lg hover:shadow-violet-500/30 transition-all disabled:opacity-50"
            >
              {status === "confirming" ? "Vinculando..." : "Confirmar vinculação"}
            </button>
          </div>
        )}

        {/* Error */}
        {status === "error" && (
          <div className="rounded-2xl border border-slate-200 bg-white p-8 shadow-sm text-center space-y-4">
            <div className="inline-flex items-center justify-center size-14 rounded-2xl bg-red-50">
              <ExclamationTriangleIcon className="size-7 text-red-500" />
            </div>
            <h1 className="text-xl font-display font-bold text-slate-900">
              Erro ao vincular
            </h1>
            <p className="text-sm text-slate-500">{errorMsg}</p>
            {errorCode === "NO_SUBSCRIPTION" && (
              <Link
                href="/pricing"
                className="inline-flex items-center gap-2 rounded-lg bg-gradient-to-r from-violet-600 to-pink-500 px-5 py-2.5 text-sm font-semibold text-white hover:shadow-lg transition"
              >
                Ver planos
              </Link>
            )}
            {errorCode === "DEVICE_LIMIT_REACHED" && (
              <Link
                href="/dispositivos"
                className="inline-flex items-center gap-2 rounded-lg bg-gradient-to-r from-violet-600 to-pink-500 px-5 py-2.5 text-sm font-semibold text-white hover:shadow-lg transition"
              >
                Gerenciar dispositivos
              </Link>
            )}
            {!errorCode && (
              <button
                onClick={() => setStatus("ready")}
                className="inline-flex items-center gap-2 rounded-lg bg-slate-100 px-5 py-2.5 text-sm font-medium text-slate-700 hover:bg-slate-200 transition"
              >
                Tentar novamente
              </button>
            )}
          </div>
        )}

        {/* Success */}
        {status === "success" && (
          <div className="rounded-2xl border border-slate-200 bg-white p-8 shadow-sm text-center space-y-4">
            <div className="inline-flex items-center justify-center size-14 rounded-2xl bg-emerald-50">
              <CheckCircleIcon className="size-7 text-emerald-500" />
            </div>
            <h1 className="text-xl font-display font-bold text-slate-900">
              Vinculado!
            </h1>
            <p className="text-sm text-slate-500">
              O dispositivo <strong className="text-slate-700">{deviceName}</strong> foi
              vinculado à sua conta com sucesso. O app vai detectar automaticamente.
            </p>
            <Link
              href="/dispositivos"
              className="inline-flex items-center gap-2 rounded-lg bg-gradient-to-r from-violet-600 to-pink-500 px-5 py-2.5 text-sm font-semibold text-white hover:shadow-lg transition w-full justify-center"
            >
              Ver dispositivos
            </Link>
          </div>
        )}
      </div>
    </div>
  );
}

export default function VincularPage() {
  return (
    <Suspense
      fallback={
        <div className="flex items-center justify-center min-h-[60vh]">
          <div className="animate-spin size-6 border-2 border-violet-500 border-t-transparent rounded-full" />
        </div>
      }
    >
      <VincularContent />
    </Suspense>
  );
}
