#!/bin/bash
#
# Sub2API Installation Script
# Sub2API 安装脚本
# 用法: curl -sSL https://raw.githubusercontent.com/yuebai-blast/sub2api/main/deploy/install.sh | bash
#

# 任意命令失败立即退出，避免出错后继续执行造成损坏
set -e

# 本地化消息表使用关联数组，需要 Bash 4+ 支持。
# 把这段版本检查放在所有 Bash 4 专有语法之前，让旧版 shell 能给出清晰提示而非报语法错误。
if [ -z "${BASH_VERSION:-}" ]; then
    echo "Error: This installer must be run with Bash 4.0 or later." >&2
    echo "Please install Bash 4+ and run it with that interpreter." >&2
    exit 1
fi

BASH_MAJOR_VERSION="${BASH_VERSION%%.*}"
if [ "$BASH_MAJOR_VERSION" -lt 4 ]; then
    echo "Error: Bash 4.0 or later is required. Current version: $BASH_VERSION" >&2
    echo "Please install Bash 4+ and retry with that interpreter." >&2
    exit 1
fi

# 终端颜色控制码
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
CYAN='\033[0;36m'
NC='\033[0m' # 重置颜色

# 基础配置
GITHUB_REPO="yuebai-blast/sub2api"   # GitHub 仓库（用于拉取 release）
INSTALL_DIR="/opt/mint_sub2api"        # 二进制及数据安装目录
SERVICE_NAME="mint_sub2api"            # systemd 服务名
SERVICE_USER="mint_sub2api"            # 运行服务的系统用户
CONFIG_DIR="/etc/mint_sub2api"         # 配置目录

# 服务器监听配置（可由用户在安装过程中修改）
SERVER_HOST="0.0.0.0"
SERVER_PORT="9000"

# 界面语言（默认: zh = 中文）
LANG_CHOICE="zh"

# ============================================================
# 多语言文案表 / 语言字符串
# ============================================================

# 中文文案
declare -A MSG_ZH=(
    # 通用
    ["info"]="信息"
    ["success"]="成功"
    ["warning"]="警告"
    ["error"]="错误"

    # 语言选择
    ["select_lang"]="请选择语言 / Select language"
    ["lang_zh"]="中文"
    ["lang_en"]="English"
    ["enter_choice"]="请输入选择 (默认: 1)"

    # 安装流程
    ["install_title"]="Sub2API 安装脚本"
    ["run_as_root"]="请使用 root 权限运行 (使用 sudo)"
    ["detected_platform"]="检测到平台"
    ["unsupported_arch"]="不支持的架构"
    ["unsupported_os"]="不支持的操作系统"
    ["missing_deps"]="缺少依赖"
    ["install_deps_first"]="请先安装以下依赖"
    ["fetching_version"]="正在获取最新版本..."
    ["latest_version"]="最新版本"
    ["failed_get_version"]="获取最新版本失败"
    ["downloading"]="正在下载"
    ["download_failed"]="下载失败"
    ["verifying_checksum"]="正在校验文件..."
    ["checksum_verified"]="校验通过"
    ["checksum_failed"]="校验失败"
    ["checksum_not_found"]="无法验证校验和（checksums.txt 未找到）"
    ["extracting"]="正在解压..."
    ["binary_installed"]="二进制文件已安装到"
    ["user_exists"]="用户已存在"
    ["creating_user"]="正在创建系统用户"
    ["user_created"]="用户已创建"
    ["setting_up_dirs"]="正在设置目录..."
    ["dirs_configured"]="目录配置完成"
    ["installing_service"]="正在安装 systemd 服务..."
    ["service_installed"]="systemd 服务已安装"
    ["ready_for_setup"]="准备就绪，可以启动设置向导"

    # 安装完成提示
    ["install_complete"]="Sub2API 安装完成！"
    ["install_dir"]="安装目录"
    ["next_steps"]="后续步骤"
    ["step1_check_services"]="确保 PostgreSQL 和 Redis 正在运行："
    ["step2_start_service"]="启动 Sub2API 服务："
    ["step3_enable_autostart"]="设置开机自启："
    ["step4_open_wizard"]="在浏览器中打开设置向导："
    ["wizard_guide"]="设置向导将引导您完成："
    ["wizard_db"]="数据库配置"
    ["wizard_redis"]="Redis 配置"
    ["wizard_admin"]="管理员账号创建"
    ["useful_commands"]="常用命令"
    ["cmd_status"]="查看状态"
    ["cmd_logs"]="查看日志"
    ["cmd_restart"]="重启服务"
    ["cmd_stop"]="停止服务"

    # 升级
    ["upgrading"]="正在升级 Sub2API..."
    ["current_version"]="当前版本"
    ["stopping_service"]="正在停止服务..."
    ["backup_created"]="备份已创建"
    ["starting_service"]="正在启动服务..."
    ["upgrade_complete"]="升级完成！"

    # 指定版本安装
    ["installing_version"]="正在安装指定版本"
    ["version_not_found"]="指定版本不存在"
    ["same_version"]="已经是该版本，无需操作"
    ["rollback_complete"]="版本回退完成！"
    ["install_version_complete"]="指定版本安装完成！"
    ["validating_version"]="正在验证版本..."
    ["available_versions"]="可用版本列表"
    ["fetching_versions"]="正在获取可用版本..."
    ["not_installed"]="Sub2API 尚未安装，请先执行全新安装"
    ["fresh_install_hint"]="用法"

    # 卸载
    ["uninstall_confirm"]="这将从系统中移除 Sub2API。"
    ["are_you_sure"]="确定要继续吗？(y/N)"
    ["uninstall_cancelled"]="卸载已取消"
    ["removing_files"]="正在移除文件..."
    ["removing_install_dir"]="正在移除安装目录..."
    ["removing_user"]="正在移除用户..."
    ["config_not_removed"]="配置目录未被移除"
    ["remove_manually"]="如不再需要，请手动删除"
    ["removing_install_lock"]="正在移除安装锁文件..."
    ["install_lock_removed"]="安装锁文件已移除，重新安装时将进入设置向导"
    ["purge_prompt"]="是否同时删除配置目录？这将清除所有配置和数据 [y/N]: "
    ["removing_config_dir"]="正在移除配置目录..."
    ["uninstall_complete"]="Sub2API 已卸载"

    # 帮助信息
    ["usage"]="用法"
    ["cmd_none"]="(无参数)"
    ["cmd_install"]="安装 Sub2API"
    ["cmd_upgrade"]="升级到最新版本"
    ["cmd_uninstall"]="卸载 Sub2API"
    ["cmd_install_version"]="安装/回退到指定版本"
    ["cmd_list_versions"]="列出可用版本"
    ["opt_version"]="指定要安装的版本号 (例如: v1.0.0)"

    # 服务器配置
    ["server_config_title"]="服务器配置"
    ["server_config_desc"]="配置 Sub2API 服务监听地址"
    ["server_host_prompt"]="服务器监听地址"
    ["server_host_hint"]="0.0.0.0 表示监听所有网卡，127.0.0.1 仅本地访问"
    ["server_port_prompt"]="服务器端口"
    ["server_port_hint"]="建议使用 1024-65535 之间的端口"
    ["server_config_summary"]="服务器配置"
    ["invalid_port"]="无效端口号，请输入 1-65535 之间的数字"

    # 服务管理
    ["starting_service"]="正在启动服务..."
    ["service_started"]="服务已启动"
    ["service_start_failed"]="服务启动失败，请检查日志"
    ["enabling_autostart"]="正在设置开机自启..."
    ["autostart_enabled"]="开机自启已启用"
    ["getting_public_ip"]="正在获取公网 IP..."
    ["public_ip_failed"]="无法获取公网 IP，使用本地 IP"
)

