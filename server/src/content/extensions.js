const { StarterKit } = require('@tiptap/starter-kit');
const { Youtube } = require('@tiptap/extension-youtube');
const { Highlight } = require('@tiptap/extension-highlight');
const { TextAlign } = require('@tiptap/extension-text-align');
const { Subscript } = require('@tiptap/extension-subscript');
const { Superscript } = require('@tiptap/extension-superscript');
const { Table, TableRow, TableHeader, TableCell } = require('@tiptap/extension-table');
const { TaskList, TaskItem } = require('@tiptap/extension-list');
const { Callout } = require('./calloutExtension');
const { BmImage } = require('./bmImageExtension');

/**
 * The authoritative document schema.
 *
 * The editor in the client must configure the same extensions. If it ever emits a
 * node this list does not know, rendering fails loudly with a clear error rather
 * than silently dropping content — see `assertRenderable` in ./renderer.
 *
 * Class names here are what the public article stylesheet targets, so they must
 * match `bm-content.css` on the client.
 */
const contentExtensions = [
	StarterKit.configure({
		heading: { levels: [1, 2, 3, 4] },
		link: {
			openOnClick: false,
			autolink: true,
			HTMLAttributes: { class: 'bm-content-link', rel: 'noopener noreferrer nofollow', target: '_blank' }
		},
		codeBlock: { HTMLAttributes: { class: 'bm-content-code-block' } }
	}),
	BmImage.configure({
		inline: false,
		allowBase64: false,
		HTMLAttributes: { class: 'bm-content-image', loading: 'lazy', decoding: 'async' }
	}),
	Youtube.configure({
		nocookie: true,
		HTMLAttributes: { class: 'bm-content-embed' }
	}),
	Highlight.configure({ multicolor: false }),
	TextAlign.configure({
		types: ['heading', 'paragraph', 'listItem'],
		alignments: ['left', 'center', 'right', 'justify'],
		defaultAlignment: null
	}),
	Subscript,
	Superscript,
	Table.configure({
		resizable: true,
		renderWrapper: true,
		HTMLAttributes: { class: 'bm-content-table' }
	}),
	TableRow,
	TableHeader,
	TableCell,
	TaskList.configure({ HTMLAttributes: { class: 'bm-content-task-list' } }),
	TaskItem.configure({ nested: true }),
	Callout
];

module.exports = { contentExtensions };
