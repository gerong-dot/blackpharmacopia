import { useQuery } from '@tanstack/react-query';
import ky from 'ky';
import { Loader2Icon } from 'lucide-react';
import { NotionRenderer } from 'react-notion-x';
import type { ExtendedRecordMap } from 'notion-types';

function MainScreen() {
  const { data, isLoading, isError, error } = useQuery<{
    recordMap: ExtendedRecordMap;
  }>({
    queryKey: ['main'],
    queryFn: () => ky.get(`/api/main?query=main`).json(),
    retry: 5,
  });

  if (isLoading) return <Loader2Icon className="animate-spin" />;
  if (!data || isError)
    return <h1 className="text-xl font-bold">{error?.message}</h1>;

  return (
    <main className="flex justify-center">
      <NotionRenderer recordMap={data.recordMap} />
    </main>
  );
}

export default MainScreen;
