import { SignOutButton } from "@clerk/clerk-react";
import { Link } from "react-router";

const DebtTopBar = () => {
  return (
    <div className="flex items-center justify-between h-14 px-4 sticky top-0 bg-white backdrop-blur-md z-10 border-b">
      
      {/* Left: Logo */}
      <Link to="/debt-notes" className="flex items-center gap-2">
        <div className="h-8 w-8 bg-gradient-to-br from-red-500 to-orange-600 rounded-lg flex items-center justify-center">
          <span className="text-white font-bold text-sm">$</span>
        </div>
        <span className="text-lg font-semibold text-gray-800">Debt Tracker</span>
        <SignOutButton/>
      </Link>

    </div>
  );
};

export default DebtTopBar;