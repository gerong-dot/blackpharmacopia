import { Client } from '@notionhq/client';
import { NotionAPI } from 'notion-client';

export const notionHQ = new Client({
  auth: process.env.VITE_NOTION_SECRET_KEY,
});
export const notion = new NotionAPI();
