import React from 'react';

export function PrivacyPolicy() {
  return (
    <div className="min-h-screen bg-[#0D0D0D] text-gray-300 p-8 font-sans">
      <div className="max-w-4xl mx-auto space-y-8">
        <div className="border-b border-gray-800 pb-8">
          <h1 className="text-3xl font-bold text-white mb-2">Privacy Policy</h1>
          <p className="text-sm text-gray-500">Last updated: February 25, 2026</p>
        </div>

        <div className="space-y-6">
          <p>
            CryptoBetCasino (hereinafter referred to as the “Platform”, “we”, “us”) respects your privacy and is committed to protecting your personal data. This Privacy Policy explains how we collect, use, disclose, and safeguard information when you use our website and online games.
          </p>

          <section className="space-y-4">
            <h2 className="text-xl font-bold text-white">1. What data we collect</h2>
            <p>We may collect the following types of information:</p>
            <ul className="list-disc pl-5 space-y-2">
              <li><strong className="text-white">Registration data:</strong> username, email, password (hashed).</li>
              <li><strong className="text-white">Financial data:</strong> cryptocurrency wallet addresses, transaction history (deposits, withdrawals).</li>
              <li><strong className="text-white">Technical data:</strong> IP address, device type, browser, login times and dates, cookies, and interaction data with the site.</li>
              <li><strong className="text-white">Gameplay data:</strong> betting history, balance, wins/losses (anonymized).</li>
              <li><strong className="text-white">Data from third parties:</strong> if you use services like MoonPay for funding — they only share necessary transaction information with us (in accordance with their policy: <a href="https://www.moonpay.com/legal/privacy_policy" target="_blank" rel="noreferrer" className="text-[#00f5ff] hover:underline">https://www.moonpay.com/legal/privacy_policy</a>).</li>
            </ul>
          </section>

          <section className="space-y-4">
            <h2 className="text-xl font-bold text-white">2. How we use your data</h2>
            <ul className="list-disc pl-5 space-y-2">
              <li>To provide access to games and platform functionality.</li>
              <li>To process transactions, verify balances, and handle withdrawals.</li>
              <li>To prevent fraud, money laundering, and comply with legal requirements.</li>
              <li>To improve the service and analyze user behavior (anonymously).</li>
              <li>To send notifications about bonuses, promotions (if you have given consent).</li>
            </ul>
          </section>

          <section className="space-y-4">
            <h2 className="text-xl font-bold text-white">3. With whom we share data</h2>
            <p>We do not sell your personal data. Data may be shared with:</p>
            <ul className="list-disc pl-5 space-y-2">
              <li>Payment processing partners (MoonPay, blockchain networks).</li>
              <li>Regulatory authorities, if required by law.</li>
              <li>Analytics providers (Google Analytics, Vercel, etc.) — only anonymized data.</li>
            </ul>
          </section>

          <section className="space-y-4">
            <h2 className="text-xl font-bold text-white">4. Data protection</h2>
            <p>
              We use encryption (HTTPS, SSL), two-factor authentication (where possible), access restrictions, and regular security audits. However, no system is 100% secure — we are not responsible for losses caused by third-party actions.
            </p>
          </section>

          <section className="space-y-4">
            <h2 className="text-xl font-bold text-white">5. Your rights</h2>
            <p>You have the right to:</p>
            <ul className="list-disc pl-5 space-y-2">
              <li>Access your data.</li>
              <li>Correct inaccurate information.</li>
              <li>Request deletion of your data (except data we are legally required to retain).</li>
              <li>Withdraw consent for marketing purposes.</li>
            </ul>
            <p className="mt-4">
              To exercise your rights, contact us at: <a href="mailto:support@cryptobetcasino.vercel.app" className="text-[#00f5ff] hover:underline">support@cryptobetcasino.vercel.app</a>
            </p>
          </section>

          <section className="space-y-4">
            <h2 className="text-xl font-bold text-white">6. Cookies and trackers</h2>
            <p>
              We use cookies for site functionality, analytics, and personalization. You can manage them in your browser settings.
            </p>
          </section>

          <section className="space-y-4">
            <h2 className="text-xl font-bold text-white">7. Children</h2>
            <p>
              The Platform is not intended for individuals under 18 years of age. We do not knowingly collect data from minors.
            </p>
          </section>

          <section className="space-y-4">
            <h2 className="text-xl font-bold text-white">8. Changes to the policy</h2>
            <p>
              We may update this policy. Significant changes will be notified via email or on the website.
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
