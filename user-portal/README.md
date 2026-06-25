# user-portal（Mint 用户前端）

面向普通用户（非管理员）的全新前端，采用 **Mint** 设计风格。**独立工程**，与仓库内 `frontend/` 互不依赖；**只调用现有后端 `/api/v1` 接口，不改任何后端代码**。

当前里程碑（M1）：**Dashboard 页面** + 最小登录 + 布局壳；使用记录 / API 密钥为占位页。

## 技术栈

Vite + Vue3(`<script setup>`) + TypeScript + Pinia + Vue Router + Tailwind + Chart.js。工具链经 **mise** 锁定（node 20.18.1 / pnpm 9.15.9）。

## 本地开发

前提：后端已在 `http://localhost:8080` 运行（`cd backend && go run ./cmd/server/`）。

工具链与命令统一收口到**仓库根** `mise.toml`（子目录不再有 `mise.toml`），以下命令均在**仓库根**执行：

```bash
mise run install-user-portal   # 安装依赖
mise run user-portal           # 启动 dev server（http://localhost:5174，/api 代理到 8080）
```

后端地址可用环境变量覆盖：`VITE_BACKEND_ORIGIN=http://其它地址 mise run user-portal`。

打开 `http://localhost:5174`，用真实账号登录后即进入 Dashboard，各区块展示真实数据。

## 常用命令（均在仓库根执行）

| 命令 | 说明 |
|---|---|
| `mise run install-user-portal` | 安装/更新依赖 |
| `mise run user-portal` | 开发服务器（端口 5174） |
| `mise run user-portal-build` | 类型检查 + 生产构建到 `dist/` |
| `mise run lint-user-portal` | ESLint 检查 |
| `mise run test-user-portal` | vue-tsc 类型检查 |

## 设计说明

- 设计稿来源：`Mint Dashboard C`（薄荷主调 / 标准强度 / 衬线数字）。
- 主题色值 token 化在 `src/styles/theme.css`，深浅色用 `<html>.dark` 切换并持久化到 `localStorage.theme`。
- 鉴权与统一返回体（`{code,data,message}`）契约复刻自 `frontend/`：token 存 `localStorage.auth_token`，401 自动用 `refresh_token` 续期。

## 目录

```
src/
  api/         client.ts(鉴权/拦截器) auth.ts user.ts usage.ts types.ts
  stores/      auth.ts(含余额) theme.ts(深浅色)
  router/      index.ts(守卫：无 token 跳登录)
  composables/ useDashboard.ts(数据加载)
  layouts/     PortalLayout.vue(顶栏+用户菜单)
  components/dashboard/  HeroBalance KpiRow ModelDistribution VendorDistribution TrendChart LifetimeStrip QuickActions
  views/       DashboardView LoginView UsageView(占位) KeysView(占位)
```
