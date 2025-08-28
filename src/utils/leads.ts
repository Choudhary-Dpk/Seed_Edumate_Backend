import path from "path";
import fs from "fs";

export const resolveLeadsCsvPath = (): string => {
  const root = process.cwd();
  const prodPath = path.join(
    root,
    "dist",
    "utils",
    "csvTemplates",
    "leads.csv"
  );
  if (fs.existsSync(prodPath)) return prodPath;

  // Fallback for dev
  return path.join(root, "src", "utils", "csvTemplates", "leads.csv");
};