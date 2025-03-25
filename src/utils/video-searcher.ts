import {youtube_v3} from 'googleapis';
import {inject, injectable} from 'inversify';
import {IYouTubeClient, YouTubeClient} from './shared/youtube-client';
import {IChannelIdFetcher, YouTubeChannelIdFetcher} from './channel-id-fetcher';

export interface Video {
  title: string;
  videoUrl: URL;
  thumbnailUrl: URL;
}

export interface IVideoSearcher {
  searchVideo(queryString: string): Promise<Video[]>;
}

@injectable()
export class YouTubeKaraokeVideoSearcher implements IVideoSearcher {
  private channels = process.env.CHANNEL_HANDLE
    ? process.env.CHANNEL_HANDLE.split(',')
    : [];

  constructor(
    @inject(YouTubeClient) private readonly youtubeClient: IYouTubeClient,
    @inject(YouTubeChannelIdFetcher)
    private readonly channelIdFetcher: IChannelIdFetcher,
  ) {}

  public async searchVideo(queryString: string): Promise<Video[]> {
    const channelIds: string[] = [];
    this.channels.forEach(async channel => {
      const id =
        await this.channelIdFetcher.getChannelIdFromChannelAlias(channel);
      channelIds.push(id);
    });
    try {
      const client = this.youtubeClient.client;
      const res = await client.search.list({
        part: ['snippet'],
        q: queryString + ' karaoke',
        type: ['video'],
        maxResults: 25, // max: 50
      });

      const result = this.parseSearchResult(res.data.items, channelIds);
      return result;
    } catch (e: unknown) {
      if (e instanceof Error) {
        console.error(e.message);
      } else {
        console.error(e);
      }
      return [];
    }
  }

  private parseSearchResult(
    items: youtube_v3.Schema$SearchResult[] | undefined,
    channelIds: string[],
  ): Video[] {
    if (!items) {
      return [];
    }

    const targets = items.filter(
      item =>
        item.snippet?.channelId && channelIds.includes(item.snippet.channelId),
    );

    return targets.map(target => {
      return {
        videoUrl: this.createVideoUrl(target.id?.videoId),
        title: target.snippet?.title || '',
        thumbnailUrl: this.createThumbnailUrl(
          target.snippet?.thumbnails?.high?.url,
        ),
      };
    });
  }

  private createThumbnailUrl(urlString: string | null | undefined): URL {
    return urlString ? new URL(urlString) : new URL('https://i.ytimg.com');
  }

  private createVideoUrl(videoId: string | null | undefined): URL {
    return videoId
      ? new URL(`https://www.youtube.com/watch?v=${videoId}`)
      : new URL('https://www.youtube.com');
  }
}
