import { INotionResponse } from '../dto/notion';
import { notion } from './_lib/notion.ts';

export default async function handler(req, res) {
  try {
    const pageIdRes = await fetch(
      `https://api.notion.com/v1/data_sources/${process.env.VITE_NOTION_ABOUT_DATABASE_URL}/query`,
      {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${process.env.VITE_NOTION_SECRET_KEY}`,
          'Content-Type': 'application/json',
          'Notion-Version': '2025-09-03',
        },
      },
    );
    const { results } = (await pageIdRes.json()) as INotionResponse;

    const recordMap = await notion.getPage(results[0].id as string);
    res.status(200).json(recordMap);
  } catch (e) {
    res.status(500).json({ error: `내부 서버 에러: ${e}` });
  }
}
