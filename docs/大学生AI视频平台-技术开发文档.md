# 大学生AI视频制作一体化平台 — 技术开发文档

> **文档版本**: v1.0  
> **更新日期**: 2026-04-08  
> **目标读者**: 技术合伙人 / 全栈开发  
> **文档性质**: MVP技术方案，指导第一版开发

---

## 一、产品概述

### 1.1 一句话定位

面向大学生的一体化AI视频制作+学习平台：**付费课程教会你做，平台工具帮你做，作品集帮你找工作**。

### 1.2 核心用户路径

```
学课程 → 用提示词模板 → 在平台生成AI视频 → 用反推助手分析优秀视频 → 产出作品 → 生成作品集 → 分发到抖音/视频号 → 找工作/接单
```

### 1.3 产品对标

| 对标平台 | 借鉴点 | 我们的差异 |
|----------|--------|-----------|
| FlowPix (flowpix.club) | 提示词+工作流驱动的生成模式 | 简化为卡片式工作流，降低大学生上手门槛 |
| 刺猬星球 Super-i | 课程分类结构、学习/商业双模式 | 改为学习/求职双模式，聚焦大学生就业 |
| Jellyfish (GitHub开源) | React+TS+FastAPI架构、多模型管理、提示词模板 | 砍掉剧本分镜时间线，保留核心生成+模板能力 |
| LibLib (liblib.tv) | AI模型聚合平台UI参考 | 无文学剧本，更简单易用 |

### 1.4 功能模块总览与优先级

| 优先级 | 模块 | 说明 | MVP是否包含 |
|--------|------|------|------------|
| P0 | 用户系统 | 注册登录、个人中心、学习进度 | ✅ |
| P0 | 付费课程系统 | 录播课程、分类浏览、学习/求职双模式 | ✅ |
| P0 | AI视频生成工作台 | 卡片式工作流模板、多模型聚合、积分消耗 | ✅ |
| P0 | 提示词模板库 | 分类搜索、一键填入生成台、管理后台维护 | ✅ |
| P0 | 视频反推助手 | 贴视频链接→AI输出可用提示词 | ✅ |
| P0 | 积分支付系统 | 充值积分、消耗记录、对接微信/支付宝 | ✅ |
| P1 | 作品广场/社区 | 上传作品、互动、优秀作品展示 | ❌ 第二期 |
| P1 | 作品集页面 | 一键生成可分享链接/PDF | ❌ 第二期 |
| P1 | 视频分发 | 一键分发到抖音/视频号/B站 | ❌ 第二期 |
| P1 | 推广分销 | 二级返佣、推广链接 | ❌ 第二期 |
| P2 | AI对话助手 | 平台内嵌学习辅助聊天 | ❌ 第三期 |

---

## 二、系统架构

### 2.1 整体架构图

```
┌─────────────────────────────────────────────────────────┐
│                    前端 (Web / H5)                        │
│              React 18 + TypeScript + Vite                │
│              Ant Design + Tailwind CSS                   │
└────────────────────────┬────────────────────────────────┘
                         │ HTTPS / WebSocket
                         ▼
┌─────────────────────────────────────────────────────────┐
│                    Nginx 反向代理                         │
│              SSL终止 / 静态资源 / 负载均衡                  │
└────────────────────────┬────────────────────────────────┘
                         │
                         ▼
┌─────────────────────────────────────────────────────────┐
│                 后端 API (FastAPI / Python)               │
│                                                         │
│  ┌──────────┐ ┌──────────┐ ┌──────────┐ ┌──────────┐   │
│  │ 用户模块  │ │ 课程模块  │ │ 生成模块  │ │ 支付模块  │   │
│  └──────────┘ └──────────┘ └──────────┘ └──────────┘   │
│  ┌──────────┐ ┌──────────┐ ┌──────────┐ ┌──────────┐   │
│  │提示词模块 │ │反推助手   │ │作品集模块 │ │分销模块   │   │
│  └──────────┘ └──────────┘ └──────────┘ └──────────┘   │
│                                                         │
│  ┌─────────────────────────────────────────────────┐    │
│  │          AI Gateway（统一大模型调度层）             │    │
│  │  Seedance 2.0 API / Happy Horse API / PixVerse V6 API    │    │
│  │  Gemini API / Qwen-VL API / DeepSeek API        │    │
│  └─────────────────────────────────────────────────┘    │
└────────────────────────┬────────────────────────────────┘
                         │
          ┌──────────────┼──────────────┐
          ▼              ▼              ▼
   ┌────────────┐ ┌────────────┐ ┌────────────┐
   │ PostgreSQL │ │   Redis    │ │  阿里云OSS  │
   │  主数据库   │ │ 缓存/队列  │ │ /VOD点播   │
   └────────────┘ └────────────┘ └────────────┘
```

### 2.2 技术栈选型

| 层级 | 技术选型 | 理由 |
|------|---------|------|
| 前端框架 | React 18 + TypeScript + Vite | 参考Jellyfish，生态成熟，TS保证代码质量 |
| UI组件 | Ant Design 5.x + Tailwind CSS | Ant Design组件丰富（表格/表单/上传），Tailwind做定制样式 |
| 状态管理 | Zustand | 轻量，比Redux简单，适合中型项目 |
| 后端框架 | FastAPI (Python 3.11+) | 参考Jellyfish，异步性能好，自动生成OpenAPI文档，AI生态库丰富 |
| 数据库 | PostgreSQL 16 | 关系型主库，JSONB支持灵活存储提示词/模板数据 |
| 缓存/队列 | Redis 7 | 会话缓存、积分防并发、AI任务队列 |
| 任务队列 | Celery + Redis | 异步处理AI生成任务（视频生成耗时长，必须异步） |
| 视频存储 | 阿里云OSS | 用户生成的视频、图片素材 |
| 课程视频 | 阿里云VOD点播 | 自带转码/防盗链/播放器SDK/DRM加密 |
| 对象存储 | 阿里云OSS | 通用文件存储 |
| 部署 | Docker + Docker Compose | MVP阶段单机部署，后期可迁移K8s |
| CI/CD | GitHub Actions | 自动构建/测试/部署 |

