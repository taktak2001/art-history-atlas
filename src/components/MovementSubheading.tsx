import type { ReactNode } from 'react';

type MovementSubheadingProps = {
  children: ReactNode;
  id?: string;
  className?: string;
};

/**
 * Editorial heading used inside movement-detail chapters.
 *
 * Content hierarchy uses the serif face; interface labels and metadata keep
 * the application sans face elsewhere.
 */
export function MovementSubheading({
  children,
  id,
  className = '',
}: MovementSubheadingProps) {
  return (
    <h3
      id={id}
      data-movement-subheading
      className={`font-serif text-xl font-medium leading-[1.4] tracking-[0.01em] text-ink sm:text-[22px] ${className}`.trim()}
    >
      {children}
    </h3>
  );
}
