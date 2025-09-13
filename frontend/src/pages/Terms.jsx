import iouLogo from "@/img/iouLogo.png"

const Terms = () => {
  return (
    <div className="min-h-screen bg-gradient-to-b from-white to-gray-50 text-gray-800">
      {/* Header */}
      <header className="text-center px-6 py-16">
        <img
          src={iouLogo}
          alt="IOU Logo"
          className="mx-auto w-20 h-20 object-contain mb-6"
        />
        <h1 className="text-4xl font-extrabold text-gray-900 mb-4">
          Terms of Service
        </h1>
        <p className="text-lg text-gray-600 max-w-2xl mx-auto">
          Welcome to <span className="font-semibold">IOU.com</span>.  
          By using our services, you agree to the following terms.
        </p>
      </header>

      {/* Content */}
      <section className="max-w-4xl mx-auto px-6 py-12 space-y-12">
        <div>
          <h2 className="text-2xl font-semibold text-gray-900 mb-3">1. Use of Service</h2>
          <p className="text-gray-600 leading-relaxed">
            IOU.com is built to help you track debts and promises. You agree not to misuse
            the platform or engage in activities that may harm other users or our system.
          </p>
        </div>

        <div>
          <h2 className="text-2xl font-semibold text-gray-900 mb-3">2. Accounts</h2>
          <p className="text-gray-600 leading-relaxed">
            You are responsible for maintaining the security of your account. Sharing login
            credentials is not permitted and may result in account suspension.
          </p>
        </div>

        <div>
          <h2 className="text-2xl font-semibold text-gray-900 mb-3">3. Limitations</h2>
          <p className="text-gray-600 leading-relaxed">
            IOU.com does not provide financial or legal advice. The platform is intended
            for personal record-keeping purposes only.
          </p>
        </div>

        <div>
          <h2 className="text-2xl font-semibold text-gray-900 mb-3">4. Termination</h2>
          <p className="text-gray-600 leading-relaxed">
            We reserve the right to suspend or terminate accounts that violate these terms
            or misuse the platform.
          </p>
        </div>
      </section>

      {/* Footer */}
      <footer className="text-center text-gray-500 text-sm py-8 border-t">
        Last updated: {new Date().getFullYear()} • © IOU.com
      </footer>
    </div>
  )
}

export default Terms
