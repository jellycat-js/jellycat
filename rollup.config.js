
import commonjs from '@rollup/plugin-commonjs';
import noderesolve from '@rollup/plugin-node-resolve';
import babel from '@rollup/plugin-babel';
import { terser } from 'rollup-plugin-terser';

export default {
	input: `src/index.js`,
	output: [
		{
			file: 'dist/bundle.cjs.js',
			format: 'cjs'
		},
		{
			file: 'dist/bundle.esm.js',
			format: 'esm'
		},
		{
			name: 'JellycatBundle',
			file: 'dist/bundle.umd.js',
			format: 'umd'
		},
		{
        	format: 'iife',
        	file: 'dist/bundle.iife.js',
        	name: 'JellycatComponent'
    	}
	],
	// watch: {
 //      include: './src/**',
 //      clearScreen: false
 //    },
    plugins: [
        commonjs(),
        noderesolve(),
        babel({ babelHelpers: 'bundled' })/*,
        terser()*/
    ]
};