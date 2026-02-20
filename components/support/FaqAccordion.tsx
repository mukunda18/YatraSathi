"use client";

import { useState } from "react";
import { HiChevronDown } from "react-icons/hi";

interface Faq {
    q: string;
    a: string;
}

interface FaqAccordionProps {
    category: {
        title: string;
        description: string;
        faqs: Faq[];
    };
}

export default function FaqAccordion({ category }: FaqAccordionProps) {
    const [open, setOpen] = useState<number | null>(null);

    const toggle = (index: number) => {
        if (open === index) {
            return setOpen(null);
        }
        setOpen(index);
    };

    return (
        <div className="mb-12">
            <h2 className="text-3xl font-black text-white mb-2 tracking-tight">{category.title}</h2>
            <p className="text-slate-400 font-medium leading-loose mb-8">{category.description}</p>
            <div className="space-y-4">
                {category.faqs.map((faq, index) => (
                    <div key={index} className="rounded-2xl bg-slate-900/50 border border-white/5 transition-all">
                        <button
                            onClick={() => toggle(index)}
                            className="w-full flex justify-between items-center p-6 text-left"
                        >
                            <h4 className="text-lg font-bold text-white">{faq.q}</h4>
                            <HiChevronDown
                                className={`w-5 h-5 text-slate-400 transform transition-transform ${open === index ? "rotate-180" : ""}`}
                            />
                        </button>
                        <div
                            className={`grid overflow-hidden transition-all duration-300 ease-in-out ${
                                open === index ? "grid-rows-[1fr] opacity-100" : "grid-rows-[0fr] opacity-0"
                            }`}
                        >
                            <div className="overflow-hidden">
                                <p className="px-6 pb-6 text-slate-400 leading-loose font-medium">
                                    {faq.a}
                                </p>
                            </div>
                        </div>
                    </div>
                ))}
            </div>
        </div>
    );
}
