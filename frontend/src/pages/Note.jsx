import { CreditCard } from "lucide-react";

const DebtDefault = () => {
  return (
    <main className="min-h-screen bg-gradient-to-br from-red-50 to-orange-50 flex items-center justify-center p-4">
      <div className="text-center">
        <div className="bg-white rounded-2xl shadow-lg p-8 max-w-md w-full border border-white/20">
          <div className="mx-auto w-16 h-16 bg-gradient-to-br from-red-500 to-orange-600 rounded-2xl flex items-center justify-center shadow-lg mb-6">
            <CreditCard className="w-8 h-8 text-white" />
          </div>
          <h1 className="text-3xl font-bold bg-gradient-to-r from-red-500 to-orange-600 bg-clip-text text-transparent mb-4">
            Select a Debt Record
          </h1>
          <p className="text-gray-600">
            Choose a debt record from your collection to view details and manage payments
          </p>
        </div>
      </div>
    </main>
  );
};

export default DebtDefault;