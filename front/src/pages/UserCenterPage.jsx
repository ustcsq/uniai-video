import { useEffect, useMemo, useState } from "react";
import { Link, Navigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext.jsx";
import { fetchCredits } from "../api/authApi.js";

const CREDIT_PACKS = [
  { id: 1, credits: 100, price: 9.9, tag: null },
  { id: 2, credits: 500, price: 39.9, tag: "热门" },
  { id: 3, credits: 1200, price: 79.9, tag: "超值" },
  { id: 4, credits: 3000, price: 169, tag: "年卡" },
];

const MY_COURSES = [
  { id: 1, title: "AI视频提示词工程入门", progress: 100, lessons: "12/12", color: "#10b981" },
  { id: 2, title: "Seedance 2.0 文生视频完全指南", progress: 72, lessons: "13/18", color: "#8b5cf6" },
  { id: 3, title: "校园宣传片从策划到成片", progress: 33, lessons: "8/24", color: "#f59e0b" },
  { id: 4, title: "短视频运营：算法+爆款", progress: 15, lessons: "3/22", color: "#06b6d4" },
];

const WORKS = [
  { id: 1, title: "校园宣传片-樱花版", model: "Seedance 2.0", time: "2小时前", status: "done" },
  { id: 2, title: "求职自我介绍V3", model: "PixVerse V6", time: "昨天", status: "done" },
  { id: 3, title: "产品展示-耳机旋转", model: "Seedance 2.0", time: "3天前", status: "done" },
  { id: 4, title: "毕业季航拍测试", model: "Happy Horse", time: "上周", status: "done" },
];

function maskPhone(phone) {
  if (!phone || phone.length < 11) return phone || "—";
  return phone.replace(/^(\d{3})\d{4}(\d{4})$/, "$1****$2");
}

function avatarEmoji(user) {
  const name = (user.nickname || user.phone || "用").trim();
  return name[0] || "😎";
}

export default function UserCenter() {
  const { user, loading, logout, updateProfile } = useAuth();
  const [tab, setTab] = useState("overview");
  const [creditTab, setCreditTab] = useState("packs");
  const [creditState, setCreditState] = useState({ balance: null, items: [], loading: false });
  const [form, setForm] = useState({ nickname: "", school: "", major: "" });
  const [saving, setSaving] = useState(false);
  const [saveMsg, setSaveMsg] = useState("");

  const displayName = useMemo(() => {
    if (!user) return "";
    return user.nickname || maskPhone(user.phone) || `用户${user.id}`;
  }, [user]);

  const isVip = user?.role === "vip";

  useEffect(() => {
    if (!user) return;
    setForm({
      nickname: user.nickname ?? "",
      school: user.school ?? "",
      major: user.major ?? "",
    });
  }, [user]);

  useEffect(() => {
    if (tab !== "credits" || !user) return;
    let cancelled = false;
    (async () => {
      setCreditState((s) => ({ ...s, loading: true }));
      try {
        const c = await fetchCredits();
        if (!cancelled) setCreditState({ balance: c.balance, items: c.items || [], loading: false });
      } catch {
        if (!cancelled) setCreditState((s) => ({ ...s, loading: false }));
      }
    })();
    return () => {
      cancelled = true;
    };
  }, [tab, user]);

  const creditBalance = creditState.balance != null ? creditState.balance : user?.credits ?? 0;

  const TABS = [
    { key: "overview", label: "总览", icon: "📊" },
    { key: "courses", label: "我的课程", icon: "📚" },
    { key: "works", label: "我的作品", icon: "🎬" },
    { key: "credits", label: "积分管理", icon: "💎" },
    { key: "settings", label: "设置", icon: "⚙️" },
  ];

  if (loading) {
    return (
      <div style={{ minHeight: "100vh", background: "#080b14", color: "#5a6785", display: "flex", alignItems: "center", justifyContent: "center", fontFamily: "'Noto Sans SC',sans-serif" }}>
        加载中…
      </div>
    );
  }

  if (!user) {
    return <Navigate to="/login" replace state={{ from: { pathname: "/user" } }} />;
  }

  const onSaveSettings = async () => {
    setSaveMsg("");
    setSaving(true);
    try {
      await updateProfile({
        nickname: form.nickname.trim() || null,
        school: form.school.trim() || null,
        major: form.major.trim() || null,
      });
      setSaveMsg("已保存");
    } catch (e) {
      setSaveMsg(e.message || "保存失败");
    } finally {
      setSaving(false);
    }
  };

  const avatarUrl = user.avatar_url?.trim();
  const showImg = avatarUrl && (avatarUrl.startsWith("http") || avatarUrl.startsWith("/"));

  return (
    <div style={{ minHeight: "100vh", background: "#080b14", color: "#d4d8e0", fontFamily: "'Noto Sans SC','DM Sans',sans-serif", display: "flex" }}>
      <style>{`@import url('https://fonts.googleapis.com/css2?family=Noto+Sans+SC:wght@300;400;500;700;900&family=DM+Sans:wght@400;500;700&family=JetBrains+Mono:wght@400&display=swap');*{margin:0;padding:0;box-sizing:border-box}::-webkit-scrollbar{width:5px}::-webkit-scrollbar-thumb{background:#1e2744;border-radius:3px}@keyframes fadeIn{from{opacity:0;transform:translateY(8px)}to{opacity:1;transform:translateY(0)}}`}</style>

      <div style={{ width: 240, background: "#0a0e1a", borderRight: "1px solid #131a2e", padding: "32px 16px", flexShrink: 0, display: "flex", flexDirection: "column" }}>
        <div style={{ textAlign: "center", marginBottom: 28 }}>
          <div
            style={{
              width: 64,
              height: 64,
              borderRadius: 16,
              background: "linear-gradient(135deg,#06b6d4,#8b5cf6)",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              fontSize: 30,
              margin: "0 auto 10px",
              overflow: "hidden",
            }}
          >
            {showImg ? (
              <img src={avatarUrl} alt="" style={{ width: "100%", height: "100%", objectFit: "cover" }} />
            ) : (
              avatarEmoji(user)
            )}
          </div>
          <div style={{ fontSize: 16, fontWeight: 700 }}>{displayName}</div>
          <div style={{ fontSize: 11, color: "#5a6785", marginTop: 4 }}>
            {[user.school, user.major].filter(Boolean).join(" · ") || "完善学校与专业"}
          </div>
          {isVip ? (
            <span style={{ display: "inline-block", marginTop: 8, padding: "3px 12px", borderRadius: 12, background: "linear-gradient(135deg,#f59e0b,#ef4444)", fontSize: 10, fontWeight: 700, color: "#fff" }}>VIP会员</span>
          ) : (
            <button type="button" style={{ marginTop: 8, padding: "5px 16px", borderRadius: 8, border: "1px solid #f59e0b33", background: "transparent", color: "#f59e0b", fontSize: 11, cursor: "pointer" }}>升级VIP</button>
          )}
        </div>
        {TABS.map((t) => (
          <button
            key={t.key}
            type="button"
            onClick={() => setTab(t.key)}
            style={{
              width: "100%",
              padding: "11px 16px",
              borderRadius: 10,
              border: "none",
              textAlign: "left",
              background: tab === t.key ? "rgba(6,182,212,.08)" : "transparent",
              color: tab === t.key ? "#06b6d4" : "#5a6785",
              fontSize: 13,
              fontWeight: 500,
              cursor: "pointer",
              marginBottom: 4,
              display: "flex",
              alignItems: "center",
              gap: 10,
              transition: "all .15s",
            }}
          >
            <span style={{ fontSize: 15 }}>{t.icon}</span> {t.label}
          </button>
        ))}
        <div style={{ marginTop: "auto", paddingTop: 24 }}>
          <Link to="/" style={{ display: "block", fontSize: 12, color: "#4a5570", marginBottom: 10, textDecoration: "none" }}>
            ← 返回首页
          </Link>
          <button
            type="button"
            onClick={() => logout()}
            style={{
              width: "100%",
              padding: "10px 12px",
              borderRadius: 10,
              border: "1px solid #1e2744",
              background: "transparent",
              color: "#8892a8",
              fontSize: 12,
              cursor: "pointer",
            }}
          >
            退出登录
          </button>
        </div>
      </div>

      <div style={{ flex: 1, overflowY: "auto", padding: "32px 40px" }}>
        {tab === "overview" && (
          <div style={{ animation: "fadeIn .3s ease" }}>
            <h2 style={{ fontSize: 24, fontWeight: 800, marginBottom: 8 }}>👋 你好，{displayName}</h2>
            <p style={{ fontSize: 12, color: "#4a5570", marginBottom: 24 }}>课程、作品、学习统计为演示数据；积分与资料来自接口。</p>
            <div style={{ display: "grid", gridTemplateColumns: "repeat(4,1fr)", gap: 14, marginBottom: 32 }}>
              {[
                { label: "积分余额", value: user.credits, icon: "💎", color: "#06b6d4" },
                { label: "学习时长", value: "—", icon: "⏱", color: "#8b5cf6", hint: "待接入" },
                { label: "完成课程", value: "—", icon: "📚", color: "#10b981", hint: "待接入" },
                { label: "生成次数", value: "—", icon: "🎬", color: "#f59e0b", hint: "待接入" },
              ].map((s, i) => (
                <div key={i} style={{ padding: 20, borderRadius: 14, background: "#0c1020", border: "1px solid #161d30" }}>
                  <div style={{ fontSize: 11, color: "#5a6785", marginBottom: 8, display: "flex", alignItems: "center", gap: 6 }}>
                    <span>{s.icon}</span> {s.label}
                  </div>
                  <div style={{ fontSize: 26, fontWeight: 800, color: s.color, fontFamily: "'DM Sans',sans-serif" }}>{s.value}</div>
                  {s.hint ? <div style={{ fontSize: 10, color: "#3d4b6b", marginTop: 4 }}>{s.hint}</div> : null}
                </div>
              ))}
            </div>
            <h3 style={{ fontSize: 15, fontWeight: 700, marginBottom: 14 }}>📚 学习进度（演示）</h3>
            <div style={{ display: "flex", flexDirection: "column", gap: 10, marginBottom: 32 }}>
              {MY_COURSES.map((c) => (
                <div key={c.id} style={{ padding: "14px 18px", borderRadius: 12, background: "#0c1020", border: "1px solid #161d30", display: "flex", alignItems: "center", gap: 16 }}>
                  <div style={{ flex: 1 }}>
                    <div style={{ fontSize: 13, fontWeight: 600, marginBottom: 6 }}>{c.title}</div>
                    <div style={{ height: 4, borderRadius: 2, background: "#1a2240", overflow: "hidden" }}>
                      <div style={{ height: "100%", borderRadius: 2, background: c.color, width: `${c.progress}%`, transition: "width .5s" }} />
                    </div>
                  </div>
                  <div style={{ textAlign: "right", flexShrink: 0 }}>
                    <div style={{ fontSize: 14, fontWeight: 700, color: c.color }}>{c.progress}%</div>
                    <div style={{ fontSize: 11, color: "#4a5570" }}>{c.lessons}</div>
                  </div>
                </div>
              ))}
            </div>
            <h3 style={{ fontSize: 15, fontWeight: 700, marginBottom: 14 }}>🎬 最近作品（演示）</h3>
            <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill,minmax(220px,1fr))", gap: 12 }}>
              {WORKS.map((w) => (
                <div key={w.id} style={{ padding: 16, borderRadius: 12, background: "#0c1020", border: "1px solid #161d30", cursor: "pointer" }}>
                  <div style={{ width: "100%", height: 100, borderRadius: 8, background: "#111627", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 28, marginBottom: 10 }}>🎬</div>
                  <div style={{ fontSize: 13, fontWeight: 600, marginBottom: 4 }}>{w.title}</div>
                  <div style={{ fontSize: 11, color: "#4a5570" }}>
                    {w.model} · {w.time}
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {tab === "courses" && (
          <div style={{ animation: "fadeIn .3s ease" }}>
            <p style={{ fontSize: 12, color: "#4a5570", marginBottom: 16 }}>以下为演示数据，课程接口待接入。</p>
            <h2 style={{ fontSize: 24, fontWeight: 800, marginBottom: 24 }}>我的课程</h2>
            {MY_COURSES.map((c) => (
              <div
                key={c.id}
                style={{
                  padding: 20,
                  borderRadius: 14,
                  background: "#0c1020",
                  border: "1px solid #161d30",
                  marginBottom: 12,
                  display: "flex",
                  alignItems: "center",
                  gap: 20,
                  cursor: "pointer",
                  transition: "all .2s",
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.borderColor = `${c.color}33`;
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.borderColor = "#161d30";
                }}
              >
                <div style={{ width: 60, height: 60, borderRadius: 12, background: `${c.color}15`, display: "flex", alignItems: "center", justifyContent: "center", fontSize: 26, flexShrink: 0 }}>📖</div>
                <div style={{ flex: 1 }}>
                  <div style={{ fontSize: 15, fontWeight: 700, marginBottom: 8 }}>{c.title}</div>
                  <div style={{ height: 6, borderRadius: 3, background: "#1a2240", overflow: "hidden" }}>
                    <div style={{ height: "100%", borderRadius: 3, background: `linear-gradient(90deg,${c.color},${c.color}88)`, width: `${c.progress}%` }} />
                  </div>
                </div>
                <div style={{ textAlign: "center", flexShrink: 0 }}>
                  <div style={{ fontSize: 22, fontWeight: 800, color: c.color }}>{c.progress}%</div>
                  <div style={{ fontSize: 11, color: "#4a5570" }}>{c.lessons} 课时</div>
                </div>
                <button
                  type="button"
                  style={{
                    padding: "8px 20px",
                    borderRadius: 8,
                    border: "none",
                    background: c.progress === 100 ? "#10b98120" : "linear-gradient(135deg,#06b6d4,#8b5cf6)",
                    color: c.progress === 100 ? "#10b981" : "#fff",
                    fontSize: 12,
                    fontWeight: 600,
                    cursor: "pointer",
                  }}
                >
                  {c.progress === 100 ? "已完成 ✓" : "继续学习"}
                </button>
              </div>
            ))}
          </div>
        )}

        {tab === "works" && (
          <div style={{ animation: "fadeIn .3s ease" }}>
            <p style={{ fontSize: 12, color: "#4a5570", marginBottom: 16 }}>以下为演示数据，作品接口待接入。</p>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 24 }}>
              <h2 style={{ fontSize: 24, fontWeight: 800 }}>我的作品</h2>
              <Link to="/workbench" style={{ padding: "8px 20px", borderRadius: 8, border: "none", background: "linear-gradient(135deg,#06b6d4,#8b5cf6)", color: "#fff", fontSize: 12, fontWeight: 600, cursor: "pointer", textDecoration: "none", display: "inline-block" }}>
                + 去工作台创作
              </Link>
            </div>
            <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill,minmax(260px,1fr))", gap: 16 }}>
              {WORKS.map((w) => (
                <div
                  key={w.id}
                  style={{ borderRadius: 14, background: "#0c1020", border: "1px solid #161d30", overflow: "hidden", cursor: "pointer", transition: "all .2s" }}
                  onMouseEnter={(e) => {
                    e.currentTarget.style.transform = "translateY(-3px)";
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.transform = "none";
                  }}
                >
                  <div style={{ height: 160, background: "#111627", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 40 }}>🎬</div>
                  <div style={{ padding: 16 }}>
                    <div style={{ fontSize: 14, fontWeight: 700, marginBottom: 6 }}>{w.title}</div>
                    <div style={{ fontSize: 11, color: "#4a5570", marginBottom: 12 }}>
                      {w.model} · {w.time}
                    </div>
                    <div style={{ display: "flex", gap: 8 }}>
                      <button type="button" style={{ flex: 1, padding: "7px 0", borderRadius: 7, border: "1px solid #1e2744", background: "transparent", color: "#6b7a99", fontSize: 11, cursor: "pointer" }}>下载</button>
                      <button type="button" style={{ flex: 1, padding: "7px 0", borderRadius: 7, border: "none", background: "rgba(6,182,212,.08)", color: "#06b6d4", fontSize: 11, fontWeight: 600, cursor: "pointer" }}>分享</button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {tab === "credits" && (
          <div style={{ animation: "fadeIn .3s ease" }}>
            <h2 style={{ fontSize: 24, fontWeight: 800, marginBottom: 24 }}>积分管理</h2>
            <div style={{ padding: 28, borderRadius: 16, background: "linear-gradient(135deg,#06b6d408,#8b5cf608)", border: "1px solid #161d30", marginBottom: 24, display: "flex", alignItems: "center", justifyContent: "space-between" }}>
              <div>
                <div style={{ fontSize: 12, color: "#5a6785", marginBottom: 6 }}>当前积分余额</div>
                <div style={{ fontSize: 40, fontWeight: 900, fontFamily: "'DM Sans',sans-serif", background: "linear-gradient(135deg,#06b6d4,#8b5cf6)", WebkitBackgroundClip: "text", WebkitTextFillColor: "transparent" }}>
                  💎 {creditState.loading ? "…" : creditBalance}
                </div>
              </div>
              <div style={{ textAlign: "right" }}>
                <div style={{ fontSize: 11, color: "#4a5570" }}>1元 ≈ 10积分</div>
                <div style={{ fontSize: 11, color: "#4a5570" }}>文生视频5秒 ≈ 10积分</div>
              </div>
            </div>

            <div style={{ display: "flex", gap: 8, marginBottom: 20 }}>
              {[
                ["packs", "充值"],
                ["history", "明细"],
              ].map(([k, l]) => (
                <button
                  key={k}
                  type="button"
                  onClick={() => setCreditTab(k)}
                  style={{
                    padding: "8px 20px",
                    borderRadius: 8,
                    border: "none",
                    fontSize: 13,
                    fontWeight: 600,
                    cursor: "pointer",
                    background: creditTab === k ? "rgba(6,182,212,.1)" : "#0f1428",
                    color: creditTab === k ? "#06b6d4" : "#5a6785",
                  }}
                >
                  {l}
                </button>
              ))}
            </div>

            {creditTab === "packs" ? (
              <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill,minmax(200px,1fr))", gap: 14 }}>
                {CREDIT_PACKS.map((p) => (
                  <div
                    key={p.id}
                    style={{
                      padding: 24,
                      borderRadius: 14,
                      background: "#0c1020",
                      border: "1px solid #161d30",
                      textAlign: "center",
                      cursor: "pointer",
                      transition: "all .2s",
                      position: "relative",
                    }}
                    onMouseEnter={(e) => {
                      e.currentTarget.style.borderColor = "#06b6d433";
                      e.currentTarget.style.transform = "translateY(-3px)";
                    }}
                    onMouseLeave={(e) => {
                      e.currentTarget.style.borderColor = "#161d30";
                      e.currentTarget.style.transform = "none";
                    }}
                  >
                    {p.tag ? (
                      <span
                        style={{
                          position: "absolute",
                          top: -8,
                          right: 16,
                          padding: "3px 10px",
                          borderRadius: 8,
                          background: p.tag === "超值" ? "linear-gradient(135deg,#f59e0b,#ef4444)" : p.tag === "热门" ? "#ef4444" : "#8b5cf6",
                          color: "#fff",
                          fontSize: 10,
                          fontWeight: 700,
                        }}
                      >
                        {p.tag}
                      </span>
                    ) : null}
                    <div style={{ fontSize: 32, fontWeight: 900, fontFamily: "'DM Sans',sans-serif", marginBottom: 4, background: "linear-gradient(135deg,#06b6d4,#8b5cf6)", WebkitBackgroundClip: "text", WebkitTextFillColor: "transparent" }}>{p.credits}</div>
                    <div style={{ fontSize: 11, color: "#5a6785", marginBottom: 14 }}>积分</div>
                    <div style={{ fontSize: 22, fontWeight: 800, marginBottom: 14 }}>¥{p.price}</div>
                    <button type="button" style={{ width: "100%", padding: "10px 0", borderRadius: 8, border: "none", background: "linear-gradient(135deg,#06b6d4,#8b5cf6)", color: "#fff", fontSize: 13, fontWeight: 700, cursor: "pointer" }}>立即充值</button>
                  </div>
                ))}
              </div>
            ) : creditState.items.length === 0 ? (
              <div style={{ padding: 32, textAlign: "center", color: "#5a6785", fontSize: 14, borderRadius: 12, border: "1px dashed #1e2744" }}>暂无流水（阶段 2 接入充值与消费明细）</div>
            ) : (
              <div style={{ display: "flex", flexDirection: "column", gap: 6 }}>
                {creditState.items.map((t) => (
                  <div key={t.id} style={{ padding: "12px 16px", borderRadius: 10, background: "#0c1020", border: "1px solid #131a2e", display: "flex", alignItems: "center", gap: 12 }}>
                    <div style={{ width: 8, height: 8, borderRadius: "50%", background: t.amount > 0 ? "#10b981" : "#ef4444", flexShrink: 0 }} />
                    <div style={{ flex: 1, fontSize: 13 }}>{t.desc}</div>
                    <div style={{ fontWeight: 700, fontFamily: "'DM Sans',sans-serif", color: t.amount > 0 ? "#10b981" : "#ef4444" }}>
                      {t.amount > 0 ? "+" : ""}
                      {t.amount}
                    </div>
                    <div style={{ fontSize: 11, color: "#3d4b6b", minWidth: 70, textAlign: "right" }}>{t.time}</div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {tab === "settings" && (
          <div style={{ animation: "fadeIn .3s ease", maxWidth: 560 }}>
            <h2 style={{ fontSize: 24, fontWeight: 800, marginBottom: 24 }}>个人设置</h2>
            {[
              { key: "nickname", label: "昵称", type: "text" },
              { key: "school", label: "学校", type: "text" },
              { key: "major", label: "专业", type: "text" },
            ].map((f) => (
              <div key={f.key} style={{ marginBottom: 18 }}>
                <label style={{ fontSize: 12, fontWeight: 600, color: "#6b7a99", display: "block", marginBottom: 6 }}>{f.label}</label>
                <input
                  value={form[f.key]}
                  onChange={(e) => setForm((prev) => ({ ...prev, [f.key]: e.target.value }))}
                  style={{
                    width: "100%",
                    padding: "10px 14px",
                    borderRadius: 10,
                    border: "1px solid #1e2744",
                    background: "#111627",
                    color: "#d4d8e0",
                    fontSize: 13,
                    outline: "none",
                  }}
                />
              </div>
            ))}
            <div style={{ marginBottom: 18 }}>
              <label style={{ fontSize: 12, fontWeight: 600, color: "#6b7a99", display: "block", marginBottom: 6 }}>手机号</label>
              <input readOnly value={maskPhone(user.phone)} style={{ width: "100%", padding: "10px 14px", borderRadius: 10, border: "1px solid #1e2744", background: "#0a0e1a", color: "#3d4b6b", fontSize: 13, outline: "none" }} />
            </div>
            <div style={{ marginBottom: 18 }}>
              <label style={{ fontSize: 12, fontWeight: 600, color: "#6b7a99", display: "block", marginBottom: 6 }}>推广码</label>
              <input readOnly value={user.referral_code || "—"} style={{ width: "100%", padding: "10px 14px", borderRadius: 10, border: "1px solid #1e2744", background: "#0a0e1a", color: "#3d4b6b", fontSize: 13, outline: "none" }} />
            </div>
            {saveMsg ? <div style={{ fontSize: 13, marginBottom: 12, color: saveMsg.includes("失败") ? "#ef4444" : "#10b981" }}>{saveMsg}</div> : null}
            <button
              type="button"
              disabled={saving}
              onClick={onSaveSettings}
              style={{
                padding: "10px 28px",
                borderRadius: 10,
                border: "none",
                background: "linear-gradient(135deg,#06b6d4,#8b5cf6)",
                color: "#fff",
                fontSize: 13,
                fontWeight: 700,
                cursor: saving ? "wait" : "pointer",
                marginTop: 8,
              }}
            >
              {saving ? "保存中…" : "保存修改"}
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
