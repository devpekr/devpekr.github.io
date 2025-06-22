"use strict";
function getConfig(hexo) {
    const drawConfig = hexo.config.draw || {};

    const arg = Object.assign(
        {
            'highlight': '#0000ff',
            'lightbox': "false",
            'nav': "true",
            'resize': "false",
            'toolbar': 'lightbox zoom layers pages',
        },
        drawConfig.default_arguments
    );

    return {
        arg
    };
}

module.exports = getConfig;
