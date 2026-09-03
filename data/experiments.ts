import { looks } from './looks';

export interface Experiment {
  slug: string;
  title: string;
  description: string;
  category: string;
  iframeSrc?: string;
  href?: string;
  thumbnail: string;
  /** When set, the tile cycles through these images in place. */
  thumbnailCycle?: string[];
}

const lookThumbnails = looks.map((look) => look.src);

export const experiments: Experiment[] = [
  {
    slug: 'style',
    title: 'Style',
    description: 'A lookbook of generated fits.',
    category: 'Lookbook',
    href: '/style',
    thumbnail: lookThumbnails[0],
    thumbnailCycle: lookThumbnails,
  },
  {
    slug: 'logocheck',
    title: 'Logocheck',
    description: 'Upload logo marks, annotate freely, share with one link.',
    category: 'Design Tool',
    iframeSrc: 'https://logocheck-phi.vercel.app',
    thumbnail: '/thumbnails/logocheck.png',
  },
  {
    slug: 'spirograph',
    title: 'Spirograph',
    description: 'Generative spirograph patterns with layering, palettes, and export.',
    category: 'Creative Tool',
    iframeSrc: 'https://spirograph-psi.vercel.app',
    thumbnail: '/thumbnails/spirograph.png',
  },
];