# 英文文案
declare -A MSG_EN=(
    # 通用
    ["info"]="INFO"
    ["success"]="SUCCESS"
    ["warning"]="WARNING"
    ["error"]="ERROR"

    # 语言选择
    ["select_lang"]="请选择语言 / Select language"
    ["lang_zh"]="中文"
    ["lang_en"]="English"
    ["enter_choice"]="Enter your choice (default: 1)"

    # 安装流程
    ["install_title"]="Sub2API Installation Script"
    ["run_as_root"]="Please run as root (use sudo)"
    ["detected_platform"]="Detected platform"
    ["unsupported_arch"]="Unsupported architecture"
    ["unsupported_os"]="Unsupported OS"
    ["missing_deps"]="Missing dependencies"
    ["install_deps_first"]="Please install them first"
    ["fetching_version"]="Fetching latest version..."
    ["latest_version"]="Latest version"
    ["failed_get_version"]="Failed to get latest version"
    ["downloading"]="Downloading"
    ["download_failed"]="Download failed"
    ["verifying_checksum"]="Verifying checksum..."
    ["checksum_verified"]="Checksum verified"
    ["checksum_failed"]="Checksum verification failed"
    ["checksum_not_found"]="Could not verify checksum (checksums.txt not found)"
    ["extracting"]="Extracting..."
    ["binary_installed"]="Binary installed to"
    ["user_exists"]="User already exists"
    ["creating_user"]="Creating system user"
    ["user_created"]="User created"
    ["setting_up_dirs"]="Setting up directories..."
    ["dirs_configured"]="Directories configured"
    ["installing_service"]="Installing systemd service..."
    ["service_installed"]="Systemd service installed"
    ["ready_for_setup"]="Ready for Setup Wizard"

    # 安装完成提示
    ["install_complete"]="Sub2API installation completed!"
    ["install_dir"]="Installation directory"
    ["next_steps"]="NEXT STEPS"
    ["step1_check_services"]="Make sure PostgreSQL and Redis are running:"
    ["step2_start_service"]="Start Sub2API service:"
    ["step3_enable_autostart"]="Enable auto-start on boot:"
    ["step4_open_wizard"]="Open the Setup Wizard in your browser:"
    ["wizard_guide"]="The Setup Wizard will guide you through:"
    ["wizard_db"]="Database configuration"
    ["wizard_redis"]="Redis configuration"
    ["wizard_admin"]="Admin account creation"
    ["useful_commands"]="USEFUL COMMANDS"
    ["cmd_status"]="Check status"
    ["cmd_logs"]="View logs"
    ["cmd_restart"]="Restart"
    ["cmd_stop"]="Stop"

    # 升级
    ["upgrading"]="Upgrading Sub2API..."
    ["current_version"]="Current version"
    ["stopping_service"]="Stopping service..."
    ["backup_created"]="Backup created"
    ["starting_service"]="Starting service..."
    ["upgrade_complete"]="Upgrade completed!"

    # 指定版本安装
    ["installing_version"]="Installing specified version"
    ["version_not_found"]="Specified version not found"
    ["same_version"]="Already at this version, no action needed"
    ["rollback_complete"]="Version rollback completed!"
    ["install_version_complete"]="Specified version installed!"
    ["validating_version"]="Validating version..."
    ["available_versions"]="Available versions"
    ["fetching_versions"]="Fetching available versions..."
    ["not_installed"]="Sub2API is not installed. Please run a fresh install first"
    ["fresh_install_hint"]="Usage"

    # 卸载
    ["uninstall_confirm"]="This will remove Sub2API from your system."
    ["are_you_sure"]="Are you sure? (y/N)"
    ["uninstall_cancelled"]="Uninstall cancelled"
    ["removing_files"]="Removing files..."
    ["removing_install_dir"]="Removing installation directory..."
    ["removing_user"]="Removing user..."
    ["config_not_removed"]="Config directory was NOT removed."
    ["remove_manually"]="Remove it manually if you no longer need it."
    ["removing_install_lock"]="Removing install lock file..."
    ["install_lock_removed"]="Install lock removed. Setup wizard will appear on next install."
    ["purge_prompt"]="Also remove config directory? This will delete all config and data [y/N]: "
    ["removing_config_dir"]="Removing config directory..."
    ["uninstall_complete"]="Sub2API has been uninstalled"

    # 帮助信息
    ["usage"]="Usage"
    ["cmd_none"]="(none)"
    ["cmd_install"]="Install Sub2API"
    ["cmd_upgrade"]="Upgrade to the latest version"
    ["cmd_uninstall"]="Remove Sub2API"
    ["cmd_install_version"]="Install/rollback to a specific version"
    ["cmd_list_versions"]="List available versions"
    ["opt_version"]="Specify version to install (e.g., v1.0.0)"

    # 服务器配置
    ["server_config_title"]="Server Configuration"
    ["server_config_desc"]="Configure Sub2API server listen address"
    ["server_host_prompt"]="Server listen address"
    ["server_host_hint"]="0.0.0.0 listens on all interfaces, 127.0.0.1 for local only"
    ["server_port_prompt"]="Server port"
    ["server_port_hint"]="Recommended range: 1024-65535"
    ["server_config_summary"]="Server configuration"
    ["invalid_port"]="Invalid port number, please enter a number between 1-65535"

    # 服务管理
    ["starting_service"]="Starting service..."
    ["service_started"]="Service started"
    ["service_start_failed"]="Service failed to start, please check logs"
    ["enabling_autostart"]="Enabling auto-start on boot..."
    ["autostart_enabled"]="Auto-start enabled"
    ["getting_public_ip"]="Getting public IP..."
    ["public_ip_failed"]="Failed to get public IP, using local IP"
)

