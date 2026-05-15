'use client';

import Link from 'next/link';

interface WizardProgressProps {
  currentStep: 1 | 2 | 3;
  canProceedToScore: boolean;
  canProceedToRewrite: boolean;
}

export default function WizardProgress({ currentStep, canProceedToScore, canProceedToRewrite }: WizardProgressProps) {
  const steps = [
    { n: 1, label: 'Upload & JD', active: true, href: '/' },
    { n: 2, label: 'ATS Score', active: currentStep >= 2 || canProceedToScore, href: '/score', disabled: !canProceedToScore && currentStep < 2 },
    { n: 3, label: 'AI Rewrite', active: currentStep >= 3 || canProceedToRewrite, href: '/rewrite', disabled: !canProceedToRewrite && currentStep < 3 },
  ];

  return (
    <div className="flex items-center w-full max-w-2xl text-[13px] font-medium mx-auto mb-10">
      {steps.map((s, i, arr) => {
        const isCurrent = currentStep === s.n;
        const content = (
          <div className="flex items-center gap-3 shrink-0 group">
            <span 
              className={`flex w-[28px] h-[28px] items-center justify-center rounded-full text-[13px] font-bold transition-all duration-200 ease-in-out ${
                isCurrent ? 'bg-[#6366f1] text-white shadow-[0_0_12px_rgba(99,102,241,0.4)]' : 
                s.active ? 'bg-[#6366f1]/20 text-[#6366f1] dark:bg-[#6366f1]/30 dark:text-indigo-300' : 
                'border-[1.5px] border-gray-300 dark:border-[rgba(255,255,255,0.2)] text-gray-400 dark:text-[rgba(255,255,255,0.35)]'
              }`}
            >
              {s.n}
            </span>
            <span className={isCurrent ? 'font-semibold text-gray-900 dark:text-white' : s.active ? 'font-medium text-gray-700 dark:text-gray-300 group-hover:text-[#6366f1] transition-colors' : 'text-gray-500 dark:text-[rgba(255,255,255,0.35)]'}>
              {s.label}
            </span>
          </div>
        );

        return (
          <div key={s.n} className={`flex items-center ${i < arr.length - 1 ? 'flex-1' : ''}`}>
            {s.disabled ? (
              <div className="cursor-not-allowed opacity-80">{content}</div>
            ) : (
              <Link href={s.href} className="cursor-pointer">{content}</Link>
            )}
            {i < arr.length - 1 && (
              <div className={`h-[2px] flex-1 mx-[12px] rounded-full transition-colors ${steps[i+1].active ? 'bg-[#6366f1]/40' : 'bg-gray-200 dark:bg-[rgba(255,255,255,0.1)]'}`}></div>
            )}
          </div>
        );
      })}
    </div>
  );
}
