import { notion, notionHQ } from './_lib/notion.ts';

export default async function handler(req, res) {
  try {
    const { results } = await notionHQ.dataSources.query({
      data_source_id: process.env.VITE_NOTION_MAIN_DATABASE_URL!,
    });

    const recordMap = await notion.getPage(results[1].id as string);
    res.status(200).json(recordMap);
  } catch (e) {
    res.status(500).json({ error: `내부 서버 에러: ${e}` });
  }
}
