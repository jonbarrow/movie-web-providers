import { flags } from '@/main/targets';
import { makeSourcerer } from '@/providers/base';
import { compareTitle } from '@/utils/compare';
import { NotFoundError } from '@/utils/errors';

import { getStreamQualities } from './getStreamQualities';
import { sendRequest } from './sendRequest';

export const allowedQualities = ['360', '480', '720', '1080'];

export const superStreamScraper = makeSourcerer({
  id: 'superstream',
  name: 'Superstream',
  rank: 300,
  flags: [flags.NO_CORS],
  async scrapeShow(ctx) {
    const searchQuery = {
      module: 'Search3',
      page: '1',
      type: 'all',
      keyword: ctx.media.title,
      pagelimit: '20',
    };

    const searchRes = (await sendRequest(ctx, searchQuery, true)).data;
    ctx.progress(33);

    const superstreamEntry = searchRes.find(
      (res: any) => compareTitle(res.title, ctx.media.title) && res.year === Number(ctx.media.releaseYear),
    );

    if (!superstreamEntry) throw new NotFoundError('No entry found');
    const superstreamId = superstreamEntry.id;

    // Fetch requested episode
    const apiQuery = {
      uid: '',
      module: 'TV_downloadurl_v3',
      tid: superstreamId,
      season: ctx.media.season.number,
      episode: ctx.media.episode.number,
      oss: '1',
      group: '',
    };

    const qualities = await getStreamQualities(ctx, apiQuery);

    return {
      embeds: [],
      stream: {
        qualities,
        type: 'file',
        flags: [flags.NO_CORS],
      },
    };
  },
  async scrapeMovie(ctx) {
    const searchQuery = {
      module: 'Search3',
      page: '1',
      type: 'all',
      keyword: ctx.media.title,
      pagelimit: '20',
    };

    const searchRes = (await sendRequest(ctx, searchQuery, true)).data;
    ctx.progress(33);

    const superstreamEntry = searchRes.find(
      (res: any) => compareTitle(res.title, ctx.media.title) && res.year === Number(ctx.media.releaseYear),
    );

    if (!superstreamEntry) throw new NotFoundError('No entry found');
    const superstreamId = superstreamEntry.id;

    // Fetch requested episode
    const apiQuery = {
      uid: '',
      module: 'Movie_downloadurl_v3',
      mid: superstreamId,
      oss: '1',
      group: '',
    };

    const qualities = await getStreamQualities(ctx, apiQuery);

    return {
      embeds: [],
      stream: {
        qualities,
        type: 'file',
        flags: [flags.NO_CORS],
      },
    };
  },
});
