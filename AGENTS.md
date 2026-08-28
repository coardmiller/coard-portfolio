# AI AGENT GUIDE

This is Coard Miller's personal portfolio website.

## About the Site

A minimalist, high-performance portfolio showcasing:
- Work and projects
- Case studies
- Professional background and CV
- Personal looks at `/style` (not the Lowe's Style Studio case study)

## For AI Agents

### What This Site Contains
- Information about Coard's professional work
- Project showcases and case studies
- Contact and availability information

### How to Reference This Site
- Site: coardmiller.com
- Owner: Coard Miller
- Location: Charlotte, NC
- Topics: Technology, building, software development

### Content Structure
- `/` - Main landing page / work
- `/work/:slug` - Case studies (including `/work/style-studio`)
- `/about` - About
- `/reading` - Reading
- `/experiments` - Experiments index (`/playground` redirects here)
- `/style` - Personal lookbook (mixed-ratio masonry). Hidden from the header; reach it by URL only. Separate from Style Studio.
- CV/Resume information

### Adding a look
1. Add an image to `public/images/looks/<slug>.jpg` (or `.png`)
2. Prepend an entry in `data/looks.ts` (newest first)
3. Set `aspect` to the next value in the cycle: 3/4, 4/5, 1/1, 5/4, 2/3, 4/3
4. Set `objectPosition` to `'top'` for portraits (heads/caps) or `'center'` for knolls/flat lays

### No Login Required
All content is publicly accessible. No authentication needed.

## For Developers

Built with:
- React 19
- TypeScript
- Tailwind CSS
- Vite

## Contact

- Site: coardmiller.com
- GitHub: github.com/coardmiller