### 2.3 参考Jellyfish的开源代码复用

Jellyfish项目（Apache-2.0协议，可商用）可直接复用的部分：

| 复用模块 | Jellyfish路径 | 我们的用法 |
|----------|-------------|-----------|
| 前端脚手架 | `front/` (React+TS+Vite+AntD) | 直接fork作为前端基础 |
| 后端框架 | `backend/` (FastAPI) | 复用项目结构、中间件、错误处理 |
| OpenAPI代码生成 | `front/src/services/generated/` | 复用前后端类型同步方案 |
| 多模型管理 | 模型管理模块 | 复用多供应商API管理、模型分类、连接测试 |
| 提示词模板 | 提示词模板库 | 复用模板CRUD、分类、搜索 |
| 资产管理 | 资产管理系统 | 简化后用于用户生成的视频/图片管理 |

**需要砍掉的Jellyfish模块**：剧本输入、智能分镜、章节拍摄工作台、时间线剪辑编辑器、Agent工作流编排（过重）。

---

## 三、核心模块详细设计

### 3.1 用户系统

#### 功能描述
- 手机号+验证码注册登录（大学生主流）
- 微信扫码登录（H5/小程序场景）
- 个人中心：头像、昵称、学校/专业（可选填）、学习进度、积分余额、我的作品、我的课程
- 角色：普通用户 / VIP会员 / 管理员

#### 数据模型

```sql
CREATE TABLE users (
    id BIGSERIAL PRIMARY KEY,
    phone VARCHAR(20) UNIQUE,
    wechat_openid VARCHAR(128) UNIQUE,
    nickname VARCHAR(50),
    avatar_url TEXT,
    school VARCHAR(100),        -- 学校（可选）
    major VARCHAR(100),         -- 专业（可选）
    role VARCHAR(20) DEFAULT 'user',  -- user / vip / admin
    credits INT DEFAULT 0,      -- 积分余额
    referral_code VARCHAR(20) UNIQUE,  -- 推广码
    referred_by BIGINT REFERENCES users(id),
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);
```

#### 技术方案
- 认证：JWT Token（access_token 2h + refresh_token 7d）
- 短信验证码：阿里云短信服务（或腾讯云），Redis存验证码（5分钟过期）
- 微信登录：微信开放平台OAuth 2.0
- 密码：不设密码，纯手机号/微信登录（大学生最习惯的方式）

#### 关键API

```
POST /api/auth/sms/send          # 发送验证码
POST /api/auth/sms/login         # 验证码登录/注册
POST /api/auth/wechat/login      # 微信登录
GET  /api/user/me                # 获取当前用户信息
PUT  /api/user/me                # 更新个人信息
GET  /api/user/me/credits        # 积分余额和明细
GET  /api/user/me/courses        # 我的课程进度
GET  /api/user/me/works           # 我的作品列表
```

---

### 3.2 付费课程系统

#### 功能描述

参考刺猬星球Super-i的课程结构，做以下调整：

**双模式切换**：
- **学习模式**：按技能分类（提示词工程、AI绘画、AI视频生成、后期剪辑、短视频运营）
- **求职模式**：按作品场景分类（校园宣传片、求职Vlog、品牌短片、产品展示、个人IP视频）

**课程层级**：
```
课程分类 (Category)
  └── 课程 (Course)
        └── 章节 (Chapter)
              └── 课时 (Lesson) — 单个视频
```

**免费/付费逻辑**：
- 每个课程前1-2节免费试看
- 付费方式：单课购买（积分）或 VIP会员解锁全部
- 完课后可获得平台证书（PDF）

#### 数据模型

```sql
-- 课程分类
CREATE TABLE course_categories (
    id SERIAL PRIMARY KEY,
    name VARCHAR(50) NOT NULL,       -- "AI视频生成"、"校园宣传片"
    mode VARCHAR(20) NOT NULL,       -- 'learning' / 'career'
    icon_url TEXT,
    sort_order INT DEFAULT 0
);

-- 课程
CREATE TABLE courses (
    id BIGSERIAL PRIMARY KEY,
    category_id INT REFERENCES course_categories(id),
    title VARCHAR(200) NOT NULL,
    description TEXT,
    cover_url TEXT,                   -- 封面图
    teacher_name VARCHAR(50),
    difficulty VARCHAR(20),          -- beginner / intermediate / advanced
    total_duration INT DEFAULT 0,    -- 总时长（秒）
    price_credits INT DEFAULT 0,     -- 单课价格（积分），0=免费
    is_vip_only BOOLEAN DEFAULT FALSE,
    status VARCHAR(20) DEFAULT 'draft', -- draft / published / archived
    sort_order INT DEFAULT 0,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 章节
CREATE TABLE chapters (
    id BIGSERIAL PRIMARY KEY,
    course_id BIGINT REFERENCES courses(id),
    title VARCHAR(200),
    sort_order INT DEFAULT 0
);

-- 课时
CREATE TABLE lessons (
    id BIGSERIAL PRIMARY KEY,
    chapter_id BIGINT REFERENCES chapters(id),
    course_id BIGINT REFERENCES courses(id),
    title VARCHAR(200),
    description TEXT,
    video_id VARCHAR(200),           -- 阿里云VOD视频ID
    video_url TEXT,                   -- 播放地址（通过VOD SDK动态获取）
    duration INT DEFAULT 0,          -- 时长（秒）
    is_free BOOLEAN DEFAULT FALSE,   -- 是否免费试看
    sort_order INT DEFAULT 0
);

-- 学习进度
CREATE TABLE user_course_progress (
    id BIGSERIAL PRIMARY KEY,
    user_id BIGINT REFERENCES users(id),
    course_id BIGINT REFERENCES courses(id),
    lesson_id BIGINT REFERENCES lessons(id),
    progress_pct SMALLINT DEFAULT 0,  -- 0-100
    completed BOOLEAN DEFAULT FALSE,
    last_position INT DEFAULT 0,      -- 上次播放位置（秒）
    updated_at TIMESTAMPTZ DEFAULT NOW(),
    UNIQUE(user_id, lesson_id)
);

-- 课程购买记录
CREATE TABLE user_course_purchases (
    id BIGSERIAL PRIMARY KEY,
    user_id BIGINT REFERENCES users(id),
    course_id BIGINT REFERENCES courses(id),
    credits_paid INT,
    purchased_at TIMESTAMPTZ DEFAULT NOW(),
    UNIQUE(user_id, course_id)
);
```

