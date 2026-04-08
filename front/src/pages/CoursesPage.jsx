import { useState } from "react";

const CATEGORIES = {
  learning: [
    { id: "prompt", label: "提示词工程", icon: "🎯" },
    { id: "painting", label: "AI绘画", icon: "🎨" },
    { id: "video", label: "AI视频生成", icon: "🎬" },
    { id: "editing", label: "后期剪辑", icon: "✂️" },
    { id: "operation", label: "短视频运营", icon: "📈" },
  ],
  career: [
    { id: "campus", label: "校园宣传片", icon: "🏫" },
    { id: "vlog", label: "求职Vlog", icon: "💼" },
    { id: "brand", label: "品牌短片", icon: "🏷️" },
    { id: "product", label: "产品展示", icon: "📦" },
    { id: "ip", label: "个人IP视频", icon: "🌟" },
  ],
};

const COURSES = [
  { id: 1, title: "AI视频提示词工程：从入门到精通", cat: "prompt", mode: "learning", tag: "免费", difficulty: "入门", duration: "2h 30min", lessons: 12, students: 3847, cover: "🎯", color: "#06b6d4", teacher: "Alex", desc: "系统掌握Seedance/PixVerse提示词写法，包含镜头语言、风格控制、反向提示词" },
  { id: 2, title: "Seedance 2.0 文生视频完全指南", cat: "video", mode: "learning", tag: "热门", difficulty: "进阶", duration: "4h 15min", lessons: 18, students: 5621, cover: "🎬", color: "#8b5cf6", teacher: "小鱼", desc: "即梦平台深度实操，2K电影级输出，原生音频+角色一致性" },
  { id: 3, title: "PixVerse V6 镜头控制大师课", cat: "video", mode: "learning", tag: "新课", difficulty: "进阶", duration: "3h 40min", lessons: 15, students: 1923, cover: "📷", color: "#10b981", teacher: "导演C", desc: "20+镜头控制参数详解，焦距/光圈/景深/色差全掌握" },
  { id: 4, title: "Happy Horse 开源模型实战部署", cat: "video", mode: "learning", tag: "技术", difficulty: "高级", duration: "5h", lessons: 20, students: 892, cover: "🐴", color: "#f59e0b", teacher: "码农D", desc: "15B模型本地部署+API调用+微调入门" },
  { id: 5, title: "AI绘画+视频联合工作流", cat: "painting", mode: "learning", tag: "推荐", difficulty: "进阶", duration: "3h", lessons: 14, students: 2764, cover: "🎨", color: "#ec4899", teacher: "画师E", desc: "Midjourney/SD出图→Seedance图生视频完整管线" },
  { id: 6, title: "CapCut AI剪辑全流程", cat: "editing", mode: "learning", tag: "免费", difficulty: "入门", duration: "2h", lessons: 10, students: 4532, cover: "✂️", color: "#6366f1", teacher: "剪刀手", desc: "AI智能剪辑+自动字幕+节奏匹配" },
  { id: 7, title: "校园宣传片：从策划到成片", cat: "campus", mode: "career", tag: "求职", difficulty: "实战", duration: "6h", lessons: 24, students: 3156, cover: "🏫", color: "#f59e0b", teacher: "团队F", desc: "完整项目实操，学完即可作为作品集核心项目" },
  { id: 8, title: "求职Vlog制作与投递技巧", cat: "vlog", mode: "career", tag: "求职", difficulty: "实战", duration: "3h", lessons: 12, students: 4891, cover: "💼", color: "#ef4444", teacher: "HR小姐姐", desc: "新媒体/短视频岗位求职Vlog模板+面试作品集打包" },
  { id: 9, title: "品牌短片商业案例全拆解", cat: "brand", mode: "career", tag: "求职", difficulty: "高级", duration: "4h 30min", lessons: 16, students: 1845, cover: "🏷️", color: "#8b5cf6", teacher: "品牌G", desc: "10个真实商业案例，从Brief到交付全流程" },
  { id: 10, title: "产品展示视频：电商爆款公式", cat: "product", mode: "career", tag: "热门", difficulty: "实战", duration: "3h 20min", lessons: 14, students: 3672, cover: "📦", color: "#06b6d4", teacher: "电商H", desc: "抖音/小红书产品视频模板，AI批量生成+运营投放" },
  { id: 11, title: "短视频运营：算法+爆款+变现", cat: "operation", mode: "learning", tag: "推荐", difficulty: "进阶", duration: "5h", lessons: 22, students: 6234, cover: "📈", color: "#10b981", teacher: "运营I", desc: "抖音/B站/小红书算法拆解+内容策略+流量变现" },
  { id: 12, title: "个人IP视频从0到10万粉", cat: "ip", mode: "career", tag: "新课", difficulty: "实战", duration: "4h", lessons: 18, students: 2103, cover: "🌟", color: "#ec4899", teacher: "IP大师", desc: "人设定位+内容矩阵+AI批量出片+粉丝运营" },
];

