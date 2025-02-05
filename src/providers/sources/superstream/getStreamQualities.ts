import { StreamFile } from '@/providers/streams';
import { ScrapeContext } from '@/utils/context';

import { sendRequest } from './sendRequest';

import { allowedQualities } from '.';

export async function getStreamQualities(ctx: ScrapeContext, apiQuery: object) {
  const mediaRes: { list: { path: string; real_quality: string }[] } = (await sendRequest(ctx, apiQuery)).data;
  ctx.progress(66);

  const qualityMap = mediaRes.list
    .filter((file) => allowedQualities.includes(file.real_quality.replace('p', '')))
    .map((file) => ({
      url: file.path,
      quality: file.real_quality.replace('p', ''),
    }));

  const qualities: Record<string, StreamFile> = {};

  allowedQualities.forEach((quality) => {
    const foundQuality = qualityMap.find((q) => q.quality === quality);
    if (foundQuality) {
      qualities[quality] = {
        type: 'mp4',
        url: foundQuality.url,
      };
    }
  });

  return qualities;
}
