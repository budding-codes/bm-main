# 🚀 Enterprise Rich Blog Editor — Full Implementation Prompt
## Budding Mariners (bm-promo) — End-to-End Production Implementation

---

## 🧭 Context & Codebase Overview

You are working on the **Budding Mariners** web application — a maritime education and career guidance platform. The project lives at `c:\Users\vivek\Desktop\BM\bm-promo` with a **monorepo structure**:

```
bm-promo/
├── client/         ← React + TypeScript + Vite + TailwindCSS frontend
│   └── src/
│       ├── App.tsx               ← React Router routes
│       ├── index.css
│       ├── components/           ← Navbar, Footer, Loader
│       ├── pages/                ← All page components
│       │   ├── Admin.tsx         ← THE MAIN FILE you will heavily modify
│       │   └── Blog.tsx          ← Blog listing page (modify + add slug route)
│       └── lib/
└── server/         ← Node.js + Express + MongoDB backend
    ├── server.js   ← Single-file server (modify this)
    └── .env        ← Environment variables
```

### Current Stack
- **Frontend**: React 18 + TypeScript + Vite + TailwindCSS + React Router + Framer Motion
- **Backend**: Node.js + Express (CommonJS `require` style, NOT ESM)
- **Database**: MongoDB via Mongoose
- **Auth**: Custom HMAC-SHA256 token (no JWT library used — stay consistent)
- **Deployment**: Client → Vercel, Server → separate hosting (has `.env`)

### What Exists Today (Current Blog System)
The `BlogSchema` in `server.js` currently has these fields:
```js
{
  title: String,          // required
  description: String,    // required (plain text, used for card previews)
  author: String,         // required
  youtubeUrl: String,     // optional
  thumbnailUrl: String,   // optional (auto-derived from YouTube if not set)
  featured: Boolean,      // default false
  published: Boolean      // default true
}
```

The Admin page (`Admin.tsx`) currently has a sidebar form with a `<textarea>` for description. The Blog page (`Blog.tsx`) shows cards but clicking them does nothing — no individual post page exists.

**Your mission**: Upgrade this entire system to a production-grade, full-featured rich blog editor with Cloudinary-powered media management.

---

## ☁️ What is Cloudinary & Why Use It Here

**Cloudinary** is a cloud-based media management platform (CDN) that handles image and video storage, optimization, transformation, and delivery at scale. Here is exactly what it does for this project:

### The Problem It Solves
When an admin uploads an image (for a blog post, thumbnail, or gallery), that image cannot be stored in MongoDB — databases are not designed for binary file storage. The image must live somewhere on the internet and be referenced by a URL. Without Cloudinary, you'd need to run your own file server or use S3/GCS.

### What Cloudinary Provides
1. **Storage** — Your media files (images, videos, PDFs) are stored permanently in Cloudinary's cloud
2. **CDN Delivery** — Files are served from servers worldwide via CDN for fast loading anywhere
3. **Auto-Optimization** — Cloudinary auto-converts images to modern formats (WebP, AVIF) and compresses them
4. **URL-based Transformations** — You can resize, crop, watermark, add effects just by changing the URL parameters (e.g., `w_800,h_600,c_fill`)
5. **Upload API** — Your Express backend sends the image to Cloudinary; Cloudinary returns a secure URL you store in MongoDB
6. **Free Tier** — 25GB storage + 25GB bandwidth/month — more than enough for a blog

### The Upload Flow in This App
```
Admin picks file in browser
       ↓
POST /api/admin/upload (Express)
       ↓ (multer reads file buffer in memory)
cloudinary.uploader.upload_stream()
       ↓
Cloudinary stores file, returns { secure_url, public_id }
       ↓
Express responds with { url: "https://res.cloudinary.com/..." }
       ↓
Tiptap editor inserts image block with that URL
       ↓
URL is saved in MongoDB blog document's contentBlocks + contentHtml
```

---

## 🔑 Step-by-Step Cloudinary Setup (Do This Before Writing Any Code)

