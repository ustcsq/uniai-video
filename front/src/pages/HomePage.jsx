import { useState, useEffect, useRef } from "react";
import { Link } from "react-router-dom";

const COURSES = [
  { id: 1, title: "AI视频提示词工程入门", tag: "免费", category: "学习", difficulty: "入门", duration: "2h", cover: "🎯", color: "#06b6d4" },
  { id: 2, title: "Seedance 2.0 文生视频实战", tag: "热门", category: "学习", difficulty: "进阶", duration: "4h", cover: "🎬", color: "#8b5cf6" },
  { id: 3, title: "校园宣传片从0到1", tag: "求职", category: "求职", difficulty: "实战", duration: "6h", cover: "🏫", color: "#f59e0b" },
  { id: 4, title: "求职Vlog制作全流程", tag: "求职", category: "求职", difficulty: "实战", duration: "3h", cover: "💼", color: "#ef4444" },
  { id: 5, title: "AI短视频运营爆款公式", tag: "新课", category: "学习", difficulty: "进阶", duration: "5h", cover: "🚀", color: "#10b981" },
  { id: 6, title: "品牌短片商业案例拆解", tag: "求职", category: "求职", difficulty: "高级", duration: "4h", cover: "🎥", color: "#ec4899" },
];

const TEMPLATES = [
  { id: 1, title: "电影级城市航拍", category: "电影风格", uses: 2847, preview: "🌆" },
  { id: 2, title: "校园青春Vlog开场", category: "校园场景", uses: 5123, preview: "🎓" },
  { id: 3, title: "产品展示旋转特写", category: "商业广告", uses: 3891, preview: "📦" },
  { id: 4, title: "二次元角色一致性", category: "角色一致", uses: 4205, preview: "🎨" },
  { id: 5, title: "赛博朋克霓虹街景", category: "电影风格", uses: 1932, preview: "🌃" },
  { id: 6, title: "自然风光延时摄影", category: "文生视频", uses: 3456, preview: "🏔️" },
  { id: 7, title: "求职自我介绍模板", category: "校园场景", uses: 6782, preview: "🙋" },
  { id: 8, title: "美食特写微距镜头", category: "商业广告", uses: 2134, preview: "🍜" },
];

const FEATURES = [
  { icon: "⚡", title: "AI视频生成", desc: "聚合Seedance 2.0/Happy Horse/PixVerse顶级模型，选模板→填提示词→一键生成", accent: "#06b6d4" },
  { icon: "🔮", title: "视频反推助手", desc: "贴个视频链接，AI自动拆解结构并输出可用提示词", accent: "#8b5cf6" },
  { icon: "📚", title: "体系化课程", desc: "从0基础到能接单，学习/求职双模式，学完即有作品集", accent: "#f59e0b" },
  { icon: "✨", title: "提示词模板库", desc: "数千条精选提示词，分类搜索一键使用，每周更新", accent: "#10b981" },
];

const STATS = [
  { value: "50+", label: "精选课程" },
  { value: "3000+", label: "提示词模板" },
  { value: "5", label: "顶级AI模型" },
  { value: "7天", label: "出作品集" },
];

// Animated counter
function Counter({ target, suffix = "" }) {
  const [count, setCount] = useState(0);
  const ref = useRef(null);
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    const obs = new IntersectionObserver(([e]) => { if (e.isIntersecting) setVisible(true); }, { threshold: 0.5 });
    if (ref.current) obs.observe(ref.current);
    return () => obs.disconnect();
  }, []);

  useEffect(() => {
    if (!visible) return;
    const num = parseInt(target.replace(/[^0-9]/g, ""));
    if (!num) { setCount(target); return; }
    let cur = 0;
    const step = Math.max(1, Math.floor(num / 40));
    const iv = setInterval(() => {
      cur += step;
      if (cur >= num) { cur = num; clearInterval(iv); }
      setCount(cur + suffix);
    }, 30);
    return () => clearInterval(iv);
  }, [visible, target, suffix]);

  return <span ref={ref}>{typeof count === "number" ? "0" : count}</span>;
}

