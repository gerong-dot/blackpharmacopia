import { notionHQ } from '../_lib/notion';

export default async function handler(req, res) {
  try {
    const galleries = await notionHQ.dataSources.query({
      data_source_id: process.env.VITE_NOTION_GALLERY_DATABASE_URL!,
      sorts: [
        {
          timestamp: 'created_time',
          direction: 'ascending',
        },
      ],
    });

    res.status(200).json(galleries.results);
  } catch (e) {
    res.status(500).json(e);
  }
}