# 根据当前语言获取对应文案
msg() {
    local key="$1"
    if [ "$LANG_CHOICE" = "en" ]; then
        echo "${MSG_EN[$key]}"
    else
        echo "${MSG_ZH[$key]}"
    fi
}

# 带颜色与级别标签的日志输出函数
print_info() {
    echo -e "${BLUE}[$(msg 'info')]${NC} $1"
}

print_success() {
    echo -e "${GREEN}[$(msg 'success')]${NC} $1"
}

print_warning() {
    echo -e "${YELLOW}[$(msg 'warning')]${NC} $1"
}

print_error() {
    echo -e "${RED}[$(msg 'error')]${NC} $1"
}

# 判断是否处于交互模式（能否访问终端）
# 通过管道运行（curl | bash）时，stdin 不是终端，但 /dev/tty 通常仍然可用
is_interactive() {
    # 检查 /dev/tty 是否可读写（即使通过管道运行也能工作）
    [ -e /dev/tty ] && [ -r /dev/tty ] && [ -w /dev/tty ]
}

# 选择界面语言
select_language() {
    # 非交互模式（管道运行）时直接使用默认语言
    if ! is_interactive; then
        LANG_CHOICE="zh"
        return
    fi

    echo ""
    echo -e "${CYAN}=============================================="
    echo "  $(msg 'select_lang')"
    echo "==============================================${NC}"
    echo ""
    echo "  1) $(msg 'lang_zh') (默认/default)"
    echo "  2) $(msg 'lang_en')"
    echo ""

    read -p "$(msg 'enter_choice'): " lang_input < /dev/tty

    case "$lang_input" in
        2|en|EN|english|English)
            LANG_CHOICE="en"
            ;;
        *)
            LANG_CHOICE="zh"
            ;;
    esac

    echo ""
}

# 校验端口号是否合法（1-65535 的纯数字）
validate_port() {
    local port="$1"
    if [[ "$port" =~ ^[0-9]+$ ]] && [ "$port" -ge 1 ] && [ "$port" -le 65535 ]; then
        return 0
    fi
    return 1
}