### Step 1 — Create a Free Cloudinary Account
1. Go to [https://cloudinary.com/users/register/free](https://cloudinary.com/users/register/free)
2. Sign up with your email (no credit card required)
3. Complete email verification and log in to the **Cloudinary Console** (dashboard)

### Step 2 — Find Your Credentials
1. On the Cloudinary Console homepage, look for the **"API Keys"** section (or go to **Settings → API Keys**)
2. You will see three values — copy them all:
   - **Cloud Name** — e.g., `dxyz12abc` (this is your account's unique identifier)
   - **API Key** — e.g., `123456789012345`
   - **API Secret** — e.g., `AbCdEfGhIjKlMnOpQrStUvWx` (keep this private — never expose it in frontend code)

### Step 3 — Create an Upload Preset (Optional but Recommended)
An "upload preset" defines default settings (folder, transformations, access mode) for all uploads:
1. In Cloudinary Console → **Settings** → **Upload** tab
2. Scroll down to **"Upload presets"** → click **"Add upload preset"**
3. Set:
   - **Preset name**: `bm_blog_uploads`
   - **Signing Mode**: `Signed` (more secure, since you're uploading from your backend)
   - **Folder**: `bm-blog` (all images will be organized in this folder)
   - **Allowed formats**: `jpg, jpeg, png, gif, webp, mp4, pdf`
4. Save the preset

### Step 4 — Create a Dedicated Folder
1. In Cloudinary Console → **Media Library**
2. Click **"New Folder"** → name it `bm-blog`
3. Inside `bm-blog`, create two subfolders:
   - `images` — for blog inline images and thumbnails
   - `videos` — for uploaded video files

### Step 5 — Add Credentials to `.env`
Open `server/.env` and add these new lines (do NOT change existing variables):
```env
CLOUDINARY_CLOUD_NAME=your_cloud_name_here
CLOUDINARY_API_KEY=your_api_key_here
CLOUDINARY_API_SECRET=your_api_secret_here
```

> ⚠️ CRITICAL: The `CLOUDINARY_API_SECRET` must NEVER be sent to the frontend or exposed in client-side code. It only lives in `server/.env` and is used exclusively by the Express backend.

### Step 6 — Verify It Works (Quick Test After Implementation)
After implementing the upload endpoint, you can test it with:
```bash
curl -X POST http://localhost:5000/api/admin/upload \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -F "file=@/path/to/test-image.jpg"
```
Expected response: `{"url": "https://res.cloudinary.com/your-cloud/image/upload/bm-blog/images/xxxx.jpg", "publicId": "bm-blog/images/xxxx"}`

---

## 📦 All Packages to Install

### Server (`server/`)
```bash
npm install cloudinary multer
```
- `cloudinary` — official Cloudinary Node.js SDK
- `multer` — multipart/form-data parser (for receiving file uploads from the browser)

### Client (`client/`)
```bash
npm install @tiptap/react @tiptap/pm @tiptap/starter-kit
npm install @tiptap/extension-image @tiptap/extension-link
npm install @tiptap/extension-youtube @tiptap/extension-highlight
npm install @tiptap/extension-superscript @tiptap/extension-subscript
npm install @tiptap/extension-underline @tiptap/extension-text-align
npm install @tiptap/extension-placeholder @tiptap/extension-character-count
npm install @tiptap/extension-code-block-lowlight @tiptap/extension-table
npm install @tiptap/extension-table-row @tiptap/extension-table-header @tiptap/extension-table-cell
npm install @tiptap/extension-task-list @tiptap/extension-task-item
npm install lowlight
```

---

## 🗄️ Phase 1 — Database Schema Migration (server/server.js)

### 1A. Upgrade BlogSchema

Replace the existing `BlogSchema` definition in `server.js` with this **backward-compatible** extended schema. Every new field has a `default` so existing records won't break:

```js
const BlogSchema = new mongoose.Schema({
  // ── Existing fields (keep these exactly as they are) ──
  title: { type: String, required: true, trim: true },
  description: { type: String, required: true, trim: true }, // kept for backward compat (card excerpts)
  author: { type: String, required: true, trim: true },
  youtubeUrl: { type: String, default: '', trim: true },
  thumbnailUrl: { type: String, default: '', trim: true },
  featured: { type: Boolean, default: false },
  published: { type: Boolean, default: true },

  // ── NEW FIELDS (all have defaults so existing records are safe) ──
  slug: {
    type: String,
    unique: true,
    sparse: true, // allows multiple null values (for old records without slug)
    trim: true,
    lowercase: true
  },
  contentBlocks: {
    type: mongoose.Schema.Types.Mixed, // Tiptap JSON doc object
    default: null
  },
  contentHtml: {
    type: String,
    default: ''    // Rendered HTML for display on /blog/:slug
  },
  metaDescription: {
    type: String,
    default: '',
    trim: true
  },
  tags: {
    type: [String], // Array of tag strings e.g. ["maritime", "career"]
    default: []
  },
  readingTimeMinutes: {
    type: Number,
    default: 0
  },
  cloudinaryPublicIds: {
    type: [String], // Track uploaded image public_ids for potential future deletion
    default: []
  }
}, { timestamps: true });
```

### 1B. Add Slug Auto-Generation Utility Function

Add this helper function in `server.js` above the route definitions:

```js
function generateSlug(title) {
  return title
    .toLowerCase()
    .trim()
    .replace(/[^\w\s-]/g, '')      // remove non-word chars
    .replace(/[\s_-]+/g, '-')      // replace spaces/underscores with hyphens
    .replace(/^-+|-+$/g, '');      // trim leading/trailing hyphens
}

async function ensureUniqueSlug(baseSlug, excludeId = null) {
  let slug = baseSlug;
  let counter = 1;
  while (true) {
    const query = { slug };
    if (excludeId) query._id = { $ne: excludeId };
    const existing = await Blog.findOne(query);
    if (!existing) break;
    slug = `${baseSlug}-${counter++}`;
  }
  return slug;
}

function estimateReadingTime(htmlContent) {
  if (!htmlContent) return 1;
  const text = htmlContent.replace(/<[^>]+>/g, '');
  const words = text.trim().split(/\s+/).length;
  return Math.max(1, Math.ceil(words / 200)); // average 200 wpm
}
```

### 1C. Add Cloudinary Configuration in server.js

Add this near the top of `server.js`, after the `require('dotenv').config()` line:

```js
const { v2: cloudinary } = require('cloudinary');
const multer = require('multer');

// Configure Cloudinary — reads from .env
cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
  secure: true // always use https URLs
});

// Multer: store uploaded files in memory (not on disk) before streaming to Cloudinary
const upload = multer({
  storage: multer.memoryStorage(),
  limits: {
    fileSize: 20 * 1024 * 1024, // 20MB max per file
    files: 10 // max 10 files per request (for gallery uploads)
  },
  fileFilter(req, file, cb) {
    const allowedMimes = [
      'image/jpeg', 'image/png', 'image/gif', 'image/webp',
      'video/mp4', 'video/webm',
      'application/pdf'
    ];
    if (allowedMimes.includes(file.mimetype)) {
      cb(null, true);
    } else {
      cb(new Error(`File type ${file.mimetype} is not allowed`), false);
    }
  }
});
```

### 1D. Add Upload Endpoint

Add this new route in `server.js` before the `app.listen` call:

```js
// Helper: upload a single buffer to Cloudinary
function uploadToCloudinary(buffer, folder, resourceType = 'image') {
  return new Promise((resolve, reject) => {
    const stream = cloudinary.uploader.upload_stream(
      {
        folder: `bm-blog/${folder}`,
        resource_type: resourceType,
        quality: 'auto',        // auto-compress images
        fetch_format: 'auto',   // auto-convert to WebP/AVIF for modern browsers
        flags: 'progressive',   // progressive JPEG loading
      },
      (error, result) => {
        if (error) return reject(error);
        resolve(result);
      }
    );
    stream.end(buffer);
  });
}

// POST /api/admin/upload — Upload a single image/video
app.post('/api/admin/upload', requireAdminAuth, upload.single('file'), async (req, res) => {
  if (!req.file) {
    return res.status(400).json({ error: 'No file provided.' });
  }

  try {
    const isVideo = req.file.mimetype.startsWith('video/');
    const folder = isVideo ? 'videos' : 'images';
    const resourceType = isVideo ? 'video' : 'image';

    const result = await uploadToCloudinary(req.file.buffer, folder, resourceType);

    res.json({
      url: result.secure_url,
      publicId: result.public_id,
      width: result.width,
      height: result.height,
      format: result.format,
      resourceType: result.resource_type,
      bytes: result.bytes
    });
  } catch (err) {
    console.error('Cloudinary upload error:', err);
    res.status(500).json({ error: 'Upload failed. Please try again.' });
  }
});

// POST /api/admin/upload-multiple — Upload multiple images (for gallery blocks)
app.post('/api/admin/upload-multiple', requireAdminAuth, upload.array('files', 10), async (req, res) => {
  if (!req.files || req.files.length === 0) {
    return res.status(400).json({ error: 'No files provided.' });
  }

  try {
    const results = await Promise.all(
      req.files.map(file => uploadToCloudinary(file.buffer, 'images', 'image'))
    );

    res.json({
      files: results.map(r => ({
        url: r.secure_url,
        publicId: r.public_id,
        width: r.width,
        height: r.height
      }))
    });
  } catch (err) {
    console.error('Cloudinary batch upload error:', err);
    res.status(500).json({ error: 'Batch upload failed.' });
  }
});

// DELETE /api/admin/upload/:publicId — Delete image from Cloudinary
app.delete('/api/admin/upload/:publicId(*)', requireAdminAuth, async (req, res) => {
  const publicId = req.params.publicId;
  if (!publicId || !publicId.startsWith('bm-blog/')) {
    return res.status(400).json({ error: 'Invalid publicId.' });
  }

  try {
    await cloudinary.uploader.destroy(publicId);
    res.json({ message: 'File deleted from Cloudinary.' });
  } catch (err) {
    console.error('Cloudinary delete error:', err);
    res.status(500).json({ error: 'Delete failed.' });
  }
});
```

### 1E. Update Blog Route Normalization

Update the `normalizeBlogPayload` function to handle the new fields, and update all blog CRUD routes:

```js
function normalizeBlogPayload(body) {
  const title = String(body.title || '').trim();
  const contentHtml = String(body.contentHtml || '').trim();

  // Auto-generate plain text excerpt from HTML if not provided
  const autoExcerpt = contentHtml
    ? contentHtml.replace(/<[^>]+>/g, '').slice(0, 200).trim()
    : '';

  return {
    title,
    // Use explicit description if provided; otherwise auto-excerpt from content
    description: String(body.description || autoExcerpt || '').trim(),
    author: String(body.author || '').trim() || 'BM Team',
    youtubeUrl: String(body.youtubeUrl || '').trim(),
    thumbnailUrl: resolveThumbnailUrl({
      youtubeUrl: body.youtubeUrl,
      thumbnailUrl: body.thumbnailUrl
    }),
    featured: Boolean(body.featured),
    published: body.published !== false,
    // New rich content fields
    contentBlocks: body.contentBlocks || null,
    contentHtml,
    metaDescription: String(body.metaDescription || '').trim().slice(0, 160),
    tags: Array.isArray(body.tags) ? body.tags.map(t => String(t).trim().toLowerCase()).filter(Boolean) : [],
    readingTimeMinutes: estimateReadingTime(contentHtml),
    cloudinaryPublicIds: Array.isArray(body.cloudinaryPublicIds) ? body.cloudinaryPublicIds : [],
  };
}
```

Update the `POST /api/admin/blogs` route to auto-generate slugs:
```js
app.post('/api/admin/blogs', requireAdminAuth, async (req, res) => {
  const payload = normalizeBlogPayload(req.body);
  if (!payload.title || !payload.description) {
    return res.status(400).json({ error: 'Title and description are required.' });
  }

  try {
    const baseSlug = req.body.slug ? String(req.body.slug).trim() : generateSlug(payload.title);
    payload.slug = await ensureUniqueSlug(baseSlug);

    const blog = await Blog.create(payload);
    if (blog.featured) {
      await ensureSingleFeaturedBlog(blog._id);
    }
    res.status(201).json({ blog });
  } catch (err) {
    console.error('Create blog error:', err);
    res.status(500).json({ error: 'Failed to create blog.' });
  }
});
```

Update the `PUT /api/admin/blogs/:id` route:
```js
app.put('/api/admin/blogs/:id', requireAdminAuth, async (req, res) => {
  const payload = normalizeBlogPayload(req.body);
  if (!payload.title || !payload.description) {
    return res.status(400).json({ error: 'Title and description are required.' });
  }

  try {
    // Only regenerate slug if explicitly changed or if slug is missing
    if (req.body.slug) {
      payload.slug = await ensureUniqueSlug(String(req.body.slug).trim(), req.params.id);
    }

    const blog = await Blog.findByIdAndUpdate(req.params.id, payload, {
      new: true,
      runValidators: true
    });

    if (!blog) {
      return res.status(404).json({ error: 'Blog not found.' });
    }

    if (blog.featured) {
      await ensureSingleFeaturedBlog(blog._id);
    }

    res.json({ blog });
  } catch (err) {
    console.error('Update blog error:', err);
    res.status(500).json({ error: 'Failed to update blog.' });
  }
});
```

Add a public endpoint to fetch blog by slug:
```js
app.get('/api/blogs/:slug', async (req, res) => {
  try {
    const blog = await Blog.findOne({ slug: req.params.slug, published: true });
    if (!blog) {
      return res.status(404).json({ error: 'Blog not found.' });
    }
    res.json({ blog });
  } catch (err) {
    res.status(500).json({ error: 'Failed to fetch blog.' });
  }
});
```

---

## 🖥️ Phase 2 — Client: Tiptap Rich Editor Component

Create a new file: `client/src/components/RichEditor/`

### File Structure to Create
```
client/src/components/RichEditor/
├── RichEditor.tsx           ← Main editor component (wraps Tiptap)
├── EditorToolbar.tsx        ← Fixed top toolbar with all formatting buttons
├── BubbleToolbar.tsx        ← Floating selection toolbar
├── SlashCommandMenu.tsx     ← The / command palette
├── ImageBlock.tsx           ← Custom image node with Cloudinary upload
├── GalleryBlock.tsx         ← Multi-image gallery node
├── CalloutBlock.tsx         ← Info/warning/tip callout block
├── extensions/
│   ├── SlashCommand.ts      ← Custom Tiptap extension for / commands
│   ├── ImageUpload.ts       ← Custom Tiptap image extension with upload
│   └── Callout.ts           ← Custom callout node extension
└── editor.css               ← All editor styles (NOT Tailwind — use custom CSS)
```

### RichEditor.tsx — The Main Editor

```tsx
import { useEditor, EditorContent, BubbleMenu } from '@tiptap/react';
import StarterKit from '@tiptap/starter-kit';
import Image from '@tiptap/extension-image';
import Link from '@tiptap/extension-link';
import Youtube from '@tiptap/extension-youtube';
import Highlight from '@tiptap/extension-highlight';
import Superscript from '@tiptap/extension-superscript';
import Subscript from '@tiptap/extension-subscript';
import Underline from '@tiptap/extension-underline';
import TextAlign from '@tiptap/extension-text-align';
import Placeholder from '@tiptap/extension-placeholder';
import CharacterCount from '@tiptap/extension-character-count';
import CodeBlockLowlight from '@tiptap/extension-code-block-lowlight';
import { Table } from '@tiptap/extension-table';
import { TableRow } from '@tiptap/extension-table-row';
import { TableHeader } from '@tiptap/extension-table-header';
import { TableCell } from '@tiptap/extension-table-cell';
import { TaskList } from '@tiptap/extension-task-list';
import { TaskItem } from '@tiptap/extension-task-item';
import { common, createLowlight } from 'lowlight';
import { useCallback, useEffect, useRef } from 'react';
import { EditorToolbar } from './EditorToolbar';
import { BubbleToolbar } from './BubbleToolbar';
import { SlashCommandExtension } from './extensions/SlashCommand';
import './editor.css';

const lowlight = createLowlight(common);

interface RichEditorProps {
  initialContent?: object | null;  // Tiptap JSON doc
  onUpdate: (html: string, json: object, wordCount: number) => void;
  adminToken: string;  // For authenticated image uploads
  placeholder?: string;
}

export function RichEditor({ initialContent, onUpdate, adminToken, placeholder }: RichEditorProps) {
  const onUpdateRef = useRef(onUpdate);
  onUpdateRef.current = onUpdate;

  const editor = useEditor({
    extensions: [
      StarterKit.configure({
        codeBlock: false, // We use CodeBlockLowlight instead
      }),
      Image.configure({
        inline: false,
        allowBase64: false,
        HTMLAttributes: { class: 'bm-editor-image' }
      }),
      Link.configure({
        openOnClick: false,
        HTMLAttributes: { class: 'bm-editor-link', rel: 'noopener noreferrer', target: '_blank' }
      }),
      Youtube.configure({
        width: '100%',
        height: 480,
        HTMLAttributes: { class: 'bm-editor-youtube' }
      }),
      Highlight.configure({ multicolor: false }),
      Superscript,
      Subscript,
      Underline,
      TextAlign.configure({ types: ['heading', 'paragraph'] }),
      Placeholder.configure({
        placeholder: placeholder || 'Start writing your post... Type / to insert a block',
        emptyEditorClass: 'bm-editor-empty',
      }),
      CharacterCount,
      CodeBlockLowlight.configure({ lowlight }),
      Table.configure({ resizable: true }),
      TableRow,
      TableHeader,
      TableCell,
      TaskList,
      TaskItem.configure({ nested: true }),
      SlashCommandExtension.configure({ adminToken }),
    ],
    content: initialContent || '',
    editorProps: {
      attributes: {
        class: 'bm-editor-canvas',
        spellcheck: 'true',
      }
    },
    onUpdate: ({ editor }) => {
      const html = editor.getHTML();
      const json = editor.getJSON();
      const wordCount = editor.storage.characterCount?.words() || 0;
      onUpdateRef.current(html, json, wordCount);
    },
    autofocus: 'end',
  });

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      editor?.destroy();
    };
  }, [editor]);

  if (!editor) return null;

  return (
    <div className="bm-rich-editor">
      <EditorToolbar editor={editor} adminToken={adminToken} />
      <BubbleMenu editor={editor} tippyOptions={{ duration: 100, placement: 'top' }}>
        <BubbleToolbar editor={editor} />
      </BubbleMenu>
      <div className="bm-editor-content-wrapper">
        <EditorContent editor={editor} />
      </div>
      <div className="bm-editor-status-bar">
        <span>{editor.storage.characterCount?.words() || 0} words</span>
        <span>{editor.storage.characterCount?.characters() || 0} characters</span>
      </div>
    </div>
  );
}
```

### SlashCommandExtension (extensions/SlashCommand.ts)

This is the most complex part — the `/` command palette. Implement it as a Tiptap extension using a React renderer for the dropdown:

```ts
// The slash command extension intercepts "/" keypresses in empty lines
// and renders a searchable command palette with all block types.
// Use Tiptap's suggestion API to implement this.
// Reference: https://tiptap.dev/docs/editor/extensions/functionality/slash-commands

import { Extension } from '@tiptap/core';
import { ReactRenderer } from '@tiptap/react';
import Suggestion from '@tiptap/suggestion';
import tippy from 'tippy.js';
import { SlashCommandMenu } from '../SlashCommandMenu';

// Define all available slash commands
export const SLASH_COMMANDS = [
  // Text blocks
  { title: 'Paragraph',     icon: '¶',  group: 'Text',   command: ({ editor, range }) => editor.chain().focus().deleteRange(range).setParagraph().run() },
  { title: 'Heading 1',     icon: 'H1', group: 'Text',   command: ({ editor, range }) => editor.chain().focus().deleteRange(range).setHeading({ level: 1 }).run() },
  { title: 'Heading 2',     icon: 'H2', group: 'Text',   command: ({ editor, range }) => editor.chain().focus().deleteRange(range).setHeading({ level: 2 }).run() },
  { title: 'Heading 3',     icon: 'H3', group: 'Text',   command: ({ editor, range }) => editor.chain().focus().deleteRange(range).setHeading({ level: 3 }).run() },
  { title: 'Bullet List',   icon: '•',  group: 'Text',   command: ({ editor, range }) => editor.chain().focus().deleteRange(range).toggleBulletList().run() },
  { title: 'Ordered List',  icon: '1.', group: 'Text',   command: ({ editor, range }) => editor.chain().focus().deleteRange(range).toggleOrderedList().run() },
  { title: 'Task List',     icon: '☑', group: 'Text',   command: ({ editor, range }) => editor.chain().focus().deleteRange(range).toggleTaskList().run() },
  { title: 'Blockquote',    icon: '"',  group: 'Text',   command: ({ editor, range }) => editor.chain().focus().deleteRange(range).setBlockquote().run() },
  { title: 'Code Block',    icon: '<>', group: 'Text',   command: ({ editor, range }) => editor.chain().focus().deleteRange(range).setCodeBlock().run() },
  { title: 'Table',         icon: '⊞', group: 'Text',   command: ({ editor, range }) => editor.chain().focus().deleteRange(range).insertTable({ rows: 3, cols: 3, withHeaderRow: true }).run() },
  { title: 'Divider',       icon: '—',  group: 'Text',   command: ({ editor, range }) => editor.chain().focus().deleteRange(range).setHorizontalRule().run() },
  // Media blocks — these open a file picker / prompt
  { title: 'Image',         icon: '🖼', group: 'Media',  command: ({ editor, range, adminToken }) => { /* trigger file upload */ } },
  { title: 'YouTube Video', icon: '▶', group: 'Media',  command: ({ editor, range }) => { /* prompt for URL */ } },
  { title: 'Callout',       icon: '⚡', group: 'Layout', command: ({ editor, range }) => { /* insert callout node */ } },
];

export const SlashCommandExtension = Extension.create({
  name: 'slashCommand',
  addOptions() {
    return { adminToken: '' };
  },
  addProseMirrorPlugins() {
    return [
      Suggestion({
        editor: this.editor,
        char: '/',
        command: ({ editor, range, props }) => {
          props.command({ editor, range, adminToken: this.options.adminToken });
        },
        items: ({ query }) => {
          if (!query) return SLASH_COMMANDS;
          const q = query.toLowerCase();
          return SLASH_COMMANDS.filter(cmd => cmd.title.toLowerCase().includes(q));
        },
        render: () => {
          let component: ReactRenderer;
          let popup: any;

          return {
            onStart: (props) => {
              component = new ReactRenderer(SlashCommandMenu, {
                props, editor: props.editor,
              });
              popup = tippy('body', {
                getReferenceClientRect: props.clientRect,
                appendTo: () => document.body,
                content: component.element,
                showOnCreate: true,
                interactive: true,
                trigger: 'manual',
                placement: 'bottom-start',
              });
            },
            onUpdate: (props) => {
              component.updateProps(props);
              popup[0].setProps({ getReferenceClientRect: props.clientRect });
            },
            onKeyDown: (props) => {
              if (props.event.key === 'Escape') { popup[0].hide(); return true; }
              return (component.ref as any)?.onKeyDown(props);
            },
            onExit: () => {
              popup[0].destroy();
              component.destroy();
            },
          };
        },
      }),
    ];
  },
});
```

### EditorToolbar.tsx — Fixed Top Toolbar

The toolbar must be visually stunning — black/yellow BM theme, grouped buttons with dividers, dropdown for block type selection.

```tsx
// Props: editor (Tiptap editor instance), adminToken (for upload button)
// Implement these button groups (separated by | dividers):

// Group 1 — Block type dropdown
// Shows current block: "Paragraph", "Heading 1", "Heading 2", "Heading 3",
// "Blockquote", "Code Block" — clicking changes block type

// Group 2 — Text formatting
// Bold (Cmd+B), Italic (Cmd+I), Underline (Cmd+U), Strikethrough

// Group 3 — Alignment
// Align Left, Center, Right, Justify (use TextAlign extension)

// Group 4 — Lists
// Bullet list, Ordered list, Task list

// Group 5 — Insert
// Link button (prompts for URL), Image upload (opens file picker → POST /api/admin/upload)
// YouTube embed (prompts for URL)

// Group 6 — History
// Undo, Redo

// Styling rules:
// - Container: bg-[#18181b] border-b border-white/10 sticky top-0 z-10 py-2 px-4
// - Buttons: rounded px-2 py-1 text-white/70 hover:text-white hover:bg-white/10 transition
// - Active state (when formatting is active on cursor): bg-yellow-400 text-black rounded
// - Dropdown: bg-[#1c1c1f] border border-white/10 rounded-lg shadow-xl
```

### BubbleToolbar.tsx — Floating Selection Menu

```tsx
// Appears when user selects text via BubbleMenu from @tiptap/react
// Buttons: Bold | Italic | Underline | Strike | Code | Highlight | Link
// Same dark theme, compact, pill-shaped container
// Show/hide link input when Link is clicked
```

### SlashCommandMenu.tsx — Command Palette

```tsx
// Rendered inside a Tippy.js tooltip
// Props from the slash command suggestion: items, command (the selected command executor)
// Features:
//   - Search input at top: "Filter commands..."
//   - Items grouped by: Text Blocks | Media Blocks | Layout Blocks
//   - Each item: icon + title + description
//   - Keyboard navigation: ↑ ↓ to move, Enter to execute, Escape to close
//   - Highlighted/selected item: bg-yellow-400/20 border-l-2 border-yellow-400
// Styling: bg-[#1c1c1f] border border-white/10 rounded-lg shadow-2xl w-72 max-h-80 overflow-y-auto
```

### editor.css — Editor Styles

This CSS must be comprehensive and match the BM black/yellow theme exactly:

```css
/* Base editor wrapper */
.bm-rich-editor {
  display: flex;
  flex-direction: column;
  height: 100%;
  background: #0d0d0d;
  border-radius: 8px;
  overflow: hidden;
}

/* The scrollable writing canvas area */
.bm-editor-content-wrapper {
  flex: 1;
  overflow-y: auto;
  padding: 0;
}

/* The actual ProseMirror editor */
.bm-editor-canvas {
  min-height: 600px;
  max-width: 800px;
  margin: 0 auto;
  padding: 48px 32px;
  color: #f8f8f8;
  font-family: 'Inter', 'Georgia', serif;
  font-size: 18px;
  line-height: 1.8;
  outline: none;
}

/* Placeholder */
.bm-editor-canvas.bm-editor-empty::before {
  content: attr(data-placeholder);
  color: rgba(255,255,255,0.25);
  pointer-events: none;
  float: left;
  height: 0;
}

/* Typography */
.bm-editor-canvas h1 { font-size: 2.5rem; font-weight: 800; line-height: 1.2; color: #facc15; margin: 2rem 0 1rem; }
.bm-editor-canvas h2 { font-size: 2rem; font-weight: 700; line-height: 1.3; color: #fff; margin: 1.75rem 0 0.75rem; }
.bm-editor-canvas h3 { font-size: 1.5rem; font-weight: 600; line-height: 1.4; color: #fff; margin: 1.5rem 0 0.5rem; }
.bm-editor-canvas p { margin: 0 0 1.2rem; }
.bm-editor-canvas strong { color: #fff; }
.bm-editor-canvas em { color: #e2e8f0; }
.bm-editor-canvas u { text-decoration-color: #facc15; }
.bm-editor-canvas mark { background: rgba(250,204,21,0.3); color: #fff; padding: 0 2px; border-radius: 2px; }

/* Links */
.bm-editor-link { color: #facc15; text-decoration: underline; text-underline-offset: 3px; }
.bm-editor-link:hover { color: #fde047; }

/* Blockquote */
.bm-editor-canvas blockquote {
  border-left: 4px solid #facc15;
  padding-left: 1.25rem;
  margin: 1.5rem 0;
  color: rgba(255,255,255,0.7);
  font-style: italic;
}

/* Code */
.bm-editor-canvas code {
  background: rgba(255,255,255,0.08);
  border: 1px solid rgba(255,255,255,0.1);
  border-radius: 4px;
  padding: 2px 6px;
  font-family: 'Fira Code', 'Consolas', monospace;
  font-size: 0.875em;
  color: #facc15;
}

/* Code blocks */
.bm-editor-canvas pre {
  background: #111111;
  border: 1px solid rgba(255,255,255,0.1);
  border-radius: 8px;
  padding: 1.5rem;
  overflow-x: auto;
  margin: 1.5rem 0;
}
.bm-editor-canvas pre code {
  background: none;
  border: none;
  color: #e2e8f0;
  font-size: 0.9rem;
}

/* Lists */
.bm-editor-canvas ul, .bm-editor-canvas ol { padding-left: 1.75rem; margin: 1rem 0; }
.bm-editor-canvas li { margin-bottom: 0.35rem; }
.bm-editor-canvas ul li::marker { color: #facc15; }
.bm-editor-canvas ol li::marker { color: #facc15; font-weight: 700; }

/* Task list */
.bm-editor-canvas ul[data-type="taskList"] { list-style: none; padding-left: 0.5rem; }
.bm-editor-canvas ul[data-type="taskList"] li { display: flex; align-items: flex-start; gap: 0.5rem; }
.bm-editor-canvas input[type="checkbox"] { accent-color: #facc15; margin-top: 4px; }

/* Images */
.bm-editor-image {
  width: 100%;
  max-width: 100%;
  height: auto;
  border-radius: 8px;
  margin: 1.5rem 0;
  border: 2px solid transparent;
  transition: border-color 0.2s;
}
.bm-editor-image.ProseMirror-selectednode { border-color: #facc15; }

/* YouTube embeds */
.bm-editor-youtube {
  width: 100%;
  aspect-ratio: 16/9;
  border-radius: 8px;
  overflow: hidden;
  margin: 1.5rem 0;
}

/* Horizontal rule */
.bm-editor-canvas hr {
  border: none;
  border-top: 1px solid rgba(255,255,255,0.1);
  margin: 2.5rem 0;
}

/* Table */
.bm-editor-canvas table {
  border-collapse: collapse;
  width: 100%;
  margin: 1.5rem 0;
  border-radius: 8px;
  overflow: hidden;
}
.bm-editor-canvas th {
  background: rgba(250,204,21,0.15);
  color: #facc15;
  font-weight: 600;
  padding: 10px 16px;
  border: 1px solid rgba(255,255,255,0.1);
  text-align: left;
}
.bm-editor-canvas td {
  padding: 10px 16px;
  border: 1px solid rgba(255,255,255,0.1);
}
.bm-editor-canvas tr:nth-child(even) td { background: rgba(255,255,255,0.02); }

/* Focus ring on selected blocks */
.bm-editor-canvas .ProseMirror-selectednode { outline: 2px solid rgba(250,204,21,0.5); border-radius: 4px; }

/* Status bar */
.bm-editor-status-bar {
  display: flex;
  gap: 1.5rem;
  padding: 8px 32px;
  background: #18181b;
  border-top: 1px solid rgba(255,255,255,0.06);
  font-size: 0.75rem;
  color: rgba(255,255,255,0.4);
}
```

---

## 🎨 Phase 3 — Redesign Admin.tsx (Full Page Layout)

### Layout Architecture

The current Admin page uses a sidebar + blog card list layout. Replace it completely with this layout when in "blog editor" mode:

```
┌─────────────────────────────────────────────────────────┐
│  ADMIN HEADER (sticky top)                              │
│  Logo | "Back to Dashboard" | Status: Draft | [Publish] │
├──────────────────────────────────────────────┬──────────┤
│  EDITOR AREA (scrollable)                    │ SIDEBAR  │
│                                              │ (320px)  │
│  ┌────────────────────────────────────────┐  │          │
│  │ TOOLBAR (sticky inside scroll)         │  │ Post     │
│  │ [H1][H2][H3]|[B][I][U][S]|[Align]|..  │  │ Settings │
│  ├────────────────────────────────────────┤  │          │
│  │                                        │  │ Featured │
│  │  [ Post Title — large editable input ] │  │ Image    │
│  │                                        │  │          │
│  │  [ Rich Editor Canvas ]                │  │ SEO      │
│  │  (Tiptap EditorContent)                │  │ Fields   │
│  │                                        │  │          │
│  └────────────────────────────────────────┘  │ Tags     │
└──────────────────────────────────────────────┴──────────┘
```

### Admin.tsx Structural Changes

**Keep all existing functionality** (leads management, admin login, stats dashboard). Add a new state `adminView: 'dashboard' | 'blogs' | 'editor'` and only show the new editor UI when `adminView === 'editor'`.

#### New State Variables Needed:
```tsx
const [editorContent, setEditorContent] = useState<{ html: string; json: object | null }>({ html: '', json: null });
const [editorWordCount, setEditorWordCount] = useState(0);
const [postSettings, setPostSettings] = useState({
  status: 'draft' as 'draft' | 'published',
  featured: false,
  author: 'BM Team',
  slug: '',
  metaDescription: '',
  tags: [] as string[],
  youtubeUrl: '',
  thumbnailUrl: '',
  featuredImageUrl: '',
  featuredImagePublicId: '',
});
const [autoSaveStatus, setAutoSaveStatus] = useState<'idle' | 'saving' | 'saved' | 'error'>('idle');
const [isPreviewMode, setIsPreviewMode] = useState(false);
const [editingBlog, setEditingBlog] = useState<BlogDoc | null>(null); // null = creating new
```

#### Auto-Save Implementation:
```tsx
// Auto-save to localStorage every 30 seconds while editing
useEffect(() => {
  if (!title && !editorContent.html) return;
  const timer = setInterval(async () => {
    setAutoSaveStatus('saving');
    try {
      // Save to localStorage as a draft backup
      localStorage.setItem('bm_draft_backup', JSON.stringify({
        title,
        editorContent,
        postSettings,
        savedAt: new Date().toISOString()
      }));
      setAutoSaveStatus('saved');
    } catch {
      setAutoSaveStatus('error');
    }
    setTimeout(() => setAutoSaveStatus('idle'), 3000);
  }, 30000);
  return () => clearInterval(timer);
}, [title, editorContent, postSettings]);
```

#### Title Field:
```tsx
// Large, editable H1-style title input (not a textarea — use contentEditable or input)
<input
  id="blog-title-input"
  type="text"
  placeholder="Post Title..."
  value={title}
  onChange={e => {
    setTitle(e.target.value);
    // Auto-generate slug from title if not manually edited
    if (!postSettings.slug || postSettings.slug === generateSlug(prevTitle)) {
      setPostSettings(s => ({ ...s, slug: generateSlug(e.target.value) }));
    }
  }}
  className="bm-title-input" // custom CSS: huge font, no border, transparent bg
/>
```

#### Right Sidebar Sections:

**Post Settings section:**
- Status toggle: `Draft ↔ Published` (clicking toggles between states)
- Author: text input
- Slug: text input with `/blog/` prefix shown as static label
- Reading time: auto-calculated, displayed as badge

**Featured Image section:**
- Drag-and-drop zone: dashed border, upload icon, "Drop image or click to upload"
- On file select: POST to `/api/admin/upload` → get Cloudinary URL → display thumbnail
- OR paste URL option
- OR YouTube URL option (auto-fetches thumbnail)

**SEO section:**
- Meta description: `<textarea>` with character counter (`{count}/160`)
- Tags input: type tag + press Enter/comma → renders as pill/chip

#### Image Upload in Toolbar:

```tsx
async function handleImageUpload(file: File): Promise<string> {
  const formData = new FormData();
  formData.append('file', file);
  const response = await fetch(`${API_BASE}/api/admin/upload`, {
    method: 'POST',
    headers: { Authorization: `Bearer ${adminToken}` },
    body: formData,
  });
  if (!response.ok) throw new Error('Upload failed');
  const data = await response.json();
  return data.url; // Cloudinary CDN URL
}

// In the toolbar's image button handler:
function openImageUploader() {
  const input = document.createElement('input');
  input.type = 'file';
  input.accept = 'image/*';
  input.onchange = async (e) => {
    const file = (e.target as HTMLInputElement).files?.[0];
    if (!file || !editor) return;
    setUploading(true);
    try {
      const url = await handleImageUpload(file);
      editor.chain().focus().setImage({ src: url }).run();
    } catch (err) {
      alert('Image upload failed. Please try again.');
    } finally {
      setUploading(false);
    }
  };
  input.click();
}
```

#### Preview Mode:

When `isPreviewMode` is true, hide the toolbar and editor, and show a `<div dangerouslySetInnerHTML={{ __html: editorContent.html }}` with the BM blog post typography styles applied — exactly how it will look to the reader.

Add a `<style>` tag or a separate CSS module for blog post display typography (separate from editor styles).

#### Save/Publish Flow:

```tsx
async function handleSave(publishStatus: 'draft' | 'published') {
  if (!title.trim()) {
    showToast('Title is required', 'error');
    return;
  }

  const payload = {
    title: title.trim(),
    description: editorContent.html
      ? editorContent.html.replace(/<[^>]+>/g, '').slice(0, 200)
      : '',
    contentBlocks: editorContent.json,
    contentHtml: editorContent.html,
    author: postSettings.author,
    slug: postSettings.slug,
    metaDescription: postSettings.metaDescription,
    tags: postSettings.tags,
    featured: postSettings.featured,
    published: publishStatus === 'published',
    youtubeUrl: postSettings.youtubeUrl,
    thumbnailUrl: postSettings.featuredImageUrl || postSettings.thumbnailUrl,
  };

  const isEditing = Boolean(editingBlog?._id);
  const url = isEditing
    ? `${API_BASE}/api/admin/blogs/${editingBlog._id}`
    : `${API_BASE}/api/admin/blogs`;
  const method = isEditing ? 'PUT' : 'POST';

  const response = await fetch(url, {
    method,
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${adminToken}`
    },
    body: JSON.stringify(payload)
  });

  if (!response.ok) throw new Error('Save failed');
  showToast(publishStatus === 'published' ? 'Published!' : 'Saved as draft', 'success');
  fetchBlogs(); // refresh blog list
}
```

---

## 📄 Phase 4 — Individual Blog Post Page (/blog/:slug)

### Create: `client/src/pages/BlogPost.tsx`

```tsx
// Route: /blog/:slug
// Fetches blog from: GET /api/blogs/:slug
// Displays:
//   1. Reading progress bar (fixed at top, yellow, animates as user scrolls)
//   2. Featured image (full width, hero style) if thumbnailUrl exists
//   3. Title (large, centered or left-aligned)
//   4. Author + date + reading time metadata row
//   5. Tags as clickable chips
//   6. Article body: <div dangerouslySetInnerHTML={{ __html: blog.contentHtml }} className="bm-blog-content" />
//   7. Share bar: Copy Link button, WhatsApp share button
//   8. Back to Blog button

