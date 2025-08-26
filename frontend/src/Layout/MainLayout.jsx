import { ResizablePanelGroup, ResizablePanel, ResizableHandle } from '@/components/ui/resizable'
import { Outlet } from 'react-router'
import LeftSideBar from './components/LeftSideBar'
import TopBar from './components/TopBar'
const MainLayout = () => {

 

  return (
    <div className="h-screen flex flex-col">
        <TopBar />
      <ResizablePanelGroup direction= "horizontal" className="h-full">
        

        {/* left side */}
        <ResizablePanel defaultSize={30} minSize={30} maxSize={45}>
          <LeftSideBar/>
        </ResizablePanel>
        <ResizableHandle />
        {/* main content */}  
        <ResizablePanel>
          <Outlet />
        </ResizablePanel>

      </ResizablePanelGroup>
    </div>
  )
}

export default MainLayout
