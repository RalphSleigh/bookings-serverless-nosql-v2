const fs = await import('fs')
const path = await import('path')
const esbuild = await import('esbuild')

const entrypoints = ['src/local-server.ts']
const outDir = `dist-local`;
const functionsDir = `src`;

const context = await esbuild.context({
        entryPoints: entrypoints,
        bundle: true,
        minify: false,
        //splitting: true,
        outdir: path.join(outDir),
        outbase: functionsDir,
        format: 'esm',
        platform: 'node',
        sourcemap: 'inline',
        target: ['node16'],
        packages: 'external',
        //external: ['pg-hstore','aws-sdk'],
        //plugins: [ImportGlobPlugin.default.default()],
    })

await context.watch()