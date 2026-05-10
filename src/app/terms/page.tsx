import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Terms of Service — BlackWolf",
  description: "BlackWolf Sec Terms of Service",
};

export default function TermsPage() {
  return (
    <main className="min-h-screen bg-[#050510] text-[#E4E4E7] py-20 px-6">
      <article className="max-w-3xl mx-auto prose prose-invert">
        <h1 className="text-4xl font-bold mb-2">Terms of Service</h1>
        <p className="text-sm text-zinc-500 mb-10">Last updated: 10 May 2026</p>

        <h2 className="text-2xl font-semibold mt-10 mb-4">1. Acceptance</h2>
        <p>
          By accessing or using the products and services offered by{" "}
          <strong>BlackWolf Sec</strong> at blackwolfsec.io and its subdomains
          (the &ldquo;Service&rdquo;), you (the &ldquo;Customer&rdquo;) agree to be bound by these Terms of
          Service. If you are entering into this agreement on behalf of a company,
          you represent that you have authority to bind that company.
        </p>

        <h2 className="text-2xl font-semibold mt-10 mb-4">2. The Service</h2>
        <p>
          BlackWolf Sec provides operational software including but not limited to a
          unified inbox, CRM, integrations with messaging providers (WhatsApp via
          Meta Business API and BSPs such as 360dialog, Instagram, Email, Calendar),
          AI-assisted automation and analytics for organizations.
        </p>

        <h2 className="text-2xl font-semibold mt-10 mb-4">3. Customer responsibilities</h2>
        <ul>
          <li>
            You are responsible for the accuracy of the data you submit and for
            obtaining all necessary consents from your end users (including consent
            to send them WhatsApp/email/SMS messages where applicable).
          </li>
          <li>
            You must comply with all applicable laws including data protection,
            anti-spam (e.g. CAN-SPAM, LSSI, RGPD) and platform-specific policies
            (Meta Business Messaging Policy for WhatsApp, etc.).
          </li>
          <li>
            You will not use the Service to send unsolicited bulk communications,
            phishing, malware, or any content that violates third-party rights.
          </li>
        </ul>

        <h2 className="text-2xl font-semibold mt-10 mb-4">4. Fees and payment</h2>
        <p>
          Fees are stated in your Order Form or pricing page and are non-refundable
          except as required by law. Late payments accrue interest at 1.5% per month
          or the maximum permitted by law. Third-party message and infrastructure costs
          (Meta WhatsApp conversations, BSP fees, Twilio, etc.) are passed through at cost
          unless otherwise stated.
        </p>

        <h2 className="text-2xl font-semibold mt-10 mb-4">5. Intellectual property</h2>
        <p>
          BlackWolf Sec retains all rights, title and interest in the Service, including
          the underlying software, designs and trademarks. Customer retains ownership
          of its own data submitted to the Service. By using the Service, Customer grants
          BlackWolf Sec a limited license to process Customer Data solely to provide
          the Service.
        </p>

        <h2 className="text-2xl font-semibold mt-10 mb-4">6. Confidentiality</h2>
        <p>
          Each party will protect the other&apos;s confidential information using at
          least the same degree of care it uses to protect its own confidential
          information of similar sensitivity, and not less than reasonable care.
        </p>

        <h2 className="text-2xl font-semibold mt-10 mb-4">7. Warranties and disclaimers</h2>
        <p>
          The Service is provided &ldquo;as is&rdquo; without warranties of any kind, express or
          implied, including warranties of merchantability, fitness for a particular
          purpose, and non-infringement. We do not warrant that the Service will be
          uninterrupted or error-free.
        </p>

        <h2 className="text-2xl font-semibold mt-10 mb-4">8. Limitation of liability</h2>
        <p>
          To the maximum extent permitted by law, neither party will be liable for any
          indirect, incidental, special, consequential or punitive damages, or any loss
          of profits or revenues. Each party&apos;s total liability arising out of these
          Terms is limited to the amount paid by Customer to BlackWolf Sec in the
          12 months preceding the event giving rise to liability.
        </p>

        <h2 className="text-2xl font-semibold mt-10 mb-4">9. Termination</h2>
        <p>
          Either party may terminate these Terms upon 30 days&apos; written notice. Either
          party may terminate immediately for material breach not cured within 15 days
          of notice. Upon termination, Customer Data will be retained for 90 days during
          which Customer may export it; thereafter it will be permanently deleted.
        </p>

        <h2 className="text-2xl font-semibold mt-10 mb-4">10. Governing law</h2>
        <p>
          These Terms are governed by the laws of Spain. Disputes will be resolved
          exclusively by the courts of Madrid, Spain, unless mandatory consumer law
          provides otherwise.
        </p>

        <h2 className="text-2xl font-semibold mt-10 mb-4">11. Contact</h2>
        <p>
          BlackWolf Sec. Email:{" "}
          <a href="mailto:legal@blackwolfsec.io" className="text-orange-400 hover:underline">
            legal@blackwolfsec.io
          </a>
          .
        </p>
      </article>
    </main>
  );
}