// Reading progress bar implementation:
useEffect(() => {
  const updateProgress = () => {
    const el = document.documentElement;
    const progress = (el.scrollTop / (el.scrollHeight - el.clientHeight)) * 100;
    setReadingProgress(Math.min(100, Math.max(0, progress)));
  };
  window.addEventListener('scroll', updateProgress, { passive: true });
  return () => window.removeEventListener('scroll', updateProgress);
}, []);

// The fixed progress bar element:
<div
  style={{ width: `${readingProgress}%` }}
  className="fixed top-0 left-0 h-1 bg-yellow-400 z-50 transition-all duration-100"
/>

// SEO: Use <Helmet> or update document.title and meta tags dynamically
// document.title = `${blog.title} — Budding Mariners`;
// document.querySelector('meta[name="description"]')?.setAttribute('content', blog.metaDescription || blog.description);

// Blog content CSS (apply class "bm-blog-content" with these exact styles):
// These mirror the editor styles but in a read-only context:
// h1 → yellow-400, h2 → white, h3 → white
// blockquote → yellow left border
// code → inline dark bg
// pre → dark code block with syntax highlighting preserved
// images → full-width, rounded
// YouTube iframes → 16:9 aspect ratio
```

### Add Route in App.tsx

```tsx
import BlogPost from './pages/BlogPost';

