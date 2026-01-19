# 💚 Longevity Tracker - 寿命追踪应用

一个基于科学数据（体检指标、生活习惯）动态预测寿命的每日打卡应用。包含体检报告分析、生物年龄计算、每日健康任务打卡及长寿趋势可视化。界面采用高级感简洁设计，支持AI分析。

## ✨ 核心功能

- 🧬 **生物年龄计算** - 基于9个关键生物标志物的PhenoAge模型
- 📊 **每日打卡系统** - 记录运动、睡眠、饮食等生活方式数据
- 📈 **实时寿命预测** - 动态调整预期寿命，查看改善潜力
- 🤖 **AI健康建议** - 基于科学研究的个性化健康建议
- 📄 **体检报告上传** - 支持PDF/图片，AI自动解析提取生物标志物
- 👤 **个人档案管理** - 完整的信息管理和健康数据摘要

## 🚀 快速开始

### 前置要求

- Node.js 18+ 
- pnpm (推荐) 或 npm
- MySQL 数据库

### 安装步骤

```bash
# 1. 克隆仓库
git clone https://github.com/Kmrnnnn/longevity-tracker.git
cd longevity-tracker

# 2. 安装依赖
pnpm install

# 3. 配置环境变量
cp .env.example .env  # 编辑 .env 文件，填入配置

# 4. 初始化数据库
pnpm db:push

# 5. 启动开发服务器
pnpm dev
```

访问 http://localhost:3000 开始使用！

详细的安装和配置说明请查看 [QUICK_START.md](./QUICK_START.md)

## 📸 功能预览

### 主页
- 寿命倒计时显示（年/月/日/时/分/秒）
- 健康评分卡片
- 预期寿命、生物年龄展示
- 改善建议列表

### 个人档案
- 个人信息管理
- 健康数据摘要
- 体检报告上传和解析
- 报告历史查看

### 每日打卡
- 运动时间记录
- 睡眠质量追踪
- 饮食评分
- 压力水平评估

### 数据看板
- 生物年龄变化曲线
- 健康评分趋势图
- 生活方式因素分析

## 🛠 技术栈

- **前端**: React 19, TypeScript, Tailwind CSS 4, tRPC, Framer Motion
- **后端**: Express 4, tRPC 11, Drizzle ORM
- **数据库**: MySQL
- **AI/LLM**: Manus LLM API (Gemini 2.5 Flash)
- **存储**: Manus Storage API (S3兼容)
- **测试**: Vitest

## 📁 项目结构

```
longevity-tracker/
├── client/              # React前端应用
│   ├── src/
│   │   ├── pages/      # 页面组件
│   │   ├── components/ # UI组件
│   │   └── ...
├── server/              # Express后端服务
│   ├── routers/        # API路由
│   ├── calculations/   # 计算引擎
│   └── ...
├── drizzle/            # 数据库schema和迁移
├── shared/             # 共享类型和常量
└── ...
```

## 🔬 科学依据

- **生物年龄计算**: 基于PhenoAge模型（Levine et al., 2018）
- **生活方式影响**: 基于Harvard T.H. Chan公共卫生学院研究
- **寿命预测**: 综合生物标志物和生活方式因素

## 📝 开发

```bash
# 开发模式
pnpm dev

# 构建生产版本
pnpm build

# 运行测试
pnpm test

# 类型检查
pnpm check

# 格式化代码
pnpm format
```

## 📚 文档

- [快速开始指南](./QUICK_START.md) - 安装和配置说明
- [预览说明](./PREVIEW.md) - 完整功能预览指南
- [架构文档](./ARCHITECTURE.md) - 系统架构详细说明
- [待办事项](./todo.md) - 功能开发进度

## 📄 许可证

MIT License

## 🤝 贡献

欢迎提交 Issue 和 Pull Request！

---

**使用 Manus 构建** | 让您的健康数据更有价值 💚
