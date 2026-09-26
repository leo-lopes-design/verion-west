import type { Preview } from '@storybook/angular';

// The stylesheets are declared in angular.json under build.options.styles, not
// imported here: the Angular builder owns the style pipeline, and a bare CSS
// import in preview.ts reaches webpack with no loader configured for it.

/**
 * The theme is a toolbar global, not a per-story argument.
 *
 * It flips one attribute on the story root and every token below it
 * re-resolves — which is the point being demonstrated, and would be hidden if
 * each story carried its own copy of the decision.
 */
const preview: Preview = {
  // One docs page per component, generated from the meta. Without this tag the
  // addon is installed and silent.
  tags: ['autodocs'],
  globalTypes: {
    mode: {
      description: 'Which mode the tokens resolve in',
      defaultValue: 'light',
      toolbar: {
        title: 'Mode',
        icon: 'circlehollow',
        items: [
          { value: 'light', icon: 'sun', title: 'Light' },
          { value: 'dark', icon: 'moon', title: 'Dark' },
        ],
        dynamicTitle: true,
      },
    },
  },
  decorators: [
    (story, context) => {
      const mode = context.globals['mode'] ?? 'light';
      document.documentElement.setAttribute('data-theme', String(mode));
      return story();
    },
  ],
  parameters: {
    controls: { matchers: { color: /(background|color)$/i } },
    options: { storySort: { order: ['Foundations', ['Tokens', 'Theme'], 'Components'] } },
  },
};
export default preview;
