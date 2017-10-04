'use strict';

angular.module('angularjsSample')
    .service('SpellsService', SpellsService);

SpellsService.$inject = [
    '$q',
    '$resource',
    '_'
];

function SpellsService($q, $resource, _) {
    // Public endpoints
    this.getMySpells = getMySpells;
    this.getAllSpells = getAllSpells;
    this.saveSpellbookChanges = saveSpellbookChanges;

    // Properties
    var spellsDatabaseUrl = 'http://localhost:3005';

    // Implementation
    function getMySpells() {
        var spellsResource = $resource(spellsDatabaseUrl + '/spells', {}, {});  // TODO: redundant code, maybe move into separate service/factory
        return spellsResource.query().$promise.then(cleanData, onError);

        function onError(error) {
            var errorMsg = '';
            if (_.isEqual(error.status, 403)) {
                errorMsg = 'Sorry, you do not have permissions to read the spells';
            } else if (_.isEqual(error.status, 404)) {
                errorMsg = 'Sorry, no spells found';
            } else {
                errorMsg = 'Sorry, we are experiencing technical diffi... I mean, the arcane winds are not favourable today';
            }
            return errorMsg;
        }
    }

    function getAllSpells() {
        var spellsResource = $resource(spellsDatabaseUrl + '/availableSpells', {}, {});
        return spellsResource.query().$promise.then(cleanData, onError);

        function onError(error) {
            var errorMsg = '';
            if (_.isEqual(error.status, 403)) {
                errorMsg = 'Sorry, you do not have permissions to read the spells';
            } else if (_.isEqual(error.status, 404)) {
                errorMsg = 'Sorry, no spells found';
            } else {
                errorMsg = 'Sorry, we are experiencing technical diffi... I mean, the arcane winds are not favourable today';
            }
            return errorMsg;
        }
    }

    function saveSpellbookChanges(spellsAdded, spellsRemovedRubrics) { // TODO: move to real backend service and implement bulk save/delete endpoints.
        var promises = [];
        //_.forEach(spellsAdded, spell => promises.push(saveSpell(spell))); --- Removed Lambda functions due to PhantomJS problems
        //_.forEach(spellsRemovedRubrics, rubric => promises.push(removeSpell(rubric)));
        _.forEach(spellsAdded, function(spell) { return promises.push(saveSpell(spell)); });
        _.forEach(spellsRemovedRubrics, function(rubric) { return promises.push(removeSpell(rubric)); });

        return $q.all(promises).then(onSuccess, onError);

        function onSuccess() {
            return 'Your spellbook has been updated in the Library';
        }
        
        function onError(error) {
            return 'There has been a problem, we could not save your spells in the Library -> ' + error;
        }
    }

    function cleanData(data){ // TODO: move to a proper backend that returns GET/QUERY results inside a results field, to prevent this.
        delete data.$promise;
        delete data.$resolved;
        return data;
    }

    function saveSpell(spell) {
        var spellsResource = $resource(spellsDatabaseUrl + '/spells', {}, {});
        //return spellsResource.save(spell).$promise.catch(() => 'Failed to save spell with rubric: ' + spell.id);
        return spellsResource.save(spell).$promise.catch(function() { return 'Failed to save spell with rubric: ' + spell.id; });
    }

    function removeSpell(rubric) {
        var spellsResource = $resource(spellsDatabaseUrl + '/spells/' + rubric, {}, {});
        //return spellsResource.remove().$promise.catch(() => 'Failed to remove spell with rubric: ' + rubric);
        return spellsResource.remove().$promise.catch(function() { return 'Failed to remove spell with rubric: ' + rubric; });
    }
}