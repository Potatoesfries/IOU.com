import { FileText } from "lucide-react";

export default function DebtDefault() {
  return (
    <main className="flex h-screen w-full items-center justify-center bg-gray-50">
      <div className="flex flex-col items-center text-center max-w-sm px-6 py-8 bg-white rounded-2xl shadow-sm">
        {/* Icon */}
        <div className="flex h-14 w-14 items-center justify-center rounded-full bg-gray-100 mb-4">
          <FileText size={28} className="text-gray-400" />
        </div>

        {/* Title */}
        <h2 className="text-xl font-semibold text-gray-800">
          No Debt Selected
        </h2>

        {/* Subtitle */}
        <p className="mt-2 text-sm text-gray-500 leading-relaxed">
          Choose a debt from the list or add a new one to get started.
        </p>
      </div>
    </main>
  );
}
