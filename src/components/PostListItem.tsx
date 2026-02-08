import { Link } from 'react-router';
import type { IPostMetadata } from '../../dto/notion.d.ts';
import Authors from './Authors.tsx';

function PostListItem({ element }: { element: IPostMetadata }) {
  const createdAt = new Date(element.created_time).toLocaleString('ko-KR', {
    timeZone: 'Asia/Seoul',
  });
  return (
    <Link
      to={`/main/board/${element.id}`}
      className="flex flex-col p-2 gap-2 not-last:border-b not-last:border-b-background grow"
    >
      <li>
        <h1 className="text-3xl font-noto-serif font-bold">
          {element.properties.제목.title[0].plain_text}
        </h1>
        <Authors authors={element.properties.작성자.people} />
        <div className="flex items-center gap-2">
          <span className="text-slate-500 text-sm">
            {element.properties.카테고리.select
              ? element.properties.카테고리.select.name
              : '카테고리 없음'}
          </span>
          <span className="text-slate-400 text-xs">{createdAt}</span>
        </div>
      </li>
    </Link>
  );
}

export default PostListItem;
