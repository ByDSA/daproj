export function addConfigTo(config) {
  config.plugins ??= [];
  config.plugins.push("prettier-plugin-packagejson");
  config.packageSortOrder = [
    /**
     * Details
     */
    "$schema",
    "private",
    "name",
    "version",
    "description",
    "license",
    "author",
    "maintainers",
    "contributors",
    "homepage",
    "repository",
    "bugs",
    "type",

    /**
    * Configuration
    */
    "exports",
    "main",
    "module",
    "browser",
    "man",
    "preferGlobal",
    "bin",
    "files",
    "directories",
    "scripts",
    "config",
    "sideEffects",
    "types",
    "typings",

    /**
    * Yarn specific
    */
    "workspaces",
    "resolutions",

    /**
    * Dependencies
    */
    "dependencies",
    "bundleDependencies",
    "bundledDependencies",
    "peerDependencies",
    "peerDependenciesMeta",
    "optionalDependencies",
    "devDependencies",

    /**
    * Used for npm search
    */
    "keywords",

    /**
    * Constraints
    */
    "engines",
    "engineStrict",
    "os",
    "cpu",

    /**
    * Package publishing configuration
    */
    "publishConfig",
  ];
}