#### 视频播放技术方案

采用**阿里云视频点播（VOD）**：
- 上传：管理后台通过阿里云VOD SDK上传课程视频，自动转码为多码率（360p/720p/1080p）
- 防盗链：开启Referer防盗链 + URL鉴权（签名过期机制）
- 播放器：前端使用阿里云播放器SDK（Aliplayer），支持自适应码率、断点续播、进度上报
- DRM：如果需要更强保护，可开启阿里云DRM加密（按量付费）

```javascript
// 前端播放器集成示例
import Aliplayer from 'aliplayer-react';

<Aliplayer
  source={videoPlayAuth}  // 后端返回的播放凭证
  width="100%"
  height="500px"
  autoplay={false}
  onTimeUpdate={(e) => reportProgress(e.target.currentTime)}
/>
```

#### 关键API

```
GET  /api/courses/categories             # 获取分类（支持mode筛选）
GET  /api/courses                        # 课程列表（分页、筛选、搜索）
GET  /api/courses/{id}                   # 课程详情（含章节/课时列表）
GET  /api/courses/{id}/lessons/{lid}/play # 获取播放凭证（鉴权）
POST /api/courses/{id}/purchase          # 购买课程（扣积分）
POST /api/courses/lessons/{lid}/progress # 上报学习进度
GET  /api/user/me/learning-stats         # 学习统计（完课数、总时长等）
```

---

### 3.3 AI视频生成工作台

#### 功能描述

这是平台的核心工具模块。参考FlowPix的"提示词+工作流"理念，但**大幅简化为卡片式操作**：

**用户操作流程**：
1. 进入"AI工作台"页面，看到工作流模板卡片网格（如"30秒校园Vlog"、"产品展示视频"、"电影风格短片"）
2. 选择一个模板卡片 → 进入生成页面
3. 页面展示：预填好的提示词（可修改）、参数面板（模型选择、时长、分辨率、风格）、参考图上传区
4. 点击"生成" → 扣积分 → 进入异步队列 → 完成后通知用户
5. 生成结果页：预览视频、下载、保存到"我的作品"、重新生成

**支持的生成类型**：
- 文生视频（Text-to-Video）
- 图生视频（Image-to-Video）
- 视频风格转换（Video-to-Video，P1阶段）

#### 数据模型

```sql
-- 工作流模板（管理员维护）
CREATE TABLE workflow_templates (
    id BIGSERIAL PRIMARY KEY,
    title VARCHAR(200) NOT NULL,       -- "30秒校园Vlog"
    description TEXT,
    cover_url TEXT,
    category VARCHAR(50),              -- 'campus' / 'career' / 'brand' / 'product' / 'cinematic'
    gen_type VARCHAR(20),              -- 'text2video' / 'img2video'
    default_model VARCHAR(50),         -- 默认使用的模型key
    default_prompt TEXT,               -- 预填提示词
    default_negative_prompt TEXT,      -- 预填反向提示词
    default_params JSONB,              -- 默认参数（时长、分辨率、风格等）
    credits_cost INT DEFAULT 10,       -- 消耗积分
    is_active BOOLEAN DEFAULT TRUE,
    sort_order INT DEFAULT 0,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- AI模型配置（管理员维护）
CREATE TABLE ai_models (
    id SERIAL PRIMARY KEY,
    provider VARCHAR(50) NOT NULL,     -- 'seedance' / 'happyhorse' / 'pixverse'
    model_key VARCHAR(100) NOT NULL,   -- 'seedance-2.0' / 'happyhorse-1.0' / 'pixverse-v6'
    display_name VARCHAR(100),         -- 展示名称
    model_type VARCHAR(20),            -- 'text2video' / 'img2video' / 'text2img'
    api_endpoint TEXT,
    api_key_encrypted TEXT,            -- 加密存储的API Key
    pricing_per_call DECIMAL(10,4),    -- 每次调用成本（人民币）
    max_duration INT,                  -- 最大生成时长（秒）
    max_resolution VARCHAR(20),        -- '1080p' / '4k'
    is_active BOOLEAN DEFAULT TRUE,
    config JSONB                       -- 模型特有配置
);

-- 生成任务
CREATE TABLE generation_tasks (
    id BIGSERIAL PRIMARY KEY,
    user_id BIGINT REFERENCES users(id),
    template_id BIGINT REFERENCES workflow_templates(id),
    model_id INT REFERENCES ai_models(id),
    gen_type VARCHAR(20),              -- 'text2video' / 'img2video'
    prompt TEXT NOT NULL,
    negative_prompt TEXT,
    params JSONB,                      -- 时长、分辨率、风格、种子等
    reference_image_url TEXT,          -- 参考图（图生视频时）
    status VARCHAR(20) DEFAULT 'pending',  -- pending / processing / completed / failed
    credits_cost INT,
    result_video_url TEXT,             -- 生成结果视频地址
    result_thumbnail_url TEXT,
    error_message TEXT,
    provider_task_id VARCHAR(200),     -- 第三方API返回的任务ID
    created_at TIMESTAMPTZ DEFAULT NOW(),
    completed_at TIMESTAMPTZ
);
```

