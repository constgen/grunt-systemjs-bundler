'use strict'

var path = require('path')
var Builder = require('systemjs-builder')

module.exports = function (grunt) {
	grunt.registerMultiTask('systemjs', 'SystemJS modules builder', function () {
		var done = this.async()
		var taskConfig = this.data

		// Merge task-specific options with these defaults.
		var options = this.options({
			baseURL: '.', //'file:/' + process.cwd(),
			format: 'global', //'amd', 'cjs', 'esm', 'global'
			minify: false,
			mangle: false,
			sourceMaps: false
		})
		
		//grunt.log.writeln(JSON.stringify(this.files))
		//grunt.log.writeln(process.cwd())
		//grunt.log.writeln(__dirname)
		//grunt.log.writeln(process.execPath)
		//grunt.log.writeln(this.target + ': ' + JSON.stringify(options))
		//grunt.log.writeln(path.relative(options.baseURL, taskConfig.src))

		var builder = new Builder(String(options.baseURL))

		function configure(config) {
			if (config instanceof Array) {
				var configurationResult = Promise.resolve()
				config.forEach(function(conf) {
					configurationResult = configurationResult.then(function() {
						return configure(conf)
					})
				})
				return configurationResult
			}
			else if (config) {
				return builder.loadConfig(config)
			}
		}
		
		function build(params) {
			switch (params.buildType) {
				case 'build':
					return builder.buildStatic(params.src, params.dest, params.buildConfig)
				case 'bundle':
				default:
					return builder.bundle(params.src, params.dest, params.buildConfig)
			}
		}

		Promise.resolve()
			.then(function () {
				return configure(options.config)
			})
			.then(function() {
				//Fix paths in config. They  become relative to builder root
				if (builder.loader.paths) {
					Object
						.keys(builder.loader.paths)
						.filter(function(pathAlias) {
							return builder.loader.paths[pathAlias].charAt(0) === '.'
						})
						.forEach(function(pathAlias) {
							var absolutePath = path.resolve(options.baseURL, builder.loader.paths[pathAlias])
							var relativeUrl = './' + path.relative('./', absolutePath).replace(/\\/g, '/')
							builder.loader.paths[pathAlias] = relativeUrl
							builder.loader.pluginLoader.paths[pathAlias] = relativeUrl
						})
				}

				//Fix packages in config. They  become relative to builder root
				//if (builder.loader.packages) {
				//	Object.keys(builder.loader.packages).forEach(function(pathAlias) {
				//		var absolutePath = pathAlias.replace(/^file:(\/)+/, '')
				//		var relativeUrl = './' + path.relative('./', absolutePath).replace(/\\/g, '/')
				//		absolutePath = path.resolve(options.baseURL, relativeUrl)
				//		var absoluteUrl = 'file:///' + absolutePath.replace(/\\/g, '/')
				//		//relativeUrl = './' + path.relative('./', absolutePath).replace(/\\/g, '/')
				//		builder.loader.packages[absoluteUrl] = builder.loader.packages[pathAlias]
				//		delete builder.loader.packages[pathAlias]
				//	})
				//}


				//resolve src. Make path relative to baseURL because of strange behaviour of System Builder
				if (taskConfig.src instanceof Array) {
					taskConfig.src = taskConfig.src
						.map(function(src) {
							if (src.charAt(0) === '!') {
								src = src.substr(1)
								src = path.relative(options.baseURL, src)
								src = src.replace(/\\/g, '/')
								src = '!' + src
								return src
							}
							else {
								src = path.relative(options.baseURL, src)
								src = src.replace(/\\/g, '/')
								return src
							}
						})
						.join(' + ')
						.replace(/\+\s+?!/g, '- ')
				}
				else {
					taskConfig.src = path.relative(options.baseURL, taskConfig.src).replace(/\\/g, '/')
				}
			})
			.then(function() {
				//builder.config()
				return build({
					src: taskConfig.src, 
					dest: taskConfig.dest, 
					buildType: options.type,
					buildConfig: {
						format: options.format,
						minify: Boolean(options.minify),
						mangle: Boolean(options.mangle),
						sourceMaps: Boolean(options.sourceMaps)
						//sourceRoot: options.baseURL
					}
				})
			})
			.then(function () {
				console.log('Build complete')
				done()
			})
			.catch(function (err) {
				console.log('Build error')
				console.error(err)
				done(false)
			})
	})
}