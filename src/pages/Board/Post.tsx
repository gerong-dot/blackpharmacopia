import { useQuery } from '@tanstack/react-query';
import ky from 'ky';
import { Loader2Icon } from 'lucide-react';
import type { ExtendedRecordMap } from 'notion-types';
import { NotionRenderer } from 'react-notion-x';
import { useParams } from 'react-router';
import type { IPostMetadata } from '../../../dto/notion';
import Authors from '../../components/Authors';
import useDarkMode from '../../hooks/useDarkMode';

function Post() {
  const { id } = useParams();
  const { data, isLoading, isError, error } = useQuery({
    queryKey: ['post', id],
    queryFn: () =>
      ky
        .get<{
          metadata: IPostMetadata;
          recordMap: ExtendedRecordMap;
        }>(`/api/board/${id}`)
        .json(),
  });

  const isDarkMode = useDarkMode();

  if (isLoading) return <Loader2Icon className="animate-spin" />;
  if (!data || isError) {
    return <h1>{error?.message}</h1>;
  }

  const { properties } = data.metadata;
  return (
    <>
      <div className="flex flex-col items-center p-2 lg:p-4 bg-base-100 grow rounded-xl">
        <h1 className="font-noto-serif text-2xl lg:text-4xl font-bold">
          {properties.제목.title[0].plain_text}
        </h1>
        <div className="flex items-center gap-2 mb-2">
          <Authors authors={properties.작성자.people} />
          <span className="text-slate-400">|</span>
          <span className="text-xs text-slate-500">
            {new Date(properties.작성일.created_time).toLocaleString('ko-KR', {
              timeZone: 'Asia/Seoul',
            })}
          </span>
        </div>
        <NotionRenderer
          recordMap={data?.recordMap}
          className="rounded-xl "
          disableHeader
          showTableOfContents
          darkMode={isDarkMode}
        />
      </div>
    </>
  );
}

export default Post;
