import fs from "fs/promises";
import path from "path";
import ProfileClient from "./ClientComp";

async function getProfileData() {
  const filePath = path.join(process.cwd(), "data", "user.json");
  const jsonData = await fs.readFile(filePath, "utf-8");
  return JSON.parse(jsonData).profile;
}

export default async function ProfilePage() {
  const profile = await getProfileData();

  return (
    <div className="p-4 md:p-8">
      <ProfileClient initialData={profile} />
    </div>
  );
}