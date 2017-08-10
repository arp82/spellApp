(function() {
    'use strict';

    angular
        .module('angularjsSample')
        .config(routerConfig);

    
    routerConfig.$inject = [
        '$stateProvider',
        '$urlRouterProvider'
    ];

    function routerConfig($stateProvider, $urlRouterProvider) {

        var states = [
            {
                name: 'spellBook',
                url: '/spellbook',
                component: 'spellBook',
                resolve: {
                    allSpells: function(SpellsService) {
                        return SpellsService.getAllSpells();
                    }
                }
            }
        ];

        states.forEach(function(state) {
            $stateProvider.state(state);
        });

        $stateProvider
            .state('home', {
                url: '/',
                templateUrl: 'app/main/main.html',
                controller: 'MainController',
                controllerAs: 'main'
            });

        $urlRouterProvider.otherwise('/');
    }

})();
