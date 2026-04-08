import { useState } from "react";

const CATS = ["全部", "文生视频", "图生视频", "角色一致", "电影风格", "校园场景", "商业广告", "创意特效"];

const PROMPTS = [
  { id: 1, title: "电影级城市日落航拍", cat: "电影风格", prompt: "Cinematic aerial drone shot of a modern city skyline at golden hour, warm sunlight reflecting off glass skyscrapers, smooth forward dolly movement, volumetric clouds, film grain, anamorphic lens flare, 4K", neg: "blurry, shaky, distorted, low quality", model: "Seedance 2.0", uses: 5847, tags: ["航拍", "城市", "日落"], preview: "🌆" },
  { id: 2, title: "校园青春Vlog开场", cat: "校园场景", prompt: "Medium tracking shot following a young college student walking through a tree-lined campus path, cherry blossoms falling, morning light, soft bokeh, handheld camera feel, warm color grading", neg: "dark, gloomy, rain", model: "PixVerse V6", uses: 8234, tags: ["校园", "青春", "Vlog"], preview: "🎓" },
  { id: 3, title: "产品360°旋转展示", cat: "商业广告", prompt: "Smooth 360-degree rotation of a premium product on a clean marble surface, soft studio lighting with rim light, gentle shadows, macro detail, ultra-sharp focus, commercial photography style", neg: "cluttered background, harsh shadows", model: "Seedance 2.0", uses: 6129, tags: ["产品", "电商", "展示"], preview: "📦" },
  { id: 4, title: "赛博朋克霓虹街景", cat: "电影风格", prompt: "POV walking through a rain-soaked cyberpunk alley at night, neon signs reflecting in puddles, steam rising from vents, holographic advertisements, Blade Runner atmosphere, slow motion, 2K cinematic", neg: "daytime, bright, cheerful", model: "Happy Horse", uses: 4523, tags: ["赛博朋克", "夜景", "氛围"], preview: "🌃" },
  { id: 5, title: "二次元角色行走", cat: "角色一致", prompt: "Anime-style character with consistent blue hair and school uniform walking through a vibrant Japanese shopping street, cherry blossoms, detailed clothing animation, Studio Ghibli color palette, smooth motion", neg: "realistic, photographic, blurry face", model: "Seedance 2.0", uses: 7891, tags: ["二次元", "角色", "动画"], preview: "🎨" },
  { id: 6, title: "美食ASMR微距特写", cat: "商业广告", prompt: "Extreme close-up of sizzling wagyu beef on a hot stone grill, oil droplets splashing in slow motion, steam rising, shallow depth of field, warm tungsten lighting, ASMR style, macro lens", neg: "wide shot, people, text overlay", model: "PixVerse V6", uses: 3456, tags: ["美食", "微距", "ASMR"], preview: "🍜" },
  { id: 7, title: "求职自我介绍模板", cat: "校园场景", prompt: "Medium close-up of a confident young professional speaking directly to camera in a bright modern co-working space, soft natural window light, gentle bokeh background, professional but approachable, steady tripod shot", neg: "dark, messy background, unfocused", model: "Seedance 2.0", uses: 9213, tags: ["求职", "自我介绍", "面试"], preview: "🙋" },
  { id: 8, title: "自然风光延时摄影", cat: "电影风格", prompt: "Breathtaking hyperlapse of misty mountain peaks at sunrise, golden light piercing through clouds, parallax effect, time-lapse cloud movement, National Geographic cinematography, orchestral mood", neg: "urban, buildings, people", model: "Happy Horse", uses: 4102, tags: ["风景", "延时", "山脉"], preview: "🏔️" },
  { id: 9, title: "角色多角度一致性", cat: "角色一致", prompt: "Character turnaround sheet: front view, 3/4 view, side view, back view of a young female character with short red hair, white jacket, detailed consistent design, clean white background, character design reference", neg: "different characters, inconsistent clothing", model: "Seedance 2.0", uses: 6734, tags: ["角色设计", "一致性", "三视图"], preview: "👤" },
  { id: 10, title: "科技产品发布会片头", cat: "商业广告", prompt: "Epic product reveal: sleek smartphone emerging from particles of light, dramatic rim lighting, dark environment with subtle blue accent, slow rotation, lens flare, cinematic trailer feel, Hans Zimmer style tension", neg: "cheap, plastic, cartoon", model: "PixVerse V6", uses: 3289, tags: ["科技", "发布会", "产品"], preview: "📱" },
  { id: 11, title: "水墨风中国风转场", cat: "创意特效", prompt: "Traditional Chinese ink wash painting style animation, black ink flowing and transforming into a mountain landscape, rice paper texture, minimalist composition, zen atmosphere, smooth morphing transition", neg: "colorful, modern, urban", model: "Seedance 2.0", uses: 5167, tags: ["中国风", "水墨", "转场"], preview: "🏯" },
  { id: 12, title: "图生视频：人物照片动态化", cat: "图生视频", prompt: "Animate this portrait photo with subtle natural movements: gentle head turn, soft smile forming, hair slightly moving in breeze, eyes blinking naturally, maintain original appearance and lighting exactly", neg: "distorted face, different person, extreme motion", model: "Seedance 2.0", uses: 8456, tags: ["图生视频", "人像", "动态"], preview: "🖼️" },
  { id: 13, title: "校园毕业季航拍", cat: "校园场景", prompt: "Drone ascending shot over university graduation ceremony, students throwing caps in the air, confetti falling, golden afternoon light, wide-angle lens, joyful atmosphere, smooth vertical rise", neg: "rain, dark, empty campus", model: "Happy Horse", uses: 4623, tags: ["毕业", "航拍", "庆典"], preview: "🎓" },
  { id: 14, title: "粒子消散特效", cat: "创意特效", prompt: "Person standing still as their body gradually dissolves into thousands of glowing golden particles drifting upward, dramatic backlighting, dark background, slow motion, ethereal and emotional mood", neg: "abrupt, low quality, cartoon", model: "PixVerse V6", uses: 3891, tags: ["特效", "粒子", "创意"], preview: "✨" },
  { id: 15, title: "咖啡制作过程特写", cat: "商业广告", prompt: "Smooth tracking shot of artisan coffee making process: espresso pouring into cup, milk steaming and swirling into latte art, close-up foam patterns forming, warm cafe lighting, satisfying ASMR style", neg: "dirty, instant coffee, bad lighting", model: "Seedance 2.0", uses: 2987, tags: ["咖啡", "制作过程", "特写"], preview: "☕" },
  { id: 16, title: "文生视频：海底世界", cat: "文生视频", prompt: "Underwater cinematic shot of a vibrant coral reef, tropical fish swimming in schools, sunlight rays penetrating crystal clear water, gentle current motion, BBC Planet Earth documentary style, 4K", neg: "muddy water, pollution, dark", model: "Happy Horse", uses: 3654, tags: ["海底", "自然", "纪录片"], preview: "🐠" },
];

