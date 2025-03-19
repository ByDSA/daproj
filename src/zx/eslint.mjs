const globalsZx = {
  argv: true,
  $: true,
  path: true,
  fs: false,
  cd: true,
  chalk: true,
  glob: true,
  echo: true,
  spinner: true,
};

export function generateConfigs(_args) {
  const ret = [
    {
      files: ["bin/**/*.mjs"],
      languageOptions: {
        globals: {
          ...globalsZx,
        },
      },
    },
  ];

  return ret;
}
