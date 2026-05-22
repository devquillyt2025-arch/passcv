'use client';

import { useState, useRef } from 'react';
import { ChevronDown, ChevronLeft, ChevronRight, Check } from 'lucide-react';
import PortalPopover from '@/components/ui/PortalPopover';

const MONTHS = ['Jan','Feb','Mar','Apr','May','Jun','Jul','Aug','Sep','Oct','Nov','Dec'];
const CURRENT_YEAR = new Date().getFullYear();

interface MonthYearPickerProps {
  value: string;
  onChange: (value: string) => void;
  disabled?: boolean;
  placeholder?: string;
}

function parseValue(value: string): { month: number | null; year: number | null } {
  const m = value?.match(/^(\d{4})-(\d{2})$/);
  if (m) return { year: parseInt(m[1]), month: parseInt(m[2]) };
  return { month: null, year: null };
}

function formatDisplay(value: string): string {
  const { month, year } = parseValue(value);
  if (month && year) return `${MONTHS[month - 1]} ${year}`;
  return '';
}

export default function MonthYearPicker({ value, onChange, disabled, placeholder = 'Select date' }: MonthYearPickerProps) {
  const [open, setOpen] = useState(false);
  const { month: committedMonth, year: committedYear } = parseValue(value);

  const [pendingMonth, setPendingMonth] = useState<number | null>(null);
  const [pendingYear, setPendingYear] = useState<number>(CURRENT_YEAR);

  const triggerRef = useRef<HTMLButtonElement>(null);

  const handleOpen = () => {
    if (disabled) return;
    setPendingMonth(committedMonth);
    setPendingYear(committedYear ?? CURRENT_YEAR);
    setOpen(true);
  };

  const handleConfirm = () => {
    if (!pendingMonth) return;
    const mm = String(pendingMonth).padStart(2, '0');
    onChange(`${pendingYear}-${mm}`);
    setOpen(false);
  };

  const display = formatDisplay(value);
  const canConfirm = pendingMonth !== null;

  return (
    <>
      {/* Trigger */}
      <button
        ref={triggerRef}
        type="button"
        onClick={handleOpen}
        disabled={disabled}
        className="w-full flex items-center justify-between rounded-lg border border-gray-300 px-3 py-2 text-sm bg-white focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 outline-none disabled:opacity-60 disabled:cursor-not-allowed text-left"
      >
        <span className={display ? 'text-gray-900' : 'text-gray-400'}>
          {display || placeholder}
        </span>
        <ChevronDown className="w-4 h-4 text-gray-400 shrink-0 ml-1" />
      </button>

      {/* Dropdown */}
      <PortalPopover isOpen={open} onClose={() => setOpen(false)} anchorRef={triggerRef} position="bottom-left">
        <div className="mt-1 w-[220px] rounded-xl border border-gray-700 bg-gray-900 shadow-2xl overflow-hidden">

          {/* Month grid — 3×4 */}
          <div className="p-3 grid grid-cols-3 gap-1.5">
            {MONTHS.map((name, idx) => {
              const m = idx + 1;
              const selected = pendingMonth === m;
              return (
                <button
                  key={name}
                  type="button"
                  onClick={() => setPendingMonth(m)}
                  className={`rounded-lg py-1.5 text-sm font-medium transition-colors ${
                    selected
                      ? 'bg-indigo-600 text-white'
                      : 'text-gray-300 hover:bg-gray-700 hover:text-white'
                  }`}
                >
                  {name}
                </button>
              );
            })}
          </div>

          {/* Divider */}
          <div className="border-t border-gray-700 mx-3" />

          {/* Year selector */}
          <div className="flex items-center justify-between px-3 py-2.5">
            <button
              type="button"
              onClick={() => setPendingYear((y) => y - 1)}
              className="p-1 rounded-lg text-gray-400 hover:text-white hover:bg-gray-700 transition-colors"
            >
              <ChevronLeft className="w-4 h-4" />
            </button>
            <span className="text-white font-semibold text-sm tabular-nums">{pendingYear}</span>
            <button
              type="button"
              onClick={() => setPendingYear((y) => y + 1)}
              className="p-1 rounded-lg text-gray-400 hover:text-white hover:bg-gray-700 transition-colors"
            >
              <ChevronRight className="w-4 h-4" />
            </button>
          </div>

          {/* Divider */}
          <div className="border-t border-gray-700 mx-3" />

          {/* Confirm */}
          <div className="p-3">
            <button
              type="button"
              onClick={handleConfirm}
              disabled={!canConfirm}
              className="w-full flex items-center justify-center gap-1.5 rounded-lg py-2 text-sm font-semibold transition-colors disabled:opacity-40 disabled:cursor-not-allowed bg-indigo-600 hover:bg-indigo-500 text-white"
            >
              <Check className="w-4 h-4" />
              {pendingMonth ? `${MONTHS[pendingMonth - 1]} ${pendingYear}` : 'Select a month'}
            </button>
          </div>

        </div>
      </PortalPopover>
    </>
  );
}
