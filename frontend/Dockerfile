# PLACEHOLDER — Replace with `npm ci`, `npm run build`, and copy `dist/` to nginx
# when the Vite + React app exists. This serves a minimal static page for now.

FROM nginx:1.27-alpine
RUN printf '%s\n' \
  '<!DOCTYPE html>' \
  '<html lang="en"><head><meta charset="utf-8"/><title>Care Operations Task Tracker</title></head>' \
  '<body><h1>Care Operations Task Tracker</h1><p>Frontend skeleton — React + Vite app will replace this page in a later phase.</p></body></html>' \
  > /usr/share/nginx/html/index.html
EXPOSE 80
