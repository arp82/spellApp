'use strict';

angular.module('angularjsSample').component('spellBook', {
    templateUrl: 'app/components/spell-book/spell-book.template.html',
    controller: SpellBookController,
    controllerAs: 'vm',
    bindings: {
        allSpells: '<'
    }
});

SpellBookController.$inject = ['SpellsService', '_'];

function SpellBookController(SpellsService, _) {
    var vm = this;

    // Public properties
    vm.spells;
    vm.spellRubricToAdd = '';
    vm.spellRubricsAvailable = [];
    vm.errorMessage = '';
    vm.successMessage = '';
    vm.spellsAreModified = false;

    // Public interface
    vm.removeSpell = removeSpell;
    vm.addSpell = addSpell;
    vm.closeAlert = closeAlert;
    vm.saveSpellbookChanges = saveSpellbookChanges;
    vm.cancel = cancel;

    // Private properties
    var spellbookBackup = [];

    // Lifecycle hook methods
    vm.$onInit = function() {
        if (vm.allSpells && vm.allSpells.length && !angular.isString(vm.allSpells)) {
            SpellsService.getMySpells().then(onSuccess, onError);    
        } else {
            vm.errorMessage = 'Could not get the spells from the serv... I mean, the Library. Here is the librarians message: ' + vm.allSpells;
        }

        function onSuccess(mySpells) {
            vm.spells = mySpells;
            updateSpellRubricsAvailable();
            angular.copy(vm.spells, spellbookBackup);
        }

        function onError(errorMessage) {
            vm.errorMessage = errorMessage;
        }
    };

    // Method implementation
    function addSpell(rubric) {
        if (!_.find(vm.spells, {id: rubric})) {
            var newSpell = _.find(vm.allSpells, function(spell) {
                return spell.id === rubric;
            });
            if (newSpell) {
                vm.spells.push(newSpell);
                var index = vm.spellRubricsAvailable.indexOf(rubric);
                if (index > -1) {
                    vm.spellRubricsAvailable.splice(index, 1);
                }
            }
        }
        vm.spellsAreModified = isSpellbookModified();
    }

    function removeSpell(spellToRemove) {
        var rubric = spellToRemove.id;
        _.remove(vm.spells, function(spell) {
            return spell.id === rubric;
        });
        vm.spellRubricsAvailable.push(rubric);
        vm.spellsAreModified = isSpellbookModified();
    }

    function updateSpellRubricsAvailable() {
        var allRubrics = _.map(vm.allSpells, 'id');
        var myRubrics = _.map(vm.spells, 'id');
        // Not needed, but complexity can be N^2 --> pre-sort the rubrics and loop through both at the same time to pick the ones that are part of the difference.
        // Doing so, complexity is ~N*logN
        vm.spellRubricsAvailable = _.difference(allRubrics, myRubrics);
    }

    function closeAlert() {
        vm.successMessage = '';
        vm.errorMessage = '';
    }

    function cancel() {
        angular.copy(spellbookBackup, vm.spells);
        vm.spellsAreModified = false;
    }

    function saveSpellbookChanges() {
        var spellbookChanges = getSpellbookChanges();
        SpellsService.saveSpellbookChanges(spellbookChanges.spellsAdded, spellbookChanges.spellsRemovedRubrics).then(onSuccess, onError);

        function onSuccess(successMessage) {
            vm.successMessage = successMessage;
            angular.copy(vm.spells, spellbookBackup);
            vm.spellsAreModified = false;
        }

        function onError(errorMessage) {
            vm.errorMessage = errorMessage;
        }

        function getSpellbookChanges() { //O(NlogN)
            var spellsAdded = [];
            var spellsRemovedRubrics = [];
            var rubrics = _.map(vm.spells, 'id').sort(function(a,b) { return a - b; }); // (a,b) => a - b, but PhantomJS does not support lambda yet
            var rubricsInBackup = _.map(spellbookBackup, 'id').sort(function(a,b) { return a - b; });
            var j = 0;
            var i = 0; 
            var finished = false;
            while (!finished) {
                if (rubrics[i] === rubricsInBackup[j]) {
                    i++;
                    j++;
                } else if (rubrics[i] < rubricsInBackup[j]) {
                    spellsAdded.push(_.find(vm.spells, {id: rubrics[i]}));
                    i++;
                } else {
                    spellsRemovedRubrics.push(rubricsInBackup[j]);
                    j++;
                }
                if (i >= rubrics.length || j >= rubricsInBackup.length) {
                    finished = true;
                    if (j < rubricsInBackup.length) {
                        for (; j < rubricsInBackup.length; j++) {
                            spellsRemovedRubrics.push(rubricsInBackup[j]);
                        }
                    } else if (i < rubrics.length) {
                        for (; i < rubrics.length; i++) {
                            spellsAdded.push(_.find(vm.spells, {id: rubrics[i]}));
                        }
                    }
                }
            }

            return {
                spellsAdded: spellsAdded,
                spellsRemovedRubrics: spellsRemovedRubrics
            };
        }
    }

    function isSpellbookModified() {
        return !_.isEqual(vm.spells, spellbookBackup);
    }
}
