import React, { useState, useEffect, useRef, ReactNode, useImperativeHandle } from 'react';
import MainButton from './MainButton';

interface ModalProps {
  id: string;
  title: string;
  children: ReactNode;
  triggerText?: string;
  dismissible?: boolean;
  ref: any
}

export default function MainModal ({ id, title, children, triggerText = 'Open Modal', dismissible = true, ref }: ModalProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [isClosing, setIsClosing] = useState(false);
  const modalRef = useRef<HTMLDivElement>(null);

  const openModal = () => {
    setIsOpen(true);
    setIsClosing(false);
  };

  const closeModal = () => {
    setIsClosing(true);
    setTimeout(() => {
      setIsOpen(false);
      setIsClosing(false);
    }, 300); // Match transition duration
  };

  useImperativeHandle(ref, () => ({
    closeModal
  }))

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && dismissible && isOpen) {
        closeModal();
      }
    };

    const focusableElements = modalRef.current?.querySelectorAll(
      'button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])'
    );
    const firstFocusable = focusableElements?.[0] as HTMLElement;

    if (isOpen && firstFocusable) {
      firstFocusable.focus();
    }

    document.addEventListener('keydown', handleKeyDown);
    return () => document.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, dismissible]);

  const handleTabKey = (e: React.KeyboardEvent) => {
    const focusableElements = modalRef.current?.querySelectorAll(
      'button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])'
    );
    if (!focusableElements) return;

    const first = focusableElements[0] as HTMLElement;
    const last = focusableElements[focusableElements.length - 1] as HTMLElement;

    if (e.key === 'Tab') {
      if (e.shiftKey && document.activeElement === first) {
        e.preventDefault();
        last.focus();
      } else if (!e.shiftKey && document.activeElement === last) {
        e.preventDefault();
        first.focus();
      }
    }
  };

  if (!isOpen && !isClosing) return <MainButton buttonType='bordered' data-modal="open" data-target={id} onClickHandler={openModal}>{triggerText}</MainButton>;

  return (
    <>
      <MainButton
        data-modal="open"
        data-target={id}
        buttonType='bordered'
        onClickHandler={openModal}>
            {triggerText}
      </MainButton>
      <div
        className={`fixed inset-0 z-[9999] flex items-center justify-center
            bg-gray-900/75 bg-blend-color-dodge backdrop-blur-lg
            transition-all duration-300
            data-[state=closed]:transition-all data-[state=closed]:duration-300
            data-[state=open]:transition-all data-[state=open]:duration-300
            ${
          isClosing ?
            `data-[state=closed]:opacity-0
            data-[state=closed]:transition-all data-[state=closed]:duration-300` :
            `data-[state=open]:opacity-100
            data-[state=open]:transition-all data-[state=open]:duration-300`
        }`}
        data-modal="container"
        data-state={isClosing ? 'closed' : 'open'}
        onClick={dismissible ? closeModal : undefined}
        role="dialog"
        aria-labelledby={`${id}-title`}
        aria-modal="true"
      >
        <div
          ref={modalRef}
          className={`rounded-sm border-2 bg-gray-900 shadow-2xl shadow-gray-700 max-w-2xl w-full p-6 transform transition-all duration-300 ${
            isClosing ? 'data-[state=closed]:scale-95' : 'data-[state=open]:scale-100'
          }`}
          data-modal="content"
          data-state={isClosing ? 'closed' : 'open'}
          onClick={(e) => e.stopPropagation()}
          onKeyDown={handleTabKey}
        >
          <div className="flex justify-between items-center mb-4">
            <h2 id={`${id}-title`} className="text-4xl font-semibold text-green-400">
              {title}
            </h2>
            {dismissible && (
              <button
                data-modal="close"
                onClick={closeModal}
                className="text-gray-200 hover:text-gray-300 cursor-pointer"
                aria-label="Close modal"
              >
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            )}
          </div>
          <div>{children}</div>
        </div>
      </div>
    </>
  );
};
