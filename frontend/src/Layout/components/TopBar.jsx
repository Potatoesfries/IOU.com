import { Button } from "@/components/ui/button"
import { SignOutButton } from "@clerk/clerk-react"
import { Search } from "lucide-react"
import iouImage from "@/img/iou.png"

export default function DebtTopBar() {
  return (
    <header className="w-full bg-white border-b border-gray-200 px-6 py-3 flex items-center justify-between">
      {/* Title with Logo */}
      <div className="flex items-center gap-3">
        <a href="/">
         <img 
          src={iouImage} 
          alt="IOU Logo" 
          className="w-16 h-16 object-contain -my-2"
        />
        </a>
      </div>
      
      {/* Actions */}
      <div className="flex items-center gap-3">
        <div className="relative">
          <input
            type="text"
            placeholder="Search..."
            className="w-48 rounded-xl border border-gray-300 bg-gray-50 px-3 py-1.5 text-sm text-gray-700 focus:border-blue-500 focus:ring-1 focus:ring-blue-500 outline-none transition"
          />
          <Search
            size={16}
            className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400"
          />
        </div>
          <SignOutButton className="rounded-xl bg-blue-500 hover:bg-blue-600 text-white text-sm font-medium px-4 py-2 flex items-center gap-1 shadow-sm"/>
      </div>
    </header>
  )
}