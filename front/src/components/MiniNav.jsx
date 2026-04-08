import { Link, useLocation } from "react-router-dom";
import { useAuth } from "../context/AuthContext.jsx";

const items = [
  ["首页", "/"],
  ["课程", "/courses"],
  ["AI工作台", "/workbench"],
  ["提示词库", "/prompts"],
  ["反推助手", "/reverse"],
];

export default function MiniNav() {
  const loc = useLocation();
  const { user, loading } = useAuth();
  const accountTo = loading || user ? "/user" : "/login";
  const accountText = loading || user ? "个人中心" : "登录";
  return (
    <nav
      style={{
        position: "sticky",
        top: 0,
        zIndex: 200,
        display: "flex",
        alignItems: "center",
        gap: 16,
        flexWrap: "wrap",
        padding: "10px 24px",
        background: "rgba(6,8,15,0.96)",
        borderBottom: "1px solid rgba(255,255,255,0.06)",
        backdropFilter: "blur(12px)",
      }}
    >
      <Link
        to="/"
        style={{
          display: "flex",
          alignItems: "center",
          gap: 8,
          textDecoration: "none",
          color: "#e8eaed",
          marginRight: 8,
        }}
      >
        <div
          style={{
            width: 28,
            height: 28,
            borderRadius: 8,
            background: "linear-gradient(135deg,#06b6d4,#8b5cf6)",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            fontSize: 14,
            fontWeight: 900,
            color: "#fff",
          }}
        >
          V
        </div>
        <span style={{ fontWeight: 700, fontSize: 14 }}>UniAI Video</span>
      </Link>
      {items.map(([label, to]) => {
        const active = loc.pathname === to;
        return (
          <Link
            key={to + label}
            to={to}
            style={{
              color: active ? "#06b6d4" : "#8892a8",
              textDecoration: "none",
              fontSize: 13,
              fontWeight: 500,
            }}
          >
            {label}
          </Link>
        );
      })}
      <Link
        to={accountTo}
        style={{
          color: loc.pathname === "/user" || loc.pathname === "/login" ? "#06b6d4" : "#8892a8",
          textDecoration: "none",
          fontSize: 13,
          fontWeight: 500,
        }}
      >
        {accountText}
      </Link>
    </nav>
  );
}
