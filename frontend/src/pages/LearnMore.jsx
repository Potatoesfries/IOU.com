import { CheckCircle, Users, Shield, Smartphone } from "lucide-react"
import iouLogo from "@/img/iouLogo.png"

const LearnMore = () => {
  return (
    <div className="min-h-screen bg-gradient-to-b from-white to-gray-50 text-gray-800">
      {/* Header Section */}
      <header className="text-center px-6 py-16">
        <img
          src={iouLogo}
          alt="IOU Logo"
          className="mx-auto w-20 h-20 object-contain mb-6"
        />
        <h1 className="text-4xl font-extrabold text-gray-900 mb-4">
          Welcome to <span>IOU.com</span>
        </h1>
        <p className="text-lg text-gray-600 max-w-2xl mx-auto">
          IOU.com helps you manage debts, promises, and shared responsibilities 
          with friends, family, or colleagues — securely and effortlessly.
        </p>
      </header>

      {/* Features Section */}
      <section className="max-w-5xl mx-auto px-6 py-12 grid grid-cols-1 md:grid-cols-2 gap-12">
        <div className="flex items-start gap-4">
          <CheckCircle className="w-8 h-8 text-blue-600 flex-shrink-0 mt-1" />
          <div>
            <h3 className="text-xl font-semibold text-gray-900">Track with Ease</h3>
            <p className="text-gray-600 mt-1">
              Record who owes you or what you owe in a simple, organized way.
            </p>
          </div>
        </div>

        <div className="flex items-start gap-4">
          <Users className="w-8 h-8 text-green-600 flex-shrink-0 mt-1" />
          <div>
            <h3 className="text-xl font-semibold text-gray-900">Stay Connected</h3>
            <p className="text-gray-600 mt-1">
              Manage debts between friends, family, or business partners without hassle.
            </p>
          </div>
        </div>

        <div className="flex items-start gap-4">
          <Shield className="w-8 h-8 text-purple-600 flex-shrink-0 mt-1" />
          <div>
            <h3 className="text-xl font-semibold text-gray-900">Secure by Design</h3>
            <p className="text-gray-600 mt-1">
              All your data is protected with modern authentication and encryption.
            </p>
          </div>
        </div>

        <div className="flex items-start gap-4">
          <Smartphone className="w-8 h-8 text-pink-600 flex-shrink-0 mt-1" />
          <div>
            <h3 className="text-xl font-semibold text-gray-900">Access Anywhere</h3>
            <p className="text-gray-600 mt-1">
              Log in from your phone, tablet, or desktop — track debts on the go.
            </p>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="text-center px-6 py-16 bg-blue-50">
        <h2 className="text-2xl font-bold text-gray-900 mb-4">
          Ready to get started?
        </h2>
        <p className="text-gray-600 mb-6">
          Sign up today and take control of your financial promises.
        </p>
        <a
          href="/"
          className="inline-block px-8 py-3 bg-blue-600 text-white font-medium rounded-full shadow hover:bg-blue-700 transition"
        >
          Get Started
        </a>
      </section>

      {/* Footer */}
      <footer className="text-center text-gray-500 text-sm py-8">
        © {new Date().getFullYear()} IOU.com — All rights reserved.
      </footer>
    </div>
  )
}

export default LearnMore
