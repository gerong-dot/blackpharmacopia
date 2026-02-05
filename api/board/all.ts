export default async function handler(req, res) {
  const queryFilter = {
    sorts: [
      {
        timestamp: 'created_time',
        direction: 'ascending',
      },
    ],
  };

  try {
    const boardListRes = await fetch(
      `https://api.notion.com/v1/data_sources/${process.env.VITE_NOTION_BOARD_DATABASE_URL}/query`,
      {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${process.env.VITE_NOTION_SECRET_KEY}`,
          'Content-Type': 'application/json',
          'Notion-Version': '2025-09-03',
        },
        body: JSON.stringify(queryFilter),
      },
    );
    const { results } = await boardListRes.json();
    const pageList = results.map((el) => {
      return {
        id: el.id,
        title: el.properties.제목.title[0].plain_text || '제목 없음',
        category: el.properties.카테고리.select
          ? el.properties.카테고리.select.name
          : '카테고리 없음',
        author: el.properties.작성자.people
          ? el.properties.작성자.people.map((el) => {
              return { name: el.name, avatarUrl: el.avatar_url };
            })
          : '작성자 없음',
        createdAt: el.created_time,
      };
    });

    res.status(200).json(pageList);
  } catch (e) {
    res.status(500).json({ error: `내부 서버 에러: ${e}` });
  }
}
