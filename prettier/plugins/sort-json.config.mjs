export function addConfigTo(config) {
  config.plugins ??= [];
  config.plugins.push("prettier-plugin-sort-json");
  config.jsonRecursiveSort = true;
}
