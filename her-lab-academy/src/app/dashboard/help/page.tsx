'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import {
  HelpCircle,
  ChevronDown,
  ChevronUp,
  MessageSquare,
  Mail,
  Phone,
  ExternalLink,
  Building2,
} from 'lucide-react';
import { HELP_CONTACT, HELP_SECTIONS } from '@/lib/helpContent';
import { PROH_IMPACT, PROH_PROFILE } from '@/lib/chatbot/institution';

function faqKey(sectionId: string, index: number) {
  return `${sectionId}-${index}`;
}

export default function HelpPage() {
  const [openKey, setOpenKey] = useState<string | null>(null);

  return (
    <div className="max-w-3xl mx-auto pb-12">
      <div className="mb-8">
        <h1 className="text-3xl font-display font-bold text-[var(--color-text-dark)] flex items-center gap-3">
          <HelpCircle className="w-8 h-8 text-[var(--color-primary)]" /> Help & FAQs
        </h1>
        <p className="text-gray-600 mt-2">
          About {PROH_PROFILE.officialName}, HER Lab, and using Her Lab Academy.
        </p>
      </div>

      {/* Organization overview */}
      <div className="bg-white border border-gray-200 rounded-xl shadow-sm p-6 mb-8">
        <div className="flex items-start gap-3">
          <div className="w-10 h-10 rounded-xl bg-[var(--color-accent)] flex items-center justify-center flex-shrink-0">
            <Building2 className="w-5 h-5 text-[var(--color-primary)]" />
          </div>
          <div>
            <h2 className="font-display font-bold text-gray-900">{PROH_PROFILE.officialName}</h2>
            <p className="text-sm text-gray-600 mt-1 leading-relaxed">{PROH_PROFILE.mission}</p>
            <dl className="mt-4 grid grid-cols-2 gap-3 text-xs sm:text-sm">
              <div>
                <dt className="text-gray-500">Children supported</dt>
                <dd className="font-semibold text-gray-900">{PROH_IMPACT.childrenSupported}</dd>
              </div>
              <div>
                <dt className="text-gray-500">Youth skilled</dt>
                <dd className="font-semibold text-gray-900">{PROH_IMPACT.youthSkilled}</dd>
              </div>
              <div>
                <dt className="text-gray-500">Women in savings groups</dt>
                <dd className="font-semibold text-gray-900">{PROH_IMPACT.womenInSavingsGroups}</dd>
              </div>
              <div>
                <dt className="text-gray-500">Trees planted</dt>
                <dd className="font-semibold text-gray-900">{PROH_IMPACT.treesPlanted}</dd>
              </div>
            </dl>
            <a
              href={PROH_PROFILE.website}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-1 mt-4 text-sm font-medium text-[var(--color-primary)] hover:underline"
            >
              Visit official website <ExternalLink className="w-3.5 h-3.5" />
            </a>
          </div>
        </div>
      </div>

      {/* FAQ sections */}
      {HELP_SECTIONS.map((section) => (
        <div key={section.id} className="mb-10">
          <h2 className="text-lg font-display font-bold text-[var(--color-text-dark)] mb-1">
            {section.title}
          </h2>
          <p className="text-sm text-gray-600 mb-4">{section.description}</p>
          <div className="space-y-3">
            {section.faqs.map((faq, i) => {
              const key = faqKey(section.id, i);
              const isOpen = openKey === key;
              return (
                <div
                  key={key}
                  className={`bg-white border rounded-xl shadow-sm overflow-hidden transition-colors ${
                    isOpen ? 'border-[var(--color-primary)]/40' : 'border-gray-200'
                  }`}
                >
                  <button
                    type="button"
                    onClick={() => setOpenKey(isOpen ? null : key)}
                    className="w-full flex items-center justify-between px-6 py-4 text-left hover:bg-gray-50 transition-colors"
                  >
                    <span className="font-semibold text-gray-900 text-sm pr-4">{faq.q}</span>
                    {isOpen ? (
                      <ChevronUp className="w-5 h-5 text-[var(--color-primary)] flex-shrink-0" />
                    ) : (
                      <ChevronDown className="w-5 h-5 text-gray-400 flex-shrink-0" />
                    )}
                  </button>
                  {isOpen && (
                    <div className="px-6 pb-5 border-t border-gray-100 pt-4 bg-[var(--color-accent)]/40">
                      <p className="text-sm text-gray-700 leading-relaxed">{faq.a}</p>
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </div>
      ))}

      {/* Contact */}
      <div className="bg-white border border-gray-200 rounded-xl shadow-sm p-6">
        <h2 className="font-bold text-gray-900 mb-1">Still need help?</h2>
        <p className="text-sm text-gray-600 mb-4">
          For portal issues use the options below. For HER Lab intake, partnerships, or donations,
          contact {HELP_CONTACT.organizationName} directly.
        </p>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <Link
            href="/dashboard/complaints"
            className="flex items-center gap-3 p-4 border border-gray-200 rounded-xl hover:border-[var(--color-primary)] hover:bg-[var(--color-accent)] transition-colors group"
          >
            <div className="w-10 h-10 rounded-xl bg-red-50 flex items-center justify-center flex-shrink-0">
              <MessageSquare className="w-5 h-5 text-red-500" />
            </div>
            <div>
              <p className="font-semibold text-sm text-gray-900 group-hover:text-[var(--color-primary)]">
                Submit a Complaint
              </p>
              <p className="text-xs text-gray-500 mt-0.5">Private message to admin</p>
            </div>
          </Link>

          <a
            href={`mailto:${HELP_CONTACT.email}`}
            className="flex items-center gap-3 p-4 border border-gray-200 rounded-xl hover:border-[var(--color-primary)] hover:bg-[var(--color-accent)] transition-colors group"
          >
            <div className="w-10 h-10 rounded-xl bg-blue-50 flex items-center justify-center flex-shrink-0">
              <Mail className="w-5 h-5 text-blue-500" />
            </div>
            <div>
              <p className="font-semibold text-sm text-gray-900 group-hover:text-[var(--color-primary)]">
                Email Support
              </p>
              <p className="text-xs text-gray-500 mt-0.5">{HELP_CONTACT.email}</p>
            </div>
          </a>

          <a
            href={`tel:${HELP_CONTACT.phoneTel}`}
            className="flex items-center gap-3 p-4 border border-gray-200 rounded-xl hover:border-[var(--color-primary)] hover:bg-[var(--color-accent)] transition-colors group"
          >
            <div className="w-10 h-10 rounded-xl bg-green-50 flex items-center justify-center flex-shrink-0">
              <Phone className="w-5 h-5 text-green-600" />
            </div>
            <div>
              <p className="font-semibold text-sm text-gray-900 group-hover:text-[var(--color-primary)]">
                Call PRoH
              </p>
              <p className="text-xs text-gray-500 mt-0.5">{HELP_CONTACT.phone}</p>
            </div>
          </a>

          <a
            href={HELP_CONTACT.website}
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center gap-3 p-4 border border-gray-200 rounded-xl hover:border-[var(--color-primary)] hover:bg-[var(--color-accent)] transition-colors group"
          >
            <div className="w-10 h-10 rounded-xl bg-orange-50 flex items-center justify-center flex-shrink-0">
              <ExternalLink className="w-5 h-5 text-orange-600" />
            </div>
            <div>
              <p className="font-semibold text-sm text-gray-900 group-hover:text-[var(--color-primary)]">
                Official Website
              </p>
              <p className="text-xs text-gray-500 mt-0.5">Donate & partner</p>
            </div>
          </a>
        </div>
        <p className="text-xs text-gray-500 mt-4">{HELP_CONTACT.address}</p>
      </div>
    </div>
  );
}
