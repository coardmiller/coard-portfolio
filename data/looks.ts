export interface Look {
  id: string;
  date: string;
  caption: string;
  src: string;
  alt: string;
}

// Newest first.
// To add a look later:
//   1. Put a photo in public/images/looks/<slug>.jpg (or .png)
//   2. Prepend one object to this array
export const looks: Look[] = [
  {
    id: 'linen-olive-cobbles',
    date: 'Aug 2026',
    caption: 'Linen and olive on cobbles.',
    src: '/images/looks/linen-olive-cobbles.jpg',
    alt: 'Walking a cobblestone lane in a white linen shirt, olive chino shorts, and brown loafers',
  },
  {
    id: 'ocbd-khaki-loafers',
    date: 'Aug 2026',
    caption: 'OCBD, khaki shorts, loafers. Nothing extra.',
    src: '/images/looks/ocbd-khaki-loafers.jpg',
    alt: 'Light blue oxford cloth button-down, khaki shorts, and brown penny loafers against white tile',
  },
  {
    id: 'summer-ivy-kit',
    date: 'Aug 2026',
    caption: 'Summer kit, laid out.',
    src: '/images/looks/summer-ivy-kit.jpg',
    alt: 'Flat lay of chambray, white oxford, navy polo, khaki and olive shorts, belt, and loafers',
  },
  {
    id: 'field-jacket-wet',
    date: 'Apr 2026',
    caption: 'Field jacket on wet pavement.',
    src: '/images/looks/field-jacket-wet.jpg',
    alt: 'Olive field jacket, light blue oxford, cuffed khakis, Chelsea boots, and a canvas tote',
  },
  {
    id: 'yankees-rain-walk',
    date: 'Apr 2026',
    caption: 'Yankees cap, tote, Chelsea boots in the rain.',
    src: '/images/looks/yankees-rain-walk.jpg',
    alt: 'Walking a wet street in an olive field jacket, navy Yankees cap, khakis, and Chelsea boots',
  },
  {
    id: 'field-jacket-knoll',
    date: 'Apr 2026',
    caption: 'The same kit, knolled.',
    src: '/images/looks/field-jacket-knoll.jpg',
    alt: 'Flat lay of an olive field jacket, chambray shirt, khakis, Yankees cap, J. Press tote, and Chelsea boots',
  },
  {
    id: 'chore-coat-corduroy',
    date: 'Nov 2025',
    caption: 'Blue chore coat and tobacco corduroy.',
    src: '/images/looks/chore-coat-corduroy.jpg',
    alt: 'Blue chore coat over a white oxford, tan corduroy trousers, and brown loafers',
  },
  {
    id: 'navy-sweater-tavern',
    date: 'Nov 2025',
    caption: 'Navy wool, tavern light.',
    src: '/images/looks/navy-sweater-tavern.jpg',
    alt: 'Navy crewneck over a light blue collar, tobacco corduroy trousers, and brown boots outside a tavern',
  },
];
