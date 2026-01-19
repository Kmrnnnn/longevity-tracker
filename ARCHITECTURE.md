# Longevity Tracker - 应用架构设计文档

## 1. 系统架构概览

Longevity Tracker 是一个基于科学数据的寿命预测与健康管理应用，采用 tRPC + React + Express + MySQL 的全栈架构。系统核心包含三个计算引擎：**生物年龄计算引擎**、**生活方式影响计算引擎** 和 **个性化建议生成引擎**。

## 2. 数据模型设计

### 2.1 核心表结构

```sql
-- 用户基本信息（扩展）
users
  - id: 主键
  - openId: OAuth标识
  - name: 用户名
  - email: 邮箱
  - dateOfBirth: 出生日期（用于计算年龄）
  - gender: 性别（影响生物年龄计算）
  - createdAt, updatedAt, lastSignedIn

-- 体检报告数据
health_reports
  - id: 主键
  - userId: 用户ID
  - reportDate: 体检日期
  - reportType: 报告类型（manual/uploaded）
  - sourceUrl: 上传的报告文件URL（S3）
  - extractedAt: 数据提取时间
  - createdAt, updatedAt

-- 生物标志物数据（与体检报告关联）
biomarkers
  - id: 主键
  - healthReportId: 体检报告ID
  - userId: 用户ID
  - glucose: 血糖（mg/dL）
  - totalCholesterol: 总胆固醇（mg/dL）
  - ldlCholesterol: LDL胆固醇（mg/dL）
  - hdlCholesterol: HDL胆固醇（mg/dL）
  - triglycerides: 甘油三酯（mg/dL）
  - systolicBP: 收缩压（mmHg）
  - diastolicBP: 舒张压（mmHg）
  - creatinine: 肌酐（mg/dL）
  - albumin: 白蛋白（g/dL）
  - lymphocytePercent: 淋巴细胞百分比（%）
  - cReactiveProtein: C反应蛋白（mg/L）
  - redCellDistributionWidth: 红细胞分布宽度（%）
  - meanPlateletVolume: 平均血小板体积（fL）
  - whiteBloodCellCount: 白细胞计数（K/uL）
  - biologicalAge: 计算得出的生物年龄（年）
  - biologicalAgeAccuracy: 计算准确度评分（0-100）
  - createdAt, updatedAt

-- 每日打卡记录
daily_checkins
  - id: 主键
  - userId: 用户ID
  - checkInDate: 打卡日期
  - exerciseMinutes: 运动时间（分钟）
  - exerciseIntensity: 运动强度（light/moderate/vigorous）
  - sleepHours: 睡眠时间（小时）
  - sleepQuality: 睡眠质量（1-10）
  - dietQuality: 饮食质量评分（1-10）
  - dietDescription: 饮食描述
  - stressLevel: 压力水平（1-10）
  - smokingCigarettes: 吸烟支数（0-40+）
  - alcoholDrinks: 饮酒杯数（0-30+）
  - weight: 体重（kg）
  - mood: 心情评分（1-10）
  - notes: 备注
  - createdAt, updatedAt

-- 生物年龄历史（每次体检后更新）
biological_age_history
  - id: 主键
  - userId: 用户ID
  - recordDate: 记录日期
  - biologicalAge: 生物年龄（年）
  - chronologicalAge: 年龄差异（生物年龄 - 实际年龄）
  - healthScore: 健康评分（0-100）
  - estimatedLifeExpectancy: 预期寿命（年）
  - createdAt

-- 寿命预测历史（每日打卡后更新）
lifespan_predictions
  - id: 主键
  - userId: 用户ID
  - predictionDate: 预测日期
  - baseLifeExpectancy: 基础预期寿命（年）
  - lifestyleAdjustment: 生活方式调整（年）
  - biomarkerAdjustment: 生物标志物调整（年）
  - estimatedLifeExpectancy: 总预期寿命（年）
  - remainingYears: 剩余寿命（年）
  - healthScore: 当前健康评分（0-100）
  - createdAt

-- 健康建议记录
health_recommendations
  - id: 主键
  - userId: 用户ID
  - recommendationDate: 建议日期
  - category: 建议类别（exercise/diet/sleep/stress/smoking/alcohol）
  - title: 建议标题
  - description: 建议描述
  - expectedBenefit: 预期寿命增加（年）
  - priority: 优先级（high/medium/low）
  - status: 状态（pending/accepted/completed）
  - createdAt, updatedAt
```

