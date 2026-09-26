import type { StorybookConfig } from '@storybook/angular';

const config: StorybookConfig = {
  stories: ['../src/**/*.stories.ts'],
  // addon-docs renders the parameters.docs descriptions; it needs `tags: ['autodocs']` in preview.ts to produce pages.
  addons: ['@storybook/addon-docs', '@storybook/addon-a11y'],
  framework: { name: '@storybook/angular', options: {} },
  docs: { defaultName: 'Notes' },
  webpackFinal: async (cfg) => {
    // No source maps in the published build. The Angular `sourceMap: false` option does not reach Storybook's webpack.
    cfg.devtool = false;
    return cfg;
  },
};
export default config;
