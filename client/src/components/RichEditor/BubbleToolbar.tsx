import type { Editor } from '@tiptap/react';
import { useEditorState } from '@tiptap/react';
import {
  Bold,
  ChevronDown,
  Code,
  Highlighter,
  Italic,
  Link as LinkIcon,
  Strikethrough,
  Underline
} from 'lucide-react';
import { useEffect, useRef, useState } from 'react';
import { LinkPopover } from './LinkPopover';
import {
  applyTextLink,
  captureSelection,
  getActiveTextLinkHref,
  removeTextLink,
  type SavedSelection
} from './linkCommands';
import {
  TEXT_ALIGNS,
  TEXT_ALIGN_ICONS,
  alignButtonLabel,
  alignButtonTitle,
  applyTextAlign,
  canSetTextAlign,
  getSelectionTextAlign,
  normalizeTextAlign,
  type TextAlignValue
} from './textAlignUtils';

type BubbleToolbarProps = {
  editor: Editor;
};

export function BubbleToolbar({ editor }: BubbleToolbarProps) {
  const [alignMenuOpen, setAlignMenuOpen] = useState(false);
  const [linkPopoverOpen, setLinkPopoverOpen] = useState(false);
  const alignMenuRef = useRef<HTMLDivElement>(null);
  const savedSelectionRef = useRef<SavedSelection | null>(null);

  const alignState = useEditorState({
    editor,
    selector: ({ editor: current }) => {
      if (!current || current.isDestroyed) {
        return {
          selectionAlign: null as ReturnType<typeof getSelectionTextAlign>,
          isHeading: false,
          bold: false,
          italic: false,
          underline: false,
          strike: false,
          code: false,
          highlight: false,
          link: false
        };
      }

      return {
        selectionAlign: getSelectionTextAlign(current),
        isHeading: current.isActive('heading'),
        bold: current.isActive('bold'),
        italic: current.isActive('italic'),
        underline: current.isActive('underline'),
        strike: current.isActive('strike'),
        code: current.isActive('code'),
        highlight: current.isActive('highlight'),
        link: current.isActive('link')
      };
    }
  });

  useEffect(() => {
    setAlignMenuOpen(false);
    setLinkPopoverOpen(false);
  }, [alignState.selectionAlign]);

  const openLinkPopover = () => {
    savedSelectionRef.current = captureSelection(editor);
    setAlignMenuOpen(false);
    setLinkPopoverOpen(true);
  };

  const closeLinkPopover = () => {
    setLinkPopoverOpen(false);
    savedSelectionRef.current = null;
  };

  const handleApplyLink = (url: string) => {
    applyTextLink(editor, url, savedSelectionRef.current ?? undefined);
    closeLinkPopover();
  };

  const handleRemoveLink = () => {
    removeTextLink(editor, savedSelectionRef.current ?? undefined);
    closeLinkPopover();
  };

  useEffect(() => {
    if (!alignMenuOpen) {
      return;
    }

    const handlePointerDown = (event: MouseEvent) => {
      if (alignMenuRef.current && !alignMenuRef.current.contains(event.target as Node)) {
        setAlignMenuOpen(false);
      }
    };

    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape') {
        setAlignMenuOpen(false);
      }
    };

    document.addEventListener('mousedown', handlePointerDown);
    document.addEventListener('keydown', handleKeyDown);
    return () => {
      document.removeEventListener('mousedown', handlePointerDown);
      document.removeEventListener('keydown', handleKeyDown);
    };
  }, [alignMenuOpen]);

  const setLink = () => {
    openLinkPopover();
  };

  const displayAlign: TextAlignValue =
    alignState.selectionAlign && alignState.selectionAlign !== 'mixed'
      ? alignState.selectionAlign
      : 'left';
  const DisplayAlignIcon = TEXT_ALIGN_ICONS[displayAlign];
  const alignDisabled = alignState.selectionAlign === null;

  const chooseAlign = (value: TextAlignValue) => {
    if (value === 'justify' && alignState.isHeading) {
      return;
    }
    if (!canSetTextAlign(editor, value) && value !== 'left') {
      return;
    }
    applyTextAlign(editor, value);
    setAlignMenuOpen(false);
  };

  return (
    <div className="bm-bubble-toolbar">
      <button
        type="button"
        className={`bm-editor-btn${alignState.bold ? ' is-active' : ''}`}
        title="Bold"
        aria-label="Bold"
        aria-pressed={alignState.bold}
        onClick={() => editor.chain().focus().toggleBold().run()}
      >
        <Bold size={14} />
      </button>
      <button
        type="button"
        className={`bm-editor-btn${alignState.italic ? ' is-active' : ''}`}
        title="Italic"
        aria-label="Italic"
        aria-pressed={alignState.italic}
        onClick={() => editor.chain().focus().toggleItalic().run()}
      >
        <Italic size={14} />
      </button>
      <button
        type="button"
        className={`bm-editor-btn${alignState.underline ? ' is-active' : ''}`}
        title="Underline"
        aria-label="Underline"
        aria-pressed={alignState.underline}
        onClick={() => editor.chain().focus().toggleUnderline().run()}
      >
        <Underline size={14} />
      </button>
      <button
        type="button"
        className={`bm-editor-btn${alignState.strike ? ' is-active' : ''}`}
        title="Strikethrough"
        aria-label="Strikethrough"
        aria-pressed={alignState.strike}
        onClick={() => editor.chain().focus().toggleStrike().run()}
      >
        <Strikethrough size={14} />
      </button>
      <button
        type="button"
        className={`bm-editor-btn${alignState.code ? ' is-active' : ''}`}
        title="Inline code"
        aria-label="Inline code"
        aria-pressed={alignState.code}
        onClick={() => editor.chain().focus().toggleCode().run()}
      >
        <Code size={14} />
      </button>
      <button
        type="button"
        className={`bm-editor-btn${alignState.highlight ? ' is-active' : ''}`}
        title="Highlight"
        aria-label="Highlight"
        aria-pressed={alignState.highlight}
        onClick={() => editor.chain().focus().toggleHighlight().run()}
      >
        <Highlighter size={14} />
      </button>
      <div className="bm-bubble-link-anchor">
        <button
          type="button"
          className={`bm-editor-btn${alignState.link ? ' is-active' : ''}`}
          title="Link"
          aria-label="Link"
          aria-pressed={alignState.link}
          aria-expanded={linkPopoverOpen}
          onMouseDown={(event) => {
            event.preventDefault();
            setLink();
          }}
        >
          <LinkIcon size={14} />
        </button>
        {linkPopoverOpen ? (
          <LinkPopover
            initialUrl={getActiveTextLinkHref(editor)}
            showRemove={alignState.link}
            onApply={handleApplyLink}
            onRemove={handleRemoveLink}
            onClose={closeLinkPopover}
          />
        ) : null}
      </div>

      <span className="bm-bubble-toolbar-divider" aria-hidden="true" />

      <div ref={alignMenuRef} className="bm-bubble-align-anchor">
        <button
          type="button"
          className={`bm-editor-btn bm-bubble-align-trigger${
            alignState.selectionAlign && alignState.selectionAlign !== 'mixed' && alignState.selectionAlign !== 'left'
              ? ' is-active'
              : ''
          }`}
          title="Text alignment"
          aria-label="Text alignment"
          aria-haspopup="menu"
          aria-expanded={alignMenuOpen}
          disabled={alignDisabled}
          onClick={() => setAlignMenuOpen((open) => !open)}
        >
          <DisplayAlignIcon size={14} />
          <ChevronDown size={12} />
        </button>
        {alignMenuOpen ? (
          <div className="bm-bubble-align-menu" role="menu" aria-label="Text alignment">
            {TEXT_ALIGNS.map((value) => {
              const Icon = TEXT_ALIGN_ICONS[value];
              const disabled =
                (value === 'justify' && alignState.isHeading) ||
                (value !== 'left' && !canSetTextAlign(editor, value));
              const isActive =
                alignState.selectionAlign === value ||
                (alignState.selectionAlign === null && value === 'left');
              const disabledReason =
                value === 'justify' && alignState.isHeading
                  ? 'Justify is for body text'
                  : undefined;

              return (
                <button
                  key={value}
                  type="button"
                  role="menuitemradio"
                  aria-checked={isActive}
                  className={`bm-bubble-align-item${isActive ? ' is-active' : ''}`}
                  title={alignButtonTitle(value, { disabledReason })}
                  disabled={disabled}
                  onClick={() => chooseAlign(normalizeTextAlign(value))}
                >
                  <Icon size={14} />
                  <span>{alignButtonLabel(value)}</span>
                </button>
              );
            })}
          </div>
        ) : null}
      </div>
    </div>
  );
}
