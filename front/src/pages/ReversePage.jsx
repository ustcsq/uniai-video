import { useState, useEffect } from "react";

const HISTORY = [
  { id: 1, url: "https://b23.tv/BV1xx...", title: "B站 · 赛博朋克城市航拍", time: "2分钟前", status: "done", prompt: "Cinematic aerial shot of a neon-lit cyberpunk city at night, rain reflections on wet streets, holographic billboards, slow dolly forward, film grain", style: "Cyberpunk / Sci-fi", camera: "Slow dolly forward", duration: 8 },
  { id: 2, url: "https://v.douyin.com/xxx", title: "抖音 · 美食探店Vlog", time: "15分钟前", status: "done", prompt: "Handheld close-up tracking shot of steaming ramen being prepared, chef adding toppings, warm restaurant ambiance, shallow depth of field, food photography style", style: "Food / ASMR", camera: "Handheld tracking", duration: 5 },
  { id: 3, url: "https://youtube.com/watch?v=xxx", title: "YouTube · 产品开箱", time: "1小时前", status: "done", prompt: "Top-down overhead shot of hands unboxing a premium gadget, clean white desk, soft diffused lighting, ASMR unwrapping sounds, satisfying reveal moment", style: "Product / Commercial", camera: "Top-down static", duration: 10 },
];

