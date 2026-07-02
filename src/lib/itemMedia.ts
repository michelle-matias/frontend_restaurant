import {
  getRecordKey,
  Item,
  StrapiMedia,
  StrapiMediaField,
  STRAPI_URL,
} from "./strapi";

function isObject(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null;
}

export function firstMedia(mediaField?: StrapiMediaField): StrapiMedia | undefined {
  if (!mediaField) return undefined;

  if (Array.isArray(mediaField)) {
    return firstMedia(mediaField[0]);
  }

  if ("data" in mediaField) {
    const data = mediaField.data;

    if (Array.isArray(data)) {
      return firstMedia(data[0]);
    }

    return data ?? undefined;
  }

  if (isObject(mediaField) && "attributes" in mediaField) {
    const mediaRecord = mediaField as Record<string, unknown>;

    return {
      id: mediaRecord.id as number | undefined,
      documentId: mediaRecord.documentId as string | undefined,
      ...(mediaRecord.attributes as StrapiMedia),
    };
  }

  return mediaField as StrapiMedia;
}

export function getMediaKey(mediaField?: StrapiMediaField) {
  const media = firstMedia(mediaField);

  return media ? getRecordKey(media) : undefined;
}

export function getMediaLabel(mediaField?: StrapiMediaField) {
  const media = firstMedia(mediaField);

  return media?.alternativeText || media?.caption || media?.url;
}

function absoluteImageUrl(url?: string) {
  if (!url) return undefined;
  if (url.startsWith("http://") || url.startsWith("https://")) return url;
  if (url.startsWith("/")) return `${STRAPI_URL}${url}`;
  return `${STRAPI_URL}/${url}`;
}

export function getItemImage(item: Item) {
  const fields = [
    item.image,
    item.images,
    item.photo,
    item.picture,
    item.media,
    item.thumbnail,
  ];

  for (const field of fields) {
    const media = firstMedia(field);
    const format =
      media?.formats?.medium ??
      media?.formats?.small ??
      media?.formats?.thumbnail;
    const url = absoluteImageUrl(format?.url ?? media?.url);

    if (url) {
      return {
        url,
        alt: media?.alternativeText || media?.caption || item.name || "Prato",
      };
    }
  }

  return undefined;
}
