import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Privacy Policy — BlackWolf",
  description: "BlackWolf Sec Privacy Policy",
};

export default function PrivacyPage() {
  return (
    <main className="min-h-screen bg-[#050510] text-[#E4E4E7] py-20 px-6">
      <article className="max-w-3xl mx-auto prose prose-invert">
        <h1 className="text-4xl font-bold mb-2">Privacy Policy</h1>
        <p className="text-sm text-zinc-500 mb-10">Last updated: 10 May 2026</p>

        <p>
          This Privacy Policy describes how <strong>BlackWolf Sec</strong>{" "}
          (&ldquo;we&rdquo;, &ldquo;our&rdquo; or &ldquo;us&rdquo;) collects, uses, and discloses
          information about you when you use our products and services accessible
          at blackwolfsec.io and its subdomains (collectively, the &ldquo;Service&rdquo;).
        </p>

        <h2 className="text-2xl font-semibold mt-10 mb-4">1. Information we collect</h2>
        <ul>
          <li>
            <strong>Account information</strong>: name, email address, role and
            organization when you create an account or are added by an administrator.
          </li>
          <li>
            <strong>Communication data</strong>: messages, contacts, files and metadata
            from connected channels (WhatsApp, Email, Calendar, Instagram, etc.) when
            you explicitly connect those integrations.
          </li>
          <li>
            <strong>Usage data</strong>: pages visited, actions performed, IP address,
            browser and device identifiers, collected via standard server logs and
            cookies for security and product analytics.
          </li>
          <li>
            <strong>Payment data</strong>: processed by Stripe; we do not store card
            numbers on our servers.
          </li>
        </ul>

        <h2 className="text-2xl font-semibold mt-10 mb-4">2. How we use information</h2>
        <ul>
          <li>To provide, maintain and improve the Service.</li>
          <li>To authenticate users and protect against fraud or abuse.</li>
          <li>
            To send transactional notifications (security alerts, billing,
            service updates).
          </li>
          <li>
            To enable the integrations you explicitly connect (e.g. send WhatsApp
            messages on your behalf via Meta Business API or BSP providers such as
            360dialog).
          </li>
          <li>
            To comply with legal obligations and enforce our Terms of Service.
          </li>
        </ul>

        <h2 className="text-2xl font-semibold mt-10 mb-4">3. Sharing</h2>
        <p>
          We do not sell personal information. We share data only with: (a) sub-processors
          required to deliver the Service (Supabase for storage, Vercel for hosting,
          Anthropic for AI inference, Meta and 360dialog for messaging,
          Google for calendar/email, Stripe for payments, Resend for transactional email);
          (b) authorities when required by law; (c) successors in the event of a corporate
          transaction.
        </p>

        <h2 className="text-2xl font-semibold mt-10 mb-4">4. Retention</h2>
        <p>
          We retain account data for as long as your organization is a customer plus a
          90-day grace period after termination, after which it is permanently deleted
          unless legally required to be kept longer.
        </p>

        <h2 className="text-2xl font-semibold mt-10 mb-4">5. Your rights</h2>
        <p>
          Under GDPR and similar regulations you have the right to access, rectify,
          export, restrict or delete your personal data, and to object to certain
          processing. Contact{" "}
          <a href="mailto:privacy@blackwolfsec.io" className="text-orange-400 hover:underline">
            privacy@blackwolfsec.io
          </a>{" "}
          to exercise any of these rights.
        </p>

        <h2 className="text-2xl font-semibold mt-10 mb-4">6. Security</h2>
        <p>
          We use industry-standard measures including TLS in transit, encryption at rest
          for databases, role-based access control, principle of least privilege for staff
          access, and continuous logging and monitoring of all systems.
        </p>

        <h2 className="text-2xl font-semibold mt-10 mb-4">7. International transfers</h2>
        <p>
          Personal data may be processed in countries outside your jurisdiction including
          the European Economic Area and the United States. We rely on Standard Contractual
          Clauses where applicable.
        </p>

        <h2 className="text-2xl font-semibold mt-10 mb-4">8. Changes to this Policy</h2>
        <p>
          We may update this Policy from time to time. Material changes will be notified
          to the primary administrator email of each customer organization with at least
          30 days&apos; notice before they take effect.
        </p>

        <h2 className="text-2xl font-semibold mt-10 mb-4">9. Contact</h2>
        <p>
          BlackWolf Sec. Email:{" "}
          <a href="mailto:privacy@blackwolfsec.io" className="text-orange-400 hover:underline">
            privacy@blackwolfsec.io
          </a>
          . Postal address available upon request.
        </p>
      </article>
    </main>
  );
}
