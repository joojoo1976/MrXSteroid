'use client';

import React from 'react';

export type GeniusToolStatus = 'idle' | 'partial' | 'ready' | 'error';

export interface GeniusToolWarning {
  id: string;
  level: 'info' | 'low' | 'high' | 'critical';
  message: string;
}

export interface GeniusToolTemplateProps {
  toolId: string;
  title: string;
  description?: string;
  locale?: 'ar' | 'en';
  direction?: 'rtl' | 'ltr';
  unitSystem?: 'metric' | 'imperial';
  theme?: 'light' | 'dark';
  status?: GeniusToolStatus;
  inputs?: React.ReactNode;
  results?: React.ReactNode;
  warnings?: GeniusToolWarning[];
  errors?: string[];
  explanation?: React.ReactNode;
  scenarios?: React.ReactNode;
  children?: React.ReactNode;
}

export function GeniusToolTemplate({
  toolId,
  title,
  description,
  locale = 'en',
  direction = 'ltr',
  unitSystem = 'metric',
  theme = 'light',
  status = 'idle',
  inputs,
  results,
  warnings = [],
  errors = [],
  explanation,
  scenarios,
  children,
}: GeniusToolTemplateProps) {
  const isRtl = direction === 'rtl';

  return (
    <section
      data-tool-id={toolId}
      data-locale={locale}
      data-unit-system={unitSystem}
      data-theme={theme}
      data-status={status}
      dir={isRtl ? 'rtl' : 'ltr'}
      className="genius-tool-template"
    >
      <header className="genius-tool-template__header">
        <h1>{title}</h1>
        {description ? <p>{description}</p> : null}
      </header>

      <div className="genius-tool-template__status" role="status">
        {status}
      </div>

      {errors.length > 0 ? (
        <div className="genius-tool-template__errors" role="alert">
          {errors.map((error, index) => (
            <p key={`error-${index}`}>{error}</p>
          ))}
        </div>
      ) : null}

      {warnings.length > 0 ? (
        <div className="genius-tool-template__warnings" role="note">
          {warnings.map((warning) => (
            <p key={warning.id} data-warning-level={warning.level}>
              {warning.message}
            </p>
          ))}
        </div>
      ) : null}

      {inputs ? <div className="genius-tool-template__inputs">{inputs}</div> : null}
      {results ? <div className="genius-tool-template__results">{results}</div> : null}
      {explanation ? <div className="genius-tool-template__explanation">{explanation}</div> : null}
      {scenarios ? <div className="genius-tool-template__scenarios">{scenarios}</div> : null}
      {children ? <div className="genius-tool-template__children">{children}</div> : null}
    </section>
  );
}

export default GeniusToolTemplate;