## 3. 计算引擎设计

### 3.1 生物年龄计算引擎（PhenoAge模型）

**基础公式：**
```
生物年龄 = 141.50 + (0.00368 × 年龄) - (0.465 × 白蛋白) 
         + (0.0619 × 淋巴细胞百分比) + (0.0917 × 肌酐)
         + (0.00720 × 葡萄糖) + (0.0305 × C反应蛋白)
         + (0.0268 × 红细胞分布宽度) + (0.00573 × 平均血小板体积)
         + (0.0468 × 白细胞计数) + (0.00163 × 收缩压)
```

**实现逻辑：**
- 接收用户体检数据（9个关键生物标志物）
- 应用PhenoAge加权公式计算生物年龄
- 与实际年龄对比，得出"生物年龄差异"（正值表示老化加速，负值表示抗衰老）
- 计算准确度评分（基于数据完整性和质量）

### 3.2 生活方式影响计算引擎

**基础寿命预期：** 根据性别和地区设定基础预期寿命（男性：76年，女性：81年）

**生活方式因素权重（基于Harvard研究）：**

| 因素 | 最优状态 | 影响范围 | 计算方法 |
|------|--------|--------|--------|
| 运动 | ≥30分钟/天 | +2.5年 | 每周运动时间 × 0.05年/小时 |
| 睡眠 | 7-8小时/天 | +1.5年 | 偏离7.5小时越远，扣分越多 |
| 饮食 | 健康饮食评分 | +3年 | (饮食评分-5) × 0.3年/分 |
| 压力 | 低压力（<3/10） | +1.5年 | (10-压力水平) × 0.15年/分 |
| 吸烟 | 不吸烟 | +8年 | 每支烟 -0.15年 |
| 饮酒 | 适度（<2杯/天） | +1年 | 过量饮酒 -0.2年/杯 |
| 体重 | BMI 18.5-24.9 | +2年 | BMI偏离正常范围扣分 |
| 社交 | 良好社交 | +1.5年 | 基于用户反馈 |

**总寿命预期计算：**
```
预期寿命 = 基础寿命 + Σ(各因素调整值) + 生物年龄调整
```

**生物年龄调整：**
```
生物年龄调整 = (生物年龄 - 实际年龄) × 0.5
// 生物年龄每老化1岁，预期寿命减少0.5年
```

### 3.3 个性化建议生成引擎

**建议优先级算法：**
1. 识别当前最大的寿命风险因素（影响最大的负向因素）
2. 计算改善潜力（该因素改善到最优状态可增加的寿命）
3. 生成可行性建议（基于用户当前状态）
4. 量化效果预测（改善后可增加的寿命年数）

**示例建议生成：**
```
如果用户运动不足（<150分钟/周）：
建议：增加每周运动时间至150分钟（中等强度）
预期效果：可增加 1.2 年寿命
可行性：基于用户年龄和当前运动水平评估
```

## 4. 核心功能流程

### 4.1 体检数据导入流程

```
用户上传体检报告 
  ↓
LLM提取关键生物标志物
  ↓
验证数据完整性和合理性
  ↓
计算生物年龄（PhenoAge）
  ↓
更新生物年龄历史
  ↓
生成初始健康评分和建议
```

### 4.2 每日打卡流程

```
用户完成每日打卡
  ↓
记录运动、睡眠、饮食、压力等数据
  ↓
计算当日生活方式评分
  ↓
更新预期寿命预测
  ↓
生成实时寿命倒计时
  ↓
识别改善机会并生成建议
```

### 4.3 寿命预测更新流程

```
每日或每周触发预测更新
  ↓
聚合最近30天的打卡数据
  ↓
计算平均生活方式评分
  ↓
结合最新生物年龄数据
  ↓
计算新的预期寿命
  ↓
与历史数据对比，识别趋势
  ↓
更新用户仪表板
```

