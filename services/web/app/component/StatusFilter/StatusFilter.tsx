import type { FilterStatus } from '@/app/types';

type FilterOption = {
  name: string;
  value: FilterStatus;
};

const FilterOptions: FilterOption[] = [
  { name: 'All', value: 'ALL' },
  { name: 'Done', value: 'DONE' },
  { name: 'Pending', value: 'IN_PROGRESS' },
];

type StatusFilterProps = {
  filteringStatus: FilterStatus;
  setFilteringStatus: (filter: FilterStatus) => void;
};

const useStatusFilter = ({
  filteringStatus,
  setFilteringStatus,
}: StatusFilterProps) => {
  const Filter = () => (
    <label className='flex gap-1 self-center justify-self-start text-gray-700'>
      <p>Status: </p>
      <select
        className='bg-transparent text-gray-700'
        name='filter'
        id='filter'
        value={filteringStatus}
        onChange={(event) => {
          const { value } = event.target;
          const status = value as FilterStatus;
          setFilteringStatus(status);
        }}
      >
        {FilterOptions.map(({ name, value }, index) => (
          <option key={index} value={value}>
            {name}
          </option>
        ))}
      </select>
    </label>
  );

  return { filteringStatus, Filter };
};

export default useStatusFilter;
