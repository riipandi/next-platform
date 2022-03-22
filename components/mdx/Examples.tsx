import type { MdxCardData } from '@/types';

import Card from './Card';

interface ExamplesProps {
  data: Array<MdxCardData>;
}

export default function Examples({ data }: ExamplesProps) {
  return (
    <div className='grid grid-cols-1 my-10 not-prose gap-x-4 gap-y-4 lg:gap-y-8 lg:-mx-36 lg:mb-20 lg:grid-cols-3'>
      {data.map((d) => (
        <Card data={d} key={d.name} />
      ))}
    </div>
  );
}
