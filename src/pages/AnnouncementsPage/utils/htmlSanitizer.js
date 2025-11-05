import DOMPurify from 'dompurify';

/**
 * Sanitize HTML content to prevent XSS attacks
 * @param {string} html - Raw HTML string
 * @returns {string} Sanitized HTML string
 */
export const sanitizeHtml = (html) => {
  if (!html) return '';
  
  return DOMPurify.sanitize(html, {
    ALLOWED_TAGS: [
      'p', 'br', 'strong', 'em', 'u', 'i', 'b',
      'h1', 'h2', 'h3', 'h4', 'h5', 'h6',
      'ul', 'ol', 'li',
      'a', 'img',
      'blockquote', 'pre', 'code',
      'span', 'div',
      'table', 'thead', 'tbody', 'tr', 'th', 'td',
      'font'
    ],
    ALLOWED_ATTR: [
      'href', 'target', 'rel',
      'src', 'alt', 'width', 'height',
      'class', 'id',
      'style',
      'size', 'color', 'face'
    ],
    ALLOWED_STYLES: {
      '*': {
        'color': [/^#[0-9a-fA-F]{3,6}$/],
        'background-color': [/^#[0-9a-fA-F]{3,6}$/],
        'font-size': [/^\d+(?:px|em|rem|%)$/],
        'font-weight': [/^(?:normal|bold|\d{3})$/],
        'text-align': [/^(?:left|right|center|justify)$/],
        'text-decoration': [/^(?:none|underline|line-through)$/],
        'font-style': [/^(?:normal|italic|oblique)$/]
      }
    }
  });
};

/**
 * Strip HTML tags and get plain text
 * @param {string} html - Raw HTML string
 * @returns {string} Plain text
 */
export const stripHtml = (html) => {
  if (!html) return '';
  
  const cleaned = DOMPurify.sanitize(html, { ALLOWED_TAGS: [] });
  return cleaned.replace(/\s+/g, ' ').trim();
};

/**
 * Get excerpt from HTML content
 * @param {string} html - Raw HTML string
 * @param {number} length - Maximum length of excerpt
 * @returns {string} Plain text excerpt
 */
export const getHtmlExcerpt = (html, length = 150) => {
  const plainText = stripHtml(html);
  
  if (plainText.length <= length) {
    return plainText;
  }
  
  return plainText.substring(0, length).trim() + '...';
};