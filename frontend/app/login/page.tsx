"use client";

import { useState } from "react";
import axios from "axios";
import { useRouter } from "next/navigation";
import API_URL from "../../config/apiConfig";

export default function LoginPage() {
  const router = useRouter();

  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");

  /* const handleLogin = async () => {
    try {
      console.log("INPUT:", username, password);

      const res = await axios.post(`${API_URL}/auth/login`, {
        username,
        password
      });

      console.log("SUCCESS:", res.data);

      localStorage.setItem("accessToken", res.data.accessToken);
      router.push("/dashboard");

    } catch (err: any) {
      console.log("ERROR:", err.response?.data);
      setError("Sai tài khoản hoặc mật khẩu");
    }
  }; */

  const handleLogin = async () => {
    try {
      console.log("INPUT:", username, password);

      const res = await axios.post(`${API_URL}/auth/login`, {
        username,
        password,
      });

      console.log("SUCCESS FULL:", res.data);

      // =========================
      // 🔥 LẤY TOKEN TRƯỚC
      // =========================
      const token =
        res.data.accessToken ||
        res.data.token ||
        res.data.access_token ||
        res.data.data?.accessToken;

      console.log("TOKEN:", token);

      if (!token) {
        setError("Backend không trả token!");
        return;
      }

      // =========================
      // 🔥 LẤY USER (NẾU CÓ)
      // =========================
      const user = res.data.user || res.data.data?.user;

      // =========================
      // 🔥 LƯU LOCALSTORAGE
      // =========================
      localStorage.setItem("accessToken", token);

      if (user) {
        localStorage.setItem("user", JSON.stringify(user));
      }

      // =========================
      // 🔥 CHUYỂN TRANG
      // =========================
      router.push("/dashboard");

    } catch (err: any) {
      console.log("ERROR:", err.response?.data);
      setError("Sai tài khoản hoặc mật khẩu");
    }
  };

  return (
    <div style={styles.container}>
      {/* Background */}
      <div style={styles.background}>
        <div style={styles.blackBg}></div>
        <div style={styles.blueBg}></div>
      </div>

      {/* Form */}
      <div style={styles.formContainer}>
        <h2 style={styles.title}>ĐĂNG NHẬP</h2>

        <div style={styles.inputGroup}>
          <label style={styles.label}>Email công ty</label>
          <input
            type="text"
            placeholder="Nhập username"
            value={username}
            onChange={(e) => setUsername(e.target.value)}
            style={styles.input}
          />
        </div>

        <div style={styles.inputGroup}>
          <label style={styles.label}>Mật khẩu</label>
          <input
            type="password"
            placeholder="Nhập mật khẩu"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            style={styles.input}
          />
        </div>

        {error && <p style={styles.error}>{error}</p>}

        <button onClick={handleLogin} style={styles.loginButton}>
          Đăng nhập
        </button>
      </div>
    </div>
  );
}

const styles: any = {
  container: {
    width: "100vw",
    height: "100vh",
    position: "relative",
    fontFamily: "'Segoe UI', sans-serif",
    overflow: "hidden",
    display: "flex",
    justifyContent: "center",
    alignItems: "center",
  },

  background: {
    position: "absolute",
    width: "100%",
    height: "100%",
  },

  blackBg: {
    position: "absolute",
    width: "100%",
    height: "100%",
    backgroundColor: "#212121",
  },

  blueBg: {
    position: "absolute",
    width: "100%",
    height: "100%",
    backgroundColor: "#26C6DA",
    clipPath: "polygon(100% 0, 85% 0, 75% 100%, 100% 100%)",
  },

  formContainer: {
    width: "380px",
    backgroundColor: "rgba(255, 255, 255, 0.15)",
    backdropFilter: "blur(10px)",
    WebkitBackdropFilter: "blur(10px)",
    padding: "40px",
    borderRadius: "15px",
    color: "white",
    zIndex: 10,
    boxShadow: "0 8px 32px rgba(0, 0, 0, 0.3)",
    border: "1px solid rgba(255, 255, 255, 0.1)",
  },

  title: {
    textAlign: "center",
    marginBottom: "30px",
    fontSize: "28px",
    fontWeight: 600,
    letterSpacing: "1px",
    color: "white",
  },

  inputGroup: {
    marginBottom: "20px",
  },

  label: {
    display: "block",
    fontSize: "16px",
    fontWeight: 500,
    color: "rgba(255, 255, 255, 0.9)",
    marginBottom: "8px",
  },

  input: {
    width: "100%",
    padding: "12px 14px",
    borderRadius: "8px",
    border: "1px solid rgba(255, 255, 255, 0.2)",
    fontSize: "16px",
    backgroundColor: "rgba(255, 255, 255, 0.1)",
    color: "white",
    boxSizing: "border-box",
  },

  loginButton: {
    width: "100%",
    padding: "14px",
    fontSize: "16px",
    fontWeight: 600,
    backgroundColor: "white",
    color: "#212121",
    border: "none",
    borderRadius: "8px",
    cursor: "pointer",
    marginTop: "10px",
    transition: "all 0.2s ease",
  },

  error: {
    color: "#FFD700",
    backgroundColor: "rgba(255, 215, 0, 0.1)",
    padding: "10px",
    borderRadius: "5px",
    textAlign: "center",
    marginTop: "10px",
    fontWeight: 500,
  },
};