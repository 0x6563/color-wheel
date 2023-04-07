import preprocess from 'svelte-preprocess';
import adapter from '@sveltejs/adapter-static';

/** @type {import('@sveltejs/kit').Config} */
const config = {
    // Consult https://github.com/sveltejs/svelte-preprocess
    // for more information about preprocessors
    preprocess: preprocess(),
    onwarn: (warning, handler) => {
        if (warning.code === 'a11y-no-onchange') return;
        handler(warning);
    },
    kit: {
        paths: { assets: "", base: "/color-wheel" },
        adapter: adapter({
            // default options are shown
            pages: 'docs',
            assets: 'docs',
            fallback: 'index.html'
        })
    }
};

export default config;