# 配置服务器监听地址与端口
configure_server() {
    # 非交互模式（管道运行）时直接使用默认配置
    if ! is_interactive; then
        print_info "$(msg 'server_config_summary'): ${SERVER_HOST}:${SERVER_PORT} (default)"
        return
    fi

    echo ""
    echo -e "${CYAN}=============================================="
    echo "  $(msg 'server_config_title')"
    echo "==============================================${NC}"
    echo ""
    echo -e "${BLUE}$(msg 'server_config_desc')${NC}"
    echo ""

    # 监听地址
    echo -e "${YELLOW}$(msg 'server_host_hint')${NC}"
    read -p "$(msg 'server_host_prompt') [${SERVER_HOST}]: " input_host < /dev/tty
    if [ -n "$input_host" ]; then
        SERVER_HOST="$input_host"
    fi

    echo ""

    # 监听端口（循环直到输入合法或采用默认值）
    echo -e "${YELLOW}$(msg 'server_port_hint')${NC}"
    while true; do
        read -p "$(msg 'server_port_prompt') [${SERVER_PORT}]: " input_port < /dev/tty
        if [ -z "$input_port" ]; then
            # 留空则使用默认端口
            break
        elif validate_port "$input_port"; then
            SERVER_PORT="$input_port"
            break
        else
            print_error "$(msg 'invalid_port')"
        fi
    done

    echo ""
    print_info "$(msg 'server_config_summary'): ${SERVER_HOST}:${SERVER_PORT}"
    echo ""
}

# 检查是否以 root 权限运行
check_root() {
    # 使用 'id -u' 而非 $EUID，兼容性更好
    # 当脚本通过管道传给 bash 时，$EUID 可能不可靠
    if [ "$(id -u)" -ne 0 ]; then
        print_error "$(msg 'run_as_root')"
        exit 1
    fi
}

# 检测操作系统和 CPU 架构，归一化为 release 命名使用的标识
detect_platform() {
    OS=$(uname -s | tr '[:upper:]' '[:lower:]')
    ARCH=$(uname -m)

    case "$ARCH" in
        x86_64)
            ARCH="amd64"
            ;;
        aarch64|arm64)
            ARCH="arm64"
            ;;
        *)
            print_error "$(msg 'unsupported_arch'): $ARCH"
            exit 1
            ;;
    esac

    case "$OS" in
        linux)
            OS="linux"
            ;;
        darwin)
            OS="darwin"
            ;;
        *)
            print_error "$(msg 'unsupported_os'): $OS"
            exit 1
            ;;
    esac

    print_info "$(msg 'detected_platform'): ${OS}_${ARCH}"
}

