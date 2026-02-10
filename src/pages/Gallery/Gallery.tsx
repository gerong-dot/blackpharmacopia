import { useQuery } from '@tanstack/react-query';
import ky from 'ky';
import { Loader2Icon } from 'lucide-react';
import Card from './Card';
import { useState } from 'react';
import type { ExtendedRecordMap } from 'notion-types';
import { createPortal } from 'react-dom';
import { NotionRenderer } from 'react-notion-x';
import useDarkMode from '../../hooks/useDarkMode';
import type { IGalleryItem } from '../../../dto/notion';

function Gallery() {
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const { data, isLoading, isError, error } = useQuery<IGalleryItem[]>({
    queryKey: ['galleries'],
    queryFn: () => ky.get('/api/gallery/all').json(),
  });

  const {
    data: galleryDetail,
    isLoading: isGalleryLoading,
    error: galleryDetailError,
  } = useQuery<{ metadata: IGalleryItem; recordMap: ExtendedRecordMap }>({
    queryKey: ['picture', selectedId],
    queryFn: () => ky.get(`/api/gallery/${selectedId}`).json(),
    enabled: !!selectedId,
  });

  const isDarkMode = useDarkMode();

  if (isLoading) return <Loader2Icon className="animate-spin" />;
  if (!data || isError)
    return <h1 className="text-xl font-bold">{error?.message}</h1>;

  const handleClick = (id: string) => {
    setSelectedId(id);
    const modal = document.getElementById('picture-modal') as HTMLDialogElement;
    modal.showModal();
  };

  return (
    <>
      <main className="w-full grow grid grid-cols-3 gap-4">
        {data.map((el) => (
          <Card element={el} key={el.id} onClick={() => handleClick(el.id)} />
        ))}
      </main>
      {createPortal(
        <dialog id="picture-modal" className="modal">
          <div className="modal-box w-1/2 max-w-2/3">
            {!isGalleryLoading && galleryDetail ? (
              <>
                <h3 className="font-bold text-lg">
                  {galleryDetail.metadata?.properties.제목.title[0].plain_text}
                </h3>
                <NotionRenderer
                  recordMap={galleryDetail.recordMap}
                  darkMode={isDarkMode}
                />
              </>
            ) : galleryDetailError ? (
              <h1 className="text-xl font-bold">
                {galleryDetailError?.message}
              </h1>
            ) : (
              <Loader2Icon className="animate-spin" />
            )}
          </div>
          <form method="dialog" className="modal-backdrop">
            <button>close</button>
          </form>
        </dialog>,
        document.getElementById('portal') as HTMLDivElement,
      )}
    </>
  );
}

export default Gallery;
