export interface Interest {
  id: string;
  title: string;
  creator: string;
  medium: 'Books' | 'Book' | 'Movie' | 'TV' | 'Game' | 'Team';
  year: string;
  note: string;
  url?: string;
  /**
   * Path under public/covers/. Leave undefined to render the generated
   * typographic card instead. Dropping a real image in and adding one line
   * here is all it takes to swap.
   */
  cover?: string;
  /**
   * How the cover fills its 2:3 frame. Use 'contain' for square box art so it
   * is letterboxed against the palette rather than cropped top and bottom.
   */
  fit?: 'cover' | 'contain';
  /** Colour pair for the generated card, and the backdrop behind a contained cover. */
  palette: [string, string];
}

export const interests: Interest[] = [
  {
    id: 'dungeon-crawler-carl',
    title: 'Dungeon Crawler Carl',
    creator: 'Matt Dinniman',
    medium: 'Books',
    year: '2020 to now',
    note: 'The whole series. Earth gets demolished into a game show dungeon and the run is broadcast live. Eight books out, the ninth is the last one.',
    url: 'https://en.wikipedia.org/wiki/Dungeon_Crawler_Carl',
    cover: 'dungeon-crawler-carl.jpg',
    palette: ['#f97316', '#7c2d12'],
  },
  {
    id: 'the-odyssey',
    title: 'The Odyssey',
    creator: 'Christopher Nolan',
    medium: 'Movie',
    year: '2026',
    note: 'Nolan doing Homer, shot entirely on IMAX 70mm. Matt Damon as Odysseus.',
    url: 'https://en.wikipedia.org/wiki/The_Odyssey_(2026_film)',
    cover: 'the-odyssey.jpg',
    palette: ['#0ea5e9', '#0c4a6e'],
  },
  {
    id: 'feel-good-productivity',
    title: 'Feel-Good Productivity',
    creator: 'Ali Abdaal',
    medium: 'Book',
    year: '2023',
    note: 'Productivity built around energy and enjoyment rather than discipline. Relevant to the day job more than I expected.',
    cover: 'feel-good-productivity.jpg',
    palette: ['#facc15', '#a16207'],
  },
  {
    id: 'splatoon-raiders',
    title: 'Splatoon Raiders',
    creator: 'Nintendo',
    medium: 'Game',
    year: '2026',
    note: 'Single-player Splatoon for Switch 2. You play a mechanic working with Deep Cut across the Spirhalite Islands.',
    url: 'https://en.wikipedia.org/wiki/Splatoon_Raiders',
    cover: 'splatoon-raiders.jpg',
    fit: 'contain',
    palette: ['#ec4899', '#4c1d95'],
  },
  {
    id: 'fallout',
    title: 'Fallout',
    creator: 'Prime Video',
    medium: 'TV',
    year: '2024 to now',
    note: 'Season two took the wasteland to New Vegas. One of the few game adaptations that understands the source material.',
    url: 'https://en.wikipedia.org/wiki/Fallout_season_2',
    cover: 'fallout.jpg',
    palette: ['#84cc16', '#14532d'],
  },
  {
    id: 'philadelphia-eagles',
    title: 'Philadelphia Eagles',
    creator: 'Sundays, September to February',
    medium: 'Team',
    year: 'Always',
    note: 'The one non-negotiable in my calendar. Kelly green throwbacks are the correct uniform, and this site is painted to match.',
    url: 'https://www.philadelphiaeagles.com/',
    cover: 'eagles-logo.png',
    fit: 'contain',
    palette: ['#2b8c4e', '#08351c'],
  },
];
