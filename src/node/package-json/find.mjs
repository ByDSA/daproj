import { join, dirname } from "node:path";
import { existsSync } from "node:fs";

// eslint-disable-next-line require-await
export async function findPackageJson(startDir = process.cwd()) {
  let currentDir = startDir;

  while (currentDir !== "/") {
    const packagePath = join(currentDir, "package.json");

    if (existsSync(packagePath)) {
      return {
        path: packagePath,
        directory: currentDir,
      };
    }

    // Move up one directory
    currentDir = dirname(currentDir);
  }

  // Check root directory
  const rootPackagePath = "/package.json";

  if (existsSync(rootPackagePath)) {
    return {
      path: rootPackagePath,
      directory: "/",
    };
  }

  // If no package.json found
  return null;
}
