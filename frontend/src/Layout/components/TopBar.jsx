import { Link } from "react-router";
const TopBar = () => {
  return (
    <div className="flex items-center justify-between h-14 px-4 sticky top-0 bg-white backdrop-blur-md z-10 border-b">
      
      {/* ✅ Left: Logo */}
      
        <Link to = "/" className="flex items-center gap-2">
        <img

          src="/logo/logo.png" 
          alt="Logo"
          className="h-8 w-8 object-contain"
        />
        <span className="text-lg font-semibold text-gray-800">My Notes</span>
        </Link>
        
     

    </div>
  );
};

export default TopBar;

// ✅ Stub DeleteNoteButton – you replace this with your real component
const DeleteNoteButton = () => {
  console.log("deleting note", note)

  const handleDelete = ()=>{
    
  }

  return (
    <button className="px-4 py-2 bg-red-600 text-white rounded-md hover:bg-red-700 transition"
      onClick={handleDelete}
      >
      Delete Note
    </button>
  );
};
