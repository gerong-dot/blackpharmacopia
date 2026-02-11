import ky from 'ky';
import type { ExtendedRecordMap } from 'notion-types';
import type {
  IGalleryItem,
  IGuestbookData,
  IManagePageListProperties,
  IPostMetadata,
} from '../../dto/notion';

export const getAbout = (): Promise<ExtendedRecordMap> => {
  return ky.get('/api/about').json();
};

export const getMain = (): Promise<{ recordMap: ExtendedRecordMap }> => {
  return ky.get(`/api/main?query=main`).json();
};

export const getMusicUrl = (): Promise<IManagePageListProperties> => {
  return ky.get('/api/main?query=playlist').json();
};

export const getBoardAll = (): Promise<IPostMetadata[]> => {
  return ky.get('/api/board/all').json();
};

export const getBoardPost = (id: string) => {
  return ky
    .get<{
      metadata: IPostMetadata;
      recordMap: ExtendedRecordMap;
    }>(`/api/board/${id}`)
    .json();
};

export const getGalleryAll = (): Promise<IGalleryItem[]> => {
  return ky.get('/api/gallery/all').json();
};

export const getGalleryPost = (
  selectedId: string,
): Promise<{ metadata: IGalleryItem; recordMap: ExtendedRecordMap }> => {
  return ky.get(`/api/gallery/${selectedId}`).json();
};

export const getGuestBookAll = (): Promise<IGuestbookData[]> => {
  return ky.get('/api/guestbook').json();
};
