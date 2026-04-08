import { useState, useRef, useCallback, useEffect } from "react";

// ─── Data ───
const MODELS = [
  { id: "seedance", name: "Seedance 2.0", badge: "电影级", color: "#f59e0b", desc: "字节跳动｜2K原生音频" },
  { id: "happyhorse", name: "Happy Horse 1.0", badge: "#1 Elo", color: "#10b981", desc: "开源15B｜音视频联合生成" },
  { id: "pixverse", name: "PixVerse V6", badge: "15秒", color: "#8b5cf6", desc: "阿里系｜20+镜头控制" },
];

const TEMPLATES = [
  { id: "t1", icon: "🎓", title: "校园宣传片", prompt: "Cinematic aerial shot of a modern university campus at golden hour, students walking on tree-lined paths, warm sunlight, smooth dolly forward", cat: "校园" },
  { id: "t2", icon: "💼", title: "求职自我介绍", prompt: "Medium close-up of a confident young professional speaking to camera in a bright modern office, soft bokeh background, natural lighting", cat: "求职" },
  { id: "t3", icon: "📦", title: "产品展示特写", prompt: "Smooth 360-degree rotation of a sleek product on a marble surface, studio lighting, soft shadows, ultra-detailed macro shot", cat: "商业" },
  { id: "t4", icon: "🌆", title: "城市航拍延时", prompt: "Hyperlapse aerial view of a bustling cityscape transitioning from day to night, traffic light trails, cinematic color grading", cat: "电影" },
  { id: "t5", icon: "🎬", title: "电影级开场", prompt: "Epic slow-motion establishing shot, fog rolling through a mystical forest, volumetric light rays, anamorphic lens flare, orchestral mood", cat: "电影" },
  { id: "t6", icon: "🍜", title: "美食微距", prompt: "Extreme close-up of sizzling food in a wok, steam rising, oil droplets, shallow depth of field, warm color temperature, ASMR style", cat: "商业" },
  { id: "t7", icon: "🎨", title: "二次元角色", prompt: "Anime-style character walking through a vibrant cherry blossom garden, flowing hair, detailed clothing, Studio Ghibli inspired", cat: "创意" },
  { id: "t8", icon: "🏔️", title: "自然风光", prompt: "Breathtaking drone shot ascending over misty mountain peaks at sunrise, golden light, parallax clouds, National Geographic style", cat: "电影" },
];

const CATS = ["全部", "校园", "求职", "商业", "电影", "创意"];

let _nid = 100;
const nid = () => ++_nid;

