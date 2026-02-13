"use client";

export default function SettingsNotificationsPage() {
  return (
    <div className="space-y-16">
      <div>
        <h2 className="text-base/7 font-semibold text-gray-900">Notificações</h2>
        <p className="mt-1 text-sm/6 text-gray-500">
          Configure como e quando receber alertas sobre os PCs.
        </p>

        <dl className="mt-6 divide-y divide-gray-100 border-t border-gray-200 text-sm/6">
          <div className="flex py-6">
            <dt className="font-medium text-gray-900 sm:w-64 sm:flex-none sm:pr-6">Alerta de strikes</dt>
            <dd className="flex flex-auto items-center justify-end">
              <div className="group relative inline-flex w-8 shrink-0 rounded-full bg-indigo-600 p-px ring-1 ring-inset ring-gray-900/5 outline-offset-2">
                <span className="size-4 translate-x-3.5 rounded-full bg-white shadow-xs ring-1 ring-gray-900/5 transition-transform duration-200 ease-in-out"></span>
                <input type="checkbox" className="absolute inset-0 size-full cursor-pointer appearance-none focus:outline-hidden" defaultChecked />
              </div>
            </dd>
          </div>
          <div className="flex py-6">
            <dt className="font-medium text-gray-900 sm:w-64 sm:flex-none sm:pr-6">Alerta de programa encerrado</dt>
            <dd className="flex flex-auto items-center justify-end">
              <div className="group relative inline-flex w-8 shrink-0 rounded-full bg-indigo-600 p-px ring-1 ring-inset ring-gray-900/5 outline-offset-2">
                <span className="size-4 translate-x-3.5 rounded-full bg-white shadow-xs ring-1 ring-gray-900/5 transition-transform duration-200 ease-in-out"></span>
                <input type="checkbox" className="absolute inset-0 size-full cursor-pointer appearance-none focus:outline-hidden" defaultChecked />
              </div>
            </dd>
          </div>
          <div className="flex py-6">
            <dt className="font-medium text-gray-500 sm:w-64 sm:flex-none sm:pr-6">Resumo diário por email</dt>
            <dd className="flex flex-auto items-center justify-end">
              <span className="inline-flex items-center rounded-md bg-gray-100 px-2 py-1 text-xs font-medium text-gray-500">
                Em breve
              </span>
            </dd>
          </div>
        </dl>
      </div>
    </div>
  );
}
