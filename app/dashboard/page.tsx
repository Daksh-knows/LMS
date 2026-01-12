import fs from "fs/promises";
import path from "path";
import OverviewClient from "./ClientComp";


async function getDashboardData() {
  const filePath = path.join(process.cwd(), "data", "user.json");
  const jsonData = await fs.readFile(filePath, "utf-8");
  return JSON.parse(jsonData);
}

export default async function OverviewPage() {
  const data = await getDashboardData();

  return (
    <div className="min-h-screen bg-[#fcfcfc]">
      <OverviewClient data={data} />
    </div>
  );
}