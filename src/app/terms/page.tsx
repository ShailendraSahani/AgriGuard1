import { Metadata } from 'next';
import Link from 'next/link';
import { ArrowLeft } from 'lucide-react';

export const metadata: Metadata = {
  title: 'Terms of Service | AgriGuard',
  description: 'Terms of Service for AgriGuard Marketplace - Read our terms and conditions for using our platform.',
};

export default function TermsPage() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-green-50 to-white">
      {/* Header */}
      <div className="bg-white shadow-sm border-b">
        <div className="max-w-4xl mx-auto px-6 py-4">
          <Link
            href="/"
            className="inline-flex items-center gap-2 text-green-600 hover:text-green-700 transition-colors"
          >
            <ArrowLeft className="w-4 h-4" />
            Back to Home
          </Link>
        </div>
      </div>

      {/* Content */}
      <div className="max-w-4xl mx-auto px-6 py-12">
        <div className="bg-white rounded-2xl shadow-lg p-8 md:p-12">
          <h1 className="text-4xl font-bold text-gray-900 mb-8">Terms of Service</h1>
          <p className="text-gray-600 mb-6">Last updated: {new Date().toLocaleDateString()}</p>

          <div className="prose prose-lg max-w-none">
            <section className="mb-8">
              <h2 className="text-2xl font-semibold text-gray-900 mb-4">1. Acceptance of Terms</h2>
              <p className="text-gray-700 leading-relaxed">
                By accessing and using AgriGuard Marketplace ("the Platform"), you accept and agree to be bound by the terms and provision of this agreement. If you do not agree to abide by the above, please do not use this service.
              </p>
            </section>

            <section className="mb-8">
              <h2 className="text-2xl font-semibold text-gray-900 mb-4">2. Description of Service</h2>
              <p className="text-gray-700 leading-relaxed mb-4">
                AgriGuard Marketplace is an online platform that connects farmers, landowners, and service providers for agricultural services including:
              </p>
              <ul className="list-disc pl-6 text-gray-700 space-y-2">
                <li>Land leasing and rental services</li>
                <li>Agricultural equipment and machinery booking</li>
                <li>Farm labor and service provider connections</li>
                <li>Agricultural consulting and advisory services</li>
                <li>Package deals for comprehensive farming solutions</li>
              </ul>
            </section>

            <section className="mb-8">
              <h2 className="text-2xl font-semibold text-gray-900 mb-4">3. User Accounts</h2>
              <h3 className="text-xl font-medium text-gray-800 mb-3">Account Registration</h3>
              <ul className="list-disc pl-6 text-gray-700 space-y-2 mb-4">
                <li>You must provide accurate and complete information during registration</li>
                <li>You are responsible for maintaining the confidentiality of your account credentials</li>
                <li>You must be at least 18 years old to create an account</li>
                <li>One person or entity may not maintain more than one account</li>
              </ul>

              <h3 className="text-xl font-medium text-gray-800 mb-3">Account Types</h3>
              <ul className="list-disc pl-6 text-gray-700 space-y-2">
                <li><strong>Farmers:</strong> Users seeking to lease land or book agricultural services</li>
                <li><strong>Land Owners:</strong> Users offering land for lease</li>
                <li><strong>Service Providers:</strong> Users offering agricultural services and equipment</li>
                <li><strong>Administrators:</strong> Platform management and oversight</li>
              </ul>
            </section>

            <section className="mb-8">
              <h2 className="text-2xl font-semibold text-gray-900 mb-4">4. User Responsibilities</h2>
              <ul className="list-disc pl-6 text-gray-700 space-y-2">
                <li>Provide accurate and truthful information about services, land, or requirements</li>
                <li>Respect intellectual property rights of other users and the platform</li>
                <li>Comply with all applicable laws and regulations</li>
                <li>Maintain professional conduct in all interactions</li>
                <li>Honor all bookings, agreements, and financial commitments</li>
                <li>Report any suspicious or illegal activities</li>
              </ul>
            </section>

            <section className="mb-8">
              <h2 className="text-2xl font-semibold text-gray-900 mb-4">5. Prohibited Activities</h2>
              <p className="text-gray-700 leading-relaxed mb-4">You agree not to engage in any of the following prohibited activities:</p>
              <ul className="list-disc pl-6 text-gray-700 space-y-2">
                <li>Violating any applicable laws or regulations</li>
                <li>Impersonating another person or entity</li>
                <li>Uploading malicious code or interfering with platform functionality</li>
                <li>Harassing, threatening, or abusing other users</li>
                <li>Posting false, misleading, or fraudulent information</li>
                <li>Attempting to gain unauthorized access to other accounts or systems</li>
                <li>Using the platform for any illegal agricultural practices</li>
              </ul>
            </section>

            <section className="mb-8">
              <h2 className="text-2xl font-semibold text-gray-900 mb-4">6. Payment Terms</h2>
              <ul className="list-disc pl-6 text-gray-700 space-y-2">
                <li>All payments are processed securely through approved payment processors</li>
                <li>Service fees are clearly displayed before booking confirmation</li>
                <li>Refunds are subject to the cancellation policy of individual service providers</li>
                <li>Disputes regarding payments should be reported within 30 days</li>
                <li>Platform fees may apply to certain transactions</li>
              </ul>
            </section>

            <section className="mb-8">
              <h2 className="text-2xl font-semibold text-gray-900 mb-4">7. Intellectual Property</h2>
              <p className="text-gray-700 leading-relaxed">
                The Platform and its original content, features, and functionality are owned by AgriGuard and are protected by international copyright, trademark, patent, trade secret, and other intellectual property laws.
              </p>
            </section>

            <section className="mb-8">
              <h2 className="text-2xl font-semibold text-gray-900 mb-4">8. Limitation of Liability</h2>
              <p className="text-gray-700 leading-relaxed">
                AgriGuard Marketplace shall not be liable for any indirect, incidental, special, consequential, or punitive damages resulting from your use of the platform or any interactions between users.
              </p>
            </section>

            <section className="mb-8">
              <h2 className="text-2xl font-semibold text-gray-900 mb-4">9. Termination</h2>
              <p className="text-gray-700 leading-relaxed">
                We reserve the right to terminate or suspend your account and access to the Platform immediately, without prior notice, for any violation of these Terms of Service.
              </p>
            </section>

            <section className="mb-8">
              <h2 className="text-2xl font-semibold text-gray-900 mb-4">10. Governing Law</h2>
              <p className="text-gray-700 leading-relaxed">
                These Terms shall be interpreted and governed by the laws of the jurisdiction in which AgriGuard operates, without regard to conflict of law provisions.
              </p>
            </section>

            <section className="mb-8">
              <h2 className="text-2xl font-semibold text-gray-900 mb-4">11. Contact Information</h2>
              <p className="text-gray-700 leading-relaxed">
                If you have any questions about these Terms of Service, please contact us:
              </p>
              <div className="bg-gray-50 p-4 rounded-lg mt-4">
                <p className="text-gray-700">Email: legal@agriguard.com</p>
                <p className="text-gray-700">Phone: +1 (555) 123-4567</p>
                <p className="text-gray-700">Address: 123 Farm Road, AgriCity</p>
              </div>
            </section>

            <section>
              <h2 className="text-2xl font-semibold text-gray-900 mb-4">12. Changes to Terms</h2>
              <p className="text-gray-700 leading-relaxed">
                We reserve the right to modify these Terms at any time. We will notify users of material changes via email or platform notification. Continued use of the Platform constitutes acceptance of modified terms.
              </p>
            </section>
          </div>
        </div>
      </div>
    </div>
  );
}
