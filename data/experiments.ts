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
    thumbnail: '',
  },
];
