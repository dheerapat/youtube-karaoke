import {youtube_v3} from 'googleapis';
import {inject, injectable} from 'inversify';
import {IYouTubeClient, YouTubeClient} from './shared/youtube-client';

export interface IChannelIdFetcher {
  getChannelIdFromChannelAlias(alias: string): Promise<string>;
}

@injectable()
export class YouTubeChannelIdFetcher implements IChannelIdFetcher {
  constructor(
    @inject(YouTubeClient) private readonly youtubeClient: IYouTubeClient,
  ) {
    if (!this.youtubeClient) {
      throw new Error('YouTubeClient not initialized');
    }
  }

  public async getChannelIdFromChannelAlias(alias: string): Promise<string> {
    try {
      const client = this.youtubeClient.client;
      const res = await client.channels.list({
        part: ['id'],
        forHandle: alias,
      });
      const result = this.parseResult(res.data.items);
      return result;
    } catch (e) {
      if (e instanceof Error) {
        console.error(e.message);
      } else {
        console.error(e);
      }
      return '';
    }
  }

  private parseResult(items: youtube_v3.Schema$Channel[] | undefined): string {
    if (!items) {
      return '';
    }

    return items[0].id ?? '';
  }
}
