# Longevity Tracker - 预览说明

## 🚀 如何启动预览

### 前置要求

1. **安装 Node.js** (推荐 v18+)
   - 下载地址: https://nodejs.org/
   - 或使用 nvm: `nvm install 18`

2. **安装 pnpm** (项目使用的包管理器)
   ```bash
   npm install -g pnpm
   # 或
   corepack enable
   corepack prepare pnpm@10.4.1 --activate
   ```

### 启动步骤

1. **安装依赖**
   ```bash
   pnpm install
   ```

2. **配置环境变量**
   
   创建 `.env` 文件，包含以下必需配置：
   ```env
   # 数据库连接
   DATABASE_URL=mysql://user:password@localhost:3306/dbname
   
   # Manus API配置（用于LLM和存储）
   BUILT_IN_FORGE_API_URL=https://forge.manus.im
   BUILT_IN_FORGE_API_KEY=your_api_key_here
   
   # OAuth配置
   OAUTH_CLIENT_ID=your_client_id
   OAUTH_CLIENT_SECRET=your_client_secret
   ```

3. **初始化数据库**
   ```bash
   pnpm db:push
   ```

4. **启动开发服务器**
   ```bash
   pnpm dev
   ```
   
   服务器将在 http://localhost:3000 启动

5. **访问应用**
   - 打开浏览器访问: http://localhost:3000
   - 首次访问需要登录（OAuth）

## 📸 功能预览

### 主要功能模块

1. **主页/仪表板**
   - 寿命倒计时显示
   - 健康评分卡片
   - 关键指标概览
   - 快速打卡入口

2. **个人档案页面** (`/profile`)
   - 个人信息管理
   - 健康数据摘要
   - 体检报告上传
   - 报告历史查看

3. **每日打卡**
   - 运动、睡眠、饮食记录
   - 压力水平评估
   - 体重跟踪

4. **数据看板**
   - 生物年龄曲线
   - 健康评分趋势
   - 因素权重分析

5. **体检报告上传**
   - 支持PDF和图片格式
   - AI自动解析生物标志物
   - 自动计算生物年龄

## 🎨 UI预览亮点

- **现代化设计**: 使用Tailwind CSS 4，简洁美观
- **响应式布局**: 完美支持移动端和桌面端
- **流畅动画**: Framer Motion动画效果
- **暗色模式支持**: 可切换主题（如启用）

## 🔧 构建生产版本

如果需要构建生产版本：

```bash
# 构建前端和后端
pnpm build

# 启动生产服务器
pnpm start
```

## 📝 开发说明

### 项目结构

```
longevity-tracker-main/
├── client/              # React前端
│   ├── src/
│   │   ├── pages/      # 页面组件
│   │   ├── components/ # UI组件
│   │   └── ...
├── server/              # Express后端
│   ├── routers/        # API路由
│   ├── calculations/   # 计算引擎
│   └── ...
├── drizzle/            # 数据库schema和迁移
└── shared/             # 共享类型和常量
```

### 主要技术栈

- **前端**: React 19, TypeScript, Tailwind CSS 4, tRPC
- **后端**: Express 4, tRPC 11, Drizzle ORM
- **数据库**: MySQL
- **AI/LLM**: Manus LLM API (Gemini 2.5 Flash)
- **存储**: Manus Storage API (S3兼容)

## ⚠️ 注意事项

1. **环境变量**: 确保正确配置所有必需的环境变量
2. **数据库**: 需要先创建MySQL数据库并配置连接
3. **API密钥**: Manus API密钥是必需的（用于LLM解析和存储）
4. **OAuth**: 需要配置OAuth提供商的客户端ID和密钥

## 🐛 故障排除

### 端口占用
如果3000端口被占用，服务器会自动查找可用端口。

### 依赖安装失败
```bash
# 清理缓存
pnpm store prune
rm -rf node_modules
pnpm install
```

### 数据库连接问题
检查 `.env` 文件中的 `DATABASE_URL` 配置是否正确。

---

更多详细信息请查看 [ARCHITECTURE.md](./ARCHITECTURE.md)