# 🚀 快速开始指南

## 一键启动预览（需要先安装环境）

### 步骤 1: 安装 Node.js

**macOS (推荐使用 Homebrew):**
```bash
brew install node
```

**或使用 nvm:**
```bash
curl -o- https://raw.githubusercontent.com/nvm-sh/nvm/v0.39.0/install.sh | bash
nvm install 18
nvm use 18
```

**验证安装:**
```bash
node --version  # 应该显示 v18.x 或更高
```

### 步骤 2: 安装 pnpm

```bash
npm install -g pnpm
# 或使用 corepack (Node.js 16.10+)
corepack enable
corepack prepare pnpm@10.4.1 --activate
```

**验证安装:**
```bash
pnpm --version  # 应该显示 10.x
```

### 步骤 3: 安装依赖

```bash
cd /Users/mac/Downloads/longevity-tracker-main
pnpm install
```

### 步骤 4: 配置环境变量

创建 `.env` 文件（复制 `.env.example` 如果存在，或创建新文件）:

```bash
# 数据库配置
DATABASE_URL=mysql://username:password@localhost:3306/longevity_tracker

# Manus API配置（必需：用于LLM解析和文件存储）
BUILT_IN_FORGE_API_URL=https://forge.manus.im
BUILT_IN_FORGE_API_KEY=your_manus_api_key_here

# OAuth配置（必需：用于用户登录）
OAUTH_CLIENT_ID=your_oauth_client_id
OAUTH_CLIENT_SECRET=your_oauth_client_secret
```

### 步骤 5: 初始化数据库

```bash
# 确保MySQL数据库已创建
# 然后运行迁移
pnpm db:push
```

### 步骤 6: 启动开发服务器

```bash
pnpm dev
```

服务器将在 **http://localhost:3000** 启动（或自动选择可用端口）

### 步骤 7: 访问应用

在浏览器中打开: **http://localhost:3000**

## 📱 功能预览

### 主页功能

1. **未登录状态**
   - 英雄区域：展示应用介绍
   - 功能卡片：生物年龄计算、每日打卡、实时预测、AI建议
   - 登录按钮

2. **登录后**
   - **概览标签页**:
     - 寿命倒计时（年/月/日/时/分/秒）
     - 预期寿命、生物年龄、健康评分卡片
     - 改善建议列表
   
   - **每日打卡标签页**:
     - 打卡表单
     - 记录运动、睡眠、饮食、压力等
   
   - **数据看板标签页**:
     - 健康评分趋势图
     - 生物年龄曲线
     - 因素权重分析

### 个人档案页面 (`/profile`)

- 个人信息管理（姓名、邮箱、出生日期、性别）
- 健康数据摘要（最新生物年龄、关键指标）
- **体检报告上传** ⭐ (新功能)
  - 上传PDF或图片
  - AI自动解析提取生物标志物
  - 自动计算生物年龄
- 体检报告历史列表

## 🎨 界面特色

- **现代化设计**: 使用Tailwind CSS 4，渐变背景，卡片式布局
- **响应式**: 完美适配移动端和桌面端
- **流畅动画**: Framer Motion 动画效果
- **暗色/亮色主题**: 支持主题切换（默认亮色）

## ⚡ 常用命令

```bash
# 开发模式
pnpm dev

# 构建生产版本
pnpm build

# 启动生产服务器
pnpm start

# 运行测试
pnpm test

# 类型检查
pnpm check

# 格式化代码
pnpm format

# 数据库迁移
pnpm db:push
```

## 🐛 常见问题

### Q: 端口被占用怎么办？
A: 服务器会自动查找可用端口，会在终端显示实际使用的端口。

### Q: 数据库连接失败？
A: 检查 `.env` 中的 `DATABASE_URL` 是否正确，确保MySQL服务已启动。

### Q: LLM解析失败？
A: 确保 `.env` 中配置了正确的 `BUILT_IN_FORGE_API_KEY`。

### Q: OAuth登录失败？
A: 检查 `.env` 中的 OAuth 配置是否正确。

## 📚 更多信息

- [架构文档](./ARCHITECTURE.md) - 详细了解系统架构
- [预览说明](./PREVIEW.md) - 完整预览指南
- [待办事项](./todo.md) - 功能开发进度

## 🆘 需要帮助？

如果遇到问题，请检查：
1. Node.js 版本是否为 18+
2. 所有环境变量是否已正确配置
3. 数据库是否已创建并运行
4. 依赖是否正确安装

---

**享受您的健康追踪之旅！** 💪