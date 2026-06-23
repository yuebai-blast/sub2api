#!/bin/sh
set -e

# 以 root 启动时修正数据目录权限。
# Docker 命名卷 / 宿主机挂载可能属 root，导致非 root 的 sub2api 用户无法写入。
if [ "$(id -u)" = "0" ]; then
    mkdir -p /app/data
    # 用 || true 避免只读挂载文件（如 config.yaml:ro）导致失败
    chown -R sub2api:sub2api /app/data 2>/dev/null || true
    # 以 sub2api 身份重新执行本脚本，使下面的 flag 检测也在正确用户下运行
    exec gosu sub2api "$0" "$@"
fi

# 兼容：若首个参数是 flag（如 --help），补上默认二进制，
# 行为与旧 ENTRYPOINT ["/app/sub2api"] 一致。
if [ "${1#-}" != "$1" ]; then
    set -- /app/sub2api "$@"
fi

exec "$@"
