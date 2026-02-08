import { notion, notionHQ } from './_lib/notion';

export default async function handler(req, res) {
  const query = req.query.query;
  if (query === 'main') {
    try {
      const { results } = await notionHQ.dataSources.query({
        data_source_id: process.env.VITE_NOTION_MAIN_DATABASE_URL!,
      });

      const recordMap = await notion.getPage(results[0].id);
      res.status(200).json({ recordMap });
    } catch (e) {
      res.status(500).json({ error: `내부 서버 에러: ${e}` });
    }
  }
  if (query === 'playlist') {
    try {
      const { results } = await notionHQ.dataSources.query({
        data_source_id: process.env.VITE_NOTION_MAIN_DATABASE_URL!,
      });

      res.status(200).json(results[2]);
    } catch (e) {
      res.status(500).json({ error: `내부 서버 에러: ${e}` });
    }
  }
}
