import { useQuery } from '@tanstack/react-query';
import ky from 'ky';
import { Loader2Icon } from 'lucide-react';
import type { IPostMetadata } from '../../../dto/notion.d.ts';
import PostListItem from '../../components/PostListItem.tsx';
import { useState } from 'react';

function Board() {
  const [selectedCategory, setSelectedCategory] = useState<string>('전체');
  const { data, isLoading, isError, error } = useQuery<IPostMetadata[]>({
    queryKey: ['posts'],
    queryFn: () => ky.get('/api/board/all').json(),
    retry: 5,
  });

  if (isLoading) return <Loader2Icon className="text-center animate-spin" />;
  if (!data || isError) return <h1 className="text-xl">{error?.message}</h1>;

  const groupedPost = data.reduce(
    (acc, post) => {
      const cat = post.properties.카테고리.select
        ? post.properties.카테고리.select.name
        : '카테고리 없음';

      if (!acc[cat]) acc[cat] = [];
      acc[cat].push(post);

      return acc;
    },
    {} as Record<string, IPostMetadata[]>,
  );

  const categories = ['전체', ...Object.keys(groupedPost)];

  const displayedPost =
    selectedCategory === '전체' ? data : groupedPost[selectedCategory] || [];

  return (
    <main className="flex flex-col gap-2 h-full">
      <>
        <nav>
          {categories.map((el) => (
            <button
              key={el}
              onClick={() => setSelectedCategory(el)}
              className="btn btn-ghost"
            >
              {el}
            </button>
          ))}
        </nav>
        <ul className="w-full bg-base-100 rounded-xl">
          {displayedPost.map((el) => (
            <PostListItem element={el} key={el.id} />
          ))}
        </ul>
      </>
    </main>
  );
}

export default Board;