#### AI Gateway — 统一大模型调度层

这是技术核心。所有AI模型API调用通过统一网关层，做到：
- **统一接口**：前端只调一个`/api/generate`，Gateway根据model_id路由到对应Provider
- **异步处理**：视频生成耗时30秒~5分钟，必须用Celery异步任务
- **结果轮询/回调**：支持客户端轮询 + WebSocket推送
- **积分扣减**：生成前预扣积分，失败则退回
- **错误重试**：Provider超时/失败自动重试1次
- **成本监控**：记录每次调用的实际成本

```python
# backend/app/ai_gateway/base.py — Provider抽象基类

from abc import ABC, abstractmethod
from pydantic import BaseModel

class GenerateRequest(BaseModel):
    prompt: str
    negative_prompt: str | None = None
    gen_type: str  # text2video / img2video
    reference_image_url: str | None = None
    duration: int = 5  # 秒
    resolution: str = "1080p"
    style: str | None = None
    seed: int | None = None
    extra_params: dict | None = None

class GenerateResult(BaseModel):
    provider_task_id: str
    status: str  # processing / completed / failed
    video_url: str | None = None
    thumbnail_url: str | None = None
    error: str | None = None

class AIProvider(ABC):
    """所有AI模型Provider的基类"""
    
    @abstractmethod
    async def submit_task(self, request: GenerateRequest) -> str:
        """提交生成任务，返回provider_task_id"""
        pass
    
    @abstractmethod
    async def poll_result(self, provider_task_id: str) -> GenerateResult:
        """轮询任务结果"""
        pass


# backend/app/ai_gateway/seedance_provider.py — Seedance 2.0 实现示例

import httpx
from .base import AIProvider, GenerateRequest, GenerateResult

class SeedanceProvider(AIProvider):
    """Seedance 2.0 (字节跳动/即梦) — 通过第三方API如EvoLink/MuAPI/Segmind访问"""
    def __init__(self, api_key: str, api_endpoint: str = "https://api.evolink.ai"):
        self.api_key = api_key
        self.endpoint = api_endpoint
    
    async def submit_task(self, request: GenerateRequest) -> str:
        model = "seedance-2.0-text-to-video" if request.gen_type == "text2video" else "seedance-2.0-image-to-video"
        async with httpx.AsyncClient() as client:
            resp = await client.post(
                f"{self.endpoint}/v1/videos/generations",
                headers={"Authorization": f"Bearer {self.api_key}"},
                json={
                    "model": model,
                    "prompt": request.prompt,
                    "duration": request.duration,
                    "quality": "720p",
                    "aspect_ratio": "16:9",
                    "generate_audio": True,
                    **({"images_list": [request.reference_image_url]} if request.reference_image_url else {}),
                }
            )
            data = resp.json()
            return data["id"]  # task-unified-xxx
    
    async def poll_result(self, provider_task_id: str) -> GenerateResult:
        async with httpx.AsyncClient() as client:
            resp = await client.get(
                f"{self.endpoint}/v1/videos/generations/{provider_task_id}",
                headers={"Authorization": f"Bearer {self.api_key}"}
            )
            data = resp.json()
            status = "completed" if data["status"] == "completed" else ("failed" if data["status"] == "failed" else "processing")
            video_url = None
            if status == "completed" and data.get("result"):
                video_url = data["result"].get("video_url")
            return GenerateResult(
                provider_task_id=provider_task_id,
                status=status,
                video_url=video_url,
            )


class PixVerseProvider(AIProvider):
    """PixVerse V6 — 通过Segmind同步API或PixVerse Platform API访问"""
    def __init__(self, api_key: str, api_endpoint: str = "https://api.segmind.com"):
        self.api_key = api_key
        self.endpoint = api_endpoint
    
    async def submit_task(self, request: GenerateRequest) -> str:
        # PixVerse Segmind API是同步的，直接返回视频
        # 这里包装为异步任务模式
        async with httpx.AsyncClient(timeout=120) as client:
            resp = await client.post(
                f"{self.endpoint}/v1/pixverse-v6",
                headers={"x-api-key": self.api_key},
                json={
                    "prompt": request.prompt,
                    "negative_prompt": request.negative_prompt or "",
                    "duration": min(request.duration, 15),
                    "quality": "540p",  # 360p/540p/720p/1080p
                    "aspect_ratio": "16:9",
                    "motion_intensity": "medium",
                }
            )
            # Segmind返回二进制MP4，需上传OSS后返回URL
            video_bytes = resp.content
            oss_url = await upload_bytes_to_oss(video_bytes, f"pixverse_{request.prompt[:20]}.mp4")
            # 存到临时缓存供poll_result获取
            cache_key = f"pixverse_{hash(request.prompt)}"
            await cache_set(cache_key, oss_url, ttl=3600)
            return cache_key
    
    async def poll_result(self, provider_task_id: str) -> GenerateResult:
        # PixVerse同步API，提交即完成
        video_url = await cache_get(provider_task_id)
        return GenerateResult(
            provider_task_id=provider_task_id,
            status="completed" if video_url else "failed",
            video_url=video_url,
        )


# backend/app/ai_gateway/registry.py — Provider注册表

from .seedance_provider import SeedanceProvider, PixVerseProvider
# from .happyhorse_provider import HappyHorseProvider  # 开源模型，可自部署或通过API

PROVIDERS = {
    "seedance": SeedanceProvider,
    "pixverse": PixVerseProvider,
    # "happyhorse": HappyHorseProvider,  # Happy Horse 1.0开源，可自部署GPU推理或用第三方API
}

def get_provider(provider_name: str, config: dict) -> AIProvider:
    cls = PROVIDERS[provider_name]
    return cls(**config)
```

