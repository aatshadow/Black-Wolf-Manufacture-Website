"use client";

import { useState } from "react";
import { motion } from "framer-motion";
import { Plus, Minus } from "lucide-react";

interface AccordionItem {
  question: string;
  answer: string;
}

export function Accordion({ items }: { items: AccordionItem[] }) {
  const [openItem, setOpenItem] = useState<number | null>(null);

  return (
    <div className="mx-auto max-w-2xl">
      {items.map((item, index) => {
        const isOpen = openItem === index;
        return (
          <div key={index} className="border-b border-white/10">
            <button
              onClick={() => setOpenItem(isOpen ? null : index)}
              className="flex w-full items-center justify-between py-6 text-left transition-colors hover:text-blue-400"
            >
              <span className="pr-4 text-base font-medium text-white">{item.question}</span>
              <div className="relative h-5 w-5 shrink-0">
                <Plus
                  className={`absolute inset-0 h-5 w-5 text-white/60 transition-all duration-300 ${isOpen ? "rotate-90 opacity-0" : "opacity-100"}`}
                />
                <Minus
                  className={`absolute inset-0 h-5 w-5 text-blue-500 transition-all duration-300 ${isOpen ? "opacity-100" : "-rotate-90 opacity-0"}`}
                />
              </div>
            </button>
            <motion.div
              initial={false}
              animate={{ height: isOpen ? "auto" : 0, opacity: isOpen ? 1 : 0 }}
              transition={{ duration: 0.4, ease: [0.16, 1, 0.3, 1] }}
              className="overflow-hidden"
            >
              <div className="pb-6 text-sm leading-relaxed text-white/60">{item.answer}</div>
            </motion.div>
          </div>
        );
      })}
    </div>
  );
}