// Inside <Routes>:
<Route path="/blog/:slug" element={<BlogPost />} />
```

### Make Blog Cards Clickable (Blog.tsx)

Update the blog cards on `Blog.tsx` to navigate to `/blog/${blog.slug}` when clicked:
```tsx
import { useNavigate } from 'react-router-dom';
const navigate = useNavigate();

// On card click:
onClick={() => blog.slug && navigate(`/blog/${blog.slug}`)}
```

---

## 🗂️ Phase 5 — Blog Management in Admin Dashboard

The admin blog list (card grid showing all blogs) needs the following upgrades:

1. **"New Post" button** — Opens the editor in create mode (clears all state)
2. **"Edit" button on each card** — Opens the editor pre-filled with that blog's data:
   - Sets `editingBlog` state
   - Pre-loads `title` from `blog.title`
   - Pre-loads `editorContent.json` (passed as `initialContent` to RichEditor)
   - Pre-loads all `postSettings` from blog data
3. **Quick toggle for Published/Draft** — PATCH button directly on the card, no full editor needed
4. **Delete with confirmation modal** — Existing functionality, keep as-is
5. **Slug display** — Show `buddingmariners.com/blog/{slug}` under the blog title in the card

---

## 🔐 Phase 6 — Security & Validation Checklist

Implement all of these without exception:

### Server-Side
- [ ] All upload/delete endpoints are behind `requireAdminAuth` middleware
- [ ] `multer` file type whitelist enforced (images + videos + PDF only)
- [ ] File size limit: 20MB max per file
- [ ] Cloudinary public IDs are validated to start with `bm-blog/` before deletion
- [ ] HTML content is stored as-is (Tiptap generates safe HTML) — do NOT strip server-side (the admin controls it)
- [ ] All new Blog fields have proper Mongoose types and defaults (no raw `Object` types except `contentBlocks`)
- [ ] Error responses always return `{ error: "..." }` JSON — never expose raw error stack traces
- [ ] `express.json()` body size limit increase for rich content: `app.use(express.json({ limit: '10mb' }))`

### Client-Side
- [ ] `adminToken` is only passed as a prop — never stored in global scope outside the auth handler
- [ ] All fetch calls to admin endpoints include `Authorization: Bearer ${adminToken}` header
- [ ] Image URLs displayed using `img` tags must be from trusted domains (Cloudinary CDN `res.cloudinary.com`)
- [ ] `dangerouslySetInnerHTML` used ONLY for displaying `contentHtml` that the admin themselves created
- [ ] No API keys or secrets anywhere in the client code
- [ ] All user inputs (title, slug, author, tags) are trimmed and validated before sending

---

## 🎨 Phase 7 — Design & Styling Requirements

### Color Tokens (must match existing BM theme exactly)
```css
--bm-bg-primary: #0d0d0d;
--bm-bg-surface: #111111;
--bm-bg-elevated: #18181b;
--bm-bg-popup: #1c1c1f;
--bm-accent: #facc15;        /* yellow-400 */
--bm-accent-dim: rgba(250, 204, 21, 0.15);
--bm-accent-glow: rgba(250, 204, 21, 0.4);
--bm-text-primary: #ffffff;
--bm-text-muted: rgba(255, 255, 255, 0.6);
--bm-text-faint: rgba(255, 255, 255, 0.25);
--bm-border: rgba(255, 255, 255, 0.08);
--bm-border-accent: rgba(250, 204, 21, 0.4);
--bm-success: #34d399;        /* emerald-400 */
--bm-danger: #f87171;         /* red-400 */
```

### Typography
- Use `Inter` from Google Fonts for the editor UI chrome (toolbar, sidebar, menus)
- Use `Georgia` or `Lora` as the editor canvas serif font for content (gives article feel)
- Title input: minimum 36px, font-weight 800, full-width, no background
- The `/` command menu items: Inter, 14px
- Status bar: monospace or Inter 12px

### Micro-Animations
- Toolbar buttons: `transition: all 0.15s ease` — scale(0.96) on active
- Slash command menu: fade in + slide down 8px over 150ms
- Bubble menu: fade in over 100ms
- Auto-save status indicator: fade "Saved" text after 3s
- Block selection highlight: glow border `box-shadow: 0 0 0 2px rgba(250,204,21,0.4)`
- Image upload progress: animated ring/spinner in yellow
- Reading progress bar: smooth width transition

---

## ✅ Phase 8 — Testing & Verification Checklist

After implementation, verify every item:

### Cloudinary Integration
- [ ] POST `/api/admin/upload` returns `{ url, publicId }` with a valid `res.cloudinary.com` URL
- [ ] The uploaded image is visible in the Cloudinary console under `bm-blog/images/`
- [ ] Uploading a disallowed file type returns a 400 error
- [ ] Uploading without auth token returns 401

### Rich Editor
- [ ] Typing `/` on an empty line opens the command palette
- [ ] All text formatting buttons work (Bold, Italic, Underline, Strikethrough, Highlight)
- [ ] All heading levels render correctly in the editor
- [ ] Pasting a YouTube URL via the YouTube block embeds a playable iframe
- [ ] Uploading an image via the toolbar inserts it into the editor at cursor position
- [ ] Code blocks render with syntax highlighting
- [ ] Tables can be inserted, edited, and have correct styling
- [ ] Undo/Redo (Ctrl+Z / Ctrl+Shift+Z or Cmd+Z) works

### Admin Panel
- [ ] Creating a new blog saves both `contentBlocks` and `contentHtml` to MongoDB
- [ ] Editing an existing blog pre-loads the Tiptap editor with the existing `contentBlocks`
- [ ] Auto-save writes to localStorage every 30 seconds
- [ ] "Preview" mode shows the blog as it will appear to readers
- [ ] Slug is auto-generated from title and is URL-safe
- [ ] Featured image upload updates the thumbnail preview in the sidebar
- [ ] Publishing a blog sets `published: true`; saving as draft sets `published: false`

### Individual Blog Post Page
- [ ] Navigating to `/blog/:slug` shows the full blog post
- [ ] The reading progress bar animates correctly as the user scrolls
- [ ] All rich content (images, YouTube, code blocks, tables) render correctly
- [ ] The page title and meta description update dynamically for SEO
- [ ] "Share" / "Copy Link" button copies the correct URL

### Backward Compatibility
- [ ] Existing blog posts (without `contentHtml`) still appear on the Blog page using `description`
- [ ] Existing blog cards are still visible and clickable
- [ ] The leads management tab in Admin still works
- [ ] Admin login/logout still works
- [ ] All other pages (Home, Courses, About, etc.) are completely unaffected

---

## 📋 Implementation Order (Do This Exactly in Sequence)

1. **Install all packages** (server + client) as listed in the packages section
2. **Update server.js** — Add Cloudinary config, multer, upload endpoints, new BlogSchema, slug utilities, updated CRUD routes
3. **Create `RichEditor/editor.css`** — All editor styles
4. **Create `RichEditor/extensions/SlashCommand.ts`** — Slash command Tiptap extension
5. **Create `RichEditor/BubbleToolbar.tsx`** — Bubble menu
6. **Create `RichEditor/EditorToolbar.tsx`** — Top toolbar with all buttons
7. **Create `RichEditor/SlashCommandMenu.tsx`** — Command palette UI
8. **Create `RichEditor/RichEditor.tsx`** — Main editor wrapper
9. **Update `Admin.tsx`** — New layout, editor integration, sidebar, auto-save
10. **Create `pages/BlogPost.tsx`** — Individual post page
11. **Update `App.tsx`** — Add `/blog/:slug` route
12. **Update `Blog.tsx`** — Make cards clickable with navigation

---

## ⚠️ Critical Rules — Do NOT Break These

1. **Keep the server in CommonJS** — Use `require()` not `import`. Do NOT add `"type": "module"` to `server/package.json`.
2. **Do NOT modify the auth system** — The existing HMAC-SHA256 token system must stay intact. Only add the `requireAdminAuth` middleware to new routes.
3. **Preserve all existing routes** — Every existing API endpoint must continue to work. Only add new ones, update existing blog CRUD routes.
4. **Keep existing pages untouched** — Only modify `Admin.tsx`, `Blog.tsx`, and `App.tsx`. All other pages (Home, Courses, About, Calculators, etc.) must not be touched.
5. **No external auth libraries** — Do not introduce JWT, Passport, or any auth library. The custom HMAC token system stays.
6. **Do NOT use base64 for images** — Always use Cloudinary URLs. Base64 in MongoDB is unacceptable for production.
7. **All new API errors must return JSON** — `res.status(XXX).json({ error: '...' })` format.
8. **Slug field uses `sparse: true`** — This allows old documents without slugs to coexist without unique constraint violations.
9. **The client sends NO Cloudinary credentials** — All uploads go through the Express backend. Never put Cloudinary API key/secret in the React code.
10. **Test backward compatibility** — Old blogs without `contentHtml` must still render on the Blog page using `description`.
