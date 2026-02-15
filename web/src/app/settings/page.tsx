"use client";

import { useUser } from "@clerk/nextjs";

export default function SettingsProfilePage() {
  const { user } = useUser();

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-2xl font-display font-bold tracking-tight text-slate-900">Perfil</h1>
        <p className="mt-1 text-sm text-slate-500">Informações da sua conta.</p>
      </div>

      <div className="rounded-2xl border border-slate-200 bg-white shadow-sm divide-y divide-slate-100">
        <div className="px-6 py-5 sm:flex sm:items-center">
          <dt className="text-sm font-medium text-slate-500 sm:w-48 sm:flex-none">Nome</dt>
          <dd className="mt-1 text-sm text-slate-900 sm:mt-0 sm:flex-auto font-medium">{user?.fullName || "—"}</dd>
        </div>
        <div className="px-6 py-5 sm:flex sm:items-center">
          <dt className="text-sm font-medium text-slate-500 sm:w-48 sm:flex-none">E-mail</dt>
          <dd className="mt-1 text-sm text-slate-900 sm:mt-0 sm:flex-auto font-medium">{user?.primaryEmailAddress?.emailAddress || "—"}</dd>
        </div>
        <div className="px-6 py-5 sm:flex sm:items-center">
          <dt className="text-sm font-medium text-slate-500 sm:w-48 sm:flex-none">Conta criada em</dt>
          <dd className="mt-1 text-sm text-slate-900 sm:mt-0 sm:flex-auto font-medium">
            {user?.createdAt ? new Date(user.createdAt).toLocaleDateString("pt-BR") : "—"}
          </dd>
        </div>
      </div>
    </div>
  );
}
