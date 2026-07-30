import type { ImageMeta } from '@/lib/schema';

const VERIFIED_ON = '2026-07-30';

type ImageDescription = {
  title: string;
  creator: string;
  date: string;
  alt: string;
};

/**
 * The Met Open Access API で isPublicDomain=true と確認した作品画像。
 * The Met は対象画像を CC0 で公開している。
 */
export function metOpenAccessImage(
  objectId: number,
  fileUrl: string,
  image: ImageDescription,
): ImageMeta {
  return {
    ...image,
    provider: 'The Metropolitan Museum of Art Open Access',
    sourceUrl: `https://www.metmuseum.org/art/collection/search/${objectId}`,
    fileUrl,
    license: 'cc0',
    credit: `${image.creator}, ${image.title}. The Metropolitan Museum of Art, CC0`,
    isPublicDomain: true,
    verifiedOn: VERIFIED_ON,
    verificationNote:
      'The Met Open Access APIで作品情報、isPublicDomain=true、primaryImageSmallを確認し、作品ページと画像URLの応答を2026-07-30に検証。',
  };
}

/**
 * Art Institute of Chicago API で is_public_domain=true と確認した作品画像。
 * AIC の Open Access Images 方針に基づき CC0 として提供される IIIF 画像を使う。
 */
export function aicOpenAccessImage(
  objectId: number,
  imageId: string,
  image: ImageDescription,
): ImageMeta {
  return {
    ...image,
    provider: 'Art Institute of Chicago Open Access',
    sourceUrl: `https://www.artic.edu/artworks/${objectId}`,
    fileUrl: `https://www.artic.edu/iiif/2/${imageId}/full/843,/0/default.jpg`,
    license: 'cc0',
    credit: `${image.creator}, ${image.title}. Art Institute of Chicago, CC0`,
    isPublicDomain: true,
    verifiedOn: VERIFIED_ON,
    verificationNote:
      'Art Institute of Chicago APIで作品情報、is_public_domain=true、image_idを確認。実行環境からIIIF画像へのHTTP検証はエッジ制限で403となったため、AICの公式IIIF URLとして収録し、公開ブラウザでの表示確認対象とする。',
  };
}

/**
 * Wikimedia Commons のファイルページでパブリックドメイン表記と
 * 原寸画像の存在を確認した作品画像。
 */
export function commonsPublicDomainImage(
  fileName: string,
  image: ImageDescription,
): ImageMeta {
  const encodedFileName = encodeURIComponent(fileName);
  return {
    ...image,
    provider: 'Wikimedia Commons',
    sourceUrl: `https://commons.wikimedia.org/wiki/File:${encodedFileName}`,
    fileUrl: `https://commons.wikimedia.org/wiki/Special:FilePath/${encodedFileName}`,
    license: 'public-domain',
    credit: `${image.creator}, ${image.title}. Public domain, via Wikimedia Commons`,
    isPublicDomain: true,
    verifiedOn: VERIFIED_ON,
    verificationNote:
      'Wikimedia Commonsのファイルページで作品情報、原寸画像、パブリックドメイン表記を2026-07-30に確認。',
  };
}

export function commonsLicensedImage(
  fileName: string,
  image: ImageDescription,
  options: {
    license: 'cc-by' | 'cc-by-sa';
    credit: string;
    verificationNote: string;
  },
): ImageMeta {
  const encodedFileName = encodeURIComponent(fileName);
  return {
    ...image,
    provider: 'Wikimedia Commons',
    sourceUrl: `https://commons.wikimedia.org/wiki/File:${encodedFileName}`,
    fileUrl: `https://commons.wikimedia.org/wiki/Special:FilePath/${encodedFileName}`,
    license: options.license,
    credit: options.credit,
    isPublicDomain: false,
    verifiedOn: VERIFIED_ON,
    verificationNote: options.verificationNote,
  };
}