export default function ReversePage() {
  const [url, setUrl] = useState("");
  const [mode, setMode] = useState("prompt");
  const [analyzing, setAnalyzing] = useState(false);
  const [progress, setProgress] = useState(0);
  const [result, setResult] = useState(null);
  const [copied, setCopied] = useState(false);
  const [history] = useState(HISTORY);

  const doAnalyze = () => {
    if (!url.trim()) return;
    setAnalyzing(true); setProgress(0); setResult(null);
    const iv = setInterval(() => setProgress(p => { if (p >= 95) { clearInterval(iv); return 95; } return p + Math.random() * 15; }), 300);
    setTimeout(() => {
      clearInterval(iv); setProgress(100);
      setTimeout(() => {
        setAnalyzing(false);
        setResult({
          prompt: "Cinematic slow-motion close-up of a young woman turning to face camera in a sunlit field of lavender, golden hour backlighting, hair flowing in gentle breeze, shallow depth of field with bokeh, warm color grading, anamorphic lens characteristics",
          negative: "dark, indoor, harsh lighting, blurry, distorted face",
          style: "Cinematic / Golden Hour Portrait",
          camera: "Static with subtle rack focus",
          duration: "5-8 seconds",
          structure: "Single continuous shot, starts soft-focused on background then racks to subject's face turning. Key emotional beat at 60% mark when eyes meet camera.",
          mood: "Warm, nostalgic, romantic",
          lighting: "Natural golden hour backlighting with lens flare",
          model_rec: "Seedance 2.0 (best for character consistency + cinematic quality)",
        });
      }, 500);
    }, 3500);
  };

  const copyText = (text) => { navigator.clipboard?.writeText(text); setCopied(true); setTimeout(() => setCopied(false), 2000); };

  return (
    <div style={{ minHeight: "100vh", background: "#080b14", color: "#d4d8e0", fontFamily: "'Noto Sans SC','DM Sans',sans-serif" }}>
      <style>{`@import url('https://fonts.googleapis.com/css2?family=Noto+Sans+SC:wght@300;400;500;700;900&family=DM+Sans:wght@400;500;700&family=JetBrains+Mono:wght@400&display=swap');*{margin:0;padding:0;box-sizing:border-box}@keyframes shimmer{0%{background-position:-200% 0}100%{background-position:200% 0}}@keyframes fadeIn{from{opacity:0;transform:translateY(12px)}to{opacity:1;transform:translateY(0)}}`}</style>

      <div style={{ maxWidth: 960, margin: "0 auto", padding: "48px 32px 80px" }}>
        <h1 style={{ fontSize: 32, fontWeight: 900, letterSpacing: -1, marginBottom: 6 }}>🔮 视频反推助手</h1>
        <p style={{ fontSize: 14, opacity: .45, marginBottom: 40 }}>粘贴任意视频链接，AI自动分析并输出可直接使用的生成提示词</p>

        {/* Input area */}
        <div style={{ borderRadius: 16, background: "#0c1020", border: "1px solid #161d30", padding: 24, marginBottom: 24 }}>
          <div style={{ display: "flex", gap: 10, marginBottom: 16 }}>
            <input value={url} onChange={e => setUrl(e.target.value)} placeholder="粘贴视频链接（支持B站/抖音/YouTube/小红书/快手）"
              onKeyDown={e => e.key === "Enter" && doAnalyze()}
              style={{ flex: 1, padding: "14px 18px", borderRadius: 10, border: "1px solid #1e2744", background: "#111627", color: "#d4d8e0", fontSize: 14, outline: "none" }} />
            <button onClick={doAnalyze} disabled={analyzing || !url.trim()} style={{
              padding: "14px 28px", borderRadius: 10, border: "none", fontSize: 14, fontWeight: 700, cursor: analyzing || !url.trim() ? "not-allowed" : "pointer",
              background: analyzing || !url.trim() ? "#1a2240" : "linear-gradient(135deg,#f59e0b,#ef4444)", color: analyzing || !url.trim() ? "#3d4b6b" : "#fff",
              whiteSpace: "nowrap", minWidth: 120,
            }}>{analyzing ? "分析中..." : "开始分析"}</button>
          </div>

          {/* Mode selector */}
          <div style={{ display: "flex", gap: 8 }}>
            {[["prompt", "🎯 提取提示词"], ["structure", "📐 结构分析"], ["full", "📊 全面分析"]].map(([k, l]) => (
              <button key={k} onClick={() => setMode(k)} style={{
                padding: "6px 14px", borderRadius: 7, border: "none", fontSize: 12, cursor: "pointer", fontWeight: 500,
                background: mode === k ? "rgba(245,158,11,.1)" : "#111627", color: mode === k ? "#f59e0b" : "#5a6785",
              }}>{l}</button>
            ))}
            <div style={{ marginLeft: "auto", fontSize: 11, color: "#3d4b6b", display: "flex", alignItems: "center", gap: 4 }}>💎 每次消耗 3 积分</div>
          </div>

          {/* Progress bar */}
          {analyzing && (
            <div style={{ marginTop: 16 }}>
              <div style={{ height: 4, borderRadius: 2, background: "#1a2240", overflow: "hidden" }}>
                <div style={{ height: "100%", borderRadius: 2, background: "linear-gradient(90deg,#f59e0b,#ef4444)", width: `${progress}%`, transition: "width .3s" }} />
              </div>
              <div style={{ marginTop: 8, fontSize: 12, color: "#5a6785", display: "flex", justifyContent: "space-between" }}>
                <span>{progress < 30 ? "正在解析视频链接..." : progress < 60 ? "提取关键帧中..." : progress < 90 ? "AI分析视频结构..." : "生成提示词..."}</span>
                <span>{Math.round(progress)}%</span>
              </div>
            </div>
          )}
        </div>

        {/* Result */}
        {result && (
          <div style={{ animation: "fadeIn .4s ease", marginBottom: 32 }}>
            {/* Prompt result — main card */}
            <div style={{ borderRadius: 16, background: "#0c1020", border: "1px solid rgba(245,158,11,.15)", padding: 24, marginBottom: 16 }}>
              <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 14 }}>
                <h3 style={{ fontSize: 15, fontWeight: 700 }}>✨ 生成提示词</h3>
                <div style={{ display: "flex", gap: 8 }}>
                  <button onClick={() => copyText(result.prompt)} style={{
                    padding: "6px 14px", borderRadius: 7, border: "none", fontSize: 11, fontWeight: 600, cursor: "pointer",
                    background: copied ? "rgba(16,185,129,.12)" : "rgba(6,182,212,.08)", color: copied ? "#10b981" : "#06b6d4",
                  }}>{copied ? "✅ 已复制" : "📋 复制"}</button>
                  <button style={{
                    padding: "6px 14px", borderRadius: 7, border: "none", fontSize: 11, fontWeight: 600, cursor: "pointer",
                    background: "linear-gradient(135deg,#06b6d4,#8b5cf6)", color: "#fff",
                  }}>✨ 去工作台生成</button>
                </div>
              </div>
              <div style={{ padding: 16, borderRadius: 10, background: "#111627", border: "1px solid #1a2240", fontFamily: "'JetBrains Mono',monospace", fontSize: 12, lineHeight: 1.8, color: "#8b9dc0", marginBottom: 12 }}>
                <div><span style={{ color: "#06b6d4" }}>prompt:</span> {result.prompt}</div>
                <div style={{ marginTop: 8, paddingTop: 8, borderTop: "1px solid #1a2240" }}><span style={{ color: "#ef4444" }}>negative:</span> {result.negative}</div>
              </div>
              <div style={{ fontSize: 11, color: "#5a6785", display: "flex", gap: 12 }}>
                <span>🎨 推荐模型: <b style={{ color: "#f59e0b" }}>{result.model_rec}</b></span>
              </div>
            </div>

            {/* Analysis details */}
            <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill,minmax(200px,1fr))", gap: 12 }}>
              {[
                { label: "视觉风格", value: result.style, icon: "🎨" },
                { label: "镜头运动", value: result.camera, icon: "📷" },
                { label: "建议时长", value: result.duration, icon: "⏱" },
                { label: "情绪氛围", value: result.mood, icon: "💫" },
                { label: "光影特征", value: result.lighting, icon: "💡" },
              ].map((item, i) => (
                <div key={i} style={{ padding: 16, borderRadius: 12, background: "#0c1020", border: "1px solid #161d30" }}>
                  <div style={{ fontSize: 11, color: "#5a6785", marginBottom: 6 }}>{item.icon} {item.label}</div>
                  <div style={{ fontSize: 13, fontWeight: 600 }}>{item.value}</div>
                </div>
              ))}
            </div>

            {/* Structure analysis */}
            {(mode === "structure" || mode === "full") && (
              <div style={{ marginTop: 16, padding: 20, borderRadius: 14, background: "#0c1020", border: "1px solid #161d30" }}>
                <h4 style={{ fontSize: 13, fontWeight: 700, marginBottom: 10, color: "#8b5cf6" }}>📐 结构分析</h4>
                <p style={{ fontSize: 12, lineHeight: 1.8, color: "#8b9dc0" }}>{result.structure}</p>
              </div>
            )}
          </div>
        )}

        {/* History */}
        <div>
          <h3 style={{ fontSize: 15, fontWeight: 700, marginBottom: 16, display: "flex", alignItems: "center", gap: 8 }}>
            🕐 分析历史
            <span style={{ fontSize: 11, fontWeight: 400, color: "#4a5570" }}>最近{history.length}条</span>
          </h3>
          <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
            {history.map(h => (
              <div key={h.id} style={{ padding: "14px 18px", borderRadius: 12, background: "#0c1020", border: "1px solid #161d30", display: "flex", alignItems: "center", gap: 14, cursor: "pointer", transition: "all .2s" }}
                onMouseEnter={e => e.currentTarget.style.borderColor = "#1e274488"}
                onMouseLeave={e => e.currentTarget.style.borderColor = "#161d30"}
              >
                <div style={{ width: 8, height: 8, borderRadius: "50%", background: "#10b981", flexShrink: 0 }} />
                <div style={{ flex: 1 }}>
                  <div style={{ fontSize: 13, fontWeight: 600, marginBottom: 2 }}>{h.title}</div>
                  <div style={{ fontSize: 11, color: "#4a5570", fontFamily: "'JetBrains Mono',monospace", whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis", maxWidth: 400 }}>{h.prompt}</div>
                </div>
                <div style={{ fontSize: 11, color: "#3d4b6b", whiteSpace: "nowrap" }}>{h.time}</div>
                <button onClick={() => copyText(h.prompt)} style={{ padding: "5px 12px", borderRadius: 6, border: "1px solid #1e2744", background: "transparent", color: "#5a6785", fontSize: 11, cursor: "pointer", whiteSpace: "nowrap" }}>复制</button>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
