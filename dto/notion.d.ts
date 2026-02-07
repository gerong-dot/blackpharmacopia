import type { PageObjectResponse } from '@notionhq/client';

export interface INotionResponse {
  results: INotionResult[];
}

export interface INotionResult {
  id: string;
  url: string;
  icon: string;
  title: string;
  category: string;
  categoryColor: string;
  createdAt: string;
  editedBy: {
    name: string;
    email: string;
    avatar: string;
  };
}

export interface IPostList {
  id: string;
  category: string;
  title: string;
  createdAt: Date;
  author: {
    name: string;
    avatar_url: string;
  }[];
}

export interface IPostMetadata extends PageObjectResponse {
  properties: {
    작성일: {
      created_time: Date;
    };
    작성자: {
      people: {
        name: string;
        avatar_url: string;
      }[];
    };
    카테고리: {
      select: {
        name: string;
      };
    };
    제목: {
      title: [{ plain_text: string }];
    };
  };
}

export interface IGuestbookData extends PageObjectResponse {
  properties: {
    이름: {
      title: [{ plain_text: string }];
    };
    방문일: {
      date: {
        start: Date;
      };
    };
    내용: {
      rich_text: [{ plain_text: string }];
    };
  };
}

interface IGalleryItem extends IPostMetadata {
  cover: {
    type: 'external';
    external: {
      url: string;
    };
  };
}
