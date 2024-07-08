import { FC } from 'react';

import toast, { Toaster, ToasterProps } from 'react-hot-toast';

export const CoToaster: FC<ToasterProps> = () => (
  <Toaster position='top-center' reverseOrder={false} />
);

export const CoToastOption = {
  id: 'co-tasker-unified-toaster',
};

export const loading = (message: string) =>
  toast.loading(message, CoToastOption);

export const success = (message: string) =>
  toast.success(message, CoToastOption);

export const error = (message: string) => toast.error(message, CoToastOption);

export const dismiss = () => toast.dismiss(CoToastOption.id);
