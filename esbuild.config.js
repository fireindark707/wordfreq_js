import * as esbuild from 'esbuild';

async function build() {
    await esbuild.build({
        entryPoints: ['src/index.ts'],
        bundle: true,
        minify: true,
        sourcemap: true,
        format: 'esm', // Modern Extensions love ESM
        outfile: 'dist/wordfreq.bundle.js',
        platform: 'browser',
        define: {
            'process.env.NODE_ENV': '"production"',
        },
        // Remove node-specific stuff for the browser bundle
        external: ['fs', 'path', 'fs/promises'],
    });

    // Also create a global-variable version (iife) for older content scripts if needed
    await esbuild.build({
        entryPoints: ['src/index.ts'],
        bundle: true,
        minify: true,
        format: 'iife',
        globalName: 'WordfreqLib',
        outfile: 'dist/wordfreq.iife.js',
        platform: 'browser',
        define: {
            'process.env.NODE_ENV': '"production"',
        },
        external: ['fs', 'path', 'fs/promises'],
    });

    console.log('Build finished successfully:');
    console.log('- dist/wordfreq.bundle.js (ESM)');
    console.log('- dist/wordfreq.iife.js (Global Variable)');
}

build().catch((err) => {
    console.error(err);
    process.exit(1);
});
