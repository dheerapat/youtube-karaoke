import 'reflect-metadata';
import {Container} from 'inversify';
import {YouTubeKaraokeVideoSearcher} from './utils/video-searcher';
import {YouTubeClient} from './utils/shared/youtube-client';
import {YouTubeChannelIdFetcher} from './utils/channel-id-fetcher';

const container = new Container({});

container.bind(YouTubeKaraokeVideoSearcher).toSelf();
container.bind(YouTubeClient).toSelf();
container.bind(YouTubeChannelIdFetcher).toSelf();

const searcher = container.get(YouTubeKaraokeVideoSearcher);

searcher
  .searchVideo('จักรยานสีแดง')
  .then(res => {
    console.log(res);
  })
  .catch(err => {
    console.log(err);
  });
