import { HeroSmall } from "@/components/sections/hero-small";
import { ContactSection } from "@/components/sections/contact-section";
import { ContactFAQ } from "@/components/sections/contact-faq";

export const metadata = {
  title: "BLACKWOLF — Контакт",
  description: "Свържете се с екипа на BlackWolf.",
};

export default function ContactBG() {
  return (
    <>
      <HeroSmall
        badge="Свържете се"
        title="Нека изградим вашата дигитална инфраструктура"
        subtitle="Независимо дали сте готови да започнете или просто проучвате опции, ние сме тук да помогнем."
      />
      <ContactSection />
      <ContactFAQ />
    </>
  );
}
