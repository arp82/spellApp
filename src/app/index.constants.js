(function() {
  'use strict';

  angular
    .module('angularjsSample')
    .constant('_', window._);   // Not using $window triggers a warning. Could be solved moving this into a service, for example

})();
