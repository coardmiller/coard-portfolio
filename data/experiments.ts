export interface Experiment {
  slug: string;
  title: string;
  description: string;
  category: string;
  iframeSrc: string;
  thumbnail: string;
}

export const experiments: Experiment[] = [
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
