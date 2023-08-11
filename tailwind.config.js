module.exports = {
    plugins: [
        require('daisyui'),
        function ({ addBase }) {
            addBase({
                // fix: el-button background is white
                ".el-button": {
                    "background-color": "var(--el-button-bg-color,var(--el-color-white))"
                }
            });
        }
    ],
    daisyui: {
        themes: [
            // "light",
            // "dark",
            // "cupcake",
            // "bumblebee",
            // "emerald",
            "corporate",
            // "synthwave",
            // "retro",
            // "cyberpunk",
            // "valentine",
            // "halloween",
            // "garden",
            // "forest",
            // "aqua",
            // "lofi",
            // "pastel",
            // "fantasy",
            // "wireframe",
            // "black",
            // "luxury",
            // "dracula",
            // "cmyk",
            // "autumn",
            // "business",
            // "acid",
            // "lemonade",
            // "night",
            // "coffee",
            // "winter",
        ],
    }
};
