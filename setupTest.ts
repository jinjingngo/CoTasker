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