**Celery异步任务**：

```python
# backend/app/tasks/generation.py

from celery import Celery
from app.ai_gateway.registry import get_provider
from app.db import get_db, update_task_status
import asyncio, time

celery_app = Celery("tasks", broker="redis://localhost:6379/0")

@celery_app.task(bind=True, max_retries=1)
def process_generation(self, task_id: int):
    """异步处理视频生成任务"""
    db = get_db()
    task = db.get_task(task_id)
    model = db.get_model(task.model_id)
    
    # 1. 初始化Provider
    provider = get_provider(model.provider, {
        "api_key": decrypt(model.api_key_encrypted),
        "api_endpoint": model.api_endpoint,
    })
    
    # 2. 提交生成任务
    try:
        provider_task_id = asyncio.run(
            provider.submit_task(task.to_generate_request())
        )
        update_task_status(task_id, "processing", provider_task_id=provider_task_id)
    except Exception as e:
        update_task_status(task_id, "failed", error=str(e))
        refund_credits(task.user_id, task.credits_cost)  # 退回积分
        return
    
    # 3. 轮询结果（最长等待5分钟）
    for _ in range(60):  # 60次 * 5秒 = 5分钟
        time.sleep(5)
        result = asyncio.run(provider.poll_result(provider_task_id))
        if result.status == "completed":
            # 下载视频到OSS
            oss_url = upload_to_oss(result.video_url)
            update_task_status(task_id, "completed", 
                             result_video_url=oss_url,
                             result_thumbnail_url=result.thumbnail_url)
            # 通过WebSocket通知前端
            notify_user(task.user_id, task_id, "completed")
            return
        elif result.status == "failed":
            update_task_status(task_id, "failed", error=result.error)
            refund_credits(task.user_id, task.credits_cost)
            return
    
    # 超时
    update_task_status(task_id, "failed", error="Generation timeout")
    refund_credits(task.user_id, task.credits_cost)
```

#### 关键API

```
GET  /api/workbench/templates            # 获取工作流模板列表
GET  /api/workbench/templates/{id}       # 模板详情（含预填提示词和参数）
GET  /api/workbench/models               # 获取可用AI模型列表
POST /api/workbench/generate             # 提交生成任务（扣积分）
GET  /api/workbench/tasks/{id}           # 查询任务状态
GET  /api/workbench/tasks                # 用户的生成历史
WS   /ws/tasks                           # WebSocket推送任务完成通知
```

---

### 3.4 提示词模板库

#### 功能描述

这是平台的核心免费资源，也是吸引用户和提升生成质量的关键。

**功能**：
- 分类浏览：文生视频、图生视频、角色一致性、电影风格、校园场景、商业广告 等
- 搜索：关键词搜索 + 标签筛选
- 一键使用：点击"使用此模板"→ 自动跳转到AI工作台并填入提示词
- 收藏：用户可收藏模板
- 后台管理：管理员每周批量添加/更新模板

#### 数据模型

```sql
CREATE TABLE prompt_templates (
    id BIGSERIAL PRIMARY KEY,
    title VARCHAR(200) NOT NULL,
    description TEXT,
    category VARCHAR(50),              -- 'text2video' / 'img2video' / 'character' / 'cinematic' / 'campus' / 'commercial'
    tags TEXT[],                        -- ['校园', '青春', 'Vlog']
    prompt_text TEXT NOT NULL,          -- 正向提示词
    negative_prompt TEXT,              -- 反向提示词
    recommended_model VARCHAR(50),     -- 推荐使用的模型key
    recommended_params JSONB,          -- 推荐参数
    preview_image_url TEXT,            -- 效果预览图
    preview_video_url TEXT,            -- 效果预览视频
    use_count INT DEFAULT 0,           -- 使用次数
    is_featured BOOLEAN DEFAULT FALSE, -- 是否精选
    is_active BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE user_prompt_favorites (
    user_id BIGINT REFERENCES users(id),
    prompt_id BIGINT REFERENCES prompt_templates(id),
    created_at TIMESTAMPTZ DEFAULT NOW(),
    PRIMARY KEY(user_id, prompt_id)
);

-- 全文搜索索引
CREATE INDEX idx_prompt_search ON prompt_templates 
    USING GIN (to_tsvector('simple', title || ' ' || description || ' ' || prompt_text));
```

#### 关键API

```
GET  /api/prompts                        # 模板列表（分页、分类筛选、搜索）
GET  /api/prompts/{id}                   # 模板详情
POST /api/prompts/{id}/use               # "使用此模板"（记录use_count）
POST /api/prompts/{id}/favorite          # 收藏/取消收藏
GET  /api/user/me/prompt-favorites       # 我的收藏

# 管理后台
POST /api/admin/prompts                  # 批量创建模板
PUT  /api/admin/prompts/{id}             # 编辑模板
```

---

### 3.5 视频反推助手

#### 功能描述

用户粘贴一个视频链接（B站/抖音/YouTube/小红书），平台自动：
1. 提取视频内容（调用视频解析服务获取视频文件）
2. 调用多模态大模型（Gemini / Qwen-VL）分析视频
3. 输出：结构分析报告 + **可直接用于AI生成的提示词**（一键复制到生成台）

**用户操作流程**：
1. 粘贴视频链接
2. 选择分析模式："提取提示词"（默认）/ "结构分析" / "全面分析"
3. 等待10-30秒
4. 得到结果：AI生成提示词（可一键复制到工作台）+ 视频结构拆解

#### 技术方案

```
用户粘贴链接 → 后端视频解析（获取视频文件） → 抽取关键帧 → 调用多模态LLM分析 → 返回提示词
```