// ─── Component ───
export default function Workbench() {
  // Canvas state
  const [offset, setOffset] = useState({ x: 0, y: 0 });
  const [zoom, setZoom] = useState(1);
  const [isPanning, setIsPanning] = useState(false);
  const panStart = useRef({ x: 0, y: 0 });
  const canvasRef = useRef(null);

  // Nodes
  const [nodes, setNodes] = useState([
    { id: 1, x: 80, y: 80, type: "text2video", prompt: "", model: "seedance", status: "idle", result: null, title: "新建文生视频", duration: 5, ratio: "16:9" },
  ]);
  const [selectedId, setSelectedId] = useState(1);
  const [draggingId, setDraggingId] = useState(null);
  const dragOff = useRef({ x: 0, y: 0 });

  // Sidebar
  const [sidebarTab, setSidebarTab] = useState("templates");
  const [catFilter, setCatFilter] = useState("全部");
  const [searchQ, setSearchQ] = useState("");

  const selected = nodes.find(n => n.id === selectedId);

  // ── Canvas pan ──
  const onCanvasDown = useCallback((e) => {
    if (e.target === canvasRef.current || e.target.dataset.canvas) {
      setIsPanning(true);
      panStart.current = { x: e.clientX - offset.x, y: e.clientY - offset.y };
      setSelectedId(null);
    }
  }, [offset]);

  const onCanvasMove = useCallback((e) => {
    if (isPanning) {
      setOffset({ x: e.clientX - panStart.current.x, y: e.clientY - panStart.current.y });
    }
    if (draggingId != null) {
      setNodes(ns => ns.map(n => n.id === draggingId ? { ...n, x: (e.clientX - dragOff.current.x - offset.x) / zoom, y: (e.clientY - dragOff.current.y - offset.y) / zoom } : n));
    }
  }, [isPanning, draggingId, offset, zoom]);

  const onCanvasUp = useCallback(() => { setIsPanning(false); setDraggingId(null); }, []);

  const onWheel = useCallback((e) => {
    e.preventDefault();
    setZoom(z => Math.min(2, Math.max(0.3, z - e.deltaY * 0.001)));
  }, []);

  useEffect(() => {
    const el = canvasRef.current;
    if (el) el.addEventListener("wheel", onWheel, { passive: false });
    return () => el?.removeEventListener("wheel", onWheel);
  }, [onWheel]);

  // ── Node drag ──
  const onNodeDown = (e, id) => {
    e.stopPropagation();
    setSelectedId(id);
    setDraggingId(id);
    const n = nodes.find(nn => nn.id === id);
    dragOff.current = { x: e.clientX - (n.x * zoom + offset.x), y: e.clientY - (n.y * zoom + offset.y) };
  };

  // ── Add node ──
  const addNode = (tpl) => {
    const id = nid();
    const cx = (window.innerWidth / 2 - offset.x) / zoom;
    const cy = (window.innerHeight / 2 - offset.y) / zoom;
    setNodes(ns => [...ns, {
      id, x: cx + Math.random() * 60 - 30, y: cy + Math.random() * 60 - 30,
      type: "text2video", prompt: tpl?.prompt || "", model: "seedance",
      status: "idle", result: null, title: tpl?.title || "新建节点",
      duration: 5, ratio: "16:9",
    }]);
    setSelectedId(id);
  };

  // ── Double click canvas → add node ──
  const onCanvasDbl = (e) => {
    if (e.target === canvasRef.current || e.target.dataset.canvas) {
      const id = nid();
      const x = (e.clientX - offset.x) / zoom;
      const y = (e.clientY - offset.y) / zoom;
      setNodes(ns => [...ns, { id, x, y, type: "text2video", prompt: "", model: "seedance", status: "idle", result: null, title: "新建节点", duration: 5, ratio: "16:9" }]);
      setSelectedId(id);
    }
  };

  // ── Fake generate ──
  const doGenerate = (id) => {
    setNodes(ns => ns.map(n => n.id === id ? { ...n, status: "generating" } : n));
    setTimeout(() => {
      setNodes(ns => ns.map(n => n.id === id ? { ...n, status: "done", result: { url: "#", thumb: null } } : n));
    }, 3000 + Math.random() * 2000);
  };

  const updateNode = (id, patch) => setNodes(ns => ns.map(n => n.id === id ? { ...n, ...patch } : n));
  const deleteNode = (id) => { setNodes(ns => ns.filter(n => n.id !== id)); if (selectedId === id) setSelectedId(null); };

  const filteredTpls = TEMPLATES.filter(t =>
    (catFilter === "全部" || t.cat === catFilter) &&
    (!searchQ || t.title.includes(searchQ) || t.prompt.toLowerCase().includes(searchQ.toLowerCase()))
  );

  // ── Styles ──
  const S = {
    root: { display: "flex", height: "100vh", background: "#080b14", color: "#d4d8e0", fontFamily: "'Noto Sans SC', 'DM Sans', sans-serif", overflow: "hidden", fontSize: 13 },
    sidebar: { width: 280, background: "#0c1020", borderRight: "1px solid #161d30", display: "flex", flexDirection: "column", flexShrink: 0, zIndex: 10 },
    canvas: { flex: 1, position: "relative", cursor: isPanning ? "grabbing" : "grab", userSelect: "none", overflow: "hidden" },
    panel: { width: 320, background: "#0c1020", borderLeft: "1px solid #161d30", overflowY: "auto", flexShrink: 0, zIndex: 10 },
  };

  return (
    <div style={S.root}>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Noto+Sans+SC:wght@300;400;500;700&family=DM+Sans:wght@400;500;700&family=JetBrains+Mono:wght@400;500&display=swap');
        * { margin:0; padding:0; box-sizing:border-box; }
        ::-webkit-scrollbar { width:5px; } ::-webkit-scrollbar-track { background:#0c1020; } ::-webkit-scrollbar-thumb { background:#1e2744; border-radius:3px; }
        @keyframes spin { to { transform:rotate(360deg); } }
        @keyframes pulse2 { 0%,100%{opacity:.6} 50%{opacity:1} }
        @keyframes nodeIn { from{opacity:0;transform:scale(.9)} to{opacity:1;transform:scale(1)} }
        input,textarea,select { font-family:inherit; }
      `}</style>

      {/* ═══ LEFT SIDEBAR ═══ */}
      <div style={S.sidebar}>
        {/* Logo */}
        <div style={{ padding: "16px 20px", borderBottom: "1px solid #161d30", display: "flex", alignItems: "center", gap: 10 }}>
          <div style={{ width: 30, height: 30, borderRadius: 8, background: "linear-gradient(135deg,#06b6d4,#8b5cf6)", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 14, fontWeight: 900, color: "#fff" }}>V</div>
          <span style={{ fontWeight: 700, fontSize: 15 }}>AI 工作台</span>
          <span style={{ marginLeft: "auto", fontSize: 11, opacity: .4 }}>⌘+滚轮缩放</span>
        </div>

        {/* Tabs */}
        <div style={{ display: "flex", borderBottom: "1px solid #161d30" }}>
          {[["templates", "模板库"], ["tools", "工具"]].map(([k, l]) => (
            <button key={k} onClick={() => setSidebarTab(k)} style={{
              flex: 1, padding: "10px 0", border: "none", background: "transparent", cursor: "pointer",
              color: sidebarTab === k ? "#06b6d4" : "#6b7a99", fontSize: 12, fontWeight: 600,
              borderBottom: sidebarTab === k ? "2px solid #06b6d4" : "2px solid transparent",
            }}>{l}</button>
          ))}
        </div>

        {sidebarTab === "templates" ? (
          <div style={{ flex: 1, overflowY: "auto", padding: 12 }}>
            {/* Search */}
            <input value={searchQ} onChange={e => setSearchQ(e.target.value)} placeholder="搜索模板..."
              style={{ width: "100%", padding: "8px 12px", borderRadius: 8, border: "1px solid #1e2744", background: "#111627", color: "#d4d8e0", fontSize: 12, outline: "none", marginBottom: 10 }} />
            {/* Cat filter */}
            <div style={{ display: "flex", gap: 6, flexWrap: "wrap", marginBottom: 12 }}>
              {CATS.map(c => (
                <button key={c} onClick={() => setCatFilter(c)} style={{
                  padding: "4px 10px", borderRadius: 6, border: "none", fontSize: 11, cursor: "pointer",
                  background: catFilter === c ? "rgba(6,182,212,.15)" : "#111627",
                  color: catFilter === c ? "#06b6d4" : "#6b7a99",
                }}>{c}</button>
              ))}
            </div>
            {/* Template cards */}
            {filteredTpls.map(t => (
              <div key={t.id} onClick={() => addNode(t)} style={{
                padding: 12, borderRadius: 10, background: "#111627", border: "1px solid #1e2744",
                marginBottom: 8, cursor: "pointer", transition: "all .2s",
              }}
                onMouseEnter={e => { e.currentTarget.style.borderColor = "#06b6d433"; e.currentTarget.style.background = "#141a2e"; }}
                onMouseLeave={e => { e.currentTarget.style.borderColor = "#1e2744"; e.currentTarget.style.background = "#111627"; }}
              >
                <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 6 }}>
                  <span style={{ fontSize: 18 }}>{t.icon}</span>
                  <span style={{ fontWeight: 600, fontSize: 13 }}>{t.title}</span>
                  <span style={{ marginLeft: "auto", fontSize: 10, padding: "2px 6px", borderRadius: 4, background: "#1e2744", color: "#6b7a99" }}>{t.cat}</span>
                </div>
                <div style={{ fontSize: 11, color: "#5a6785", lineHeight: 1.5, display: "-webkit-box", WebkitLineClamp: 2, WebkitBoxOrient: "vertical", overflow: "hidden" }}>{t.prompt}</div>
              </div>
            ))}
          </div>
        ) : (
          <div style={{ flex: 1, overflowY: "auto", padding: 12 }}>
            {[
              { icon: "✨", label: "文生视频", desc: "输入提示词生成视频" },
              { icon: "🖼️", label: "图生视频", desc: "上传图片生成动态视频" },
              { icon: "🔮", label: "视频反推", desc: "粘贴链接提取提示词" },
              { icon: "📝", label: "文本节点", desc: "写脚本或备注" },
            ].map((tool, i) => (
              <div key={i} onClick={() => addNode({ title: tool.label, prompt: "" })} style={{
                padding: 14, borderRadius: 10, background: "#111627", border: "1px solid #1e2744",
                marginBottom: 8, cursor: "pointer", display: "flex", alignItems: "center", gap: 12,
                transition: "all .2s",
              }}
                onMouseEnter={e => e.currentTarget.style.borderColor = "#06b6d433"}
                onMouseLeave={e => e.currentTarget.style.borderColor = "#1e2744"}
              >
                <span style={{ fontSize: 22 }}>{tool.icon}</span>
                <div>
                  <div style={{ fontWeight: 600, marginBottom: 2 }}>{tool.label}</div>
                  <div style={{ fontSize: 11, color: "#5a6785" }}>{tool.desc}</div>
                </div>
              </div>
            ))}
            <div style={{ marginTop: 16, padding: 12, borderRadius: 10, background: "rgba(6,182,212,.06)", border: "1px solid rgba(6,182,212,.12)", fontSize: 11, color: "#6b99aa", lineHeight: 1.6 }}>
              💡 <b>提示</b>：双击画布空白处也可快速创建节点
            </div>
          </div>
        )}

        {/* Bottom: credits */}
        <div style={{ padding: "12px 16px", borderTop: "1px solid #161d30", display: "flex", alignItems: "center", justifyContent: "space-between" }}>
          <div style={{ display: "flex", alignItems: "center", gap: 6 }}>
            <span style={{ fontSize: 14 }}>💎</span>
            <span style={{ fontWeight: 700, fontSize: 14 }}>286</span>
            <span style={{ fontSize: 11, opacity: .4 }}>积分</span>
          </div>
          <button style={{ padding: "6px 14px", borderRadius: 7, border: "none", background: "linear-gradient(135deg,#06b6d4,#8b5cf6)", color: "#fff", fontSize: 11, fontWeight: 600, cursor: "pointer" }}>充值</button>
        </div>
      </div>

      {/* ═══ CANVAS ═══ */}
      <div ref={canvasRef} style={S.canvas}
        onMouseDown={onCanvasDown} onMouseMove={onCanvasMove} onMouseUp={onCanvasUp} onMouseLeave={onCanvasUp}
        onDoubleClick={onCanvasDbl}
      >
        {/* Grid bg */}
        <div data-canvas="true" style={{
          position: "absolute", inset: 0, pointerEvents: "none",
          backgroundImage: `radial-gradient(circle, #1a2240 1px, transparent 1px)`,
          backgroundSize: `${24 * zoom}px ${24 * zoom}px`,
          backgroundPosition: `${offset.x}px ${offset.y}px`,
          opacity: 0.4,
        }} />

        {/* Nodes layer */}
        <div style={{ position: "absolute", left: 0, top: 0, transform: `translate(${offset.x}px, ${offset.y}px) scale(${zoom})`, transformOrigin: "0 0" }}>
          {nodes.map(n => {
            const mdl = MODELS.find(m => m.id === n.model);
            const isSel = selectedId === n.id;
            return (
              <div key={n.id}
                onMouseDown={(e) => onNodeDown(e, n.id)}
                style={{
                  position: "absolute", left: n.x, top: n.y,
                  width: 340, minHeight: 120,
                  background: "#0f1428", borderRadius: 14,
                  border: `1.5px solid ${isSel ? "#06b6d4" : "#1e2744"}`,
                  boxShadow: isSel ? "0 0 24px rgba(6,182,212,.12)" : "0 4px 20px rgba(0,0,0,.3)",
                  cursor: draggingId === n.id ? "grabbing" : "grab",
                  animation: "nodeIn .3s ease",
                  transition: "border-color .2s, box-shadow .2s",
                }}
              >
                {/* Header */}
                <div style={{ padding: "10px 14px", borderBottom: "1px solid #1a2240", display: "flex", alignItems: "center", gap: 8 }}>
                  <div style={{ width: 8, height: 8, borderRadius: "50%", background: n.status === "done" ? "#10b981" : n.status === "generating" ? "#f59e0b" : "#2a3656" }} />
                  <span style={{ fontWeight: 600, fontSize: 13, flex: 1 }}>{n.title}</span>
                  <span style={{ fontSize: 10, padding: "2px 8px", borderRadius: 5, background: mdl?.color + "18", color: mdl?.color, fontWeight: 600 }}>{mdl?.name}</span>
                </div>

                {/* Body */}
                <div style={{ padding: 14 }}>
                  {/* Prompt preview */}
                  <div style={{
                    padding: 10, borderRadius: 8, background: "#111627", border: "1px solid #1a2240",
                    fontSize: 11, color: n.prompt ? "#8b9dc0" : "#3d4b6b", lineHeight: 1.6,
                    minHeight: 48, fontFamily: "'JetBrains Mono', monospace",
                    display: "-webkit-box", WebkitLineClamp: 3, WebkitBoxOrient: "vertical", overflow: "hidden",
                  }}>
                    {n.prompt || "点击右侧面板编辑提示词..."}
                  </div>

                  {/* Params row */}
                  <div style={{ display: "flex", gap: 8, marginTop: 10, fontSize: 11, color: "#5a6785" }}>
                    <span style={{ padding: "3px 8px", borderRadius: 5, background: "#111627" }}>⏱ {n.duration}s</span>
                    <span style={{ padding: "3px 8px", borderRadius: 5, background: "#111627" }}>📐 {n.ratio}</span>
                    <span style={{ padding: "3px 8px", borderRadius: 5, background: "#111627" }}>💎 {n.duration * 2}</span>
                  </div>

                  {/* Status / Result */}
                  {n.status === "generating" && (
                    <div style={{ marginTop: 12, display: "flex", alignItems: "center", gap: 8, color: "#f59e0b", fontSize: 12 }}>
                      <div style={{ width: 16, height: 16, border: "2px solid #f59e0b", borderTopColor: "transparent", borderRadius: "50%", animation: "spin 1s linear infinite" }} />
                      生成中...
                    </div>
                  )}
                  {n.status === "done" && (
                    <div style={{ marginTop: 12 }}>
                      <div style={{ width: "100%", height: 140, borderRadius: 8, background: "linear-gradient(135deg,#141a2e,#1a2444)", display: "flex", alignItems: "center", justifyContent: "center", border: "1px solid #1e2744" }}>
                        <div style={{ textAlign: "center" }}>
                          <div style={{ fontSize: 32, marginBottom: 6 }}>🎬</div>
                          <div style={{ fontSize: 11, color: "#10b981", fontWeight: 600 }}>生成完成</div>
                          <div style={{ fontSize: 10, color: "#5a6785", marginTop: 2 }}>点击预览 · 右键下载</div>
                        </div>
                      </div>
                    </div>
                  )}
                </div>

                {/* Footer: generate button */}
                <div style={{ padding: "8px 14px 12px", display: "flex", gap: 8 }}>
                  <button onClick={(e) => { e.stopPropagation(); doGenerate(n.id); }}
                    disabled={n.status === "generating" || !n.prompt}
                    style={{
                      flex: 1, padding: "9px 0", borderRadius: 8, border: "none",
                      background: n.status === "generating" || !n.prompt ? "#1a2240" : "linear-gradient(135deg,#06b6d4,#8b5cf6)",
                      color: n.status === "generating" || !n.prompt ? "#3d4b6b" : "#fff",
                      fontSize: 12, fontWeight: 600, cursor: n.status === "generating" || !n.prompt ? "not-allowed" : "pointer",
                    }}>
                    {n.status === "generating" ? "生成中..." : n.status === "done" ? "重新生成" : "✨ 生成视频"}
                  </button>
                  <button onClick={(e) => { e.stopPropagation(); deleteNode(n.id); }} style={{
                    width: 34, borderRadius: 8, border: "1px solid #1e2744", background: "transparent", color: "#5a6785", fontSize: 14, cursor: "pointer",
                  }}>×</button>
                </div>
              </div>
            );
          })}
        </div>

        {/* Zoom indicator */}
        <div style={{ position: "absolute", bottom: 16, left: "50%", transform: "translateX(-50%)", display: "flex", alignItems: "center", gap: 8, padding: "6px 14px", borderRadius: 8, background: "rgba(12,16,32,.85)", border: "1px solid #1e2744", fontSize: 11, color: "#5a6785" }}>
          <button onClick={() => setZoom(z => Math.max(0.3, z - 0.1))} style={{ background: "none", border: "none", color: "#6b7a99", cursor: "pointer", fontSize: 14 }}>−</button>
          <span style={{ minWidth: 40, textAlign: "center", fontFamily: "'JetBrains Mono', monospace" }}>{Math.round(zoom * 100)}%</span>
          <button onClick={() => setZoom(z => Math.min(2, z + 0.1))} style={{ background: "none", border: "none", color: "#6b7a99", cursor: "pointer", fontSize: 14 }}>+</button>
          <div style={{ width: 1, height: 14, background: "#1e2744" }} />
          <button onClick={() => { setZoom(1); setOffset({ x: 0, y: 0 }); }} style={{ background: "none", border: "none", color: "#6b7a99", cursor: "pointer", fontSize: 11 }}>重置</button>
        </div>

        {/* Top bar */}
        <div style={{ position: "absolute", top: 16, left: "50%", transform: "translateX(-50%)", display: "flex", gap: 6, padding: "6px 10px", borderRadius: 10, background: "rgba(12,16,32,.85)", border: "1px solid #1e2744" }}>
          {[["文生视频", "✨"], ["图生视频", "🖼️"], ["视频反推", "🔮"]].map(([label, icon]) => (
            <button key={label} onClick={() => addNode({ title: label, prompt: "" })} style={{
              padding: "6px 14px", borderRadius: 7, border: "1px solid #1e2744", background: "transparent",
              color: "#8b9dc0", fontSize: 12, cursor: "pointer", display: "flex", alignItems: "center", gap: 5,
              transition: "all .15s",
            }}
              onMouseEnter={e => { e.currentTarget.style.background = "#141a2e"; e.currentTarget.style.borderColor = "#06b6d433"; }}
              onMouseLeave={e => { e.currentTarget.style.background = "transparent"; e.currentTarget.style.borderColor = "#1e2744"; }}
            >{icon} {label}</button>
          ))}
        </div>
      </div>

      {/* ═══ RIGHT PANEL ═══ */}
      <div style={S.panel}>
        {selected ? (
          <div style={{ padding: 0 }}>
            {/* Panel header */}
            <div style={{ padding: "16px 20px", borderBottom: "1px solid #161d30" }}>
              <div style={{ fontSize: 14, fontWeight: 700, marginBottom: 2 }}>{selected.title}</div>
              <div style={{ fontSize: 11, color: "#5a6785" }}>节点 #{selected.id} · {selected.status === "done" ? "✅ 已完成" : selected.status === "generating" ? "⏳ 生成中" : "编辑中"}</div>
            </div>

            <div style={{ padding: 20 }}>
              {/* Model selector */}
              <label style={{ fontSize: 11, fontWeight: 600, color: "#6b7a99", display: "block", marginBottom: 8 }}>AI 模型</label>
              <div style={{ display: "flex", flexDirection: "column", gap: 6, marginBottom: 20 }}>
                {MODELS.map(m => (
                  <div key={m.id} onClick={() => updateNode(selected.id, { model: m.id })} style={{
                    padding: "10px 12px", borderRadius: 10, cursor: "pointer",
                    background: selected.model === m.id ? m.color + "10" : "#111627",
                    border: `1.5px solid ${selected.model === m.id ? m.color + "44" : "#1e2744"}`,
                    transition: "all .2s",
                  }}>
                    <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                      <div style={{ width: 8, height: 8, borderRadius: "50%", background: m.color }} />
                      <span style={{ fontWeight: 600, fontSize: 13 }}>{m.name}</span>
                      <span style={{ marginLeft: "auto", fontSize: 10, padding: "2px 6px", borderRadius: 4, background: m.color + "18", color: m.color, fontWeight: 600 }}>{m.badge}</span>
                    </div>
                    <div style={{ fontSize: 11, color: "#5a6785", marginTop: 4, marginLeft: 16 }}>{m.desc}</div>
                  </div>
                ))}
              </div>

              {/* Prompt */}
              <label style={{ fontSize: 11, fontWeight: 600, color: "#6b7a99", display: "block", marginBottom: 6 }}>提示词 Prompt</label>
              <textarea value={selected.prompt} onChange={e => updateNode(selected.id, { prompt: e.target.value })}
                placeholder="描述你想生成的视频画面、镜头、风格..."
                rows={6} style={{
                  width: "100%", padding: 12, borderRadius: 10, border: "1px solid #1e2744",
                  background: "#111627", color: "#d4d8e0", fontSize: 12, lineHeight: 1.7, resize: "vertical",
                  outline: "none", fontFamily: "'JetBrains Mono', monospace",
                }} />

              {/* Params */}
              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12, marginTop: 16 }}>
                <div>
                  <label style={{ fontSize: 11, fontWeight: 600, color: "#6b7a99", display: "block", marginBottom: 6 }}>时长</label>
                  <select value={selected.duration} onChange={e => updateNode(selected.id, { duration: +e.target.value })}
                    style={{ width: "100%", padding: "8px 10px", borderRadius: 8, border: "1px solid #1e2744", background: "#111627", color: "#d4d8e0", fontSize: 12, outline: "none" }}>
                    {[3, 5, 8, 10, 15].map(d => <option key={d} value={d}>{d}秒</option>)}
                  </select>
                </div>
                <div>
                  <label style={{ fontSize: 11, fontWeight: 600, color: "#6b7a99", display: "block", marginBottom: 6 }}>画面比例</label>
                  <select value={selected.ratio} onChange={e => updateNode(selected.id, { ratio: e.target.value })}
                    style={{ width: "100%", padding: "8px 10px", borderRadius: 8, border: "1px solid #1e2744", background: "#111627", color: "#d4d8e0", fontSize: 12, outline: "none" }}>
                    {["16:9", "9:16", "1:1", "4:3", "21:9"].map(r => <option key={r} value={r}>{r}</option>)}
                  </select>
                </div>
              </div>

              {/* Reference image upload */}
              <label style={{ fontSize: 11, fontWeight: 600, color: "#6b7a99", display: "block", marginTop: 16, marginBottom: 6 }}>参考图（可选）</label>
              <div style={{
                padding: 24, borderRadius: 10, border: "1px dashed #1e2744", background: "#111627",
                textAlign: "center", cursor: "pointer", transition: "all .2s",
              }}
                onMouseEnter={e => e.currentTarget.style.borderColor = "#06b6d444"}
                onMouseLeave={e => e.currentTarget.style.borderColor = "#1e2744"}
              >
                <div style={{ fontSize: 22, marginBottom: 6 }}>🖼️</div>
                <div style={{ fontSize: 11, color: "#5a6785" }}>点击上传或拖入图片</div>
              </div>

              {/* Cost preview */}
              <div style={{ marginTop: 20, padding: 14, borderRadius: 10, background: "rgba(6,182,212,.05)", border: "1px solid rgba(6,182,212,.1)" }}>
                <div style={{ display: "flex", justifyContent: "space-between", fontSize: 12, marginBottom: 6 }}>
                  <span style={{ color: "#6b99aa" }}>预计消耗</span>
                  <span style={{ fontWeight: 700, color: "#06b6d4" }}>💎 {selected.duration * 2} 积分</span>
                </div>
                <div style={{ fontSize: 11, color: "#4a7080" }}>
                  {MODELS.find(m => m.id === selected.model)?.name} · {selected.duration}秒 · {selected.ratio}
                </div>
              </div>

              {/* Generate */}
              <button onClick={() => doGenerate(selected.id)}
                disabled={selected.status === "generating" || !selected.prompt}
                style={{
                  width: "100%", padding: "12px 0", borderRadius: 10, border: "none", marginTop: 16,
                  background: selected.status === "generating" || !selected.prompt ? "#1a2240" : "linear-gradient(135deg,#06b6d4,#8b5cf6)",
                  color: selected.status === "generating" || !selected.prompt ? "#3d4b6b" : "#fff",
                  fontSize: 14, fontWeight: 700, cursor: selected.status === "generating" || !selected.prompt ? "not-allowed" : "pointer",
                  boxShadow: selected.prompt && selected.status !== "generating" ? "0 0 30px rgba(6,182,212,.15)" : "none",
                }}>
                {selected.status === "generating" ? "⏳ 生成中..." : "✨ 生成视频"}
              </button>
            </div>
          </div>
        ) : (
          <div style={{ padding: 40, textAlign: "center" }}>
            <div style={{ fontSize: 40, marginBottom: 16, opacity: .3 }}>🖱️</div>
            <div style={{ fontSize: 13, color: "#3d4b6b", lineHeight: 1.8 }}>
              点击画布上的节点<br />或从左侧拖入模板<br />开始创作
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
