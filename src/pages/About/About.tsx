import { useQuery } from '@tanstack/react-query';
import ky from 'ky';
import { Loader2Icon } from 'lucide-react';
import { NotionRenderer } from 'react-notion-x';
import type { ExtendedRecordMap } from 'notion-types';
import useDarkMode from '../../hooks/useDarkMode';

function About() {
  const {
    data: recordMap,
    isLoading,
    isError,
    error,
  } = useQuery<ExtendedRecordMap>({
    queryKey: ['about'],
    queryFn: () => ky.get(`/api/about`).json(),
    retry: 5,
  });
  const isDarkMode = useDarkMode();

  return (
    <main className="flex justify-center">
      {!isLoading && recordMap ? (
        <NotionRenderer recordMap={recordMap} darkMode={isDarkMode} />
      ) : (
        <Loader2Icon className="animate-spin" />
      )}
      {isError && <h1 className="text-xl">{error.message}</h1>}
    </main>
  );
}

export default About;
