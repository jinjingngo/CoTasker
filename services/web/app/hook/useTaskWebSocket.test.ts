import { describe, it, expect, vi, beforeEach } from 'vitest';
import { renderHook } from '@testing-library/react';
import useWebSocket from 'react-use-websocket';

import { useTaskWebSocket } from './useTaskWebSocket';

interface ReadyStateType {
  UNINSTANTIATED: -1;
  CONNECTING: 0;
  OPEN: 1;
  CLOSING: 2;
  CLOSED: 3;
}

interface ReactUseWebSocketModule {
  ReadyState: ReadyStateType;
}

vi.mock('react-use-websocket', async () => {
  const actualModule = (await vi.importActual(
    'react-use-websocket',
  )) as ReactUseWebSocketModule;
  return {
    __esModule: true,
    default: vi.fn(() => ({
      sendJsonMessage: vi.fn(),
      lastJsonMessage: { id: 1, content: 'Hello' },
      readyState: actualModule.ReadyState.OPEN,
    })),
    ReadyState: {
      ...actualModule.ReadyState,
    },
  };
});

describe('useTaskWebSocket', () => {
  const todo_uuid = 'test-uuid';
  const testUrl = `ws://example.com/ws/${todo_uuid}`;

  beforeEach(() => {
    process.env.NEXT_PUBLIC_WS_URL = 'ws://example.com';
  });

  it('should initiate connection with correct URL', () => {
    renderHook(() => useTaskWebSocket(todo_uuid));
    expect(useWebSocket).toHaveBeenCalledWith(testUrl, expect.anything());
  });

  it('returns necessary websocket functions and data', () => {
    const { result } = renderHook(() => useTaskWebSocket(todo_uuid));
    expect(result.current.sendJsonMessage).toBeInstanceOf(Function);
    expect(result.current.lastJsonMessage).toEqual({ id: 1, content: 'Hello' });
    expect(result.current.readyState).toBe(WebSocket.OPEN);
  });
});
