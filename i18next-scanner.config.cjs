module.exports = {
  input: [
    'src/**/*.{js,jsx,ts,tsx}',
    // 排除 node_modules 和构建产物
    '!src/**/*.spec.{js,jsx,ts,tsx}',
    '!src/**/*.test.{js,jsx,ts,tsx}',
    '!**/node_modules/**',
    '!**/dist/**',
  ],
  output: './',
  options: {
    debug: false,
    func: {
      list: ['t', 'i18next.t', 'i18n.t'],
      extensions: ['.js', '.jsx', '.ts', '.tsx'],
    },
    // 禁用 Trans 组件解析，因为不支持 TypeScript
    trans: false,
    lngs: ['zh-CN', 'en-US'],
    defaultLng: 'zh-CN',
    defaultValue: '__STRING_NOT_TRANSLATED__',
    resource: {
      loadPath: 'src/core/locales/{{lng}}.json',
      savePath: 'src/core/locales/{{lng}}.json',
      jsonIndent: 2,
      lineEnding: '\n',
    },
    nsSeparator: '.',
    keySeparator: '.',
    interpolation: {
      prefix: '{{',
      suffix: '}}',
    },
  },
};

