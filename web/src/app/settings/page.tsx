"use client";

import { useUser } from "@clerk/nextjs";

export default function SettingsProfilePage() {
  const { user } = useUser();

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-2xl font-display tracking-tight text-[#1a1a2e]">Perfil</h1>
        <p className="mt-1 text-sm text-gray-500">Informações da sua conta.</p>
      </div>

      <div className="card-flat divide-y divide-[#F0EBE5] overflow-hidden">
        <div className="px-6 py-5 sm:flex sm:items-center">
          <dt className="text-sm font-medium text-gray-500 sm:w-48 sm:flex-none">Nome</dt>
          <dd className="mt-1 text-sm text-[#1a1a2e] sm:mt-0 sm:flex-auto font-medium">{user?.fullName || "—"}</dd>
        </div>
        <div className="px-6 py-5 sm:flex sm:items-center">
          <dt className="text-sm font-medium text-gray-500 sm:w-48 sm:flex-none">E-mail</dt>
          <dd className="mt-1 text-sm text-[#1a1a2e] sm:mt-0 sm:flex-auto font-medium">{user?.primaryEmailAddress?.emailAddress || "—"}</dd>
        </div>
        <div className="px-6 py-5 sm:flex sm:items-center">
          <dt className="text-sm font-medium text-gray-500 sm:w-48 sm:flex-none">Conta criada em</dt>
          <dd className="mt-1 text-sm text-[#1a1a2e] sm:mt-0 sm:flex-auto font-medium">
            {user?.createdAt ? new Date(user.createdAt).toLocaleDateString("pt-BR") : "—"}
          </dd>
        </div>
      </div>
    </div>
  );
}
