import type { ReactNode } from 'react';

type EditorialPageHeaderProps = {
  englishTitle: string;
  japaneseTitle: string;
  description?: ReactNode;
  aside?: ReactNode;
  className?: string;
};

export function EditorialPageHeader({
  englishTitle,
  japaneseTitle,
  description,
  aside,
  className = '',
}: EditorialPageHeaderProps) {
  return (
    <header className={`editorial-page-header ${className}`.trim()}>
      <div className="editorial-page-header__main">
        <div className="editorial-page-header__heading">
          <p className="editorial-page-header__english" aria-hidden="true">
            {englishTitle}
          </p>
          <h1 className="editorial-page-header__japanese">{japaneseTitle}</h1>
        </div>
        {description && (
          <div className="editorial-page-header__description">{description}</div>
        )}
      </div>
      {aside && <div className="editorial-page-header__aside">{aside}</div>}
    </header>
  );
}
