'use strict';

angular.module('angularjsSample').component('navbar', {
    templateUrl: 'app/components/navbar/navbar.template.html',
    controller: NavbarController,
    controllerAs: 'vm',
    bindings: {}
});

NavbarController.$inject = [];

function NavbarController() {

}
