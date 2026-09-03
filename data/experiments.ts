export interface Experiment {
  slug: string;
  title: string;
  description: string;
  category: string;
  iframeSrc?: string;
  href?: string;
  thumbnail: string;
}

export const experiments: Experiment[] = [
  {
    slug: 'style',
    title: 'Style',
    description: 'A silent masonry lookbook of generated fits.',
    category: 'Lookbook',
    href: '/style',
    thumbnail: '/images/looks/levis-sage-tee-light-501s.jpg',
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
