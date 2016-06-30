# grunt-systemjs-bundler
The Gunt plugin for SystemJS modules compilation and bundling 

Full usage example:

    module.exports = function (grunt) {
        var SRC_DIR = 'src',
            TEST_DIR = 'test',
            BUILD_DIR = 'build';

        grunt.initConfig({
            systemjs: {
                build: {
                    src: [
                        SRC_DIR + '/ui/**/*.js', //ui
                        SRC_DIR + '/ui/**/*.html', //ui
                        SRC_DIR + '/modules/main.js', //modules
                        '!' + SRC_DIR + '/config.json', //exclude config to be loaded dinamically
                        SRC_DIR + '/systemjs-plugin-image', //plugin
                        SRC_DIR + '/systemjs-plugin-css', //plugin
                        SRC_DIR + '/systemjs-plugin-text', //plugin
                        SRC_DIR + '/systemjs-plugin-json' //plugin
                    ],
                    dest: BUILD_DIR + '/js/bundle.js',
                    options: {
                        baseURL: SRC_DIR,
                        type: 'bundle', //sfx, bundle
                        format: 'amd',
                        config: 'system.config.js',
                        minify: false,
                        mangle: false,
                        sourceMaps: false
                    }
                },
                test: {
                    src: TEST_DIR + '/spec.js',
                    dest: TEST_DIR + '/test.js',
                    options: {
                        baseURL: TEST_DIR,
                        type: 'sfx', //sfx, bundle
                        format: 'global',
                        config: ['system.config.js', TEST_DIR + '/system.config.js']
                    }
                }
            }
        });

        grunt.loadNpmTasks('grunt-systemjs-bundler');
    };