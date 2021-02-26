export interface Answer {
  id?: string;
  text?: string;
  voteCount?: number;
}

export interface Item {
  condition?: string;
  id?: string;
  photo?: string;
  price?: number;
}

export interface Story {
  body?: string;
  title?: string;
}

export interface Theme {
  accentColor?: string;
  backgroundColor?: string;
  backgroundImage?: string;
  foreground?: 'dark' | 'light';
}

export interface Topic {
  commentCount?: number;
  createdAt?: string;
  id?: string;
  replyCount?: number;
  url?: string;
  votecount?: number;
}

export interface Deal {
  features?: string;
  id?: string;
  items?: Array<Item>;
  photos?: Array<string>;
  purchaseQuantity?: {
    maximumLimit?: number;
    minimumLimit?: number;
  };
  story?: Story;
  theme?: Theme;
  title?: string;
  topic?: Topic;
  url?: string;
}

export interface Poll {
  answers?: Array<Answer>;
  id?: string;
  startDate?: string;
  title?: string;
  topic?: Topic;
}

export interface Video {
  id?: string;
  startDate?: string;
  title?: string;
  topic?: Topic;
  url?: string;
}

export interface APIData {
  deal?: Deal;
  poll?: Poll;
  video?: Video;
}
