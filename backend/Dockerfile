# =============================================================================
# Sub2API Backend 镜像（debian-slim + mise 多阶段，内嵌 frontend）
# =============================================================================
ARG GOPROXY=https://goproxy.cn,direct
ARG GOSUMDB=sum.golang.google.cn
ARG PG_CLIENT_VERSION=18

# -----------------------------------------------------------------------------
# 构建阶段：debian-slim + curl 装 mise（官方写法）
# -----------------------------------------------------------------------------
FROM debian:13-slim AS build

ENV MISE_VERSION=2026.6.0
ENV MISE_DATA_DIR=/mise MISE_CONFIG_DIR=/mise MISE_CACHE_DIR=/mise/cache \
    MISE_INSTALL_PATH=/usr/local/bin/mise PATH=/mise/shims:$PATH
RUN apt-get update \
    && apt-get install -y --no-install-recommends curl git ca-certificates \
    && rm -rf /var/lib/apt/lists/* \
    && curl https://mise.run | sh

ARG GOPROXY
ARG GOSUMDB
ENV GOPROXY=${GOPROXY} GOSUMDB=${GOSUMDB}

WORKDIR /app
# 仅装本镜像所需工具（不 mise install 全装）
COPY mise.toml ./
RUN mise trust && mise install go node pnpm

# 依赖清单先 COPY（层缓存）
COPY backend/go.mod backend/go.sum ./backend/
RUN cd backend && go mod download
COPY frontend/package.json frontend/pnpm-lock.yaml ./frontend/
RUN cd frontend && pnpm install --frozen-lockfile

# 源码后 COPY。先放后端源码，再 build 前端（其 outDir 写入 backend/internal/web/dist，
# 避免被后端源码 COPY 覆盖）。LegalDocumentView.vue 需 docs/legal/*.md。
COPY backend/ ./backend/
COPY frontend/ ./frontend/
COPY docs/legal/ ./docs/legal/
RUN cd frontend && pnpm run build

# 编译后端（embed 内嵌前端）；VERSION 优先级：build arg > cmd/server/VERSION
ARG VERSION
ARG COMMIT=docker
ARG DATE
RUN cd backend && \
    VERSION_VALUE="${VERSION}" && \
    if [ -z "${VERSION_VALUE}" ]; then VERSION_VALUE="$(tr -d '\r\n' < ./cmd/server/VERSION)"; fi && \
    DATE_VALUE="${DATE:-$(date -u +%Y-%m-%dT%H:%M:%SZ)}" && \
    CGO_ENABLED=0 GOOS=linux go build \
      -tags embed \
      -ldflags="-s -w -X main.Version=${VERSION_VALUE} -X main.Commit=${COMMIT} -X main.Date=${DATE_VALUE} -X main.BuildType=release" \
      -trimpath \
      -o /app/sub2api \
      ./cmd/server

# -----------------------------------------------------------------------------
# 运行阶段：debian-slim + PGDG apt 装 pg-client
# -----------------------------------------------------------------------------
FROM debian:13-slim AS runtime
ARG PG_CLIENT_VERSION

LABEL description="Sub2API - AI API Gateway Platform (backend)"

# 运行时依赖：ca-certificates/tzdata/curl(healthcheck) + PGDG postgresql-client
RUN apt-get update \
    && apt-get install -y --no-install-recommends ca-certificates tzdata curl gnupg \
    && install -d /usr/share/postgresql-common/pgdg \
    && curl -o /usr/share/postgresql-common/pgdg/apt.postgresql.org.asc \
         https://www.postgresql.org/media/keys/ACCC4CF8.asc \
    && echo "deb [signed-by=/usr/share/postgresql-common/pgdg/apt.postgresql.org.asc] http://apt.postgresql.org/pub/repos/apt $(. /etc/os-release && echo $VERSION_CODENAME)-pgdg main" \
         > /etc/apt/sources.list.d/pgdg.list \
    && apt-get update \
    && apt-get install -y --no-install-recommends postgresql-client-${PG_CLIENT_VERSION} \
    && apt-get purge -y gnupg \
    && apt-get autoremove -y \
    && rm -rf /var/lib/apt/lists/*

# 以 root 运行（不创建非 root 用户）：root 可直接写挂载卷 /app/data，
# 无需 entrypoint 脚本做 chown/降权。
WORKDIR /app
COPY --from=build /app/sub2api /app/sub2api
COPY --from=build /app/backend/resources /app/resources
RUN mkdir -p /app/data

EXPOSE 8080
HEALTHCHECK --interval=30s --timeout=10s --start-period=10s --retries=3 \
    CMD curl -fsS -m 5 "http://localhost:${SERVER_PORT:-8080}/health" || exit 1

ENTRYPOINT ["/app/sub2api"]
