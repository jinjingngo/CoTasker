import useTodo from '../../hook/useTodo';

const TodoCounter = () => {
  const { todos, total, hasMore, loadMore, isLoading } = useTodo();
  return (
    <li className='flex w-full items-center justify-between rounded-b-lg border-[1px] border-solid border-[salmon] px-4  py-2'>
      <div>
        {todos.length} / {total}
      </div>
      <button
        className='disabled:cursor-not-allowed disabled:text-gray-400'
        disabled={isLoading || !hasMore}
        onClick={loadMore}
      >
        Load more
      </button>
    </li>
  );
};

export default TodoCounter;
