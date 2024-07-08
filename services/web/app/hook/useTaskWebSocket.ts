import useWebSocket from 'react-use-websocket';

export const useTaskWebSocket = (todo_uuid: string) => {
  const url = `${process.env.NEXT_PUBLIC_WS_URL}/ws/${todo_uuid}`;
  const { sendJsonMessage, lastJsonMessage, readyState } = useWebSocket(url, {
    onOpen: () => console.log('opened'),
    shouldReconnect: (closeEvent) => {
      console.log(closeEvent);
      return true;
    },
    reconnectAttempts: 10,
  });

  return { sendJsonMessage, lastJsonMessage, readyState };
};
