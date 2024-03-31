import { PathParam } from '@/app/types';

const TaskPage = (pathParam: PathParam) => {
  console.log(pathParam);
  return (
    <main className='flex min-h-screen flex-col items-center justify-between p-24'>
      task {pathParam.params.todo_uuid}
    </main>
  );
};

export default TaskPage;
