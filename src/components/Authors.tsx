import type { IPostList } from '../../dto/notion';

function Authors({ authors }: { authors: IPostList['author'] }) {
  return (
    <div className="flex items-center">
      <div className="avatar-group -space-x-4">
        {authors.map((el) => (
          <div key={el.name} className="avatar">
            <div className="w-6 rounded-full">
              <img src={el.avatar_url} alt={`${el.name}의 아바타`} />
            </div>
          </div>
        ))}
      </div>
      {authors.map((el) => (
        <span key={el.name} className="text-sm text-slate-600 ml-2">
          {el.name}
        </span>
      ))}
    </div>
  );
}

export default Authors;
