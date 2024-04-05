import { useContext } from 'react';

import { TodoProviderContext } from '../provider';

const useTodo = () => {
  return useContext(TodoProviderContext);
};

export default useTodo;
