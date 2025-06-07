import { FileText } from "lucide-react";

const Note = () => {
  return (
    <main className="min-h-screen bg-gradient-to-br from-slate-50 to-blue-50 flex items-center justify-center p-4">
      <div className="text-center">
        <div className="bg-white rounded-2xl shadow-lg p-8 max-w-md w-full border border-white/20">
          <div className="mx-auto w-16 h-16 bg-gradient-to-br from-blue-500 to-purple-600 rounded-2xl flex items-center justify-center shadow-lg mb-6">
            <FileText className="w-8 h-8 text-white" />
          </div>
          <h1 className="text-3xl font-bold bg-gradient-to-r from-blue-500 to-purple-600 bg-clip-text text-transparent mb-4">
            Select Your Note
          </h1>
          <p className="text-gray-600">
            Choose a note from your collection to get started
          </p>
        </div>
      </div>
    </main>
  );
};

export default Note;