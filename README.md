# Banda Dark Sertanejo Artist Page

Static landing page for the Brazilian version of the dark country artist page.

## What is included

- Responsive landing page for desktop and mobile.
- Four sections: Inicio, Lancamento, Musicas, Historia.
- Live Spotify artist and release links.
- Live YouTube Music artist link.
- Live YouTube channel link.
- Live Apple Music artist link.
- Facebook, Instagram, and YouTube follow links.
- Vercel Web Analytics script for page-view tracking after deployment.
- Vercel-ready static deployment.

## Local preview

```powershell
python -m http.server 5174
```

Then open:

```text
http://localhost:5174
```

## Deploy on Vercel

1. Push this folder to a GitHub repo.
2. In Vercel, choose `Add New` -> `Project`.
3. Import the GitHub repo.
4. Keep the framework preset as `Other`.
5. Leave build command empty.
6. Leave output directory empty.
7. Deploy.
8. In the Vercel project dashboard, enable Web Analytics.
9. Visit the production site and wait for page views to appear in Vercel Analytics.

## Visitor analytics

This static site includes Vercel Web Analytics via `/_vercel/insights/script.js`.
It will not collect visits from `localhost`; it starts collecting after the site is deployed on Vercel and Web Analytics is enabled for the project.

## Current music links

- Spotify artist: `https://open.spotify.com/artist/4aniePiSQrXnWCxKbH0Nay`
- YouTube Music artist: `https://music.youtube.com/channel/UCl8jFfuIqHLbXDsuO1mY_Dg?si=8e3M0dc5IO2Ffnl-`
- YouTube channel: `https://www.youtube.com/@BandaDarkSertanejo`
- Facebook: `https://www.facebook.com/profile.php?id=61590410820671`
- Apple Music artist: `https://music.apple.com/us/artist/banda-dark-sertanejo/6800148195`
- Featured release: `Nem a Morte Nos Separa`
- Standout releases: `Nem a Morte Nos Separa`, `O Seu Lado Da Cama`, `O Vazio`
