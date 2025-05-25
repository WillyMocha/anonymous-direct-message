import { DirectInboxFeedResponseThreadsItem } from 'instagram-private-api';
import {
  DirectThreadItem,
  isTextItem,
  isMediaItem,
  isVideoItem,
  isStoryShareItem,
  isLinkItem,
} from '@/types/DirectThreadItem';

export function extractMessageInfo(thread: DirectInboxFeedResponseThreadsItem) {
  const lastItem = thread.last_permanent_item as DirectThreadItem | undefined;
  const itemType = lastItem?.item_type ?? 'unknown';

  let text = 'No message';
  let mediaUrl: string | null = null;

  if (!lastItem) {
    return {
      usernames: thread.users?.map((u) => u.username).join(', ') ?? 'Unknown',
      text,
      mediaUrl,
      itemType,
    };
  }

  if (isTextItem(lastItem)) {
    text = lastItem.text ?? 'No message';
  } else if (isMediaItem(lastItem)) {
    text = '[Image]';
    mediaUrl = lastItem.media?.image_versions2?.candidates?.[0]?.url ?? null;
  } else if (isVideoItem(lastItem)) {
    text = '[Video]';
    mediaUrl = lastItem.video_versions?.[0]?.url ?? null;
  } else if (isStoryShareItem(lastItem)) {
    text = `[Story Share] ${lastItem.story_share?.title ?? ''}`;
    mediaUrl =
      lastItem.story_share?.media?.image_versions2?.candidates?.[0]?.url ?? null;
  } else if (isLinkItem(lastItem)) {
  const linkText =
    lastItem.link?.text ??
    lastItem.link?.links?.[0]?.text ??
    'URL';
  text = `[Link] ${linkText}`;
}
 else {
    text = `[${itemType}]`;
  }

  return {
    usernames: thread.users?.map((u) => u.username).join(', ') ?? 'Unknown',
    text,
    mediaUrl,
    itemType,
  };
}
