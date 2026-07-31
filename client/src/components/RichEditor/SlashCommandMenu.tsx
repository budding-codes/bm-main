import { forwardRef, useEffect, useImperativeHandle, useState } from 'react';

export type SlashCommandItem = {
  title: string;
  description: string;
  icon: string;
  group: string;
  command: (props: { editor: any; range: any }) => void;
};

type SlashCommandMenuProps = {
  items: SlashCommandItem[];
  command: (item: SlashCommandItem) => void;
};

export type SlashCommandMenuHandle = {
  onKeyDown: (props: { event: KeyboardEvent }) => boolean;
};

export const SlashCommandMenu = forwardRef<SlashCommandMenuHandle, SlashCommandMenuProps>(
  function SlashCommandMenu({ items, command }, ref) {
    const [selectedIndex, setSelectedIndex] = useState(0);

    useEffect(() => {
      setSelectedIndex(0);
    }, [items]);

    useImperativeHandle(ref, () => ({
      onKeyDown: ({ event }) => {
        if (event.key === 'ArrowUp') {
          setSelectedIndex((index) => (index + items.length - 1) % Math.max(items.length, 1));
          return true;
        }
        if (event.key === 'ArrowDown') {
          setSelectedIndex((index) => (index + 1) % Math.max(items.length, 1));
          return true;
        }
        if (event.key === 'Enter') {
          const item = items[selectedIndex];
          if (item) command(item);
          return true;
        }
        return false;
      }
    }));

    if (items.length === 0) {
      return (
        <div className="bm-slash-menu">
          <div className="bm-slash-group">No matches</div>
        </div>
      );
    }

    const groups = items.reduce<Record<string, SlashCommandItem[]>>((acc, item) => {
      (acc[item.group] ||= []).push(item);
      return acc;
    }, {});

    let flatIndex = -1;

    return (
      <div className="bm-slash-menu">
        {Object.entries(groups).map(([group, groupItems]) => (
          <div key={group}>
            <div className="bm-slash-group">{group}</div>
            {groupItems.map((item) => {
              flatIndex += 1;
              const index = flatIndex;
              return (
                <button
                  key={item.title}
                  type="button"
                  className={`bm-slash-item ${index === selectedIndex ? 'is-selected' : ''}`}
                  onClick={() => command(item)}
                >
                  <span className="bm-slash-item-icon">{item.icon}</span>
                  <span>
                    <div className="bm-slash-item-title">{item.title}</div>
                    <div className="bm-slash-item-desc">{item.description}</div>
                  </span>
                </button>
              );
            })}
          </div>
        ))}
      </div>
    );
  }
);
