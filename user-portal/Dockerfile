# =============================================================================
# Sub2API user-portal 镜像（debian-slim + mise 构建 → nginx 托管）
# =============================================================================
FROM debian:13-slim AS build

ENV MISE_VERSION=2026.6.0
ENV MISE_DATA_DIR=/mise MISE_CONFIG_DIR=/mise MISE_CACHE_DIR=/mise/cache \
    MISE_INSTALL_PATH=/usr/local/bin/mise PATH=/mise/shims:$PATH
RUN apt-get update \
    && apt-get install -y --no-install-recommends curl git ca-certificates \
    && rm -rf /var/lib/apt/lists/* \
    && curl https://mise.run | sh

WORKDIR /app
COPY mise.toml ./
RUN mise trust && mise install node pnpm

COPY user-portal/package.json user-portal/pnpm-lock.yaml ./user-portal/
RUN cd user-portal && pnpm install --frozen-lockfile
COPY user-portal/ ./user-portal/
RUN cd user-portal && pnpm run build

# -----------------------------------------------------------------------------
FROM nginx:1.27-alpine AS runtime
COPY user-portal/nginx.conf /etc/nginx/conf.d/default.conf
COPY --from=build /app/user-portal/dist /usr/share/nginx/html
EXPOSE 80
