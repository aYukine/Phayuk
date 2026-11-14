#!/usr/bin/env bash
# Run this ON THE VPS, inside the cloned repo.
#
#   ./deploy/install.sh          build the site, publish it, install the nginx site if needed
#   ./deploy/install.sh --ssl    add HTTPS with Let's Encrypt (run once DNS points at this server)
#
# Update later with:  git pull && ./deploy/install.sh
#
# Options (environment variables):
#   DOMAIN=phayuk.com  SITE_NAME=phayuk  WEB_ROOT=/var/www/phayuk  CERTBOT_EMAIL=you@example.com
set -euo pipefail
cd "$(dirname "$0")/.."

DOMAIN="${DOMAIN:-phayuk.com}"
SITE_NAME="${SITE_NAME:-phayuk}"
WEB_ROOT="${WEB_ROOT:-/var/www/$SITE_NAME}"
KEEP_RELEASES="${KEEP_RELEASES:-5}"
NGINX_DIR="${NGINX_DIR:-/etc/nginx}"
SUDO=""; [ "$(id -u)" -ne 0 ] && SUDO="sudo"

say() { printf '\n\033[1m==> %s\033[0m\n' "$*"; }
die() { printf '\033[31mError:\033[0m %s\n' "$*" >&2; exit 1; }

if [ -d "$NGINX_DIR/sites-enabled" ]; then
  CONF="$NGINX_DIR/sites-available/$SITE_NAME"; LINK="$NGINX_DIR/sites-enabled/$SITE_NAME"
else
  CONF="$NGINX_DIR/conf.d/$SITE_NAME.conf"; LINK=""
fi

# ---------------------------------------------------------------- HTTPS
if [ "${1:-}" = "--ssl" ]; then
  command -v certbot >/dev/null || die "certbot is not installed. Run: $SUDO apt install -y certbot python3-certbot-nginx"
  [ -e "$CONF" ] || die "Run ./deploy/install.sh first so the nginx site exists."

  # Only request names whose DNS already points at this server (FORCE=1 skips the check,
  # e.g. when the records are proxied through Cloudflare).
  MY_IPS=" $(hostname -I 2>/dev/null) "
  ARGS=(); NAMES=()
  for d in "$DOMAIN" "www.$DOMAIN"; do
    ips="$(getent ahostsv4 "$d" | awk '{print $1}' | sort -u | tr '\n' ' ')"
    match=0; for ip in $ips; do [[ "$MY_IPS" == *" $ip "* ]] && match=1; done
    if [ "$match" = 1 ] || [ "${FORCE:-0}" = 1 ]; then
      echo "  ok    $d -> ${ips:-?}"; ARGS+=(-d "$d"); NAMES+=("$d")
    else
      echo "  skip  $d -> ${ips:-no record} (this server: $(echo $MY_IPS))"
    fi
  done
  [ ${#ARGS[@]} -gt 0 ] || die "No domain points at this server yet. Update DNS, wait a few minutes, then retry."

  say "Requesting certificate for: ${NAMES[*]}"
  $SUDO certbot --nginx "${ARGS[@]}" --cert-name "$DOMAIN" --expand --redirect --non-interactive --agree-tos \
    ${CERTBOT_EMAIL:+-m "$CERTBOT_EMAIL"} ${CERTBOT_EMAIL:---register-unsafely-without-email}
  $SUDO nginx -t && $SUDO systemctl reload nginx
  say "HTTPS enabled for: ${NAMES[*]}"
  [ ${#NAMES[@]} -eq 2 ] || echo "Once www.$DOMAIN points here too, run --ssl again to add it to the certificate."
  exit 0
fi

# ---------------------------------------------------------------- checks
command -v nginx >/dev/null || die "nginx is not installed."
command -v node >/dev/null || die "Node.js 22.23+ is required. See the 'Install Node' step in README.md."
node -e 'const [a,b]=process.versions.node.split(".").map(Number);process.exit(a>22||(a===22&&b>=23)?0:1)' \
  || die "Node $(node -v) is too old. Astro needs 22.23 or newer."

# ---------------------------------------------------------------- build
say "Installing dependencies"
npm ci --no-audit --no-fund
say "Building site"
ASTRO_TELEMETRY_DISABLED=1 npm run build

# ---------------------------------------------------------------- publish
RELEASE="$(date +%Y%m%d-%H%M%S)"
say "Publishing release $RELEASE to $WEB_ROOT"
$SUDO mkdir -p "$WEB_ROOT/releases/$RELEASE"
$SUDO cp -a frontend/dist/. "$WEB_ROOT/releases/$RELEASE/"
$SUDO chmod -R a+rX "$WEB_ROOT/releases/$RELEASE"
$SUDO ln -sfn "releases/$RELEASE" "$WEB_ROOT/current.tmp"
$SUDO mv -Tf "$WEB_ROOT/current.tmp" "$WEB_ROOT/current"
# keep the newest $KEEP_RELEASES releases
ls -1dt "$WEB_ROOT"/releases/* | tail -n +$((KEEP_RELEASES + 1)) | xargs -r $SUDO rm -rf

# ---------------------------------------------------------------- nginx
if [ ! -e "$CONF" ]; then
  say "Installing nginx site $CONF (only answers for $DOMAIN, other sites are untouched)"
  sed -e "s#__DOMAIN__#$DOMAIN#g" -e "s#__ROOT__#$WEB_ROOT#g" deploy/nginx.conf | $SUDO tee "$CONF" >/dev/null
  [ -n "$LINK" ] && $SUDO ln -sfn "$CONF" "$LINK"
  if ! $SUDO nginx -t; then
    $SUDO rm -f "${LINK:-$CONF}"
    die "nginx config test failed, so the new site was disabled again. Your other site is unaffected."
  fi
else
  echo "nginx site already exists at $CONF, leaving it as is."
fi

$SUDO nginx -t && $SUDO systemctl reload nginx
say "Live: http://$DOMAIN  (release $RELEASE)"
[ -n "$(grep -l 'ssl_certificate' "$CONF" 2>/dev/null)" ] || echo "Next: ./deploy/install.sh --ssl"
