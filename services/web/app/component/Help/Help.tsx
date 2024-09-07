import { FC, ReactNode, useRef, useEffect } from 'react';

interface DialogProps {
  title: string;
  isOpen: boolean;
  close: () => void;
  children: ReactNode;
}

const DEFAULT_TITLE = 'Help';

export const Dialog: FC<DialogProps> = ({
  title = DEFAULT_TITLE,
  isOpen,
  close,
  children,
}) => {
  const ref = useRef<HTMLDialogElement | null>(null);

  useEffect(() => {
    if (isOpen) {
      ref.current?.showModal();
    } else {
      ref.current?.close();
    }
  }, [isOpen]);

  return (
    <dialog
      className={`w-full flex-col gap-4 rounded-lg border-[1px] border-solid border-[salmon] px-4 py-2 shadow-2xl md:w-[70%] lg:w-[55%] xl:w-[35%] ${isOpen ? 'flex' : ''}`}
      ref={ref}
    >
      <header className='select-none font-medium'>{title}</header>
      <section>{children}</section>
      <footer className='flex justify-end'>
        <button
          className='select-none outline-none hover:text-[salmon]'
          onClick={close}
        >
          Close
        </button>
      </footer>
    </dialog>
  );
};

type HelperProps = Omit<DialogProps, 'children' | 'title'>;

export const Helper: FC<HelperProps> = (props) => {
  return (
    <Dialog {...props} title='How CoTasker works'>
      <p>
        CoTasker is a to-do app designed to support real-time collaboration
        between users. It allows users to create tasks, such as grocery lists,
        and collaborate with others to edit shared lists in real-time. Users can
        mark tasks as &quot;done&quot;, helping to keep the list clutter-free
        and focus on pending items. The app also includes a filtering feature
        that lets users view completed tasks for reviewing progress.
      </p>
      <br />
      <p>
        Additionally, CoTasker supports creating subtasks within main tasks,
        allowing users to logically group tasks and track their progress more
        effectively. The app enables infinite nesting of subtasks, making it
        easy to break down complex tasks into smaller, manageable parts for
        better organization and productivity.
      </p>
    </Dialog>
  );
};
