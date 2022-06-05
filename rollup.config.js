
import commonjs from '@rollup/plugin-commonjs';
import noderesolve from '@rollup/plugin-node-resolve';
import babel from '@rollup/plugin-babel';
import { terser } from 'rollup-plugin-terser';

export default {
	input: `src/index.js`,
	output: [
		{
			file: 'dist/index.cjs.js',
			format: 'cjs'
		},
		{
			file: 'dist/index.esm.js',
			format: 'esm'
		},
		{
			name: 'JellycatBundle',
			file: 'dist/index.umd.js',
			format: 'umd'
		},
		{
        	format: 'iife',
        	file: 'dist/index.iife.js',
        	name: 'JellycatComponent'
    	}
	],
    plugins: [
        commonjs(),
        noderesolve(),
        babel({ babelHelpers: 'bundled' }),
        terser()
    ]
};