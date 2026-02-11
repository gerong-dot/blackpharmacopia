import { useQuery } from '@tanstack/react-query';
import { NotionRenderer } from 'react-notion-x';
import { useParams } from 'react-router';
import Authors from '../../components/Authors';
import useDarkMode from '../../hooks/useDarkMode';
import { getBoardPost } from '../../services/api';

function Post() {
  const { id } = useParams();
  const { data, isLoading, isError, error } = useQuery({
    queryKey: ['post', id],
    queryFn: () => getBoardPost(id!),
  });

  const isDarkMode = useDarkMode();

  return (
    <div className="flex flex-col items-center p-2 lg:p-4 bg-base-100 grow rounded-xl">
      {isLoading && !data ? (
        <div className="w-full px-6 lg:px-18 flex flex-col items-center gap-2">
          <div className="skeleton h-6 lg:h-12 w-3/4 lg:w-lg" />
          <div className="flex items-center gap-4">
            <div className="skeleton rounded-full w-8 h-8" />
            <div className="skeleton h-4 w-12" />
            <span className="text-slate-400">|</span>
            <div className="skeleton h-4 w-24" />
          </div>
          <div className="w-full space-y-2 mt-2">
            <div className="skeleton h-4 w-1/3" />
            <div className="skeleton h-4 w-1/2" />
            <div className="skeleton h-4 w-full" />
            <div className="skeleton h-4 w-full" />
          </div>
        </div>
      ) : isError && !data ? (
        <h1>{error.message}</h1>
      ) : (
        data && (
          <>
            <h1 className="font-noto-serif text-2xl lg:text-4xl font-bold">
              {data?.metadata.properties.제목.title[0].plain_text}
            </h1>
            <div className="flex items-center gap-2 mb-2">
              <Authors authors={data.metadata.properties.작성자.people ?? []} />
              <span className="text-slate-400">|</span>
              <span className="text-xs text-slate-500">
                {new Date(
                  data.metadata.properties.작성일.created_time,
                ).toLocaleString('ko-KR', {
                  timeZone: 'Asia/Seoul',
                })}
              </span>
            </div>
            <NotionRenderer
              recordMap={data?.recordMap}
              className="rounded-xl"
              disableHeader
              showTableOfContents
              darkMode={isDarkMode}
            />
          </>
        )
      )}
    </div>
  );
}

export default Post;
