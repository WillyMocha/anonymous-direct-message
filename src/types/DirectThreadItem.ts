export type BaseThreadItem = {
  item_type: string;
};

export type TextThreadItem = BaseThreadItem & {
  item_type: 'text';
  text?: string;
};

export type MediaThreadItem = BaseThreadItem & {
  item_type: 'media' | 'image';
  media?: {
    image_versions2?: {
      candidates?: { url: string }[];
    };
  };
};

export type VideoThreadItem = BaseThreadItem & {
  item_type: 'video';
  video_versions?: { url: string }[];
};

export type StoryShareThreadItem = BaseThreadItem & {
  item_type: 'story_share';
  story_share?: {
    title?: string;
    media?: {
      image_versions2?: {
        candidates?: { url: string }[];
      };
    };
  };
};

export type LinkThreadItem = BaseThreadItem & {
  item_type: 'link';
  link?: {
    text?: string;
    links?: { text?: string }[];
  };
};

export type DirectThreadItem =
  | TextThreadItem
  | MediaThreadItem
  | VideoThreadItem
  | StoryShareThreadItem
  | LinkThreadItem
  | BaseThreadItem;

// Type guards
export function isTextItem(item: DirectThreadItem): item is TextThreadItem {
  return item.item_type === 'text';
}

export function isMediaItem(item: DirectThreadItem): item is MediaThreadItem {
  return item.item_type === 'media' || item.item_type === 'image';
}

export function isVideoItem(item: DirectThreadItem): item is VideoThreadItem {
  return item.item_type === 'video';
}

export function isStoryShareItem(item: DirectThreadItem): item is StoryShareThreadItem {
  return item.item_type === 'story_share';
}

export function isLinkItem(item: DirectThreadItem): item is LinkThreadItem {
  return item.item_type === 'link';
}
