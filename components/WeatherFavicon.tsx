import { useEffect } from 'react';

const LAT = 35.2271;
const LON = -80.8431;
const REFRESH_MS = 30 * 60 * 1000;

function svgFor(code: number, isDay: boolean): string {
  const stroke = '#111111';
  const sun = `<circle cx="16" cy="16" r="6" fill="#f4b942"/>
    <g stroke="#f4b942" stroke-width="2" stroke-linecap="round">
      <path d="M16 4v3M16 25v3M4 16h3M25 16h3M7.2 7.2l2.1 2.1M22.7 22.7l2.1 2.1M7.2 24.8l2.1-2.1M22.7 9.3l2.1-2.1"/>
    </g>`;
  const moon = `<path fill="#c9d4e8" d="M18 6.5a9.5 9.5 0 1 0 7.4 15.3A8 8 0 0 1 18 6.5z"/>`;
  const cloud = `<path fill="#8ea0b5" d="M10 22h13.5a5 5 0 0 0 .4-10 7 7 0 0 0-13.2 1.8A4.5 4.5 0 0 0 10 22z"/>`;
  const rain = `<g stroke="#4a7fd4" stroke-width="1.8" stroke-linecap="round">
      <path d="M12 24.5l-1 3.2M16.5 24.5l-1 3.2M21 24.5l-1 3.2"/>
    </g>`;
  const snow = `<g fill="#9ec7ea">
      <circle cx="12" cy="26" r="1.3"/><circle cx="16.5" cy="27.2" r="1.3"/><circle cx="21" cy="26" r="1.3"/>
    </g>`;
  const bolt = `<path fill="#f4b942" d="M17.5 20l-2.4 6.8 6.2-8.2h-3.8l2-5.6-6.4 7z"/>`;
  const fog = `<g stroke="${stroke}" stroke-width="1.8" stroke-linecap="round" opacity="0.7">
      <path d="M7 18h18M6 21.5h20M8 25h16"/>
    </g>`;

  let body = isDay ? sun : moon;
  if (code === 45 || code === 48) body = fog;
  else if ([95, 96, 99].includes(code)) body = cloud + bolt;
  else if ((code >= 71 && code <= 77) || code === 85 || code === 86) body = cloud + snow;
  else if (code >= 51) body = cloud + rain;
  else if (code >= 2) body = (isDay ? `<g opacity="0.55">${sun}</g>` : moon) + cloud;

  return `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 32 32">${body}</svg>`;
}

function setIcon(svg: string) {
  const href = `data:image/svg+xml,${encodeURIComponent(svg)}`;
  let link = document.querySelector<HTMLLinkElement>('link[rel="icon"]');
  if (!link) {
    link = document.createElement('link');
    link.rel = 'icon';
    document.head.appendChild(link);
  }
  link.type = 'image/svg+xml';
  link.href = href;
}

export default function WeatherFavicon() {
  useEffect(() => {
    let cancelled = false;
    const run = async () => {
      try {
        const res = await fetch(
          `https://api.open-meteo.com/v1/forecast?latitude=${LAT}&longitude=${LON}&current=weather_code,is_day&timezone=America/New_York`
        );
        const data = await res.json();
        if (cancelled) return;
        const code = Number(data?.current?.weather_code);
        const isDay = Number(data?.current?.is_day) === 1;
        setIcon(svgFor(Number.isFinite(code) ? code : 0, isDay));
      } catch {
        if (!cancelled) setIcon(svgFor(0, true));
      }
    };
    void run();
    const id = window.setInterval(run, REFRESH_MS);
    return () => {
      cancelled = true;
      window.clearInterval(id);
    };
  }, []);
  return null;
};