## 5. 前端架构

### 5.1 页面结构

```
App
├── Dashboard（主仪表板）
│   ├── 寿命倒计时显示
│   ├── 健康评分卡片
│   ├── 关键指标概览
│   └── 快速打卡入口
├── HealthData（健康数据管理）
│   ├── 体检报告管理
│   ├── 生物标志物输入
│   └── 生物年龄历史
├── DailyCheckin（每日打卡）
│   ├── 打卡表单
│   ├── 打卡历史
│   └── 趋势分析
├── Analytics（数据可视化）
│   ├── 生物年龄曲线
│   ├── 健康评分趋势
│   ├── 因素权重分析
│   └── 改善潜力分析
├── Recommendations（AI建议）
│   ├── 个性化建议列表
│   ├── 建议详情和效果预测
│   └── 建议执行跟踪
└── Profile（个人资料）
    ├── 基本信息
    ├── 健康目标
    └── 设置
```

### 5.2 关键组件

- **LifespanCountdown**: 实时寿命倒计时显示（年/月/日/时/分/秒）
- **HealthScoreCard**: 健康评分卡片，展示当前评分和趋势
- **BiomarkerForm**: 生物标志物输入表单
- **DailyCheckinForm**: 每日打卡表单
- **AnalyticsCharts**: 各类数据可视化图表
- **RecommendationCard**: 健康建议卡片

## 6. 后端API设计

### 6.1 tRPC Procedures

**健康数据相关：**
- `health.getBiomarkers(userId)` - 获取最新生物标志物
- `health.createBiomarkers(data)` - 创建生物标志物记录
- `health.getHealthReports(userId)` - 获取体检报告列表
- `health.uploadHealthReport(file)` - 上传体检报告

**打卡相关：**
- `checkin.create(data)` - 创建每日打卡
- `checkin.getHistory(userId, days)` - 获取打卡历史
- `checkin.getStats(userId, period)` - 获取打卡统计

**预测相关：**
- `prediction.getLatest(userId)` - 获取最新寿命预测
- `prediction.getHistory(userId)` - 获取预测历史
- `prediction.calculate(userId)` - 手动触发预测计算

**建议相关：**
- `recommendations.getList(userId)` - 获取建议列表
- `recommendations.generate(userId)` - 生成AI建议
- `recommendations.updateStatus(id, status)` - 更新建议状态

## 7. 技术栈

| 层 | 技术 | 用途 |
|----|------|------|
| 前端框架 | React 19 | UI构建 |
| 样式 | Tailwind CSS 4 | 响应式设计 |
| 状态管理 | tRPC + React Query | 服务器状态管理 |
| 后端框架 | Express 4 | HTTP服务器 |
| RPC框架 | tRPC 11 | 类型安全的API |
| 数据库 | MySQL | 数据持久化 |
| ORM | Drizzle ORM | 数据库操作 |
| 图表库 | Recharts | 数据可视化 |
| 动画库 | Framer Motion | UI动画 |
| LLM集成 | Manus LLM API | 报告解析和建议生成 |
| 文件存储 | AWS S3 | 体检报告存储 |

## 8. 计算准确性考虑

### 8.1 生物年龄计算准确性

- PhenoAge模型在大规模人群中的预测准确度约为 ±5-8 年
- 数据完整性影响准确度：缺少任何关键生物标志物会降低准确度
- 定期更新（每3-6个月）可以更好地跟踪生物年龄变化

### 8.2 生活方式影响的科学依据

- 基于 Harvard T.H. Chan 公共卫生学院的大规模队列研究
- 8个健康习惯可延长 21-24 年寿命（Li et al., 2018）
- 每个因素的权重基于多项随机对照试验的荟萃分析

### 8.3 个性化建议的有效性

- 建议基于用户的具体数据和风险因素
- 优先级排序确保用户关注最有影响力的改善
- 定期更新建议以反映用户进度

## 9. 隐私和安全考虑

- 所有健康数据加密存储
- 体检报告存储在S3，仅用户可访问
- LLM处理报告时不保存原始文件
- 遵守HIPAA和GDPR合规要求
- 用户可随时删除个人数据
