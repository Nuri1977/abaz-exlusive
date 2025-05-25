import "@testing-library/jest-dom";
import React from "react";

// Polyfill TextEncoder and TextDecoder for Node.js
import { TextEncoder, TextDecoder } from "util";
if (typeof global.TextEncoder === "undefined") {
  global.TextEncoder = TextEncoder as unknown as typeof global.TextEncoder;
}
if (typeof global.TextDecoder === "undefined") {
  global.TextDecoder = TextDecoder as unknown as typeof global.TextDecoder;
}

// Mock next/navigation
jest.mock("next/navigation", () => ({
  useRouter() {
    return {
      push: jest.fn(),
      replace: jest.fn(),
      prefetch: jest.fn(),
      back: jest.fn(),
    };
  },
  usePathname() {
    return "";
  },
  useSearchParams() {
    return new URLSearchParams();
  },
}));

// Mock next/image
jest.mock("next/image", () => ({
  __esModule: true,
  default: function Image(props: any) {
    return React.createElement("img", props);
  },
}));

// Suppress console errors during tests
const originalError = console.error;
beforeAll(() => {
  console.error = (...args: any[]) => {
    if (
      typeof args[0] === "string" &&
      args[0].includes("Warning: ReactDOM.render is no longer supported")
    ) {
      return;
    }
    originalError.call(console, ...args);
  };
});

afterAll(() => {
  console.error = originalError;
});
