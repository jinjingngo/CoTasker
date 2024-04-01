// import '@testing-library/jest-dom';

// Mock matchMedia
global.window.matchMedia =
  global.window.matchMedia ||
  (() => {
    return {
      matches: false,
      addListener: () => {},
      removeListener: () => {},
    };
  });
