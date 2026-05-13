# Production deployment hardening (KLiP)

Checklist intent: prevent source/config exposure (e.g. `.env`, `.git`, `vendor/`) and ensure only `public/` is reachable.

## 1) DocumentRoot / web root

- Main app: set web server `root` / `DocumentRoot` to `.../KLIP/public`
- Backend app: set web server `root` / `DocumentRoot` to `.../KLIP/backend/public`

If the server is mistakenly pointed at `.../KLIP/` or `.../KLIP/backend/`, the added root `.htaccess` files will rewrite to `public/` as a defensive fallback (Apache only). Do **not** rely on this for Nginx because Nginx ignores `.htaccess`.

## 2) Remove `.git` from production builds

Do not deploy `.git/` to production.

Safer deploy patterns:

- Build an artifact: `git archive --format=tar HEAD | gzip > app.tar.gz`
- Or rsync/scp with excludes: exclude `.git/`, `node_modules/` (if built separately), and local docs.

## 3) HTTPS + SSL

Terminate TLS at the web server (or a reverse proxy). After HTTPS works, enable HSTS (already included in examples).

## 4) Server configs

- Nginx example: `deploy/nginx/laravel-public-only-example.conf`
- Apache vhost example: `deploy/apache/laravel-vhost-example.conf`

