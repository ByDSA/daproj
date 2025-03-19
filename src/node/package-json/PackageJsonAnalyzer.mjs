import fs from "fs/promises";

export class PackageJsonAnalyzer {
  #data;

  async readFile(path = "./package.json") {
    this.#data = JSON.parse(
      await fs.readFile(path, "utf8"),
    );
  }

  checkProdScriptsContent(prodScripts, f) {
    const runtimeScripts = prodScripts.filter(
      script => this.#data.scripts?.[script],
    );

    return runtimeScripts.some(k=> {
      const c = this.#data.scripts?.[k].trim();

      return f(c);
    } );
  }

  hasAnyProdDependency(prodDeps) {
    const gotDeps = Object.keys(this.#data.dependencies ?? {} );

    return prodDeps.some(
      dep => gotDeps.includes(dep),
    );
  }
}
