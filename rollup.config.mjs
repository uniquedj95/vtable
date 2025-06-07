import typescript from 'rollup-plugin-typescript2';
import vue from 'rollup-plugin-vue';
import clear from 'rollup-plugin-clear';
import css from 'rollup-plugin-css-only';

export default async function config(args) {
  return [
    {
      input: 'src/index.ts',
      output: {
        dir: 'dist',
        format: 'cjs',
        sourcemap: true,
        entryFileNames: '[name].js',
      },
      external: [
        'vue',
        '@ionic/vue',
        'ionicons/icons'
      ],
      plugins: [
        clear({
          targets: ['./dist'],
        }),
        css({ output: "lib/datatable.css" }),
        vue(),
        typescript({
          tsconfigOverride: {
            compilerOptions: {
              declaration: true,
            },
            include: ["src/**/*.ts", "src/**/*.tsx", "src/**/*.vue"],
            exclude: ["**/*.css"]
          },
        }),
      ],
    },
    {
      input: 'src/index.ts',
      output: {
        dir: 'dist',
        format: 'esm',
        sourcemap: true,
        entryFileNames: '[name].mjs',
      },
      external: [
        'vue',
        '@ionic/vue',
        'ionicons/icons'
      ],
      plugins: [
        vue(),
        typescript({
          tsconfigOverride: {
            declaration: false,
            include: ["src/**/*.ts", "src/**/*.tsx", "src/**/*.vue"],
            exclude: ["**/*.css"]
          },
        }),
      ],
    }
  ];
}