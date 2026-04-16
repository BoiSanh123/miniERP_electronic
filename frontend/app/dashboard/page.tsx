"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";

export default function Dashboard() {
  const router = useRouter();
  const [user, setUser] = useState<any>(null);

  useEffect(() => {
    const data = localStorage.getItem("user");

    if (!data) {
      router.push("/login");
    } else {
      setUser(JSON.parse(data));
    }
  }, []);

  if (!user) {
    return <div>Loading...</div>;
  }

  return (
    <div style={{ padding: 20 }}>
      <h1>Dashboard</h1>
      <p>Xin chào: {user.username}</p>
    </div>
  );
}