# 检查所需依赖命令是否存在（curl、tar）
check_dependencies() {
    local missing=()

    if ! command -v curl &> /dev/null; then
        missing+=("curl")
    fi

    if ! command -v tar &> /dev/null; then
        missing+=("tar")
    fi

    if [ ${#missing[@]} -gt 0 ]; then
        print_error "$(msg 'missing_deps'): ${missing[*]}"
        print_info "$(msg 'install_deps_first')"
        exit 1
    fi
}

# 通过 GitHub API 获取最新 release 版本号
get_latest_version() {
    print_info "$(msg 'fetching_version')"
    LATEST_VERSION=$(curl -s --connect-timeout 10 --max-time 30 "https://api.github.com/repos/${GITHUB_REPO}/releases/latest" 2>/dev/null | grep '"tag_name"' | sed -E 's/.*"([^"]+)".*/\1/')

    if [ -z "$LATEST_VERSION" ]; then
        print_error "$(msg 'failed_get_version')"
        print_info "Please check your network connection or try again later."
        exit 1
    fi

    print_info "$(msg 'latest_version'): $LATEST_VERSION"
}

# 列出可用版本（最近 20 个 release）
list_versions() {
    print_info "$(msg 'fetching_versions')"

    local versions
    versions=$(curl -s --connect-timeout 10 --max-time 30 "https://api.github.com/repos/${GITHUB_REPO}/releases" 2>/dev/null | grep '"tag_name"' | sed -E 's/.*"([^"]+)".*/\1/' | head -20)

    if [ -z "$versions" ]; then
        print_error "$(msg 'failed_get_version')"
        print_info "Please check your network connection or try again later."
        exit 1
    fi

    echo ""
    echo "$(msg 'available_versions'):"
    echo "----------------------------------------"
    echo "$versions" | while read -r version; do
        echo "  $version"
    done
    echo "----------------------------------------"
    echo ""
}

# 校验指定版本是否存在，并返回归一化后的版本号
validate_version() {
    local version="$1"

    # 版本号不能为空
    if [ -z "$version" ]; then
        print_error "$(msg 'opt_version')" >&2
        exit 1
    fi

    # 确保版本号以 'v' 开头
    if [[ ! "$version" =~ ^v ]]; then
        version="v$version"
    fi

    print_info "$(msg 'validating_version') $version" >&2

    # 通过 GitHub API 检查该 release 是否存在（取 HTTP 状态码）
    local http_code
    http_code=$(curl -s -o /dev/null -w "%{http_code}" --connect-timeout 10 --max-time 30 "https://api.github.com/repos/${GITHUB_REPO}/releases/tags/${version}" 2>/dev/null)

    # 检查网络错误（响应为空或非数字）
    if [ -z "$http_code" ] || ! [[ "$http_code" =~ ^[0-9]+$ ]]; then
        print_error "Network error: Failed to connect to GitHub API" >&2
        exit 1
    fi

    if [ "$http_code" != "200" ]; then
        print_error "$(msg 'version_not_found'): $version" >&2
        echo "" >&2
        list_versions >&2
        exit 1
    fi

    # 将归一化后的版本号输出到 stdout 供调用方使用
    echo "$version"
}

# 获取当前已安装的版本号
get_current_version() {
    if [ -f "$INSTALL_DIR/sub2api" ]; then
        # 使用 grep -E 提取版本号，兼容 macOS 和 Linux
        "$INSTALL_DIR/sub2api" --version 2>/dev/null | grep -oE 'v?[0-9]+\.[0-9]+\.[0-9]+' | head -1 || echo "unknown"
    else
        echo "not_installed"
    fi
}

# 下载并解压发行包，校验后安装二进制
download_and_extract() {
    local version_num=${LATEST_VERSION#v}
    local archive_name="sub2api_${version_num}_${OS}_${ARCH}.tar.gz"
    local download_url="https://github.com/${GITHUB_REPO}/releases/download/${LATEST_VERSION}/${archive_name}"
    local checksum_url="https://github.com/${GITHUB_REPO}/releases/download/${LATEST_VERSION}/checksums.txt"

    print_info "$(msg 'downloading') ${archive_name}..."

    # 创建临时目录，并在脚本退出时自动清理
    TEMP_DIR=$(mktemp -d)
    trap "rm -rf $TEMP_DIR" EXIT

    # 下载发行包
    if ! curl -sL "$download_url" -o "$TEMP_DIR/$archive_name"; then
        print_error "$(msg 'download_failed')"
        exit 1
    fi

    # 下载校验文件并校验 sha256
    print_info "$(msg 'verifying_checksum')"
    if curl -sL "$checksum_url" -o "$TEMP_DIR/checksums.txt" 2>/dev/null; then
        local expected_checksum=$(grep "$archive_name" "$TEMP_DIR/checksums.txt" | awk '{print $1}')
        local actual_checksum=$(sha256sum "$TEMP_DIR/$archive_name" | awk '{print $1}')

        if [ "$expected_checksum" != "$actual_checksum" ]; then
            print_error "$(msg 'checksum_failed')"
            print_error "Expected: $expected_checksum"
            print_error "Actual: $actual_checksum"
            exit 1
        fi
        print_success "$(msg 'checksum_verified')"
    else
        print_warning "$(msg 'checksum_not_found')"
    fi

    # 解压
    print_info "$(msg 'extracting')"
    tar -xzf "$TEMP_DIR/$archive_name" -C "$TEMP_DIR"

    # 创建安装目录
    mkdir -p "$INSTALL_DIR"

    # 复制二进制并赋予可执行权限
    cp "$TEMP_DIR/sub2api" "$INSTALL_DIR/sub2api"
    chmod +x "$INSTALL_DIR/sub2api"

    # 如果发行包中包含 deploy 目录，一并复制过去
    if [ -d "$TEMP_DIR/deploy" ]; then
        cp -r "$TEMP_DIR/deploy/"* "$INSTALL_DIR/" 2>/dev/null || true
    fi

    print_success "$(msg 'binary_installed') $INSTALL_DIR/sub2api"
}

# 创建运行服务所需的系统用户
create_user() {
    if id "$SERVICE_USER" &>/dev/null; then
        print_info "$(msg 'user_exists'): $SERVICE_USER"
        # 修复：确保已存在的用户使用 /bin/sh，使 sudo 能正常工作
        # 旧版本使用 /bin/false，会导致 sudo 无法执行
        local current_shell
        current_shell=$(getent passwd "$SERVICE_USER" 2>/dev/null | cut -d: -f7)
        if [ "$current_shell" = "/bin/false" ] || [ "$current_shell" = "/sbin/nologin" ]; then
            print_info "Fixing user shell for sudo compatibility..."
            if usermod -s /bin/sh "$SERVICE_USER" 2>/dev/null; then
                print_success "User shell updated to /bin/sh"
            else
                print_warning "Failed to update user shell. Service restart may not work automatically."
                print_warning "Manual fix: sudo usermod -s /bin/sh $SERVICE_USER"
            fi
        fi
    else
        print_info "$(msg 'creating_user') $SERVICE_USER..."
        # 使用 /bin/sh 而非 /bin/false，以允许 sudo 执行
        # 该用户仍无法交互登录（未设置密码）
        useradd -r -s /bin/sh -d "$INSTALL_DIR" "$SERVICE_USER"
        print_success "$(msg 'user_created')"
    fi
}

# 设置目录及权限
setup_directories() {
    print_info "$(msg 'setting_up_dirs')"

    # 创建所需目录
    mkdir -p "$INSTALL_DIR"
    mkdir -p "$INSTALL_DIR/data"
    mkdir -p "$CONFIG_DIR"

    # 设置目录归属
    chown -R "$SERVICE_USER:$SERVICE_USER" "$INSTALL_DIR"
    chown -R "$SERVICE_USER:$SERVICE_USER" "$CONFIG_DIR"

    print_success "$(msg 'dirs_configured')"
}

# 安装 systemd 服务
install_service() {
    print_info "$(msg 'installing_service')"

    # 使用配置好的监听地址和端口生成服务单元文件
    # 注意：以下全部引用顶部变量，避免与服务器上原版 sub2api 的服务单元冲突
    cat > "/etc/systemd/system/${SERVICE_NAME}.service" << EOF
[Unit]
Description=Sub2API (mint) - AI API Gateway Platform
Documentation=https://github.com/yuebai-blast/sub2api
After=network.target postgresql.service redis.service
Wants=postgresql.service redis.service

[Service]
Type=simple
User=${SERVICE_USER}
Group=${SERVICE_USER}
WorkingDirectory=${INSTALL_DIR}
ExecStart=${INSTALL_DIR}/sub2api
Restart=always
RestartSec=5
StandardOutput=journal
StandardError=journal
SyslogIdentifier=${SERVICE_NAME}

# 安全加固
NoNewPrivileges=true
ProtectSystem=strict
ProtectHome=true
PrivateTmp=true
ReadWritePaths=${INSTALL_DIR}

# 环境变量 - 服务器配置
Environment=GIN_MODE=release
Environment=SERVER_HOST=${SERVER_HOST}
Environment=SERVER_PORT=${SERVER_PORT}

[Install]
WantedBy=multi-user.target
EOF

    # 重新加载 systemd 配置使新服务生效
    systemctl daemon-reload

    print_success "$(msg 'service_installed')"
}

# 为设置向导做准备（无需生成配置文件，向导会自行创建）
prepare_for_setup() {
    print_success "$(msg 'ready_for_setup')"
}

# 获取公网 IP 地址
get_public_ip() {
    print_info "$(msg 'getting_public_ip')"

    # 尝试从 ipinfo.io 获取公网 IP
    local response
    response=$(curl -s --connect-timeout 5 --max-time 10 "https://ipinfo.io/json" 2>/dev/null)

    if [ -n "$response" ]; then
        # 用 grep 和 sed 从 JSON 响应中提取 IP（无需依赖 jq）
        PUBLIC_IP=$(echo "$response" | grep -o '"ip": *"[^"]*"' | sed 's/"ip": *"\([^"]*\)"/\1/')
        if [ -n "$PUBLIC_IP" ]; then
            print_success "Public IP: $PUBLIC_IP"
            return 0
        fi
    fi

    # 获取失败时回退到本机内网 IP
    print_warning "$(msg 'public_ip_failed')"
    PUBLIC_IP=$(hostname -I 2>/dev/null | awk '{print $1}' || echo "YOUR_SERVER_IP")
    return 1
}

# 启动服务
start_service() {
    print_info "$(msg 'starting_service')"

    if systemctl start "${SERVICE_NAME}"; then
        print_success "$(msg 'service_started')"
        return 0
    else
        print_error "$(msg 'service_start_failed')"
        print_info "sudo journalctl -u ${SERVICE_NAME} -n 50"
        return 1
    fi
}

# 设置服务开机自启
enable_autostart() {
    print_info "$(msg 'enabling_autostart')"

    if systemctl enable "${SERVICE_NAME}" 2>/dev/null; then
        print_success "$(msg 'autostart_enabled')"
        return 0
    else
        print_warning "Failed to enable auto-start"
        return 1
    fi
}

# 打印安装完成信息
print_completion() {
    # 使用 get_public_ip() 设置的 PUBLIC_IP
    # 确定用于展示的访问地址
    local display_host="${PUBLIC_IP:-YOUR_SERVER_IP}"
    if [ "$SERVER_HOST" = "127.0.0.1" ]; then
        display_host="127.0.0.1"
    fi

    echo ""
    echo "=============================================="
    print_success "$(msg 'install_complete')"
    echo "=============================================="
    echo ""
    echo "$(msg 'install_dir'): $INSTALL_DIR"
    echo "$(msg 'server_config_summary'): ${SERVER_HOST}:${SERVER_PORT}"
    echo ""
    echo "=============================================="
    echo "  $(msg 'step4_open_wizard')"
    echo "=============================================="
    echo ""
    print_info "     http://${display_host}:${SERVER_PORT}"
    echo ""
    echo "     $(msg 'wizard_guide')"
    echo "     - $(msg 'wizard_db')"
    echo "     - $(msg 'wizard_redis')"
    echo "     - $(msg 'wizard_admin')"
    echo ""
    echo "=============================================="
    echo "  $(msg 'useful_commands')"
    echo "=============================================="
    echo ""
    echo "  $(msg 'cmd_status'):   sudo systemctl status ${SERVICE_NAME}"
    echo "  $(msg 'cmd_logs'):     sudo journalctl -u ${SERVICE_NAME} -f"
    echo "  $(msg 'cmd_restart'):  sudo systemctl restart ${SERVICE_NAME}"
    echo "  $(msg 'cmd_stop'):     sudo systemctl stop ${SERVICE_NAME}"
    echo ""
    echo "=============================================="
}

# 升级到最新版本
upgrade() {
    # 检查 Sub2API 是否已安装
    if [ ! -f "$INSTALL_DIR/sub2api" ]; then
        print_error "$(msg 'not_installed')"
        print_info "$(msg 'fresh_install_hint'): $0 install"
        exit 1
    fi

    print_info "$(msg 'upgrading')"

    # 获取当前版本
    CURRENT_VERSION=$("$INSTALL_DIR/sub2api" --version 2>/dev/null | grep -oE 'v?[0-9]+\.[0-9]+\.[0-9]+' || echo "unknown")
    print_info "$(msg 'current_version'): $CURRENT_VERSION"

    # 停止服务
    if systemctl is-active --quiet "${SERVICE_NAME}"; then
        print_info "$(msg 'stopping_service')"
        systemctl stop "${SERVICE_NAME}"
    fi

    # 备份当前二进制
    cp "$INSTALL_DIR/sub2api" "$INSTALL_DIR/sub2api.backup"
    print_info "$(msg 'backup_created'): $INSTALL_DIR/sub2api.backup"

    # 下载并安装新版本
    get_latest_version
    download_and_extract

    # 设置权限
    chown "$SERVICE_USER:$SERVICE_USER" "$INSTALL_DIR/sub2api"

    # 启动服务
    print_info "$(msg 'starting_service')"
    systemctl start "${SERVICE_NAME}"

    print_success "$(msg 'upgrade_complete')"
}

# 安装指定版本（用于升级或回退）
# 前提：Sub2API 必须已经安装
install_version() {
    local target_version="$1"

    # 检查 Sub2API 是否已安装
    if [ ! -f "$INSTALL_DIR/sub2api" ]; then
        print_error "$(msg 'not_installed')"
        print_info "$(msg 'fresh_install_hint'): $0 install -v $target_version"
        exit 1
    fi

    # 校验并归一化版本号
    target_version=$(validate_version "$target_version")

    print_info "$(msg 'installing_version'): $target_version"

    # 获取当前版本
    local current_version
    current_version=$(get_current_version)
    print_info "$(msg 'current_version'): $current_version"

    # 若目标版本与当前版本相同则无需操作
    if [ "$current_version" = "$target_version" ] || [ "$current_version" = "${target_version#v}" ]; then
        print_warning "$(msg 'same_version')"
        exit 0
    fi

    # 如服务正在运行则先停止
    if systemctl is-active --quiet "${SERVICE_NAME}"; then
        print_info "$(msg 'stopping_service')"
        systemctl stop "${SERVICE_NAME}"
    fi

    # 备份当前二进制（便于异常时恢复）
    if [ -f "$INSTALL_DIR/sub2api" ]; then
        local backup_name
        if [ "$current_version" != "unknown" ] && [ "$current_version" != "not_installed" ]; then
            backup_name="sub2api.backup.${current_version}"
        else
            backup_name="sub2api.backup.$(date +%Y%m%d%H%M%S)"
        fi
        cp "$INSTALL_DIR/sub2api" "$INSTALL_DIR/$backup_name"
        print_info "$(msg 'backup_created'): $INSTALL_DIR/$backup_name"
    fi

    # 将 LATEST_VERSION 设为目标版本，供 download_and_extract 使用
    LATEST_VERSION="$target_version"

    # 下载并安装
    download_and_extract

    # 设置权限
    chown "$SERVICE_USER:$SERVICE_USER" "$INSTALL_DIR/sub2api"

    # 启动服务
    print_info "$(msg 'starting_service')"
    if systemctl start "${SERVICE_NAME}"; then
        print_success "$(msg 'service_started')"
    else
        print_error "$(msg 'service_start_failed')"
        print_info "sudo journalctl -u ${SERVICE_NAME} -n 50"
    fi

    # 打印完成信息
    local new_version
    new_version=$(get_current_version)
    echo ""
    echo "=============================================="
    print_success "$(msg 'install_version_complete')"
    echo "=============================================="
    echo ""
    echo "  $(msg 'current_version'): $new_version"
    echo ""
}

# 卸载 Sub2API
uninstall() {
    print_warning "$(msg 'uninstall_confirm')"

    # 非交互模式（管道运行）下必须带 -y 参数才能确认卸载
    if ! is_interactive; then
        if [ "${FORCE_YES:-}" != "true" ]; then
            print_error "Non-interactive mode detected. Use 'curl ... | bash -s -- uninstall -y' to confirm."
            exit 1
        fi
    else
        read -p "$(msg 'are_you_sure') " -n 1 -r < /dev/tty
        echo
        if [[ ! $REPLY =~ ^[Yy]$ ]]; then
            print_info "$(msg 'uninstall_cancelled')"
            exit 0
        fi
    fi

    print_info "$(msg 'stopping_service')"
    systemctl stop "${SERVICE_NAME}" 2>/dev/null || true
    systemctl disable "${SERVICE_NAME}" 2>/dev/null || true

    print_info "$(msg 'removing_files')"
    rm -f "/etc/systemd/system/${SERVICE_NAME}.service"
    systemctl daemon-reload

    print_info "$(msg 'removing_install_dir')"
    rm -rf "$INSTALL_DIR"

    print_info "$(msg 'removing_user')"
    userdel "$SERVICE_USER" 2>/dev/null || true

    # 删除安装锁文件(.installed)，使重新安装时能再次进入设置向导
    print_info "$(msg 'removing_install_lock')"
    rm -f "$CONFIG_DIR/.installed" 2>/dev/null || true
    rm -f "$INSTALL_DIR/.installed" 2>/dev/null || true
    print_success "$(msg 'install_lock_removed')"

    # 询问是否删除配置目录（仅交互模式下询问）
    local remove_config=false
    if [ "${PURGE:-}" = "true" ]; then
        remove_config=true
    elif is_interactive; then
        read -p "$(msg 'purge_prompt')" -n 1 -r < /dev/tty
        echo
        if [[ $REPLY =~ ^[Yy]$ ]]; then
            remove_config=true
        fi
    fi

    if [ "$remove_config" = true ]; then
        print_info "$(msg 'removing_config_dir')"
        rm -rf "$CONFIG_DIR"
    else
        print_warning "$(msg 'config_not_removed'): $CONFIG_DIR"
        print_warning "$(msg 'remove_manually')"
    fi

    print_success "$(msg 'uninstall_complete')"
}

# 主入口
main() {
    # 先解析可选参数（flag）
    local target_version=""
    local positional_args=()

    while [[ $# -gt 0 ]]; do
        case "$1" in
            -y|--yes)
                FORCE_YES="true"
                shift
                ;;
            --purge)
                PURGE="true"
                shift
                ;;
            -v|--version)
                if [ -n "${2:-}" ] && [[ ! "$2" =~ ^- ]]; then
                    target_version="$2"
                    shift 2
                else
                    echo "Error: --version requires a version argument"
                    exit 1
                fi
                ;;
            --version=*)
                target_version="${1#*=}"
                if [ -z "$target_version" ]; then
                    echo "Error: --version requires a version argument"
                    exit 1
                fi
                shift
                ;;
            *)
                positional_args+=("$1")
                shift
                ;;
        esac
    done

    # 还原位置参数（命令名等）
    set -- "${positional_args[@]}"

    # 先选择界面语言
    select_language

    echo ""
    echo "=============================================="
    echo "       $(msg 'install_title')"
    echo "=============================================="
    echo ""

    # 解析子命令
    case "${1:-}" in
        upgrade|update)
            check_root
            detect_platform
            check_dependencies
            if [ -n "$target_version" ]; then
                # 升级到指定版本
                install_version "$target_version"
            else
                # 升级到最新版本
                upgrade
            fi
            exit 0
            ;;
        install)
            # 安装（可附带指定版本）
            check_root
            detect_platform
            check_dependencies
            if [ -n "$target_version" ]; then
                # 安装指定版本（全新安装或回退）
                if [ -f "$INSTALL_DIR/sub2api" ]; then
                    # 已安装则视为版本切换
                    install_version "$target_version"
                else
                    # 全新安装指定版本
                    configure_server
                    LATEST_VERSION=$(validate_version "$target_version")
                    download_and_extract
                    create_user
                    setup_directories
                    install_service
                    prepare_for_setup
                    get_public_ip
                    start_service
                    enable_autostart
                    print_completion
                fi
            else
                # 全新安装最新版本
                configure_server
                get_latest_version
                download_and_extract
                create_user
                setup_directories
                install_service
                prepare_for_setup
                get_public_ip
                start_service
                enable_autostart
                print_completion
            fi
            exit 0
            ;;
        rollback)
            # 回退到指定版本（等价于带版本号的 install）
            if [ -z "$target_version" ] && [ -n "${2:-}" ]; then
                target_version="$2"
            fi
            if [ -z "$target_version" ]; then
                print_error "$(msg 'opt_version')"
                echo ""
                echo "Usage: $0 rollback -v <version>"
                echo "       $0 rollback <version>"
                echo ""
                list_versions
                exit 1
            fi
            check_root
            detect_platform
            check_dependencies
            install_version "$target_version"
            exit 0
            ;;
        list-versions|versions)
            list_versions
            exit 0
            ;;
        uninstall|remove)
            check_root
            uninstall
            exit 0
            ;;
        --help|-h)
            echo "$(msg 'usage'): $0 [command] [options]"
            echo ""
            echo "Commands:"
            echo "  $(msg 'cmd_none')            $(msg 'cmd_install')"
            echo "  install              $(msg 'cmd_install')"
            echo "  upgrade              $(msg 'cmd_upgrade')"
            echo "  rollback <version>   $(msg 'cmd_install_version')"
            echo "  list-versions        $(msg 'cmd_list_versions')"
            echo "  uninstall            $(msg 'cmd_uninstall')"
            echo ""
            echo "Options:"
            echo "  -v, --version <ver>  $(msg 'opt_version')"
            echo "  -y, --yes            Skip confirmation prompts (for uninstall)"
            echo ""
            echo "Examples:"
            echo "  $0                        # Install latest version"
            echo "  $0 install -v v0.1.0      # Install specific version"
            echo "  $0 upgrade                # Upgrade to latest"
            echo "  $0 upgrade -v v0.2.0      # Upgrade to specific version"
            echo "  $0 rollback v0.1.0        # Rollback to v0.1.0"
            echo "  $0 list-versions          # List available versions"
            echo ""
            exit 0
            ;;
    esac

    # 默认行为：全新安装最新版本
    check_root
    detect_platform
    check_dependencies

    if [ -n "$target_version" ]; then
        # 安装指定版本
        if [ -f "$INSTALL_DIR/sub2api" ]; then
            install_version "$target_version"
        else
            configure_server
            LATEST_VERSION=$(validate_version "$target_version")
            download_and_extract
            create_user
            setup_directories
            install_service
            prepare_for_setup
            get_public_ip
            start_service
            enable_autostart
            print_completion
        fi
    else
        # 安装最新版本
        configure_server
        get_latest_version
        download_and_extract
        create_user
        setup_directories
        install_service
        prepare_for_setup
        get_public_ip
        start_service
        enable_autostart
        print_completion
    fi
}

main "$@"
