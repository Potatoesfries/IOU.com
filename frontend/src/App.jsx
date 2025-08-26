import {Route, Routes} from 'react-router'
import MainLayout from './Layout/MainLayout.jsx'
import Note from './pages/Note.jsx'
import { Toaster } from 'react-hot-toast'
import NotePage from './pages/NotePage.jsx'

const App = () => {
  return (
    <>
      <Routes>
        <Route element={<MainLayout />}>
          <Route path='/' element={<Note />} />
          <Route path='/debt-notes/:id' element={<NotePage />} />
        </Route>
      </Routes>
      <Toaster />
    </>
  )
}

export default App
