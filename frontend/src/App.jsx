import {Route, Routes} from 'react-router'
import { AuthenticateWithRedirectCallback, SignedIn, SignedOut, RedirectToSignIn } from '@clerk/clerk-react'
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
        {/* Public routes */}
        <Route path='/' element={
          <SignedOut>
            <Login />
          </SignedOut>
        } />
        <Route path='/sso-callback' element={<AuthenticateWithRedirectCallback />} />
        <Route path="/auth-callback" element={<AuthCallBackPage />} />

        {/* Protected routes */}
        <Route path='/debt-notes' element={
          <SignedIn>
            <MainLayout />
          </SignedIn>
        }>
          <Route index element={<Note />} />
          <Route path=':id' element={<NotePage />} />
        </Route>
        
        {/* Catch all protected routes and redirect if not signed in */}
        <Route path='/debt-notes/*' element={
          <SignedOut>
            <RedirectToSignIn />
          </SignedOut>
        } />
      </Routes>
      <Toaster />
    </>
  )
}

export default App