const DIFFS = ["全部", "入门", "进阶", "高级", "实战"];

export default function CoursesPage() {
  const [mode, setMode] = useState("learning");
  const [activeCat, setActiveCat] = useState(null);
  const [diffFilter, setDiffFilter] = useState("全部");
  const [search, setSearch] = useState("");
  const [hovered, setHovered] = useState(null);

  const cats = CATEGORIES[mode];
  const filtered = COURSES.filter(c => {
    if (c.mode !== mode) return false;
    if (activeCat && c.cat !== activeCat) return false;
    if (diffFilter !== "全部" && c.difficulty !== diffFilter) return false;
    if (search && !c.title.includes(search) && !c.desc.includes(search)) return false;
    return true;
  });

  const tagColor = (tag) => {
    const map = { "免费": "#10b981", "热门": "#ef4444", "新课": "#06b6d4", "推荐": "#8b5cf6", "求职": "#f59e0b", "技术": "#6366f1" };
    return map[tag] || "#6b7a99";
  };

  return (
    <div style={{ minHeight: "100vh", background: "#080b14", color: "#d4d8e0", fontFamily: "'Noto Sans SC','DM Sans',sans-serif" }}>
      <style>{`@import url('https://fonts.googleapis.com/css2?family=Noto+Sans+SC:wght@300;400;500;700;900&family=DM+Sans:wght@400;500;700&display=swap');*{margin:0;padding:0;box-sizing:border-box}::-webkit-scrollbar{width:5px}::-webkit-scrollbar-thumb{background:#1e2744;border-radius:3px}@keyframes fadeUp{from{opacity:0;transform:translateY(16px)}to{opacity:1;transform:translateY(0)}}`}</style>

      {/* Header */}
      <div style={{ maxWidth: 1200, margin: "0 auto", padding: "48px 32px 0" }}>
        <h1 style={{ fontSize: 32, fontWeight: 900, letterSpacing: -1, marginBottom: 8 }}>课程中心</h1>
        <p style={{ fontSize: 14, opacity: .45, marginBottom: 32 }}>从0基础到独立接单，体系化学习AI视频制作全流程</p>

        {/* Mode switch */}
        <div style={{ display: "inline-flex", borderRadius: 12, background: "#0c1020", border: "1px solid #161d30", padding: 4, marginBottom: 28 }}>
          {[["learning", "🎓 学习模式", "按技能分类"], ["career", "💼 求职模式", "按作品场景"]].map(([k, label, sub]) => (
            <button key={k} onClick={() => { setMode(k); setActiveCat(null); }} style={{
              padding: "12px 28px", borderRadius: 10, border: "none", cursor: "pointer",
              background: mode === k ? "linear-gradient(135deg,#06b6d420,#8b5cf620)" : "transparent",
              color: mode === k ? "#e8eaed" : "#5a6785", transition: "all .25s",
            }}>
              <div style={{ fontSize: 14, fontWeight: 700 }}>{label}</div>
              <div style={{ fontSize: 11, opacity: .5, marginTop: 2 }}>{sub}</div>
            </button>
          ))}
        </div>

        {/* Category pills */}
        <div style={{ display: "flex", gap: 10, flexWrap: "wrap", marginBottom: 16 }}>
          <button onClick={() => setActiveCat(null)} style={{
            padding: "8px 18px", borderRadius: 8, border: "none", fontSize: 13, cursor: "pointer", fontWeight: 600,
            background: !activeCat ? "rgba(6,182,212,.12)" : "#0f1428", color: !activeCat ? "#06b6d4" : "#5a6785",
          }}>全部</button>
          {cats.map(c => (
            <button key={c.id} onClick={() => setActiveCat(c.id)} style={{
              padding: "8px 18px", borderRadius: 8, border: "none", fontSize: 13, cursor: "pointer", fontWeight: 500,
              background: activeCat === c.id ? "rgba(6,182,212,.12)" : "#0f1428", color: activeCat === c.id ? "#06b6d4" : "#5a6785",
              display: "flex", alignItems: "center", gap: 6,
            }}>{c.icon} {c.label}</button>
          ))}
        </div>

        {/* Filters row */}
        <div style={{ display: "flex", alignItems: "center", gap: 12, marginBottom: 32, flexWrap: "wrap" }}>
          <div style={{ display: "flex", gap: 6 }}>
            {DIFFS.map(d => (
              <button key={d} onClick={() => setDiffFilter(d)} style={{
                padding: "5px 12px", borderRadius: 6, border: "none", fontSize: 12, cursor: "pointer",
                background: diffFilter === d ? "#1a2240" : "transparent", color: diffFilter === d ? "#d4d8e0" : "#4a5570",
              }}>{d}</button>
            ))}
          </div>
          <div style={{ marginLeft: "auto" }}>
            <input value={search} onChange={e => setSearch(e.target.value)} placeholder="搜索课程..."
              style={{ padding: "8px 16px", borderRadius: 8, border: "1px solid #1e2744", background: "#0f1428", color: "#d4d8e0", fontSize: 12, width: 220, outline: "none" }} />
          </div>
        </div>
      </div>

      {/* Course grid */}
      <div style={{ maxWidth: 1200, margin: "0 auto", padding: "0 32px 80px" }}>
        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill,minmax(340px,1fr))", gap: 20 }}>
          {filtered.map((c, i) => (
            <div key={c.id}
              onMouseEnter={() => setHovered(c.id)} onMouseLeave={() => setHovered(null)}
              style={{
                borderRadius: 16, overflow: "hidden", cursor: "pointer",
                background: "#0c1020", border: `1px solid ${hovered === c.id ? c.color + "33" : "#161d30"}`,
                transition: "all .3s", transform: hovered === c.id ? "translateY(-4px)" : "none",
                boxShadow: hovered === c.id ? `0 8px 32px ${c.color}12` : "none",
                animation: `fadeUp .4s ease ${i * .05}s both`,
              }}>
              {/* Cover */}
              <div style={{ height: 160, background: `linear-gradient(135deg,${c.color}12,${c.color}06)`, display: "flex", alignItems: "center", justifyContent: "center", fontSize: 52, position: "relative" }}>
                {c.cover}
                <span style={{ position: "absolute", top: 12, left: 12, padding: "4px 10px", borderRadius: 6, fontSize: 11, fontWeight: 600, background: tagColor(c.tag) + "18", color: tagColor(c.tag) }}>{c.tag}</span>
                <span style={{ position: "absolute", top: 12, right: 12, padding: "4px 10px", borderRadius: 6, fontSize: 11, background: "#0c102099", color: "#8b9dc0" }}>{c.difficulty}</span>
              </div>
              {/* Info */}
              <div style={{ padding: "18px 20px" }}>
                <h3 style={{ fontSize: 15, fontWeight: 700, lineHeight: 1.4, marginBottom: 8, minHeight: 42 }}>{c.title}</h3>
                <p style={{ fontSize: 12, color: "#5a6785", lineHeight: 1.6, marginBottom: 14, minHeight: 36, display: "-webkit-box", WebkitLineClamp: 2, WebkitBoxOrient: "vertical", overflow: "hidden" }}>{c.desc}</p>
                <div style={{ display: "flex", alignItems: "center", gap: 16, fontSize: 11, color: "#4a5570" }}>
                  <span>👤 {c.teacher}</span>
                  <span>📖 {c.lessons}节</span>
                  <span>⏱ {c.duration}</span>
                  <span style={{ marginLeft: "auto", color: "#6b7a99" }}>👥 {c.students.toLocaleString()}</span>
                </div>
              </div>
            </div>
          ))}
        </div>
        {filtered.length === 0 && (
          <div style={{ textAlign: "center", padding: "80px 0", color: "#3d4b6b" }}>
            <div style={{ fontSize: 40, marginBottom: 12 }}>📭</div>
            <div>暂无匹配课程，试试其他筛选条件</div>
          </div>
        )}
      </div>
    </div>
  );
}