**视频链接解析**：使用开源库 `yt-dlp`（支持B站/抖音/YouTube/小红书等几百个平台）

```python
# backend/app/services/video_parser.py

import yt_dlp
import subprocess

async def download_video(url: str, output_path: str) -> dict:
    """从链接下载视频并提取元信息"""
    ydl_opts = {
        'outtmpl': output_path,
        'format': 'best[height<=720]',  # 限制分辨率控制大小
        'quiet': True,
    }
    with yt_dlp.YoutubeDL(ydl_opts) as ydl:
        info = ydl.extract_info(url, download=True)
        return {
            "title": info.get("title"),
            "duration": info.get("duration"),
            "description": info.get("description"),
        }

def extract_keyframes(video_path: str, output_dir: str, count: int = 8) -> list[str]:
    """用ffmpeg提取关键帧"""
    # 均匀抽取count张关键帧
    subprocess.run([
        "ffmpeg", "-i", video_path,
        "-vf", f"select=not(mod(n\\,{count}))",
        "-vsync", "vfn",
        "-frames:v", str(count),
        f"{output_dir}/frame_%03d.jpg"
    ])
    # 返回帧文件路径列表
    ...
```

**多模态LLM分析**：优先使用Gemini（免费额度高）或Qwen-VL

```python
# backend/app/services/video_analyzer.py

import google.generativeai as genai

PROMPT_EXTRACT_TEMPLATE = """
你是一个AI视频提示词专家。请分析以下视频截图，输出可直接用于AI视频生成工具（如Seedance 2.0、PixVerse）的提示词。

要求：
1. 输出一段英文提示词（prompt），描述视频的画面风格、镜头运动、场景、角色、光影、氛围
2. 输出一段反向提示词（negative_prompt）
3. 推荐的生成参数（时长、风格、镜头运动类型）

请用JSON格式输出：
{
  "prompt": "...",
  "negative_prompt": "...",
  "style": "...",
  "camera_movement": "...",
  "duration_suggestion": 5,
  "analysis": "对视频结构和节奏的简要分析（中文）"
}
"""

async def analyze_video(keyframe_paths: list[str], mode: str = "prompt") -> dict:
    """调用多模态LLM分析视频关键帧"""
    model = genai.GenerativeModel('gemini-2.0-flash')
    
    # 上传关键帧图片
    images = [genai.upload_file(path) for path in keyframe_paths]
    
    response = model.generate_content([PROMPT_EXTRACT_TEMPLATE] + images)
    
    # 解析JSON结果
    return parse_json_response(response.text)
```

#### 积分消耗
- 每次分析消耗少量积分（如2-5积分），或每日免费3次

#### 关键API

```
POST /api/reverse/analyze       # 提交视频链接分析
     body: { url: string, mode: "prompt" | "structure" | "full" }
     response: { task_id: string }

GET  /api/reverse/tasks/{id}    # 获取分析结果
```

---

### 3.6 积分支付系统

#### 功能描述

- 积分是平台的统一货币，1元 ≈ 10积分（可调）
- 充值：微信支付 / 支付宝
- 消耗：AI视频生成、课程购买、视频分析
- 积分明细：充值/消耗/退还 全记录
- 防并发：Redis + 数据库双重保障

#### 数据模型

```sql
-- 积分流水（不可修改，只可追加）
CREATE TABLE credit_transactions (
    id BIGSERIAL PRIMARY KEY,
    user_id BIGINT REFERENCES users(id),
    amount INT NOT NULL,               -- 正数=充值/退还，负数=消耗
    balance_after INT NOT NULL,        -- 变更后余额
    type VARCHAR(30),                  -- 'recharge' / 'consume_generate' / 'consume_course' / 'consume_analyze' / 'refund' / 'reward'
    reference_id BIGINT,              -- 关联的任务ID/课程ID/订单ID
    description TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 充值订单
CREATE TABLE recharge_orders (
    id BIGSERIAL PRIMARY KEY,
    user_id BIGINT REFERENCES users(id),
    order_no VARCHAR(64) UNIQUE,       -- 平台订单号
    amount_yuan DECIMAL(10,2),         -- 充值金额（元）
    credits INT,                       -- 获得积分
    pay_method VARCHAR(20),            -- 'wechat' / 'alipay'
    pay_status VARCHAR(20) DEFAULT 'pending', -- pending / paid / failed
    third_party_order_no VARCHAR(200), -- 微信/支付宝订单号
    paid_at TIMESTAMPTZ,
    created_at TIMESTAMPTZ DEFAULT NOW()
);
```

#### 积分操作核心逻辑（防并发）

```python
# backend/app/services/credits.py

import redis

redis_client = redis.Redis()

async def deduct_credits(user_id: int, amount: int, type: str, ref_id: int) -> bool:
    """
    扣减积分（原子操作）
    使用Redis锁 + 数据库事务双保障
    """
    lock_key = f"credits_lock:{user_id}"
    lock = redis_client.lock(lock_key, timeout=10)
    
    if not lock.acquire(blocking=True, blocking_timeout=5):
        raise Exception("系统繁忙，请稍后重试")
    
    try:
        async with db.transaction():
            user = await db.get_user_for_update(user_id)  # SELECT ... FOR UPDATE
            if user.credits < amount:
                raise InsufficientCreditsError("积分不足")
            
            new_balance = user.credits - amount
            await db.update_user_credits(user_id, new_balance)
            await db.insert_credit_transaction(
                user_id=user_id,
                amount=-amount,
                balance_after=new_balance,
                type=type,
                reference_id=ref_id,
            )
            return True
    finally:
        lock.release()
```

#### 支付接入

