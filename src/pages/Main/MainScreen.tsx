import { useQuery } from '@tanstack/react-query';
import { Loader2Icon } from 'lucide-react';
import { NotionRenderer } from 'react-notion-x';
import type { ExtendedRecordMap } from 'notion-types';
import useDarkMode from '../../hooks/useDarkMode';
import { getMain } from '../../services/api';

function MainScreen() {
  const { data, isLoading, isError, error } = useQuery<{
    recordMap: ExtendedRecordMap;
  }>({
    queryKey: ['main'],
    queryFn: getMain,
  });

  const isDarkMode = useDarkMode();

  if (isLoading) return <Loader2Icon className="animate-spin" />;
  if (!data || isError)
    return <h1 className="text-xl font-bold">{error?.message}</h1>;

  return (
    <main className="flex justify-center">
      <NotionRenderer recordMap={data.recordMap} darkMode={isDarkMode} />
    </main>
  );
}

export default MainScreen;
