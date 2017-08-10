(function() {
  'use strict';

  angular
    .module('angularjsSample')
    .run(runBlock);

  /** @ngInject */
  function runBlock($log) {

    $log.debug('runBlock end');
  }

})();
