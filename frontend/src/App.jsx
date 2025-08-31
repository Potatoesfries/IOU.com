import {Route, Routes} from 'react-router'
import { AuthenticateWithRedirectCallback, SignedIn, SignedOut } from '@clerk/clerk-react'
import MainLayout from './Layout/MainLayout.jsx'
import Note from './pages/Note.jsx'
import { Toaster } from 'react-hot-toast'
import NotePage from './pages/NotePage.jsx'
import Login from './SignUp/LogIn.jsx'
import AuthCallBackPage from './auth-callBack/authCallBackPage.jsx'

const App = () => {
  return (
    <>
      <Routes>
        {/* Root route - conditional based on auth status */}
        <Route path='/' element={
          <>
            <SignedOut>
              <Login />
            </SignedOut>
            <SignedIn>
              <MainLayout />
            </SignedIn>
          </>
        }>
          {/* Nested routes only accessible when signed in */}
          <Route index element={
            <SignedIn>
              <Note />
            </SignedIn>
          } />
          <Route path='debt-notes/:id' element={
            <SignedIn>
              <NotePage />
            </SignedIn>
          } />
        </Route>

        {/* Auth callback routes */}
        <Route path='/sso-callback' element={<AuthenticateWithRedirectCallback />} />
        <Route path="/auth-callback" element={<AuthCallBackPage />} />
      </Routes>
      <Toaster />
    </>
  )
}

export default App