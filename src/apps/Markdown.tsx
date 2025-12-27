// Markdown Editor with Live Preview
import React, { useState, useEffect } from 'react';
import { marked } from 'marked';
import { Eye, EyeOff, Download, Copy, Check } from 'lucide-react';
import './Markdown.css';

marked.setOptions({
  breaks: true,
  gfm: true,
});

const DEFAULT_MARKDOWN = `# Welcome to Markdown Editor

## Features
- **Live preview** - See your changes instantly
- *Italic text* and **bold text**
- \`Inline code\` and code blocks
- Lists and tables
- Links and images

## Code Example
\`\`\`javascript
function greet(name) {
  return \`Hello, \${name}!\`;
}
\`\`\`

## Lists
1. First item
2. Second item
3. Third item

- Bullet point
- Another point
  - Nested point

## Table
| Feature | Status |
|---------|--------|
| Preview | ✅ |
| Export | ✅ |
| Syntax | ✅ |

## Links
[SnackOS GitHub](https://github.com)

> This is a blockquote
> It can span multiple lines

---

Happy writing! 📝
`;

export const Markdown: React.FC = () => {
  const [markdown, setMarkdown] = useState(() => {
    const saved = localStorage.getItem('snackos-markdown');
    return saved || DEFAULT_MARKDOWN;
  });
  const [showPreview, setShowPreview] = useState(true);
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    const timeoutId = setTimeout(() => {
      localStorage.setItem('snackos-markdown', markdown);
    }, 1000);

    return () => clearTimeout(timeoutId);
  }, [markdown]);

  const getHtmlPreview = () => {
    return { __html: marked(markdown) };
  };

  const handleExportMarkdown = () => {
    const blob = new Blob([markdown], { type: 'text/markdown' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `document-${Date.now()}.md`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  const handleExportHtml = () => {
    const html = marked(markdown);
    const fullHtml = `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Markdown Document</title>
  <style>
    body {
      max-width: 800px;
      margin: 0 auto;
      padding: 2rem;
      font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
      line-height: 1.6;
      color: #333;
    }
    pre { background: #f5f5f5; padding: 1rem; border-radius: 4px; overflow-x: auto; }
    code { background: #f5f5f5; padding: 0.2rem 0.4rem; border-radius: 3px; font-size: 0.9em; }
    table { border-collapse: collapse; width: 100%; margin: 1rem 0; }
    th, td { border: 1px solid #ddd; padding: 0.5rem; text-align: left; }
    th { background: #f5f5f5; }
    blockquote { border-left: 4px solid #ddd; margin: 1rem 0; padding-left: 1rem; color: #666; }
    img { max-width: 100%; }
  </style>
</head>
<body>
${html}
</body>
</html>`;
    
    const blob = new Blob([fullHtml], { type: 'text/html' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `document-${Date.now()}.html`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  const handleCopyMarkdown = async () => {
    try {
      await navigator.clipboard.writeText(markdown);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch (err) {
      console.error('Failed to copy:', err);
    }
  };

  const handleClear = () => {
    if (confirm('Are you sure you want to clear the editor?')) {
      setMarkdown('');
    }
  };

  const wordCount = markdown.split(/\s+/).filter(word => word.length > 0).length;
  const charCount = markdown.length;
  const lineCount = markdown.split('\n').length;

  return (
    <div className="markdown-app">
      <div className="markdown-toolbar">
        <div className="toolbar-section">
          <button
            className={`toolbar-btn ${showPreview ? 'active' : ''}`}
            onClick={() => setShowPreview(!showPreview)}
            title={showPreview ? 'Hide Preview' : 'Show Preview'}
          >
            {showPreview ? <Eye size={18} /> : <EyeOff size={18} />}
            {showPreview ? 'Preview' : 'Editor Only'}
          </button>
        </div>

        <div className="toolbar-section">
          <button
            className="toolbar-btn"
            onClick={handleCopyMarkdown}
            title="Copy to Clipboard"
          >
            {copied ? <Check size={18} /> : <Copy size={18} />}
            {copied ? 'Copied!' : 'Copy'}
          </button>
          <button
            className="toolbar-btn"
            onClick={handleExportMarkdown}
            title="Export as Markdown"
          >
            <Download size={18} />
            .md
          </button>
          <button
            className="toolbar-btn"
            onClick={handleExportHtml}
            title="Export as HTML"
          >
            <Download size={18} />
            .html
          </button>
          <button
            className="toolbar-btn danger"
            onClick={handleClear}
            title="Clear Editor"
          >
            Clear
          </button>
        </div>
      </div>

      <div className="markdown-content">
        <div className={`editor-pane ${showPreview ? 'split' : 'full'}`}>
          <div className="pane-header">
            <span>Editor</span>
            <div className="editor-stats">
              {wordCount} words · {charCount} chars · {lineCount} lines
            </div>
          </div>
          <textarea
            className="markdown-editor"
            value={markdown}
            onChange={(e) => setMarkdown(e.target.value)}
            placeholder="Start writing markdown..."
            spellCheck={false}
          />
        </div>

        {showPreview && (
          <div className="preview-pane">
            <div className="pane-header">
              <span>Preview</span>
            </div>
            <div
              className="markdown-preview"
              dangerouslySetInnerHTML={getHtmlPreview()}
            />
          </div>
        )}
      </div>
    </div>
  );
};

