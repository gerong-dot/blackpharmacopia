import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import ky from 'ky';
import { Loader2Icon } from 'lucide-react';
import type { IGuestbookData } from '../../../dto/notion';
import type { KeyboardEvent, SubmitEvent } from 'react';
import { useState } from 'react';

function Guestbook() {
  const [name, setName] = useState('');
  const [content, setContent] = useState('');
  const [loading, setLoading] = useState(false);
  const { data, isFetching, isLoading, isError, error } = useQuery<
    IGuestbookData[]
  >({
    queryKey: ['guestbook'],
    queryFn: () => ky.get('/api/guestbook').json(),
  });
  const queryClient = useQueryClient();
  const {
    mutate,
    variables,
    isPending,
    isError: isMutationError,
  } = useMutation({
    mutationFn: ({ name, content }: { name: string; content: string }) =>
      ky.post('/api/guestbook', {
        json: {
          name,
          content,
        },
      }),
    onMutate: () => {
      setLoading(true);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['guestbook'] });
      setLoading(false);
      setName('');
      setContent('');
    },
  });

  if (isError) return <h1 className="text-xl font-bold">{error?.message}</h1>;

  const handleSubmit = (e: SubmitEvent) => {
    e.preventDefault();
    mutate({ name, content });
  };
  const handleKeyDown = (e: KeyboardEvent) => {
    if (e.key === 'Enter') e.preventDefault();
  };

  return (
    <main className="space-y-4">
      <h1 className="text-3xl font-noto-serif">방명록</h1>
      <div>
        <form
          className="w-full grid grid-cols-6 gap-2"
          onSubmit={handleSubmit}
          onKeyDown={handleKeyDown}
        >
          <input
            type="text"
            placeholder="이름 (6자까지)"
            className="input"
            value={name}
            maxLength={6}
            onChange={(e) => setName(e.target.value)}
            disabled={loading}
          />
          <input
            type="text"
            placeholder="내용 (140자까지)"
            className="input col-span-4 w-full"
            value={content}
            maxLength={140}
            required
            onChange={(e) => setContent(e.target.value)}
            disabled={loading}
          />
          <button className="btn btn-primary" type="submit">
            제출
          </button>
        </form>
      </div>
      {!isLoading && data ? (
        <ul className="list bg-base-100 rounded-box">
          {isFetching && (
            <li className="list-row">
              <Loader2Icon className="animate-spin text-center" />
            </li>
          )}
          {isPending && !isMutationError && (
            <li className="list-row">
              <h2 className="text-base-300">
                {variables.name === '' ? '익명' : variables.name}
              </h2>
              <p className="text-base-300">{variables.content}</p>
            </li>
          )}
          {data.map((el) => (
            <li className="list-row" key={el.id}>
              <h2 className="text-slate-500">
                {el.properties.이름.title[0].plain_text}
              </h2>
              <p className="text-base-content">
                {el.properties.내용.rich_text[0].plain_text}
              </p>
            </li>
          ))}
          {data.length <= 0 && !isPending && !isFetching && (
            <li className="list-row">방명록의 첫번째 손님이 되어주세요!</li>
          )}
        </ul>
      ) : (
        <Loader2Icon className="animate-spin" />
      )}
    </main>
  );
}

export default Guestbook;
