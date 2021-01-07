/*
 * @Author: nigel
 * @Date: 2020-05-15 15:11:17
 * @LastEditTime: 2021-01-07 17:10:06
 */
let webpackDevConfig = require('./build/webpack.dev.conf.js')

module.exports = function (config) {
    config.set({
        frameworks: ['mocha'],
        files: ['./test/unit/*.spec.js'],
        preprocessors: {
            '**/*.spec.js': ['webpack', 'sourcemap']
        },
        webpack: webpackDevConfig,
        browsers: ['Firefox'],
        reporters: ['spec', 'coverage'],
        coverageReporter: {
            dir: './coverage',
            reporters: [
                { type: 'html', subdir: 'report-html' },
                { type: 'lcov', subdir: 'report-lcov' },
            ]
        }
    })
}