import type { ExtendedRecordMap } from 'notion-types';
import type { IGalleryItem } from '../../dto/notion';
import { notion, notionHQ } from '../_lib/notion';

export default async function handler(req, res) {
  const { id } = req.query;
  try {
    const [metadata, recordMap]: [IGalleryItem, ExtendedRecordMap] =
      await Promise.all([
        notionHQ.pages.retrieve({ page_id: id }) as Promise<IGalleryItem>,
        notion.getPage(id),
      ]);

    res.status(200).json({ metadata, recordMap });
  } catch (e) {
    res.status(500).json({ error: `내부 서버 에러: ${e}` });
  }
}
