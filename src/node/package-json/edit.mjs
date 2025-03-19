import fs from "node:fs";

export async function editPackageJson(obj, path = "./package.json") {
  const pkg = JSON.parse(await fs.promises.readFile(path, "utf8"));

  for (const [key, value] of Object.entries(obj)) {
    if (value === undefined || value === null)
      delete pkg[key];
    else if (typeof value === "string")
      pkg[key] = value;
    else if (typeof value === "function")
      pkg[key] = await value(pkg.key);
  }

  await fs.promises.writeFile(path, JSON.stringify(pkg, null, 2));
}
