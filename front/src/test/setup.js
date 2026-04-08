import "@testing-library/jest-dom/vitest";

// HomePage Counter 使用 IntersectionObserver；jsdom 未实现
globalThis.IntersectionObserver = class {
  constructor() {}
  observe() {}
  unobserve() {}
  disconnect() {}
};