export default function PromptsPage() {
  const [cat, setCat] = useState("全部");
  const [search, setSearch] = useState("");
  const [sort, setSort] = useState("hot");
  const [expanded, setExpanded] = useState(null);
  const [copied, setCopied] = useState(null);

  const filtered = PROMPTS.filter(p => {
    if (cat !== "全部" && p.cat !== cat) return false;
    if (search && !p.title.includes(search) && !p.prompt.toLowerCase().includes(search.toLowerCase()) && !p.tags.some(t => t.includes(search))) return false;
    return true;
  }).sort((a, b) => sort === "hot" ? b.uses - a.uses : b.id - a.id);

  const copyPrompt = (p) => {
    navigator.clipboard?.writeText(p.prompt);
    setCopied(p.id);
    setTimeout(() => setCopied(null), 2000);
  };

  return (
    <div style={{ minHeight: "100vh", background: "#080b14", color: "#d4d8e0", fontFamily: "'Noto Sans SC','DM Sans',sans-serif" }}>
      <style>{`@import url('https://fonts.googleapis.com/css2?family=Noto+Sans+SC:wght@300;400;500;700;900&family=DM+Sans:wght@400;500;700&family=JetBrains+Mono:wght@400&display=swap');*{margin:0;padding:0;box-sizing:border-box}::-webkit-scrollbar{width:5px}::-webkit-scrollbar-thumb{background:#1e2744;border-radius:3px}@keyframes fadeIn{from{opacity:0;transform:translateY(12px)}to{opacity:1;transform:translateY(0)}}@keyframes pop{0%{transform:scale(1)}50%{transform:scale(1.15)}100%{transform:scale(1)}}`}</style>

      <div style={{ maxWidth: 1200, margin: "0 auto", padding: "48px 32px 80px" }}>
        <div style={{ display: "flex", alignItems: "flex-end", justifyContent: "space-between", marginBottom: 32, flexWrap: "wrap", gap: 16 }}>
          <div>
            <h1 style={{ fontSize: 32, fontWeight: 900, letterSpacing: -1, marginBottom: 6 }}>提示词模板库</h1>
            <p style={{ fontSize: 14, opacity: .45 }}>精选{PROMPTS.length}+提示词 · 每周更新 · 一键复制到AI工作台</p>
          </div>
          <input value={search} onChange={e => setSearch(e.target.value)} placeholder="搜索提示词、标签..."
            style={{ padding: "10px 18px", borderRadius: 10, border: "1px solid #1e2744", background: "#0c1020", color: "#d4d8e0", fontSize: 13, width: 280, outline: "none" }} />
        </div>

        {/* Category + sort */}
        <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 24, flexWrap: "wrap" }}>
          {CATS.map(c => (
            <button key={c} onClick={() => setCat(c)} style={{
              padding: "7px 16px", borderRadius: 8, border: "none", fontSize: 12, cursor: "pointer", fontWeight: 600,
              background: cat === c ? "rgba(6,182,212,.12)" : "#0f1428", color: cat === c ? "#06b6d4" : "#5a6785", transition: "all .2s",
            }}>{c}</button>
          ))}
          <div style={{ marginLeft: "auto", display: "flex", gap: 4 }}>
            {[["hot", "🔥 最热"], ["new", "🕐 最新"]].map(([k, l]) => (
              <button key={k} onClick={() => setSort(k)} style={{
                padding: "6px 14px", borderRadius: 6, border: "none", fontSize: 11, cursor: "pointer",
                background: sort === k ? "#1a2240" : "transparent", color: sort === k ? "#d4d8e0" : "#4a5570",
              }}>{l}</button>
            ))}
          </div>
        </div>

        {/* Grid */}
        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill,minmax(360px,1fr))", gap: 16 }}>
          {filtered.map((p, i) => {
            const isExp = expanded === p.id;
            return (
              <div key={p.id} style={{
                borderRadius: 14, background: "#0c1020", border: "1px solid #161d30",
                overflow: "hidden", transition: "all .2s", animation: `fadeIn .3s ease ${i * .03}s both`,
              }}>
                {/* Header */}
                <div style={{ padding: "14px 18px", display: "flex", alignItems: "center", gap: 10 }}>
                  <span style={{ fontSize: 26 }}>{p.preview}</span>
                  <div style={{ flex: 1 }}>
                    <h3 style={{ fontSize: 14, fontWeight: 700, marginBottom: 3 }}>{p.title}</h3>
                    <div style={{ display: "flex", gap: 6, fontSize: 10 }}>
                      <span style={{ padding: "2px 7px", borderRadius: 4, background: "#111627", color: "#5a6785" }}>{p.cat}</span>
                      <span style={{ padding: "2px 7px", borderRadius: 4, background: "#111627", color: "#5a6785" }}>{p.model}</span>
                      <span style={{ color: "#4a5570" }}>🔥 {p.uses.toLocaleString()}</span>
                    </div>
                  </div>
                  <button onClick={() => setExpanded(isExp ? null : p.id)} style={{
                    width: 30, height: 30, borderRadius: 7, border: "1px solid #1e2744", background: "transparent",
                    color: "#5a6785", fontSize: 12, cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center",
                  }}>{isExp ? "▲" : "▼"}</button>
                </div>

                {/* Prompt preview */}
                <div style={{ padding: "0 18px 14px" }}>
                  <div style={{
                    padding: 12, borderRadius: 8, background: "#111627", border: "1px solid #1a2240",
                    fontFamily: "'JetBrains Mono',monospace", fontSize: 11, color: "#8b9dc0", lineHeight: 1.7,
                    maxHeight: isExp ? 400 : 60, overflow: "hidden", transition: "max-height .3s ease",
                  }}>
                    <span style={{ color: "#06b6d4" }}>prompt: </span>{p.prompt}
                    {isExp && p.neg && (
                      <div style={{ marginTop: 8, paddingTop: 8, borderTop: "1px solid #1a2240" }}>
                        <span style={{ color: "#ef4444" }}>negative: </span>{p.neg}
                      </div>
                    )}
                  </div>
                </div>

                {/* Tags */}
                {isExp && (
                  <div style={{ padding: "0 18px 8px", display: "flex", gap: 6, flexWrap: "wrap" }}>
                    {p.tags.map(t => (
                      <span key={t} style={{ padding: "3px 10px", borderRadius: 12, background: "#111627", fontSize: 11, color: "#6b7a99" }}>#{t}</span>
                    ))}
                  </div>
                )}

                {/* Actions */}
                <div style={{ padding: "8px 18px 14px", display: "flex", gap: 8 }}>
                  <button onClick={() => copyPrompt(p)} style={{
                    flex: 1, padding: "9px 0", borderRadius: 8, border: "none", fontSize: 12, fontWeight: 600, cursor: "pointer",
                    background: copied === p.id ? "rgba(16,185,129,.12)" : "rgba(6,182,212,.08)",
                    color: copied === p.id ? "#10b981" : "#06b6d4", transition: "all .2s",
                  }}>
                    {copied === p.id ? "✅ 已复制" : "📋 复制提示词"}
                  </button>
                  <button style={{
                    flex: 1, padding: "9px 0", borderRadius: 8, border: "none", fontSize: 12, fontWeight: 600, cursor: "pointer",
                    background: "linear-gradient(135deg,#06b6d4,#8b5cf6)", color: "#fff",
                  }}>✨ 去工作台使用</button>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
