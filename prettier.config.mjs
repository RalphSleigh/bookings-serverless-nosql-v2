// @ts-check

/** @type {import("prettier").Config} */
const options = {
    // Standard prettier options
    singleQuote: true,
    semi: false,
    printWidth: 200,
    // Since prettier 3.0, manually specifying plugins is required
    plugins: ['@ianvs/prettier-plugin-sort-imports'],
    // This plugin's options
    importOrder: ['^@core/(.*)$', '', '^@server/(.*)$', '', '^@ui/(.*)$', '', '^[./]'],
    importOrderParserPlugins: ['typescript', 'jsx', 'decorators-legacy'],
    importOrderTypeScriptVersion: '5.0.0',
    importOrderCaseSensitive: false,
};

export default options;