/* eslint-disable no-console */

import fs from "fs/promises";
import { PackageJsonAnalyzer } from "./package-json/PackageJsonAnalyzer.mjs";

export function isUsing(props) {
  const { dirname } = props;

  return new NodeProjectAnalyzer(dirname).check();
}

class NodeProjectAnalyzer {
  constructor(projectPath) {
    this.projectPath = projectPath;
    this.results = {
      runtimeIndicators: [],
      developmentOnlyIndicators: [],
      potentialRuntimeNode: false,
    };
  }

  async check() {
    try {
      let ret = false;

      ret ||= await this.checkPackageJson();

      if (ret)
        return true;

      ret ||= await this.checkFilenames();

      return ret;
    } catch (error) {
      console.error("Error en el análisis:", error);

      return false;
    }
  }

  async checkPackageJson() {
    try {
      const analyzer = new PackageJsonAnalyzer();

      await analyzer.readFile();

      return analyzer.checkProdScriptsContent(
        ["start", "serve", "production", "prod"],
        (c) => {
          c.startsWith("node");
        },
      )
      || analyzer.hasAnyProdDependency([
        "express", "koa", "nest", "fastify",
        "socket.io", "ws", "typeorm", "sequelize",
      ]);
    } catch (error) {
      console.warn("No se pudo leer package.json:", error);
    }

    return false;
  }

  async checkFilenames() {
    const serverFilesRegexps = [
      "(src/)?server.mjs", "(src/)?app.mjs", "(src/)?index.mjs",
      "(src/)?main.mjs", "(src/)?server.js", "(src/)?app.js",
    ];

    try {
      const files = await fs.readdir(this.projectPath, { recursive: true } );

      for (const file of files) {
        if (serverFilesRegexps.some(pattern => {
          const regex = new RegExp(pattern);

          return regex.test(file);
        } ))
          return true;
      }
    } catch (error) {
      console.warn("Error al buscar archivos de servidor:", error);
    }

    return false;
  }
}
