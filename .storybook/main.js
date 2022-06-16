const custom = require('@vue/cli-service/webpack.config.js');
const path = require("path");

module.exports = {
    "stories": [
        "../src/**/*.stories.mdx",
        "../src/**/*.stories.@(js|jsx|ts|tsx)"
    ],
    "addons": [
        "@storybook/addon-links",
        "@storybook/addon-essentials"
    ],
    "framework": "@storybook/vue",
    webpackFinal: async (config) => {
        return {
            ...config,
            module: {
                ...config.module,
                rules: custom.module.rules
            },
            resolve: {
                ...(config.resolve || {}),
                alias: {
                    ...(config.resolve && config.resolve.alias ? config.resolve.alias : {}),
                    '@': path.resolve(__dirname, '../src')
                }
            }
        };
    },

}
