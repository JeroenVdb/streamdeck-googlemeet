import typescript from '@rollup/plugin-typescript';

export default {
	input: 'src/be.jeroenvdb.googlemeet.sdPlugin/index.ts',
	output: {
		file: 'build/be.jeroenvdb.googlemeet.sdPlugin/bundle.js',
		format: 'iife'
	},
	treeshake: false,
	plugins: [
		typescript()
	]
};
