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
- `/style` - Personal lookbook (masonry). Separate from Style Studio.
- CV/Resume information

### Adding a look
1. Add an image to `public/images/looks/<slug>.jpg` (or `.png`)
2. Prepend an entry in `data/looks.ts` (newest first)

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
