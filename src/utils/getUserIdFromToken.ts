
import { jwtDecode } from "jwt-decode";

export function getUserIdFromToken(): number | null {
  if (typeof window === "undefined") return null;

  const token =
    localStorage.getItem("authToken") ||
    localStorage.getItem("token") ||
    localStorage.getItem("accessToken");

    console.log("token",token);
    
  if (!token) return null;

  try {
    const decoded: any = jwtDecode(token);
    return decoded?.id ? Number(decoded.id) : null;
  } catch {
    return null;
  }
}
