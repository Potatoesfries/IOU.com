import { useState, useEffect, useRef } from "react";
import { ResizablePanelGroup, ResizablePanel, ResizableHandle } from "@/components/ui/resizable";
import { Outlet } from "react-router";
import LeftSideBar from "./components/LeftSideBar";
import TopBar from "./components/TopBar";
import { Menu } from "lucide-react"; // small menu icon

const MainLayout = () => {
  const [isMobile, setIsMobile] = useState(false);
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const sidebarRef = useRef(null);

  // Detect screen size
  useEffect(() => {
    const handleResize = () => setIsMobile(window.innerWidth < 768); // Tailwind md breakpoint
    handleResize();
    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  // Close sidebar when clicking outside
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (
        sidebarOpen &&
        sidebarRef.current &&
        !sidebarRef.current.contains(event.target)
      ) {
        setSidebarOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, [sidebarOpen]);

  const toggleSidebar = () => setSidebarOpen(!sidebarOpen);

  return (
    <div className="h-screen flex flex-col">
      {/* TopBar with menu toggle on mobile */}
      <div className="flex items-center  p-2">
        {isMobile && (
          <button
            className="p-2 rounded-lg hover:bg-gray-100"
            onClick={toggleSidebar}
          >
            <Menu size={20} />
          </button>
        )}
        <TopBar />
      </div>

      <div className="flex flex-1 overflow-hidden">
        {isMobile ? (
          <>
            {/* Sidebar Drawer (mobile only) */}
            <div
              ref={sidebarRef}
              className={`fixed inset-y-0 left-0 transform ${
                sidebarOpen ? "translate-x-0" : "-translate-x-full"
              } transition-transform duration-300 ease-in-out bg-white shadow-lg w-64 z-40 flex flex-col`}
            >
              {/* Close button inside sidebar */}
              <div className="flex justify-end p-2 border-b">
                <button
                  className="p-1 rounded hover:bg-gray-200"
                  onClick={() => setSidebarOpen(false)}
                >
                  ✕
                </button>
              </div>

              {/* Sidebar content */}
              <LeftSideBar />
            </div>

            {/* Main content */}
            <main className="flex-1 overflow-auto p-4">
              <Outlet />
            </main>
          </>
        ) : (
          // Desktop layout with resizable sidebar
          <ResizablePanelGroup direction="horizontal">
            <ResizablePanel defaultSize={20} minSize={15} maxSize={25}>
              <LeftSideBar />
            </ResizablePanel>
            <ResizableHandle />
            <ResizablePanel defaultSize={80}>
              <main className="h-full overflow-auto p-4">
                <Outlet />
              </main>
            </ResizablePanel>
          </ResizablePanelGroup>
        )}
      </div>
    </div>
  );
};

export default MainLayout;
