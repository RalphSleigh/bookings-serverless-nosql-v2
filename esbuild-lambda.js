
import esbuild from 'esbuild';
import path from 'path';
//.filter(p => p.includes('.ts'))
const outDir = `dist-lambda`;
const functionsDir = `src/lambda`;

esbuild
    .build({
       entryPoints: ["src/lambda/handler.ts", "src/lambda/asyncTaskHandler.ts"],
        bundle: true,
        minify: true,
        //splitting: true,
        outdir: path.join(".", outDir),
        outbase: functionsDir,
        outExtension: { '.js': '.mjs' },
        format: 'esm',
        platform: 'node',
        //sourcemap: 'inline',
        target: ['node22'],
        external: ['aws-sdk','aws-lambda','@aws-sdk/*', 'punycode'],
        //metafile: true,
        banner: {
            js: `
            import path from 'path';
            import { fileURLToPath } from 'url';
            import { createRequire as topLevelCreateRequire } from 'module';
            const require = topLevelCreateRequire(import.meta.url);
            const __filename = fileURLToPath(import.meta.url);
            const __dirname = path.dirname(__filename);
            `,
          },
    })


//})()