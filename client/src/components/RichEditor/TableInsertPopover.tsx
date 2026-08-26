import type { Editor } from '@tiptap/react';
import { useEffect, useRef, useState } from 'react';
import { insertTableSafely } from './tableUtils';

const MAX_ROWS = 8;
const MAX_COLS = 8;

type TableInsertPopoverProps = {
  editor: Editor;
  onClose: () => void;
};

export function TableInsertPopover({ editor, onClose }: TableInsertPopoverProps) {
  const popoverRef = useRef<HTMLDivElement>(null);
  const [hover, setHover] = useState({ rows: 3, cols: 3 });

  useEffect(() => {
    const handlePointerDown = (event: MouseEvent) => {
      if (popoverRef.current && !popoverRef.current.contains(event.target as Node)) {
        onClose();
      }
    };

    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape') {
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

  const insert = (rows: number, cols: number) => {
    insertTableSafely(editor, rows, cols);
    onClose();
  };

  return (
    <div ref={popoverRef} className="bm-table-insert-popover" role="dialog" aria-label="Insert table">
      <p className="bm-table-insert-label">
        {hover.rows > 0 && hover.cols > 0 ? `${hover.rows} × ${hover.cols}` : 'Insert table'}
      </p>
      <div
        className="bm-table-insert-grid"
        onMouseLeave={() => setHover({ rows: 0, cols: 0 })}
      >
        {Array.from({ length: MAX_ROWS }, (_, rowIndex) =>
          Array.from({ length: MAX_COLS }, (_, colIndex) => {
            const rows = rowIndex + 1;
            const cols = colIndex + 1;
            const isActive = rows <= hover.rows && cols <= hover.cols;

            return (
              <button
                key={`${rows}-${cols}`}
                type="button"
                className={`bm-table-insert-cell${isActive ? ' is-active' : ''}`}
                title={`${rows} × ${cols} table`}
                aria-label={`Insert ${rows} by ${cols} table`}
                onMouseEnter={() => setHover({ rows, cols })}
                onClick={() => insert(rows, cols)}
              />
            );
          })
        )}
      </div>
    </div>
  );
}
