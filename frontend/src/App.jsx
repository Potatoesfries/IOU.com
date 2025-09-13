import { Route, Routes } from "react-router"
import { SignedIn, SignedOut } from "@clerk/clerk-react"
import MainLayout from "./Layout/MainLayout.jsx"
import Note from "./pages/Note.jsx"
import { Toaster } from "react-hot-toast"
import NotePage from "./pages/NotePage.jsx"
import Login from "./SignUp/LogIn.jsx"
import AuthCallBackPage from "./auth-callBack/authCallBackPage.jsx"
import { SearchProvider } from "./context/SearchContext.jsx"
import Dashboard from "./pages/dashboard.jsx"
import Profile from "./pages/Profile.jsx"
import SsoCallbackPage from "./loading/SsoLoading.jsx"
import LearnMore from "./pages/LearnMore.jsx"
import Terms from "./pages/Terms.jsx"
import Privacy from "./pages/Privacy.jsx"

const App = () => {
  return (
    <SearchProvider>
      <Routes>
        {/* Root route (protected area) */}
        <Route
          path="/"
          element={
            <>
              <SignedOut>
                <Login />
              </SignedOut>
              <SignedIn>
                <MainLayout />
              </SignedIn>
            </>
          }
        >
          <Route index element={<Note />} />
          <Route path="dashboard" element={<Dashboard />} />
          <Route path="profile" element={<Profile />} />
          <Route path="debt-notes/:id" element={<NotePage />} />
        </Route>

        {/*  Public route (no auth required) */}
        <Route path="/learn-more" element={<LearnMore />} />
        <Route path="/Terms" element={<Terms />} />
        <Route path="/Privacy" element={<Privacy />} />

        {/* Clerk callback routes */}
        <Route path="/sso-callback" element={<SsoCallbackPage />} />
        <Route path="/auth-callback" element={<AuthCallBackPage />} />
      </Routes>
      <Toaster />
    </SearchProvider>
  )
}

export default App
