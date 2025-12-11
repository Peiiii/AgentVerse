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
    debug: true,
    func: {
      list: ['t', 'i18next.t', 'i18n.t', 'useTranslation'],
      extensions: ['.js', '.jsx', '.ts', '.tsx'],
    },
    trans: {
      component: 'Trans',
      i18nKey: 'i18nKey',
      defaultsKey: 'defaults',
      extensions: ['.js', '.jsx', '.ts', '.tsx'],
      fallbackKey: function (ns, value) {
        return value;
      },
    },
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

