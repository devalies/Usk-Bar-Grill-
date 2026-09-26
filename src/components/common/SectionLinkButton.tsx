import React from 'react';
import { ButtonTargetType, LandingSection } from '../../types/cms';
import { isElementVisible, normalizeSectionKey } from '../../utils/sectionDependency';

export interface SectionLinkButtonProps {
  label?: string;
  targetSection?: string;
  targetUrl?: string;
  type?: ButtonTargetType;
  isEnabled?: boolean;
  sections?: LandingSection[] | Record<string, boolean>;
  onClick?: () => void;
  className?: string;
  children?: React.ReactNode;
  icon?: React.ReactNode;
  title?: string;
  role?: string;
}

export const SectionLinkButton: React.FC<SectionLinkButtonProps> = ({
  label,
  targetSection,
  targetUrl,
  type = 'section',
  isEnabled = true,
  sections,
  onClick,
  className = '',
  children,
  icon,
  title
}) => {
  // If no explicit targetSection is provided, try to infer it from targetUrl
  const effectiveTargetSection = targetSection || (targetUrl?.startsWith('#') ? normalizeSectionKey(targetUrl) : undefined) || undefined;

  // Single source of truth visibility check:
  // Both element.isEnabled AND targetSection.isEnabled must be true!
  const isVisible = isElementVisible(
    {
      isEnabled,
      type,
      targetSection: effectiveTargetSection,
      targetUrl: targetUrl || (effectiveTargetSection ? `#${effectiveTargetSection}` : undefined)
    },
    sections
  );

  if (!isVisible) {
    return null;
  }

  const handleClick = (e: React.MouseEvent) => {
    if (onClick) {
      onClick();
      return;
    }

    // Default internal scroll behavior for section links
    if (type === 'section' || targetUrl?.startsWith('#')) {
      const anchor = targetUrl ? targetUrl.replace('#', '') : effectiveTargetSection;
      if (anchor) {
        const element = document.getElementById(anchor);
        if (element) {
          element.scrollIntoView({ behavior: 'smooth' });
        }
      }
    } else if (type === 'phone' || targetUrl?.startsWith('tel:')) {
      window.location.href = targetUrl || '';
    } else if (type === 'email' || targetUrl?.startsWith('mailto:')) {
      window.location.href = targetUrl || '';
    } else if (targetUrl) {
      window.open(targetUrl, '_blank', 'noopener,noreferrer');
    }
  };

  return (
    <button
      type="button"
      onClick={handleClick}
      className={className}
      title={title || label}
    >
      {children ? (
        children
      ) : (
        <>
          {icon}
          {label && <span>{label}</span>}
        </>
      )}
    </button>
  );
};