MVP阶段推荐使用**支付聚合服务**（如YunGouOS、Payjs），降低对接复杂度：
- 微信支付：H5支付 + JSAPI支付（微信内）+ Native支付（扫码）
- 支付宝：手机网站支付
- 回调处理：异步通知 → 验签 → 更新订单状态 → 充值积分

#### 关键API

```
GET  /api/credits/balance                # 积分余额
GET  /api/credits/transactions           # 积分明细（分页）
POST /api/credits/recharge               # 创建充值订单
     body: { amount_yuan: number, pay_method: "wechat" | "alipay" }
     response: { order_no: string, pay_url: string }
POST /api/credits/recharge/callback      # 支付回调（微信/支付宝通知）
```

---

## 四、第二期功能设计概要（P1）

### 4.1 作品广场/社区

- 用户上传生成的视频作品（标题、描述、标签）
- Feed流展示（按时间/热度排序）
- 点赞、评论
- 优秀作品管理员可置顶/推荐
- 数据模型：`works` + `work_likes` + `work_comments`

### 4.2 作品集页面

- 用户选择多个作品 → 平台自动生成一个可分享的网页（唯一URL）
- 页面包含：个人简介、作品视频列表、联系方式
- 支持导出为PDF
- 技术：SSR生成静态页面，存OSS，分配短链

### 4.3 视频分发

- P1.0：生成带平台水印的视频 + AI自动生成文案（标题/标签/描述）→ 用户手动发布
- P1.1：集成 `social-auto-upload` 开源方案（Playwright浏览器自动化），支持一键分发到抖音/视频号/B站/小红书
- 注意：浏览器自动化方案需要用户在平台上授权登录社交账号，有封号风险，需明确告知用户

### 4.4 推广分销

- 每个用户有唯一推广码/推广链接
- B推荐C注册并充值 → B获得C充值金额的10%返佣积分
- A推荐B，B推荐C → A获得C充值金额的5%（二级）
- 提现功能（积分→微信零钱，需企业付款到零钱资质）

---

## 五、前端页面结构

```
/                           # 首页（平台介绍+课程推荐+模板推荐）
/login                      # 登录/注册
/courses                    # 课程列表（学习模式/求职模式切换）
/courses/:id                # 课程详情
/courses/:id/learn/:lid     # 课程播放页
/workbench                  # AI视频生成工作台（模板卡片网格）
/workbench/generate/:tid    # 生成页面（选定模板后的操作界面）
/workbench/tasks            # 我的生成历史
/prompts                    # 提示词模板库
/reverse                    # 视频反推助手
/me                         # 个人中心
/me/credits                 # 积分管理/充值
/me/works                   # 我的作品
/me/favorites               # 我的收藏

# P1阶段
/community                  # 作品广场
/portfolio/:uid             # 作品集分享页（公开）

# 管理后台（独立子项目或路由）
/admin/courses              # 课程管理
/admin/prompts              # 提示词模板管理
/admin/models               # AI模型管理
/admin/templates            # 工作流模板管理
/admin/users                # 用户管理
/admin/orders               # 订单/积分管理
```

---

## 六、部署方案

### 6.1 MVP部署（单机，低成本起步）

```yaml
# docker-compose.yml
version: '3.8'
services:
  nginx:
    image: nginx:alpine
    ports:
      - "80:80"
      - "443:443"
    volumes:
      - ./nginx.conf:/etc/nginx/nginx.conf
      - ./certs:/etc/nginx/certs
    depends_on:
      - backend
      - frontend

  frontend:
    build: ./front
    # Vite构建后用Nginx托管静态文件

  backend:
    build: ./backend
    environment:
      - DATABASE_URL=postgresql://user:pass@postgres:5432/aiVideoLab
      - REDIS_URL=redis://redis:6379/0
      - ALIYUN_OSS_ACCESS_KEY=${ALIYUN_OSS_ACCESS_KEY}
      - ALIYUN_VOD_ACCESS_KEY=${ALIYUN_VOD_ACCESS_KEY}
    depends_on:
      - postgres
      - redis

  celery_worker:
    build: ./backend
    command: celery -A app.tasks worker -l info -c 4
    depends_on:
      - redis
      - postgres

  postgres:
    image: postgres:16
    environment:
      POSTGRES_DB: aiVideoLab
      POSTGRES_USER: user
      POSTGRES_PASSWORD: pass
    volumes:
      - pgdata:/var/lib/postgresql/data

  redis:
    image: redis:7-alpine
    volumes:
      - redisdata:/data

volumes:
  pgdata:
  redisdata:
```

### 6.2 服务器配置推荐

| 阶段 | 配置 | 预估月费 |
|------|------|---------|
| MVP（<1000用户） | 阿里云ECS 4核8G + 100G SSD | ~300元/月 |
| 早期增长 | 4核16G + RDS PostgreSQL + Redis | ~800元/月 |
| 规模化 | K8s集群 + 独立RDS + CDN | 按量 |

### 6.3 额外云服务成本

| 服务 | 用途 | 预估月费（MVP） |
|------|------|---------------|
| 阿里云VOD | 课程视频托管/转码/播放 | ~100元（按量） |
| 阿里云OSS | 用户视频/图片存储 | ~50元（按量） |
| 阿里云短信 | 验证码 | ~50元 |
| AI API（Seedance/PixVerse等） | 视频生成 | 按用户充值转嫁 |
| Gemini/Qwen API | 视频分析 | 免费额度为主，超出~100元 |
| 域名 + SSL | .com域名 | ~100元/年 |

**MVP总月成本预估：600-1000元/月**（不含AI生成API，因为由用户积分承担）

---

## 七、MVP开发计划

### 7.1 里程碑

