const { NxAppWebpackPlugin } = require('@nx/webpack/app-plugin');
const { join } = require('path');

module.exports = {
  output: {
    path: join(__dirname, '../../dist/apps/mob-api'),
  },
  resolve: {
    alias: {
      '@./auth': join(__dirname, '../../libs/auth/src/index.ts'),
      '@./auth/*': join(__dirname, '../../libs/auth/src/lib/*'),
      '@./common': join(__dirname, '../../libs/common/src/index.ts'),
      '@./common/*': join(__dirname, '../../libs/common/src/lib/*'),
      '@./config': join(__dirname, '../../libs/config/src/index.ts'),
      '@./config/*': join(__dirname, '../../libs/config/src/lib/*'),
      '@./contract': join(__dirname, '../../libs/contract/src/index.ts'),
      '@./contract/*': join(__dirname, '../../libs/contract/src/lib/*'),
      '@./database': join(__dirname, '../../libs/database/src/index.ts'),
      '@./database/*': join(__dirname, '../../libs/database/src/lib/*'),
      '@./logger': join(__dirname, '../../libs/logger/src/index.ts'),
      '@./logger/*': join(__dirname, '../../libs/logger/src/lib/*'),
      '@./mail': join(__dirname, '../../libs/mail/src/index.ts'),
      '@./mail/*': join(__dirname, '../../libs/mail/src/lib/*'),
      '@./user': join(__dirname, '../../libs/user/src/index.ts'),
      '@./user/*': join(__dirname, '../../libs/user/src/lib/*'),
    },
  },
  plugins: [
    new NxAppWebpackPlugin({
      target: 'node',
      compiler: 'tsc',
      main: './src/main.ts',
      tsConfig: './tsconfig.app.json',
      assets: ['./src/assets'],
      optimization: false,
      outputHashing: 'none',
      generatePackageJson: true,
    }),
  ],
};
