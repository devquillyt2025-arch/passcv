'use client';

import { useEffect, useRef, useState } from 'react';
import { createPortal } from 'react-dom';

export type PopoverPosition = 'bottom-left' | 'bottom-right' | 'top-center' | 'bottom-center';

interface PortalPopoverProps {
  isOpen: boolean;
  onClose?: () => void;
  anchorRef: React.RefObject<HTMLElement | null>;
  children: React.ReactNode;
  position?: PopoverPosition;
  offset?: number;
}

export default function PortalPopover({
  isOpen,
  onClose,
  anchorRef,
  children,
  position = 'bottom-left',
  offset = 4,
}: PortalPopoverProps) {
  const [mounted, setMounted] = useState(false);
  const [coords, setCoords] = useState<{ top: number; left: number } | null>(null);
  const popoverRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    setMounted(true);
    return () => setMounted(false);
  }, []);

  useEffect(() => {
    if (!isOpen || !anchorRef.current) return;

    const updatePosition = () => {
      if (!anchorRef.current) return;
      const rect = anchorRef.current.getBoundingClientRect();
      
      let newCoords = { top: 0, left: 0 };
      
      switch (position) {
        case 'bottom-left':
          newCoords = {
            top: rect.bottom + window.scrollY + offset,
            left: rect.left + window.scrollX,
          };
          break;
        case 'bottom-right':
          newCoords = {
            top: rect.bottom + window.scrollY + offset,
            left: rect.right + window.scrollX,
          };
          break;
        case 'top-center':
          newCoords = {
            top: rect.top + window.scrollY - offset,
            left: rect.left + rect.width / 2 + window.scrollX,
          };
          break;
        case 'bottom-center':
          newCoords = {
            top: rect.bottom + window.scrollY + offset,
            left: rect.left + rect.width / 2 + window.scrollX,
          };
          break;
      }
      
      setCoords(newCoords);
    };

    updatePosition();
    window.addEventListener('resize', updatePosition);
    window.addEventListener('scroll', updatePosition, true);

    return () => {
      window.removeEventListener('resize', updatePosition);
      window.removeEventListener('scroll', updatePosition, true);
    };
  }, [isOpen, anchorRef, position, offset]);

  useEffect(() => {
    if (!isOpen || !onClose) return;

    const handleClickOutside = (e: MouseEvent) => {
      if (
        popoverRef.current &&
        !popoverRef.current.contains(e.target as Node) &&
        anchorRef.current &&
        !anchorRef.current.contains(e.target as Node)
      ) {
        onClose();
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [isOpen, onClose, anchorRef]);

  if (!mounted || !isOpen || !coords) return null;

  let transform = '';
  switch (position) {
    case 'bottom-left': transform = 'none'; break;
    case 'bottom-right': transform = 'translateX(-100%)'; break;
    case 'top-center': transform = 'translate(-50%, -100%)'; break;
    case 'bottom-center': transform = 'translate(-50%, 0)'; break;
  }

  return createPortal(
    <div
      ref={popoverRef}
      style={{
        position: 'absolute',
        top: coords.top,
        left: coords.left,
        transform,
        zIndex: 9999,
      }}
    >
      {children}
    </div>,
    document.body
  );
}
