import { useQuery, useQueryClient } from '@tanstack/react-query';
import { Loader2Icon } from 'lucide-react';
import Card from './Card';
import { useState } from 'react';
import type { ExtendedRecordMap } from 'notion-types';
import { createPortal } from 'react-dom';
import { NotionRenderer } from 'react-notion-x';
import useDarkMode from '../../hooks/useDarkMode';
import type { IGalleryItem } from '../../../dto/notion';
import { getGalleryAll, getGalleryPost } from '../../services/api';

function Gallery() {
  const queryClient = useQueryClient();
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const { data, isLoading, isError, error } = useQuery<IGalleryItem[]>({
    queryKey: ['galleries'],
    queryFn: getGalleryAll,
  });

  const {
    data: galleryDetail,
    isLoading: isGalleryLoading,
    error: galleryDetailError,
  } = useQuery<{ metadata: IGalleryItem; recordMap: ExtendedRecordMap }>({
    queryKey: ['picture', selectedId],
    queryFn: () => getGalleryPost(selectedId!),
    enabled: !!selectedId,
  });

  const isDarkMode = useDarkMode();

  if (isLoading) return <Loader2Icon className="animate-spin" />;
  if (!data || isError)
    return <h1 className="text-xl font-bold">{error?.message}</h1>;

  const handleClick = (id: string) => {
    setSelectedId(id);
  };

  const handleMouseEnter = (id: string) => {
    queryClient.prefetchQuery({
      queryKey: ['picture', id],
      queryFn: () => getGalleryPost(id),
      staleTime: 1000 * 60 * 5,
    });
  };

  return (
    <>
      <main className="w-full grow grid grid-cols-2 lg:grid-cols-3 gap-4">
        {data.map((el) => (
          <Card
            element={el}
            key={el.id}
            onClick={() => handleClick(el.id)}
            onMouseEnter={() => handleMouseEnter(el.id)}
            onPointerDown={() => handleMouseEnter(el.id)}
          />
        ))}
      </main>
      {createPortal(
        <>
          <input
            type="checkbox"
            id="picture-modal"
            className="modal-toggle"
            checked={isModalOpen}
            onChange={(e) => setIsModalOpen(e.target.checked)}
          />
          <div className="modal" role="dialog">
            <div className="modal-box m-4 lg:w-1/2 lg:max-w-2/3">
              <button
                className="btn btn-sm btn-circle btn-ghost absolute right-5 top-5 z-10"
                onClick={() => setIsModalOpen(false)}
              >
                ✕
              </button>
              {!isGalleryLoading && galleryDetail ? (
                <>
                  <div className="relative">
                    <h3 className="font-bold text-lg">
                      {
                        galleryDetail.metadata?.properties.제목.title[0]
                          .plain_text
                      }
                    </h3>
                    <NotionRenderer
                      recordMap={galleryDetail.recordMap}
                      darkMode={isDarkMode}
                    />
                  </div>
                </>
              ) : galleryDetailError ? (
                <h1 className="text-xl font-bold">
                  {galleryDetailError?.message}
                </h1>
              ) : (
                <Loader2Icon className="animate-spin" />
              )}
            </div>
          </div>
        </>,
        document.body,
      )}
    </>
  );
}

export default Gallery;