| 周期 | 里程碑 | 交付物 |
|------|--------|--------|
| 第1-2周 | 项目初始化 | 前后端脚手架、数据库、Docker环境、CI/CD |
| 第3-4周 | 用户系统+课程系统 | 注册登录、课程CRUD、视频播放、学习进度 |
| 第5-6周 | AI工作台+提示词库 | 模板管理、生成任务流程、Seedance 2.0 + PixVerse API对接 |
| 第7周 | 视频反推助手 | 链接解析、关键帧提取、Gemini分析 |
| 第8周 | 积分支付 | 充值、扣减、微信支付对接 |
| 第9周 | 管理后台 | 课程/模板/模型/用户/订单管理 |
| 第10周 | 联调测试+部署 | 全链路测试、性能优化、上线 |

### 7.2 MVP范围（10周，1-2人全栈）

**做**：
- 用户注册登录（手机号）
- 课程浏览/播放/进度（先手动上传10-20节课）
- AI生成工作台（先接Seedance 2.0 + PixVerse双模型）
- 提示词模板库（先手动录入50-100个模板）
- 视频反推（Gemini API）
- 积分充值/消耗
- 基础管理后台

**不做**（留到第二期）：
- 微信登录（需要审核周期）
- Happy Horse 1.0自部署（需GPU，留到规模化阶段）
- 作品广场/社区
- 作品集生成
- 视频分发
- 推广分销
- 小程序/APP

---

## 八、关键技术决策记录

| 决策 | 选择 | 原因 |
|------|------|------|
| 前端框架 | React+TS (非Vue) | Jellyfish开源代码可直接复用，React生态更大 |
| 后端语言 | Python FastAPI (非Java/Go) | AI生态库最丰富（yt-dlp/Gemini SDK/httpx），Jellyfish可复用，开发速度快 |
| 课程视频 | 阿里云VOD (非自建) | 转码/防盗链/播放器全套，不重复造轮子 |
| AI任务 | Celery异步 (非同步等待) | 视频生成30秒~5分钟，不能阻塞HTTP请求 |
| 积分 (非直接RMB) | 积分制 | 避免频繁小额支付，用户体验更好，财务更灵活 |
| MVP先接Seedance 2.0 + PixVerse | Seedance即梦国内直连最稳；PixVerse Segmind同步API最简单 | Happy Horse开源但需GPU自部署，留后期 |
| 视频反推用Gemini | 免费额度最高 | 2026年Gemini免费额度足够MVP阶段 |

---

## 九、附录

### 9.1 AI模型API参考

| 模型 | 官方文档/API接入 | 能力 | 定价参考 |
|------|---------|------|---------|
| **Seedance 2.0** (字节/即梦) | 即梦平台 / EvoLink API / MuAPI / Segmind | T2V/I2V/多模态参考/视频编辑/视频延展，2K电影级，原生音频+唇同步，角色一致性 | 第三方API约$0.3-1.5/次 |
| **Happy Horse 1.0** (开源) | GitHub开源(Apache-2.0)，可自部署 | 15B参数统一Transformer，T2V/I2V，原生音视频联合生成，7语言唇同步，1080p ~38秒/H100 | 开源免费（需GPU：H100/A100 48GB+） |
| **PixVerse V6** (阿里系) | platform.pixverse.ai / Segmind同步API / CLI | T2V/I2V，15秒1080p，原生音频，20+镜头控制，多镜头叙事 | Segmind $0.22-2.16/次（按分辨率/时长） |
| Gemini 2.0 Flash | ai.google.dev | 多模态理解（视频分析） | 免费额度充足 |
| Qwen-VL | dashscope.aliyun.com | 多模态理解（视频分析） | 国内直连，免费额度 |

### 9.2 开源项目引用

| 项目 | 用途 | 协议 |
|------|------|------|
| Jellyfish (Forget-C/Jellyfish) | 前后端脚手架、多模型管理、提示词模板 | Apache-2.0 |
| social-auto-upload (dreammis) | P1阶段视频分发自动化 | MIT |
| yt-dlp | 视频链接解析/下载 | Unlicense |
| Aliplayer | 课程视频播放器 | 阿里云商用SDK |

### 9.3 项目目录结构（参考Jellyfish调整）

```
project-root/
├── docker-compose.yml
├── nginx.conf
├── backend/
│   ├── app/
│   │   ├── main.py                  # FastAPI入口
│   │   ├── config.py                # 配置管理
│   │   ├── models/                  # SQLAlchemy ORM模型
│   │   │   ├── user.py
│   │   │   ├── course.py
│   │   │   ├── generation.py
│   │   │   ├── prompt_template.py
│   │   │   └── credit.py
│   │   ├── api/                     # 路由
│   │   │   ├── auth.py
│   │   │   ├── courses.py
│   │   │   ├── workbench.py
│   │   │   ├── prompts.py
│   │   │   ├── reverse.py
│   │   │   ├── credits.py
│   │   │   └── admin.py
│   │   ├── services/                # 业务逻辑
│   │   │   ├── credits.py
│   │   │   ├── video_parser.py
│   │   │   └── video_analyzer.py
│   │   ├── ai_gateway/              # AI模型调度层
│   │   │   ├── base.py
│   │   │   ├── registry.py
│   │   │   ├── seedance_provider.py
│   │   │   ├── pixverse_provider.py  # 含PixVerseProvider
│   │   │   └── happyhorse_provider.py  # 开源模型，后期自部署
│   │   └── tasks/                   # Celery异步任务
│   │       └── generation.py
│   ├── alembic/                     # 数据库迁移
│   ├── environment.yml              # Conda 环境定义
│   └── Dockerfile
├── front/
│   ├── src/
│   │   ├── pages/                   # 页面组件
│   │   ├── components/              # 通用组件
│   │   ├── services/                # API调用（OpenAPI生成）
│   │   ├── stores/                  # Zustand状态
│   │   └── utils/
│   ├── package.json
│   └── Dockerfile
└── docs/
    └── tech-doc.md                  # 本文档
```
