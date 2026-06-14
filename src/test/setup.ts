import '@testing-library/jest-dom/vitest'

// pdfjs-dist references DOMMatrix at import time; jsdom doesn't provide it.
if (typeof globalThis.DOMMatrix === 'undefined') {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  ;(globalThis as any).DOMMatrix = class DOMMatrix {}
}
