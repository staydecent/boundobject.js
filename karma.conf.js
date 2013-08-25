module.exports = function(config) {
  config.set({
    frameworks: ['jasmine'],

    files: [
      'lib/microevent.js',
      'src/boundobject.js',

      // dom nodes to test on
      'tests/*.html',

      // Our specs
      'tests/*spec.*'
    ],

    autoWatch: true,

    browsers: ['Chrome'],

    reporters: ['dots'],  

    plugins: [
      'karma-jasmine',
      'karma-html2js-preprocessor',
      'karma-chrome-launcher',
      'karma-firefox-launcher',
      'karma-phantomjs-launcher'
    ],
  });
};