export default function HomePage() {
  const [activeTab, setActiveTab] = useState("all");
  const [hoveredCourse, setHoveredCourse] = useState(null);
  const [hoveredTemplate, setHoveredTemplate] = useState(null);
  const [reverseUrl, setReverseUrl] = useState("");
  const [scrollY, setScrollY] = useState(0);

  useEffect(() => {
    const onScroll = () => setScrollY(window.scrollY);
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  const filteredCourses = activeTab === "all" ? COURSES : COURSES.filter(c =>
    activeTab === "learn" ? c.category === "学习" : c.category === "求职"
  );

  return (
    <div style={{
      minHeight: "100vh",
      background: "#06080f",
      color: "#e8eaed",
      fontFamily: "'Noto Sans SC', 'SF Pro Display', -apple-system, sans-serif",
      overflow: "hidden",
    }}>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Noto+Sans+SC:wght@300;400;500;700;900&family=Space+Mono:wght@400;700&display=swap');
        * { margin: 0; padding: 0; box-sizing: border-box; }
        ::-webkit-scrollbar { width: 6px; }
        ::-webkit-scrollbar-track { background: #0a0d16; }
        ::-webkit-scrollbar-thumb { background: #1e293b; border-radius: 3px; }
        @keyframes float { 0%,100% { transform: translateY(0px); } 50% { transform: translateY(-12px); } }
        @keyframes pulse-glow { 0%,100% { opacity: 0.4; } 50% { opacity: 0.8; } }
        @keyframes slide-up { from { opacity: 0; transform: translateY(30px); } to { opacity: 1; transform: translateY(0); } }
        @keyframes grain { 0% { transform: translate(0,0); } 10% { transform: translate(-2%,-2%); } 20% { transform: translate(2%,2%); } 30% { transform: translate(-1%,1%); } 40% { transform: translate(1%,-1%); } 50% { transform: translate(-2%,2%); } 60% { transform: translate(2%,-2%); } 70% { transform: translate(-1%,-1%); } 80% { transform: translate(1%,1%); } 90% { transform: translate(-2%,0%); } 100% { transform: translate(0,0); } }
        .grain::after { content:''; position:fixed;top:-50%;left:-50%;right:-50%;bottom:-50%;width:200%;height:200%;background-image:url("data:image/svg+xml,%3Csvg viewBox='0 0 256 256' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='n'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.9' numOctaves='4' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23n)' opacity='0.04'/%3E%3C/svg%3E");animation:grain 4s steps(8) infinite;pointer-events:none;z-index:9999;opacity:0.3; }
      `}</style>

      <div className="grain" />

      {/* ===== NAV ===== */}
      <nav style={{
        position: "fixed", top: 0, left: 0, right: 0, zIndex: 100,
        padding: "16px 40px",
        background: scrollY > 50 ? "rgba(6,8,15,0.92)" : "transparent",
        backdropFilter: scrollY > 50 ? "blur(20px)" : "none",
        borderBottom: scrollY > 50 ? "1px solid rgba(255,255,255,0.05)" : "none",
        transition: "all 0.3s ease",
        display: "flex", alignItems: "center", justifyContent: "space-between",
      }}>
        <Link to="/" style={{ display: "flex", alignItems: "center", gap: 10, textDecoration: "none", color: "inherit" }}>
          <div style={{
            width: 36, height: 36, borderRadius: 10,
            background: "linear-gradient(135deg, #06b6d4, #8b5cf6)",
            display: "flex", alignItems: "center", justifyContent: "center",
            fontSize: 18, fontWeight: 900, color: "#fff",
          }}>V</div>
          <span style={{ fontSize: 18, fontWeight: 700, letterSpacing: -0.5 }}>
            UniAI Video Lab
          </span>
        </Link>
        <div style={{ display: "flex", gap: 32, fontSize: 14, fontWeight: 400, opacity: 0.7 }}>
          {[
            ["课程", "/courses"],
            ["AI工作台", "/workbench"],
            ["提示词库", "/prompts"],
            ["反推助手", "/reverse"],
          ].map(([t, to]) => (
            <Link
              key={t}
              to={to}
              style={{ color: "#e8eaed", textDecoration: "none", transition: "opacity 0.2s", opacity: 0.7 }}
              onMouseEnter={e => { e.currentTarget.style.opacity = 1; }}
              onMouseLeave={e => { e.currentTarget.style.opacity = 0.7; }}
            >{t}</Link>
          ))}
        </div>
        <div style={{ display: "flex", gap: 12 }}>
          <Link
            to="/login"
            style={{
              padding: "8px 20px", borderRadius: 8, border: "1px solid rgba(255,255,255,0.12)",
              background: "transparent", color: "#e8eaed", fontSize: 13, cursor: "pointer", textDecoration: "none",
            }}
          >登录</Link>
          <Link
            to="/login"
            style={{
              padding: "8px 20px", borderRadius: 8, border: "none",
              background: "linear-gradient(135deg, #06b6d4, #8b5cf6)", color: "#fff",
              fontSize: 13, fontWeight: 600, cursor: "pointer", textDecoration: "none",
            }}
          >免费注册</Link>
        </div>
      </nav>

      {/* ===== HERO ===== */}
      <section style={{
        position: "relative", minHeight: "100vh",
        display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center",
        padding: "120px 40px 80px",
        textAlign: "center",
      }}>
        {/* Background orbs */}
        <div style={{ position: "absolute", top: "10%", left: "15%", width: 400, height: 400, borderRadius: "50%", background: "radial-gradient(circle, rgba(6,182,212,0.12) 0%, transparent 70%)", filter: "blur(60px)", animation: "pulse-glow 6s ease-in-out infinite", pointerEvents: "none" }} />
        <div style={{ position: "absolute", bottom: "20%", right: "10%", width: 350, height: 350, borderRadius: "50%", background: "radial-gradient(circle, rgba(139,92,246,0.1) 0%, transparent 70%)", filter: "blur(60px)", animation: "pulse-glow 6s ease-in-out infinite 3s", pointerEvents: "none" }} />

        <div style={{ animation: "slide-up 0.8s ease-out", position: "relative", zIndex: 1 }}>
          <div style={{
            display: "inline-flex", alignItems: "center", gap: 8,
            padding: "6px 16px", borderRadius: 20,
            background: "rgba(6,182,212,0.1)", border: "1px solid rgba(6,182,212,0.2)",
            fontSize: 13, color: "#06b6d4", marginBottom: 32,
          }}>
            <span style={{ width: 6, height: 6, borderRadius: "50%", background: "#06b6d4", animation: "pulse-glow 2s infinite" }} />
            2026年大学生最需要的AI视频技能平台
          </div>

          <h1 style={{
            fontSize: "clamp(36px, 5.5vw, 72px)", fontWeight: 900,
            lineHeight: 1.1, letterSpacing: -2,
            maxWidth: 800, margin: "0 auto 24px",
          }}>
            <span style={{ color: "#e8eaed" }}>学AI视频，做作品集</span>
            <br />
            <span style={{
              background: "linear-gradient(135deg, #06b6d4, #8b5cf6, #ec4899)",
              WebkitBackgroundClip: "text", WebkitTextFillColor: "transparent",
            }}>找到好工作</span>
          </h1>

          <p style={{
            fontSize: 18, lineHeight: 1.7, opacity: 0.5, maxWidth: 560, margin: "0 auto 40px",
            fontWeight: 300,
          }}>
            聚合Seedance 2.0 · Happy Horse · PixVerse顶级AI模型<br />
            从0基础到独立接单，7天产出简历作品集
          </p>

          <div style={{ display: "flex", gap: 16, justifyContent: "center", flexWrap: "wrap" }}>
            <Link
              to="/courses"
              style={{
                display: "inline-block",
                padding: "14px 36px", borderRadius: 12, border: "none",
                background: "linear-gradient(135deg, #06b6d4, #8b5cf6)",
                color: "#fff", fontSize: 16, fontWeight: 600, cursor: "pointer",
                boxShadow: "0 0 40px rgba(6,182,212,0.25)",
                transition: "transform 0.2s, box-shadow 0.2s",
                textDecoration: "none",
              }}
              onMouseEnter={e => { e.currentTarget.style.transform = "translateY(-2px)"; e.currentTarget.style.boxShadow = "0 0 60px rgba(6,182,212,0.4)"; }}
              onMouseLeave={e => { e.currentTarget.style.transform = "translateY(0)"; e.currentTarget.style.boxShadow = "0 0 40px rgba(6,182,212,0.25)"; }}
            >免费开始学习</Link>
            <Link
              to="/workbench"
              style={{
                display: "inline-block",
                padding: "14px 36px", borderRadius: 12,
                border: "1px solid rgba(255,255,255,0.1)",
                background: "rgba(255,255,255,0.03)", color: "#e8eaed",
                fontSize: 16, cursor: "pointer", transition: "all 0.2s",
                textDecoration: "none",
              }}
              onMouseEnter={e => { e.currentTarget.style.background = "rgba(255,255,255,0.06)"; }}
              onMouseLeave={e => { e.currentTarget.style.background = "rgba(255,255,255,0.03)"; }}
            >体验AI工作台 →</Link>
          </div>
        </div>

        {/* Stats bar */}
        <div style={{
          display: "flex", gap: 48, marginTop: 80, animation: "slide-up 1s ease-out 0.3s both",
          position: "relative", zIndex: 1,
        }}>
          {STATS.map((s, i) => (
            <div key={i} style={{ textAlign: "center" }}>
              <div style={{ fontSize: 32, fontWeight: 900, fontFamily: "'Space Mono', monospace", letterSpacing: -1 }}>
                <Counter target={s.value} suffix={s.value.replace(/[0-9]/g, "")} />
              </div>
              <div style={{ fontSize: 13, opacity: 0.4, marginTop: 4 }}>{s.label}</div>
            </div>
          ))}
        </div>
      </section>

      {/* ===== FEATURES ===== */}
      <section style={{ padding: "80px 40px", maxWidth: 1200, margin: "0 auto" }}>
        <h2 style={{ fontSize: 14, fontWeight: 500, color: "#06b6d4", letterSpacing: 3, textTransform: "uppercase", marginBottom: 12 }}>
          核心能力
        </h2>
        <h3 style={{ fontSize: 36, fontWeight: 800, letterSpacing: -1, marginBottom: 48 }}>
          一个平台，解决所有问题
        </h3>
        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(260px, 1fr))", gap: 20 }}>
          {FEATURES.map((f, i) => (
            <div key={i} style={{
              padding: 32, borderRadius: 16,
              background: "rgba(255,255,255,0.02)",
              border: "1px solid rgba(255,255,255,0.05)",
              transition: "all 0.3s ease",
              cursor: "default",
            }}
              onMouseEnter={e => { e.currentTarget.style.background = "rgba(255,255,255,0.04)"; e.currentTarget.style.borderColor = f.accent + "33"; e.currentTarget.style.transform = "translateY(-4px)"; }}
              onMouseLeave={e => { e.currentTarget.style.background = "rgba(255,255,255,0.02)"; e.currentTarget.style.borderColor = "rgba(255,255,255,0.05)"; e.currentTarget.style.transform = "translateY(0)"; }}
            >
              <div style={{ fontSize: 32, marginBottom: 16, animation: "float 4s ease-in-out infinite", animationDelay: `${i * 0.5}s` }}>{f.icon}</div>
              <h4 style={{ fontSize: 18, fontWeight: 700, marginBottom: 8 }}>{f.title}</h4>
              <p style={{ fontSize: 14, lineHeight: 1.7, opacity: 0.5 }}>{f.desc}</p>
            </div>
          ))}
        </div>
      </section>

      {/* ===== COURSES ===== */}
      <section style={{ padding: "80px 40px", maxWidth: 1200, margin: "0 auto" }}>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-end", marginBottom: 36, flexWrap: "wrap", gap: 16 }}>
          <div>
            <h2 style={{ fontSize: 14, fontWeight: 500, color: "#8b5cf6", letterSpacing: 3, textTransform: "uppercase", marginBottom: 12 }}>
              精选课程
            </h2>
            <h3 style={{ fontSize: 36, fontWeight: 800, letterSpacing: -1 }}>
              从零开始，学完即战
            </h3>
          </div>
          <div style={{ display: "flex", gap: 8 }}>
            {[{ key: "all", label: "全部" }, { key: "learn", label: "🎓 学习模式" }, { key: "career", label: "💼 求职模式" }].map(t => (
              <button key={t.key} onClick={() => setActiveTab(t.key)} style={{
                padding: "8px 18px", borderRadius: 8, border: "none",
                background: activeTab === t.key ? "rgba(139,92,246,0.15)" : "rgba(255,255,255,0.03)",
                color: activeTab === t.key ? "#8b5cf6" : "rgba(255,255,255,0.5)",
                fontSize: 13, fontWeight: 500, cursor: "pointer", transition: "all 0.2s",
              }}>{t.label}</button>
            ))}
          </div>
        </div>

        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(320px, 1fr))", gap: 20 }}>
          {filteredCourses.map(c => (
            <div key={c.id}
              onMouseEnter={() => setHoveredCourse(c.id)}
              onMouseLeave={() => setHoveredCourse(null)}
              style={{
                borderRadius: 16, overflow: "hidden",
                background: "rgba(255,255,255,0.02)",
                border: `1px solid ${hoveredCourse === c.id ? c.color + "44" : "rgba(255,255,255,0.05)"}`,
                transition: "all 0.3s ease",
                transform: hoveredCourse === c.id ? "translateY(-4px)" : "none",
                cursor: "pointer",
              }}
            >
              <div style={{
                height: 160, display: "flex", alignItems: "center", justifyContent: "center",
                background: `linear-gradient(135deg, ${c.color}15, ${c.color}05)`,
                fontSize: 56,
                position: "relative",
              }}>
                {c.cover}
                <span style={{
                  position: "absolute", top: 12, right: 12,
                  padding: "4px 10px", borderRadius: 6,
                  background: c.tag === "免费" ? "rgba(16,185,129,0.15)" : c.tag === "热门" ? "rgba(239,68,68,0.15)" : c.tag === "新课" ? "rgba(6,182,212,0.15)" : "rgba(245,158,11,0.15)",
                  color: c.tag === "免费" ? "#10b981" : c.tag === "热门" ? "#ef4444" : c.tag === "新课" ? "#06b6d4" : "#f59e0b",
                  fontSize: 11, fontWeight: 600,
                }}>{c.tag}</span>
              </div>
              <div style={{ padding: "20px 24px" }}>
                <h4 style={{ fontSize: 16, fontWeight: 600, marginBottom: 12, lineHeight: 1.4 }}>{c.title}</h4>
                <div style={{ display: "flex", gap: 12, fontSize: 12, opacity: 0.4 }}>
                  <span>📊 {c.difficulty}</span>
                  <span>⏱ {c.duration}</span>
                </div>
              </div>
            </div>
          ))}
        </div>

        <div style={{ textAlign: "center", marginTop: 36 }}>
          <Link
            to="/courses"
            style={{
              display: "inline-block",
              padding: "12px 32px", borderRadius: 10,
              border: "1px solid rgba(139,92,246,0.2)", background: "rgba(139,92,246,0.06)",
              color: "#8b5cf6", fontSize: 14, fontWeight: 500, cursor: "pointer",
              textDecoration: "none",
            }}
          >查看全部课程 →</Link>
        </div>
      </section>

      {/* ===== PROMPT TEMPLATES ===== */}
      <section style={{ padding: "80px 40px", maxWidth: 1200, margin: "0 auto" }}>
        <h2 style={{ fontSize: 14, fontWeight: 500, color: "#10b981", letterSpacing: 3, textTransform: "uppercase", marginBottom: 12 }}>
          提示词模板库
        </h2>
        <h3 style={{ fontSize: 36, fontWeight: 800, letterSpacing: -1, marginBottom: 12 }}>
          精选提示词，一键生成大片
        </h3>
        <p style={{ fontSize: 15, opacity: 0.4, marginBottom: 40 }}>每周更新 · 覆盖校园/商业/电影全场景 · 点击即用</p>

        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(260px, 1fr))", gap: 16 }}>
          {TEMPLATES.map(t => (
            <div key={t.id}
              onMouseEnter={() => setHoveredTemplate(t.id)}
              onMouseLeave={() => setHoveredTemplate(null)}
              style={{
                padding: 20, borderRadius: 14,
                background: hoveredTemplate === t.id ? "rgba(16,185,129,0.04)" : "rgba(255,255,255,0.02)",
                border: `1px solid ${hoveredTemplate === t.id ? "rgba(16,185,129,0.15)" : "rgba(255,255,255,0.05)"}`,
                transition: "all 0.25s ease",
                cursor: "pointer",
                display: "flex", alignItems: "center", gap: 16,
              }}
            >
              <div style={{
                width: 52, height: 52, borderRadius: 12,
                background: "rgba(255,255,255,0.03)",
                display: "flex", alignItems: "center", justifyContent: "center",
                fontSize: 26, flexShrink: 0,
              }}>{t.preview}</div>
              <div style={{ flex: 1, minWidth: 0 }}>
                <h4 style={{ fontSize: 14, fontWeight: 600, marginBottom: 6 }}>{t.title}</h4>
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                  <span style={{ fontSize: 11, padding: "2px 8px", borderRadius: 4, background: "rgba(255,255,255,0.04)", opacity: 0.5 }}>{t.category}</span>
                  <span style={{ fontSize: 11, opacity: 0.3 }}>{t.uses.toLocaleString()} 次使用</span>
                </div>
              </div>
              <div style={{
                opacity: hoveredTemplate === t.id ? 1 : 0,
                transition: "opacity 0.2s",
                fontSize: 12, color: "#10b981", whiteSpace: "nowrap", fontWeight: 500,
              }}>使用 →</div>
            </div>
          ))}
        </div>
      </section>

      {/* ===== REVERSE TOOL PREVIEW ===== */}
      <section style={{
        padding: "80px 40px", maxWidth: 1200, margin: "0 auto",
      }}>
        <div style={{
          borderRadius: 24, padding: "60px 48px",
          background: "linear-gradient(135deg, rgba(139,92,246,0.06), rgba(6,182,212,0.04))",
          border: "1px solid rgba(255,255,255,0.05)",
          display: "flex", gap: 48, alignItems: "center", flexWrap: "wrap",
        }}>
          <div style={{ flex: 1, minWidth: 300 }}>
            <h2 style={{ fontSize: 14, fontWeight: 500, color: "#f59e0b", letterSpacing: 3, textTransform: "uppercase", marginBottom: 12 }}>
              视频反推助手
            </h2>
            <h3 style={{ fontSize: 32, fontWeight: 800, letterSpacing: -1, lineHeight: 1.3, marginBottom: 16 }}>
              看到好视频？<br />AI帮你提取提示词
            </h3>
            <p style={{ fontSize: 15, opacity: 0.45, lineHeight: 1.7, marginBottom: 32 }}>
              粘贴任意视频链接（B站/抖音/YouTube/小红书），AI自动分析视频结构、镜头语言、风格氛围，输出可直接用于Seedance/PixVerse生成的提示词。
            </p>
            <div style={{ display: "flex", gap: 10 }}>
              <input
                value={reverseUrl}
                onChange={e => setReverseUrl(e.target.value)}
                placeholder="粘贴视频链接，如 https://b23.tv/xxxxx"
                style={{
                  flex: 1, padding: "14px 18px", borderRadius: 12,
                  background: "rgba(0,0,0,0.3)", border: "1px solid rgba(255,255,255,0.08)",
                  color: "#e8eaed", fontSize: 14, outline: "none",
                }}
              />
              <Link
                to="/reverse"
                style={{
                  display: "inline-block",
                  padding: "14px 24px", borderRadius: 12, border: "none",
                  background: "linear-gradient(135deg, #f59e0b, #ef4444)",
                  color: "#fff", fontSize: 14, fontWeight: 600, cursor: "pointer", whiteSpace: "nowrap",
                  textDecoration: "none",
                }}
              >开始分析</Link>
            </div>
          </div>
          <div style={{
            width: 320, height: 220, borderRadius: 16,
            background: "rgba(0,0,0,0.3)", border: "1px solid rgba(255,255,255,0.06)",
            display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center",
            fontFamily: "'Space Mono', monospace", fontSize: 12, opacity: 0.4, gap: 8, flexShrink: 0,
          }}>
            <div style={{ fontSize: 40, marginBottom: 8 }}>🔮</div>
            <div>{"{"}</div>
            <div style={{ color: "#06b6d4" }}>&nbsp;&nbsp;"prompt": "cinematic aerial shot..."</div>
            <div style={{ color: "#8b5cf6" }}>&nbsp;&nbsp;"style": "film grain, golden hour"</div>
            <div style={{ color: "#f59e0b" }}>&nbsp;&nbsp;"camera": "slow dolly forward"</div>
            <div>{"}"}</div>
          </div>
        </div>
      </section>

      {/* ===== CTA ===== */}
      <section style={{
        padding: "100px 40px", textAlign: "center",
        position: "relative",
      }}>
        <div style={{ position: "absolute", top: "50%", left: "50%", transform: "translate(-50%,-50%)", width: 500, height: 500, borderRadius: "50%", background: "radial-gradient(circle, rgba(6,182,212,0.08) 0%, transparent 70%)", filter: "blur(80px)", pointerEvents: "none" }} />
        <h2 style={{ fontSize: "clamp(28px, 4vw, 48px)", fontWeight: 900, letterSpacing: -1, marginBottom: 16, position: "relative", zIndex: 1 }}>
          你的第一部AI视频作品
          <br />
          <span style={{ background: "linear-gradient(135deg, #06b6d4, #8b5cf6)", WebkitBackgroundClip: "text", WebkitTextFillColor: "transparent" }}>
            从今天开始
          </span>
        </h2>
        <p style={{ fontSize: 16, opacity: 0.4, marginBottom: 40, position: "relative", zIndex: 1 }}>
          注册即送50积分，免费体验AI视频生成
        </p>
        <Link
          to="/login"
          style={{
            display: "inline-block",
            padding: "16px 48px", borderRadius: 14, border: "none",
            background: "linear-gradient(135deg, #06b6d4, #8b5cf6)",
            color: "#fff", fontSize: 18, fontWeight: 700, cursor: "pointer",
            boxShadow: "0 0 60px rgba(6,182,212,0.3)",
            transition: "transform 0.2s",
            position: "relative", zIndex: 1,
            textDecoration: "none",
          }}
          onMouseEnter={e => { e.currentTarget.style.transform = "scale(1.05)"; }}
          onMouseLeave={e => { e.currentTarget.style.transform = "scale(1)"; }}
        >立即免费注册</Link>
      </section>

      {/* ===== FOOTER ===== */}
      <footer style={{
        padding: "40px 40px 32px", borderTop: "1px solid rgba(255,255,255,0.04)",
        maxWidth: 1200, margin: "0 auto",
        display: "flex", justifyContent: "space-between", alignItems: "center",
        fontSize: 12, opacity: 0.3, flexWrap: "wrap", gap: 16,
      }}>
        <span>© 2026 UniAI Video Lab · 大学生AI视频制作实战平台</span>
        <div style={{ display: "flex", gap: 24 }}>
          <a href="#" style={{ color: "#e8eaed", textDecoration: "none" }}>关于我们</a>
          <a href="#" style={{ color: "#e8eaed", textDecoration: "none" }}>隐私政策</a>
          <a href="#" style={{ color: "#e8eaed", textDecoration: "none" }}>用户协议</a>
          <a href="#" style={{ color: "#e8eaed", textDecoration: "none" }}>联系客服</a>
        </div>
      </footer>
    </div>
  );
}
