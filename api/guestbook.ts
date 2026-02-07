import { notionHQ } from './_lib/notion.ts';

export default async function handler(req, res) {
  if (req.method === 'GET') {
    try {
      const guestbook = await notionHQ.dataSources.query({
        data_source_id: process.env.VITE_NOTION_GUESTBOOK_DATABASE_URL!,
        sorts: [
          {
            timestamp: 'created_time',
            direction: 'descending',
          },
        ],
      });
      res.status(200).json(guestbook.results);
    } catch (e) {
      res.status(500).json(e);
    }
  }

  if (req.method === 'POST') {
    try {
      const response = await notionHQ.pages.create({
        parent: {
          data_source_id: process.env.VITE_NOTION_GUESTBOOK_DATABASE_URL!,
        },
        properties: {
          이름: {
            type: 'title',
            title: [
              {
                type: 'text',
                text: {
                  content: req.body.name === '' ? '익명' : req.body.name,
                },
              },
            ],
          },
          내용: {
            type: 'rich_text',
            rich_text: [
              {
                type: 'text',
                text: { content: req.body.content },
              },
            ],
          },
          방문일: {
            type: 'date',
            date: {
              start: new Date(Date.now()).toISOString(),
            },
          },
        },
      });
      res.status(200).json(response);
    } catch (e) {
      res.status(500).json(e);
    }
  }
}
