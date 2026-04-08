import { useState } from "react";
import { Link, useNavigate, useLocation } from "react-router-dom";
import { useAuth } from "../context/AuthContext.jsx";
import { fetchHealth } from "../api/authApi.js";

export default function LoginPage() {
  const { login, sendSms } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const from = location.state?.from?.pathname || "/user";

  const [phone, setPhone] = useState("");
  const [code, setCode] = useState("");
  const [sending, setSending] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [msg, setMsg] = useState("");
  const [debugCode, setDebugCode] = useState("");
  const [backendOk, setBackendOk] = useState(null);

  const checkBackend = async () => {
    try {
      const h = await fetchHealth();
      setBackendOk(h?.database === "ok");
    } catch {
      setBackendOk(false);
    }
  };

  const onSend = async () => {
    setMsg("");
    if (!/^1[3-9]\d{9}$/.test(phone)) {
      setMsg("请输入 11 位中国大陆手机号");
      return;
    }
    setSending(true);
    try {
      const r = await sendSms(phone);
      if (r.debug_code) setDebugCode(String(r.debug_code));
      else setDebugCode("");
      setMsg("验证码已发送，请查收短信或查看接口返回（调试模式）");
    } catch (e) {
      setMsg(e.message || "发送失败");
    } finally {
      setSending(false);
    }
  };

  const onSubmit = async (e) => {
    e.preventDefault();
    setMsg("");
    setSubmitting(true);
    try {
      await login(phone, code);
      navigate(from, { replace: true });
    } catch (err) {
      setMsg(err.message || "登录失败");
    } finally {
      setSubmitting(false);
    }
  };

  const bg = "#080b14";
  const card = "#0c1020";

  return (
    <div
      style={{
        minHeight: "100vh",
        background: bg,
        color: "#d4d8e0",
        fontFamily: "'Noto Sans SC','DM Sans',sans-serif",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        padding: 24,
      }}
    >
      <style>{`@import url('https://fonts.googleapis.com/css2?family=Noto+Sans+SC:wght@400;500;700&display=swap');`}</style>
      <div
        style={{
          width: "100%",
          maxWidth: 400,
          padding: 32,
          borderRadius: 16,
          background: card,
          border: "1px solid #161d30",
        }}
      >
        <h1 style={{ fontSize: 22, fontWeight: 800, marginBottom: 8 }}>登录 / 注册</h1>
        <p style={{ fontSize: 13, color: "#5a6785", marginBottom: 24 }}>
          手机号验证码登录，新用户自动注册。需本地已启动后端（默认 <code style={{ color: "#06b6d4" }}>:8000</code>，Vite 代理 <code>/api</code>）。
        </p>

        <div style={{ display: "flex", gap: 8, marginBottom: 16, alignItems: "center" }}>
          <button
            type="button"
            onClick={checkBackend}
            style={{
              padding: "6px 12px",
              borderRadius: 8,
              border: "1px solid #1e2744",
              background: "#111627",
              color: "#8892a8",
              fontSize: 12,
              cursor: "pointer",
            }}
          >
            检测后端
          </button>
          {backendOk === true && <span style={{ fontSize: 12, color: "#10b981" }}>API 可用</span>}
          {backendOk === false && <span style={{ fontSize: 12, color: "#ef4444" }}>无法连接 /api/v1/health</span>}
        </div>

        <form onSubmit={onSubmit}>
          <label style={{ fontSize: 12, color: "#6b7a99", display: "block", marginBottom: 6 }}>手机号</label>
          <input
            value={phone}
            onChange={(e) => setPhone(e.target.value.trim())}
            placeholder="13800138000"
            style={{
              width: "100%",
              padding: "12px 14px",
              borderRadius: 10,
              border: "1px solid #1e2744",
              background: "#111627",
              color: "#e8eaed",
              fontSize: 15,
              marginBottom: 16,
              outline: "none",
            }}
          />

          <div style={{ display: "flex", gap: 10, marginBottom: 16 }}>
            <div style={{ flex: 1 }}>
              <label style={{ fontSize: 12, color: "#6b7a99", display: "block", marginBottom: 6 }}>验证码</label>
              <input
                value={code}
                onChange={(e) => setCode(e.target.value.trim())}
                placeholder="6 位数字"
                style={{
                  width: "100%",
                  padding: "12px 14px",
                  borderRadius: 10,
                  border: "1px solid #1e2744",
                  background: "#111627",
                  color: "#e8eaed",
                  fontSize: 15,
                  outline: "none",
                }}
              />
            </div>
            <div style={{ paddingTop: 22 }}>
              <button
                type="button"
                disabled={sending}
                onClick={onSend}
                style={{
                  padding: "12px 16px",
                  borderRadius: 10,
                  border: "none",
                  background: "linear-gradient(135deg,#06b6d4,#8b5cf6)",
                  color: "#fff",
                  fontSize: 13,
                  fontWeight: 600,
                  cursor: sending ? "wait" : "pointer",
                  whiteSpace: "nowrap",
                }}
              >
                {sending ? "发送中…" : "获取验证码"}
              </button>
            </div>
          </div>

          {debugCode ? (
            <div style={{ fontSize: 12, color: "#f59e0b", marginBottom: 12 }}>
              调试：验证码 <strong>{debugCode}</strong>（生产环境勿开启 <code>SMS_DEBUG_RETURN_CODE</code>）
            </div>
          ) : null}

          {msg ? <div style={{ fontSize: 13, color: msg.includes("失败") || msg.includes("错误") ? "#ef4444" : "#06b6d4", marginBottom: 12 }}>{msg}</div> : null}

          <button
            type="submit"
            disabled={submitting}
            style={{
              width: "100%",
              padding: "14px 0",
              borderRadius: 12,
              border: "none",
              background: "linear-gradient(135deg,#06b6d4,#8b5cf6)",
              color: "#fff",
              fontSize: 15,
              fontWeight: 700,
              cursor: submitting ? "wait" : "pointer",
            }}
          >
            {submitting ? "登录中…" : "登录"}
          </button>
        </form>

        <p style={{ marginTop: 20, fontSize: 12, color: "#4a5570", textAlign: "center" }}>
          本地开发可在后端 <code>.env</code> 设置 <code>AUTH_DEV_FIXED_CODE=123456</code> 固定验证码。
        </p>
        <Link to="/" style={{ display: "block", textAlign: "center", marginTop: 12, color: "#06b6d4", fontSize: 13 }}>
          ← 返回首页
        </Link>
      </div>
    </div>
  );
}
