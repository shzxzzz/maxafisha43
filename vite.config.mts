import path from 'path';

import legacy from '@vitejs/plugin-legacy';
import react from '@vitejs/plugin-react-swc';
import autoprefixer from 'autoprefixer';
import { defineConfig, loadEnv, type AliasOptions } from 'vite';
import checker from 'vite-plugin-checker';
import { createHtmlPlugin } from 'vite-plugin-html';
import svgr from 'vite-plugin-svgr';

import { createParserApiPlugin } from './src/pages/ParserPage/backend/plugin';
import { buildFontsInject } from './tools/fonts';
import tsConfig from './tsconfig.json';

const SRC_PATH = path.resolve(__dirname, 'src');
const BUILD_PATH = path.resolve(__dirname, 'public');

const defineEnvVariables = (variables: string[]): Record<string, any> =>
  variables.reduce(
    (accumulator, variable) => ({
      ...accumulator,
      [`process.env.${variable}`]: JSON.stringify(process.env[variable]),
    }),
    {}
  );

const getAliases = (): AliasOptions =>
  Object.fromEntries(
    Object.keys(tsConfig.compilerOptions.paths)
      .map((alias) => alias.replace('/*', ''))
      .map((alias) => [alias, path.join(SRC_PATH, alias)])
  );

// https://vitejs.dev/config/
export default defineConfig(({ mode }) => {
  process.env = { ...process.env, ...loadEnv(mode, process.cwd(), '') };

  const { NODE_ENV = '' } = process.env;

  const IS_PROD = NODE_ENV === 'production';

  const { INJECT_FONTS_PRELOAD_LINKS, INJECT_FONTS_FACES } = buildFontsInject();

  return {
    define: defineEnvVariables(['NODE_ENV']),
    base: '/',
    publicDir: 'static',
    build: {
      outDir: BUILD_PATH,
      assetsDir: 'static',
      sourcemap: 'hidden',
    },
    server: {},
    css: {
      modules: {
        generateScopedName: IS_PROD ? '[hash:base64]' : '[name]__[local]__[hash:base64:5]',
      },
      postcss: {
        plugins: [autoprefixer()],
      },
      preprocessorOptions: {
        scss: {
          silenceDeprecations: ['legacy-js-api'],
        },
      },
    },
    resolve: {
      alias: getAliases(),
    },
    plugins: [
      checker({
        typescript: true,
      }),
      createParserApiPlugin(),
      createHtmlPlugin({
        minify: IS_PROD,
        inject: {
          ejsOptions: {
            delimiter: '|',
            openDelimiter: '{',
            closeDelimiter: '}',
          },
          data: {
            INJECT_FONTS_PRELOAD_LINKS,
            INJECT_FONTS_FACES,
            INJECT_IS_DEV: !IS_PROD,
          },
        },
      }),
      react(),
      svgr({
        svgrOptions: {
          ref: true,
          memo: true,
          plugins: ['@svgr/plugin-svgo', '@svgr/plugin-jsx'],
          svgoConfig: {
            plugins: [
              {
                name: 'preset-default',
                params: {
                  overrides: {
                    removeViewBox: false,
                  },
                },
              },
              {
                name: 'cleanupIds',
                params: {
                  remove: false,
                },
              },
              'prefixIds',
            ],
          },
        },
      }),
      legacy({
        targets: IS_PROD
          ? '> 0.2%, not dead, not op_mini all, not IE 11'
          : 'last 1 chrome version, last 1 firefox version, last 1 safari version',
      }),
    ],
  };
});
