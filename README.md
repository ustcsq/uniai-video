# UniAI Video（大学生 AI 视频平台）

单体仓库：**前端** + **后端** + 文档与归档。

## 目录结构

```
.
├── README.md
├── .gitignore
├── .env.example              # 可选：docker compose 用环境变量模板
├── docker-compose.yml        # 服务器上一键起 API 容器
├── docs/                     # 技术开发文档
│   ├── 大学生AI视频平台-技术开发文档.md
│   ├── 后端实现顺序.md       # 阶段规划（阶段 0 起）
│   └── 最简实现流程.md       # 本地 Conda / 前后端 / 测试速查
├── archive/                  # 历史交付物（zip、截图等）
├── front/                    # 前端（Vite + React 18 + React Router）
│   ├── .env.example          # VITE_API_BASE_URL 等
│   └── src/config.js         # 统一读 API 根地址（调用后端时用 apiUrl）
└── backend/                  # 后端（FastAPI，与文档 Jellyfish「backend/」对齐）
    ├── environment.yml       # Conda 环境（Python 与 pip 依赖）
    ├── alembic.ini           # 数据库迁移
    ├── alembic/              # 迁移脚本（异步 SQLAlchemy）
    ├── Dockerfile
    ├── .env.example
    └── app/
        ├── main.py           # 应用入口、生命周期、Request-ID 中间件
        ├── core/             # 配置、日志、AppError
        ├── db/               # Base、异步 engine / session
        ├── redis_client.py   # 可选 Redis
        ├── models/           # ORM（如 User）
        ├── schemas/          # Pydantic 请求/响应
        ├── services/         # 业务小函数
        └── api/v1/
            ├── deps.py       # get_db、get_current_user
            ├── router.py
            └── endpoints/    # health、auth、user
```

## 前端

```bash
cd front
npm install
npm run dev
```

默认 <http://localhost:5173>。

**前端单测**（Vitest，不启动浏览器）：

```bash
cd front
npm run test:run    # 跑一轮退出
npm run test        # 监听模式
```

前端请求后端：`npm run dev` 时 **`/api` 会由 Vite 代理到 `http://127.0.0.1:8000`**，一般无需配置 `.env`。自测联调可打开 `http://127.0.0.1:8000/api/v1/health` 或 Swagger `/docs`。上云构建再设 `VITE_API_BASE_URL` 或同域反代；业务代码用 `src/config.js` 的 `apiUrl()`。

## 后端

后端使用 **Conda** 管理 Python 环境（`environment.yml` 指定 3.12；与文档「Python 3.11+」兼容）。

```bash
cd backend
conda env create -f environment.yml   # 首次
conda activate uniai-video-backend
python -m uvicorn app.main:app --reload --host 0.0.0.0 --port 8000
```

依赖变更后：`conda env update -f environment.yml --prune`

**阶段 0（地基）**：默认 **SQLite**（`backend/data/dev.db`，已加入 `.gitignore`）；可选 **PostgreSQL / Redis**（见 `docker-compose.yml` 与 `.env.example`）。数据库迁移：

```bash
cd backend
alembic upgrade head
```

业务里抛出 `AppError` 会返回统一 JSON：`code`、`message`、`request_id`。响应头带 **`X-Request-ID`**。

**后端单测**（pytest + `httpx.AsyncClient`/`ASGITransport`，**无需**单独起 uvicorn；请先 `alembic upgrade head`。避免 Windows 上 `TestClient` 偶发 access violation）：

```bash
cd backend
pytest
```

- 接口根路径：<http://127.0.0.1:8000/>
- OpenAPI 文档：<http://127.0.0.1:8000/docs>
- 健康检查：<http://127.0.0.1:8000/api/v1/health>

**阶段 1（用户与鉴权）**：技术文档里的路径为 `/api/auth/...`，本仓库统一挂在 **`/api/v1`** 下。

| 方法 | 路径 | 说明 |
|------|------|------|
| POST | `/api/v1/auth/sms/send` | 发验证码（Redis 或进程内缓存；`AUTH_DEV_FIXED_CODE` 固定码便于本地/单测） |
| POST | `/api/v1/auth/sms/login` | 验证码登录/注册，返回 `access_token` / `refresh_token` |
| POST | `/api/v1/auth/refresh` | 用 `refresh_token` 换新令牌 |
| GET | `/api/v1/user/me` | 当前用户（Header: `Authorization: Bearer <access>`） |
| PUT | `/api/v1/user/me` | 更新昵称/头像 URL/学校/专业 |
| GET | `/api/v1/user/me/credits` | 积分余额（`items` 阶段 2 再补流水） |

JWT 密钥：`JWT_SECRET`（见 `backend/.env.example`）。本地调试可在 `.env` 设 `SMS_DEBUG_RETURN_CODE=true` 在发码响应里看到 `debug_code`（**勿上生产**）。

跨域在 `backend/.env` 里用 **`CORS_ORIGINS`**（逗号分隔）；上云改为 `https://你的前端站`（见 `backend/.env.example`）。

## 服务器 / Docker（可选）

与 Windows 本地并行：镜像内用 **pip** 装依赖，版本与 `environment.yml` 的 pip 段一致；改依赖时请同时改 **Dockerfile** 与 **environment.yml**。

```bash
# 仓库根目录；可先复制 .env.example 为 .env 再改端口/CORS
# 会启动 postgres、redis、api（API 默认连 compose 内 PG + Redis）
docker compose up -d --build
```

首次在容器连上 Postgres 后，需在 **backend** 目录对同一 `DATABASE_URL` 执行 `alembic upgrade head`（可在 CI/启动脚本里自动化）。

## 上云时少踩坑

- **不要**在代码里写死 `D:\`、局域网 IP；差异一律用 **环境变量**（后端 `.env` / 系统环境 / compose `environment`）。
- 前端构建前设置 **`VITE_API_BASE_URL`**，或用 Nginx **同域反代** `/api` 到后端，此时可留空并由反代统一路径。
- 后端在反代子路径挂载时，按需设置 **`ROOT_PATH`**（见 `backend/.env.example`）。

## 说明

- 后端落地顺序见 **`docs/后端实现顺序.md`**；业务细节仍以 `docs/大学生AI视频平台-技术开发文档.md` 为准。
- 前端目录为 `front/`，与文档中 Jellyfish「`front/`」命名一致。
- 若不想提交大体积 zip，可在根 `.gitignore` 取消注释 `# archive/*.zip`。
