import { notionHQ } from '../_lib/notion.ts';

export default async function handler(req, res) {
  try {
    const boards = await notionHQ.dataSources.query({
      data_source_id: process.env.VITE_NOTION_BOARD_DATABASE_URL!,
      sorts: [
        {
          timestamp: 'created_time',
          direction: 'ascending',
        },
      ],
    });
    res.status(200).json(boards.results);
  } catch (e) {
    res.status(500).json({ error: `내부 서버 에러: ${e}` });
  }
}
