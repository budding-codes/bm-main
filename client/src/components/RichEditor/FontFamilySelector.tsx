import type { Editor } from '@tiptap/react';
import { useEditorState } from '@tiptap/react';
import { ChevronDown } from 'lucide-react';
import { useEffect, useId, useRef, useState } from 'react';
import {
  FONT_REGISTRY,
  type FontCategory,
  type FontDefinition,
  getFeaturedFonts,
  getFontCssClass
} from '../../lib/fontRegistry';
import {
  applyFontFamily,
  ensureEditorPreviewFontsLoaded,
  getFontSelectorLabel,
  getSelectionFontId,
  preventEditorToolbarMouseDown
} from './fontFamilyUtils';

type FontFamilySelectorProps = {
  editor: Editor;
};

const CATEGORY_LABELS: Record<FontCategory, string> = {
  'sans-serif': 'Sans Serif',
  serif: 'Serif',
  system: 'System'
};

const CATEGORY_ORDER: FontCategory[] = ['sans-serif', 'serif', 'system'];

function FontOption({
  font,
  selected,
  onSelect
}: {
  font: FontDefinition;
  selected: boolean;
  onSelect: () => void;
}) {
  const cssClass = getFontCssClass(font.id);

  return (
    <button
      type="button"
      role="option"
      aria-selected={selected}
      className={`bm-font-option${selected ? ' is-selected' : ''}`}
      onMouseDown={preventEditorToolbarMouseDown}
      onClick={onSelect}
    >
      <span className={cssClass || undefined}>{font.label}</span>
    </button>
  );
}

export function FontFamilySelector({ editor }: FontFamilySelectorProps) {
  const [open, setOpen] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);
  const listboxId = useId();
  const buttonId = useId();

  const selectionFontId = useEditorState({
    editor,
    selector: ({ editor: current }) => getSelectionFontId(current)
  });

  const label = getFontSelectorLabel(selectionFontId);
  const featuredFonts = getFeaturedFonts();
  const featuredIds = new Set(featuredFonts.map((font) => font.id));

  useEffect(() => {
    if (!open) {
      return;
    }

    ensureEditorPreviewFontsLoaded();

    const handlePointerDown = (event: MouseEvent) => {
      if (containerRef.current && !containerRef.current.contains(event.target as Node)) {
        setOpen(false);
      }
    };

    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape') {
        setOpen(false);
      }
    };

    document.addEventListener('mousedown', handlePointerDown);
    document.addEventListener('keydown', handleKeyDown);
    return () => {
      document.removeEventListener('mousedown', handlePointerDown);
      document.removeEventListener('keydown', handleKeyDown);
    };
  }, [open]);

  const selectFont = (fontId: string | null) => {
    applyFontFamily(editor, fontId);
    setOpen(false);
  };

  const previewClass =
    selectionFontId && selectionFontId !== 'mixed' ? getFontCssClass(selectionFontId) : undefined;

  return (
    <div ref={containerRef} className="bm-editor-toolbar-anchor bm-font-selector">
      <button
        id={buttonId}
        type="button"
        className={`bm-font-selector-trigger${open ? ' is-open' : ''}`}
        aria-haspopup="listbox"
        aria-expanded={open}
        aria-controls={listboxId}
        title="Font family"
        onMouseDown={preventEditorToolbarMouseDown}
        onClick={() => setOpen((value) => !value)}
      >
        <span className={previewClass || undefined}>{label}</span>
        <ChevronDown size={14} aria-hidden />
      </button>

      {open ? (
        <div
          id={listboxId}
          role="listbox"
          aria-labelledby={buttonId}
          className="bm-font-selector-menu"
        >
          <button
            type="button"
            role="option"
            aria-selected={selectionFontId === null}
            className={`bm-font-option${selectionFontId === null ? ' is-selected' : ''}`}
            onMouseDown={preventEditorToolbarMouseDown}
            onClick={() => selectFont(null)}
          >
            Default
          </button>

          <div className="bm-font-selector-section">Recommended</div>
          {featuredFonts.map((font) => (
            <FontOption
              key={`featured-${font.id}`}
              font={font}
              selected={selectionFontId === font.id}
              onSelect={() => selectFont(font.id)}
            />
          ))}

          {CATEGORY_ORDER.map((category) => {
            const fonts = FONT_REGISTRY.filter(
              (font) => font.category === category && !featuredIds.has(font.id)
            );

            if (fonts.length === 0) {
              return null;
            }

            return (
              <div key={category}>
                <div className="bm-font-selector-section">{CATEGORY_LABELS[category]}</div>
                {fonts.map((font) => (
                  <FontOption
                    key={font.id}
                    font={font}
                    selected={selectionFontId === font.id}
                    onSelect={() => selectFont(font.id)}
                  />
                ))}
              </div>
            );
          })}
        </div>
      ) : null}
    </div>
  );
}
