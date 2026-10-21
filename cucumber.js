module.exports = {
  default: {
    paths: ['tests/features/**/*.feature'],
    require: ['tests/features/support/*.js', 'tests/features/step-definitions/*.js'],
    format: ['progress-bar', 'html:reports/cucumber.html'],
  },
};