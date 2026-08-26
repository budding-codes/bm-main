import { useEffect, useId, useRef, useState } from 'react';
import { Check, Copy, ExternalLink, Link2, Unlink } from 'lucide-react';
import { validateLinkUrl } from '../../lib/linkUtils';

export type LinkPopoverProps = {
  initialUrl?: string;
  placeholder?: string;
  onApply: (url: string) => void;
  onRemove?: () => void;
  onClose: () => void;
  showRemove?: boolean;
};

export function LinkPopover({
  initialUrl = '',
  placeholder = 'Paste or type a URL',
  onApply,
  onRemove,
  onClose,
  showRemove = false
}: LinkPopoverProps) {
  const inputId = useId();
  const popoverRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);
  const [url, setUrl] = useState(initialUrl);
  const [error, setError] = useState<string | null>(null);
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    setUrl(initialUrl);
    setError(null);
    setCopied(false);
  }, [initialUrl]);

  useEffect(() => {
    const frame = window.requestAnimationFrame(() => {
      inputRef.current?.focus();
      inputRef.current?.select();
    });
    return () => window.cancelAnimationFrame(frame);
  }, []);

  useEffect(() => {
    const handlePointerDown = (event: MouseEvent) => {
      if (popoverRef.current && !popoverRef.current.contains(event.target as Node)) {
        onClose();
      }
    };

    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape') {
        event.preventDefault();
        onClose();
      }
    };

    document.addEventListener('mousedown', handlePointerDown);
    document.addEventListener('keydown', handleKeyDown);
    return () => {
      document.removeEventListener('mousedown', handlePointerDown);
      document.removeEventListener('keydown', handleKeyDown);
    };
  }, [onClose]);

  const submit = () => {
    const result = validateLinkUrl(url);
    if (!result.valid || !result.url) {
      setError(result.error);
      return;
    }
    setError(null);
    onApply(result.url);
  };

  const openLink = () => {
    const result = validateLinkUrl(url);
    if (!result.valid || !result.url) {
      setError(result.error);
      return;
    }
    window.open(result.url, '_blank', 'noopener,noreferrer');
  };

  const copyLink = async () => {
    const result = validateLinkUrl(url);
    if (!result.valid || !result.url) {
      setError(result.error);
      return;
    }
    try {
      await navigator.clipboard.writeText(result.url);
      setCopied(true);
      window.setTimeout(() => setCopied(false), 1500);
    } catch {
      setError('Could not copy the URL to your clipboard.');
    }
  };

  return (
    <div
      ref={popoverRef}
      className="bm-link-popover"
      role="dialog"
      aria-label="Edit link"
      onMouseDown={(event) => event.preventDefault()}
    >
      <div className="bm-link-popover-header">
        <Link2 size={14} aria-hidden="true" />
        <span>Link</span>
      </div>

      <label className="bm-link-popover-label" htmlFor={inputId}>
        URL
      </label>
      <input
        ref={inputRef}
        id={inputId}
        type="url"
        className="bm-link-popover-input"
        value={url}
        placeholder={placeholder}
        autoComplete="off"
        spellCheck={false}
        aria-invalid={error ? 'true' : undefined}
        aria-describedby={error ? `${inputId}-error` : undefined}
        onChange={(event) => {
          setUrl(event.target.value);
          if (error) {
            setError(null);
          }
        }}
        onKeyDown={(event) => {
          if (event.key === 'Enter') {
            event.preventDefault();
            submit();
          }
        }}
      />

      {error ? (
        <p id={`${inputId}-error`} className="bm-link-popover-error" role="alert">
          {error}
        </p>
      ) : null}

      <div className="bm-link-popover-actions">
        <button type="button" className="bm-link-popover-btn bm-link-popover-btn--primary" onClick={submit}>
          <Check size={14} aria-hidden="true" />
          Apply
        </button>
        {showRemove && onRemove ? (
          <button type="button" className="bm-link-popover-btn" onClick={onRemove} title="Remove link">
            <Unlink size={14} aria-hidden="true" />
            Remove
          </button>
        ) : null}
        <button type="button" className="bm-link-popover-btn" onClick={openLink} title="Open link" disabled={!url.trim()}>
          <ExternalLink size={14} aria-hidden="true" />
          Open
        </button>
        <button type="button" className="bm-link-popover-btn" onClick={() => void copyLink()} title="Copy link" disabled={!url.trim()}>
          {copied ? <Check size={14} aria-hidden="true" /> : <Copy size={14} aria-hidden="true" />}
          {copied ? 'Copied' : 'Copy'}
        </button>
      </div>
    </div>
  );
}
