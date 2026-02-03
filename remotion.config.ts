import { Config } from 'remotion';

/**
 * NOTE: If styling is not reflecting, run:
 * rm -rf node_modules/.cache
 */

// @ts-ignore
Config.setWebpackOverride((config: any) => {
  const cssRule = {
    test: /\.css$/i,
    use: [
      require.resolve('style-loader'),
      require.resolve('css-loader'),
      {
        loader: require.resolve('postcss-loader'),
        options: {
          postcssOptions: {
            plugins: [
              eval('require')('@tailwindcss/postcss'),
            ],
          },
        },
      },
    ],
  };

  return {
    ...config,
    module: {
      ...config.module,
      rules: [
        ...(config.module?.rules ?? []).filter((rule: any) => {
          if (rule && rule.test && rule.test.toString().includes('css')) {
            return false;
          }
          return true;
        }),
        cssRule,
      ],
    },
  };
});
