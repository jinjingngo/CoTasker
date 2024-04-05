import { useState } from 'react';

import type { Status } from '@/shared/schemas';

type FilterOption = {
  name: string;
  value: Status[];
};

const FilterOptions: FilterOption[] = [
  { name: 'All', value: ['DONE', 'IN_PROGRESS'] },
  { name: 'Done', value: ['DONE'] },
  { name: 'Pending', value: ['IN_PROGRESS'] },
];

const useStatusFilter = () => {
  const [filteringStatus, setFilteringStatus] = useState<Status[]>([
    'DONE',
    'IN_PROGRESS',
  ]);

  const Filter = () => (
    <label className='flex gap-1 place-self-start text-gray-700'>
      <p>Status: </p>
      <select
        className='bg-transparent text-gray-700'
        name='filter'
        id='filter'
        value={filteringStatus.join(',')}
        onChange={(event) => {
          const { value } = event.target;
          const status = value.split(',') as Status[];
          setFilteringStatus(status);
        }}
      >
        {FilterOptions.map(({ name, value }, index) => (
          <option key={index} value={value.join(',')}>
            {name}
          </option>
        ))}
      </select>
    </label>
  );

  return { filteringStatus, Filter };
};

export default useStatusFilter;
