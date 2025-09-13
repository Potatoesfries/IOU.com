import iouLogo from "@/img/iouLogo.png"

const Privacy = () => {
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
          Privacy Policy
        </h1>
        <p className="text-lg text-gray-600 max-w-2xl mx-auto">
          At <span className="font-semibold">IOU.com</span>, your privacy is our priority.  
          This policy explains how we handle and protect your data.
        </p>
      </header>

      {/* Content */}
      <section className="max-w-4xl mx-auto px-6 py-12 space-y-12">
        <div>
          <h2 className="text-2xl font-semibold text-gray-900 mb-3">1. Information We Collect</h2>
          <p className="text-gray-600 leading-relaxed">
            We collect account details such as your name, email, and authentication
            credentials. Debt notes and related data are stored securely and accessible
            only to you.
          </p>
        </div>

        <div>
          <h2 className="text-2xl font-semibold text-gray-900 mb-3">2. How We Use Data</h2>
          <p className="text-gray-600 leading-relaxed">
            Your data is used solely to provide and improve the IOU.com experience.
            We never sell or share your personal information for marketing purposes.
          </p>
        </div>

        <div>
          <h2 className="text-2xl font-semibold text-gray-900 mb-3">3. Security</h2>
          <p className="text-gray-600 leading-relaxed">
            We use encryption and secure authentication practices to protect your data
            from unauthorized access.
          </p>
        </div>

        <div>
          <h2 className="text-2xl font-semibold text-gray-900 mb-3">4. Your Rights</h2>
          <p className="text-gray-600 leading-relaxed">
            You may request access, correction, or deletion of your personal data by
            contacting our support team.
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

export default Privacy
