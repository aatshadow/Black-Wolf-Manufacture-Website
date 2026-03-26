import { HeroSmall } from "@/components/sections/hero-small";
import { ContactSection } from "@/components/sections/contact-section";
import { ContactFAQ } from "@/components/sections/contact-faq";

export const metadata = {
  title: "BLACKWOLF — Contact",
  description: "Get in touch with BlackWolf. Send us a message or book a consultation call.",
};

export default function ContactPage() {
  return (
    <>
      <HeroSmall
        badge="Get in Touch"
        title="Let's talk about your business."
        subtitle="Whether you're ready to start or just exploring options — we'd love to hear from you."
      />
      <ContactSection />
      <ContactFAQ />
    </>
  );
}
