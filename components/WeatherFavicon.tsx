import { useEffect } from 'react';

const LAT = 35.2271;
const LON = -80.8431;
const REFRESH_MS = 30 * 60 * 1000;
const CACHE_KEY = 'coard-miller-charlotte-weather';
const UA = 'coardmiller.com weather favicon';

type Sky = 'sun' | 'moon' | 'partly' | 'cloud' | 'rain' | 'storm' | 'snow' | 'fog';

function kindFromText(text: string, isDay: boolean): Sky {
  const t = text.toLowerCase();
  if (/thunder|t-?storm/.test(t)) return 'storm';
  if (/snow|sleet|flurries|ice/.test(t)) return 'snow';
  if (/fog|mist|haze/.test(t)) return 'fog';
  if (/rain|shower|drizzle/.test(t)) return 'rain';
  if (/overcast|cloudy/.test(t) && !/partly|mostly sunny|mostly clear/.test(t)) return 'cloud';
  if (/partly|mostly cloudy|mostly sunny/.test(t)) return 'partly';
  if (/clear|sunny|fair/.test(t)) return isDay ? 'sun' : 'moon';
  return isDay ? 'sun' : 'moon';
}

function kindFromWmo(code: number, isDay: boolean): Sky {
  if (code === 45 || code === 48) return 'fog';
  if ([95, 96, 99].includes(code)) return 'storm';
  if ((code >= 71 && code <= 77) || code === 85 || code === 86) return 'snow';
  if (code >= 51) return 'rain';
  if (code >= 3) return 'cloud';
  if (code === 2) return 'partly';
  return isDay ? 'sun' : 'moon';
}

function svgFor(kind: Sky): string {
  const sun = `<circle cx="16" cy="14" r="6.2" fill="#f5b942"/>
    <g stroke="#f5b942" stroke-width="2.4" stroke-linecap="round">
      <path d="M16 2.6v2.6M16 22.8v2.6M3.8 14h2.6M25.6 14h2.6M6.6 4.6l1.9 1.9M23.5 21.5l1.9 1.9M6.6 23.4l1.9-1.9M23.5 6.5l1.9-1.9"/>
    </g>`;
  const moon = `<path fill="#d7e2f2" d="M19 4.8a10 10 0 1 0 6.8 16.2A8.4 8.4 0 0 1 19 4.8z"/>`;
  const cloud = `<path fill="#7f93aa" d="M8.4 21.6h16.2a5.3 5.3 0 0 0 .3-10.6 7.6 7.6 0 0 0-14.4 2A4.8 4.8 0 0 0 8.4 21.6z"/>`;
  const rain = `<g stroke="#3f74c8" stroke-width="2.2" stroke-linecap="round">
      <path d="M11.4 24.2l-1.1 3.6M16.4 24.2l-1.1 3.6M21.4 24.2l-1.1 3.6"/>
    </g>`;
  const snow = `<g fill="#9ec7ea">
      <circle cx="11.6" cy="26.2" r="1.5"/><circle cx="16.4" cy="27.4" r="1.5"/><circle cx="21.2" cy="26.2" r="1.5"/>
    </g>`;
  const bolt = `<path fill="#f5b942" d="M17.8 19.2l-2.6 7.2 6.6-8.6h-4l2.1-5.8-7 7.2z"/>`;
  const fog = `<g stroke="#6b7280" stroke-width="2.2" stroke-linecap="round">
      <path d="M6 16.5h20M5 20.4h22M7 24.3h18"/>
    </g>`;

  const body =
    kind === 'moon' ? moon :
    kind === 'fog' ? fog :
    kind === 'storm' ? cloud + bolt :
    kind === 'snow' ? cloud + snow :
    kind === 'rain' ? cloud + rain :
    kind === 'cloud' ? cloud :
    kind === 'partly' ? `<g transform="translate(0 -2)">${sun}</g>${cloud}` :
    sun;

  return `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 32 32">${body}</svg>`;
}

function setIcon(svg: string) {
  const href = `data:image/svg+xml,${encodeURIComponent(svg)}`;
  const apply = (rel: string) => {
    let link = document.querySelector<HTMLLinkElement>(`link[rel="${rel}"]`);
    if (!link) {
      link = document.createElement('link');
      link.rel = rel;
      document.head.appendChild(link);
    }
    link.type = 'image/svg+xml';
    link.href = href;
  };
  apply('icon');
  apply('shortcut icon');
  apply('apple-touch-icon');
}

async function fromNws(): Promise<Sky> {
  const points = await fetch(`https://api.weather.gov/points/${LAT},${LON}`, {
    headers: { Accept: 'application/geo+json', 'User-Agent': UA },
  });
  if (!points.ok) throw new Error('points');
  const pointJson = await points.json();
  const hourlyUrl = pointJson?.properties?.forecastHourly;
  if (!hourlyUrl) throw new Error('hourly url');
  const hourly = await fetch(hourlyUrl, {
    headers: { Accept: 'application/geo+json', 'User-Agent': UA },
  });
  if (!hourly.ok) throw new Error('hourly');
  const data = await hourly.json();
  const period = data?.properties?.periods?.[0];
  const text = String(period?.shortForecast || '');
  const isDay = Boolean(period?.isDaytime);
  return kindFromText(text, isDay);
}

async function fromOpenMeteo(): Promise<Sky> {
  const res = await fetch(
    `https://api.open-meteo.com/v1/forecast?latitude=${LAT}&longitude=${LON}&current=weather_code,is_day&timezone=America/New_York`
  );
  if (!res.ok) throw new Error('meteo');
  const data = await res.json();
  const code = Number(data?.current?.weather_code);
  const isDay = Number(data?.current?.is_day) === 1;
  return kindFromWmo(Number.isFinite(code) ? code : 0, isDay);
}

function readCache(): Sky | null {
  try {
    const raw = localStorage.getItem(CACHE_KEY);
    if (!raw) return null;
    const parsed = JSON.parse(raw) as { kind?: Sky; at?: number };
    if (!parsed.kind || !parsed.at) return null;
    if (Date.now() - parsed.at > REFRESH_MS * 2) return null;
    return parsed.kind;
  } catch {
    return null;
  }
}

function writeCache(kind: Sky) {
  try {
    localStorage.setItem(CACHE_KEY, JSON.stringify({ kind, at: Date.now() }));
  } catch {
    /* ignore */
  }
}

export default function WeatherFavicon() {
  useEffect(() => {
    let cancelled = false;
    const paint = (kind: Sky) => {
      if (!cancelled) setIcon(svgFor(kind));
    };
    const cached = readCache();
    paint(cached ?? 'sun');

    const run = async () => {
      try {
        const kind = await fromNws().catch(() => fromOpenMeteo());
        writeCache(kind);
        paint(kind);
      } catch {
        paint(cached ?? 'sun');
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
}
