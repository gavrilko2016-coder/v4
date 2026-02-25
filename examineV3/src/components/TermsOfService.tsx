import React from 'react';

export function TermsOfService() {
  return (
    <div className="min-h-screen bg-[#0D0D0D] text-gray-300 p-8 font-sans">
      <div className="max-w-4xl mx-auto space-y-8">
        <div className="border-b border-gray-800 pb-8">
          <h1 className="text-3xl font-bold text-white mb-2">Terms of Service</h1>
          <p className="text-sm text-gray-500">Last updated: February 25, 2026</p>
        </div>

        <div className="space-y-6">
          <p>
            These Terms of Service (“Terms”) govern your access to and use of the CryptoBetCasino online gaming platform (the “Platform”, “we”, “us”, “our”), including any content, functionality, and services offered on or through <a href="https://cryptobetcasino.vercel.app" className="text-[#00f5ff] hover:underline">https://cryptobetcasino.vercel.app</a>.
          </p>

          <section className="space-y-4">
            <h2 className="text-xl font-bold text-white">1. Acceptance of Terms</h2>
            <p>
              By accessing or using the Platform, you agree to be bound by these Terms. If you do not agree, do not use the Platform.
            </p>
          </section>

          <section className="space-y-4">
            <h2 className="text-xl font-bold text-white">2. Eligibility</h2>
            <p>
              You must be at least 18 years old (or the legal age of majority in your jurisdiction) to use the Platform. By using it, you represent and warrant that you meet this requirement.
            </p>
          </section>

          <section className="space-y-4">
            <h2 className="text-xl font-bold text-white">3. Account Registration</h2>
            <p>
              You may be required to create an account. You are responsible for maintaining the confidentiality of your credentials and for all activities under your account.
            </p>
          </section>

          <section className="space-y-4">
            <h2 className="text-xl font-bold text-white">4. Gameplay and Funds</h2>
            <ul className="list-disc pl-5 space-y-2">
              <li>All games are for entertainment purposes.</li>
              <li>Cryptocurrency deposits and withdrawals are final and irreversible.</li>
              <li>We reserve the right to refuse or cancel any transaction suspected of fraud or violation of these Terms.</li>
              <li>You are solely responsible for any taxes applicable to your winnings.</li>
            </ul>
          </section>

          <section className="space-y-4">
            <h2 className="text-xl font-bold text-white">5. Prohibited Conduct</h2>
            <p>You agree not to:</p>
            <ul className="list-disc pl-5 space-y-2">
              <li>Use bots, scripts, or automated tools to interact with the Platform.</li>
              <li>Attempt to manipulate games or exploit vulnerabilities.</li>
              <li>Engage in money laundering, fraud, or illegal activities.</li>
              <li>Share your account with others.</li>
            </ul>
          </section>

          <section className="space-y-4">
            <h2 className="text-xl font-bold text-white">6. Intellectual Property</h2>
            <p>
              All content on the Platform (graphics, games, logos, software) is owned by us or our licensors and protected by copyright and other laws.
            </p>
          </section>

          <section className="space-y-4">
            <h2 className="text-xl font-bold text-white">7. Limitation of Liability</h2>
            <p>
              The Platform is provided “as is”. We are not liable for any losses, including financial losses from gameplay, technical issues, or third-party actions. Your maximum liability is limited to the amount deposited in the last 30 days.
            </p>
          </section>

          <section className="space-y-4">
            <h2 className="text-xl font-bold text-white">8. Termination</h2>
            <p>
              We may suspend or terminate your access at any time, without notice, for violation of these Terms or for any other reason.
            </p>
          </section>

          <section className="space-y-4">
            <h2 className="text-xl font-bold text-white">9. Governing Law</h2>
            <p>
              These Terms are governed by the laws of Curacao. Disputes shall be resolved in arbitration in Curacao.
            </p>
          </section>

          <section className="space-y-4">
            <h2 className="text-xl font-bold text-white">10. Changes to Terms</h2>
            <p>
              We may update these Terms. Continued use after changes constitutes acceptance.
            </p>
          </section>
        </div>

        <div className="border-t border-gray-800 pt-8 mt-12 text-center">
          <a href="/" className="inline-flex items-center gap-2 text-[#00f5ff] hover:text-[#00ccdd] transition-colors font-mono text-sm font-bold">
            <span>←</span> BACK TO GAME
          </a>
        </div>
      </div>
    </div>
  );
}
