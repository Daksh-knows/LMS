import { cookies } from "next/headers";

export async function getCurrentUser() {
  const cookieStore = await cookies();
  const userData = cookieStore.get("user_data")?.value;

  if (!userData) return null;

  try {
    // Assuming the cookie is a JSON string or a JWT
    // If it's a JSON string:
    return JSON.parse(userData);
  } catch (error) {
    return null;
  }
}
