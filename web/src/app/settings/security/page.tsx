"use client";

import { useUser } from "@clerk/nextjs";

export default function SettingsSecurityPage() {
  const { user } = useUser();

  return (
    <div className="space-y-16">
      <div>
        <h2 className="text-base/7 font-semibold text-gray-900">Segurança</h2>
        <p className="mt-1 text-sm/6 text-gray-500">
          Gerencie a segurança da sua conta.
        </p>

        <dl className="mt-6 divide-y divide-gray-100 border-t border-gray-200 text-sm/6">
          <div className="py-6 sm:flex">
            <dt className="font-medium text-gray-900 sm:w-64 sm:flex-none sm:pr-6">Email</dt>
            <dd className="mt-1 flex justify-between gap-x-6 sm:mt-0 sm:flex-auto">
              <div className="text-gray-900">
                {user?.primaryEmailAddress?.emailAddress || "—"}
              </div>
            </dd>
          </div>
          <div className="py-6 sm:flex">
            <dt className="font-medium text-gray-900 sm:w-64 sm:flex-none sm:pr-6">Senha</dt>
            <dd className="mt-1 flex justify-between gap-x-6 sm:mt-0 sm:flex-auto">
              <div className="text-gray-900">••••••••</div>
              <button
                type="button"
                onClick={() => user?.update({})}
                className="font-semibold text-indigo-600 hover:text-indigo-500"
              >
                Alterar
              </button>
            </dd>
          </div>
          <div className="py-6 sm:flex">
            <dt className="font-medium text-gray-900 sm:w-64 sm:flex-none sm:pr-6">Autenticação em dois fatores</dt>
            <dd className="mt-1 flex justify-between gap-x-6 sm:mt-0 sm:flex-auto">
              <div className="text-gray-500">Desativada</div>
            </dd>
          </div>
        </dl>
      </div>
    </div>
  );
}
