describe('components/spell-book/spell-book.component.spec.js', function() {
    var $q;
    var $scope;
    var $componentController;
    var ctrl;
    var SpellsService;
    var mySpells;
    var _;

    beforeEach(module('angularjsSample'));

    beforeEach(function() {
        angular.mock.inject([
            '$q',
            '$rootScope',
            '$componentController',
            'SpellsService',
            '_',
            function(
                _$q_,
                $rootScope,
                _$componentController_,
                _SpellsService_,
                Lodash
            ) {
                $q = _$q_;
                $scope = $rootScope.$new();
                $componentController = _$componentController_;
                SpellsService = _SpellsService_;
                _ = Lodash;
            }
        ]);

        var bindings = {
            allSpells: [{
                  'id': 4,
                  'name': 'Hurricane',
                  'school': 'Air',
                  'mana': 14,
                  'difficulty': 14
                },
                {
                  'id': 5,
                  'name': 'Chain Lightning',
                  'school': 'Air',
                  'mana': 16,
                  'difficulty': 14
                },
                {
                  'id': 8,
                  'name': 'Shadow Bolts',
                  'school': 'Shadow',
                  'mana': 10,
                  'difficulty': 5
                },
                {
                  'id': 6,
                  'name': 'Freezing Blast',
                  'school': 'Water',
                  'mana': 10,
                  'difficulty': 5
                },
                {
                  'id': 9,
                  'name': 'Summon Pedobear',
                  'school': 'Otherworld',
                  'mana': 35,
                  'difficulty': 50
                },
                {
                  'id': 11,
                  'name': 'Lux Confetti',
                  'school': 'Light',
                  'mana': 25,
                  'difficulty': 25
                },
                {
                  'id': 10,
                  'name': 'Boundless Love',
                  'school': 'Air',
                  'mana': 30,
                  'difficulty': 35
                }
            ]
        };

        mySpells = [
            {
              'id': 11,
              'name': 'Lux Confetti',
              'school': 'Light',
              'mana': 25,
              'difficulty': 25
            },
            {
              'id': 10,
              'name': 'Boundless Love',
              'school': 'Air',
              'mana': 30,
              'difficulty': 35
            }
        ];

        ctrl = $componentController('spellBook', {$scope: $scope}, bindings);

    });

    it('should retrieve the spells for the spellbook on initialization', function() {
        var deferredSpells = $q.defer();
        spyOn(SpellsService, 'getMySpells').and.returnValue(deferredSpells.promise);
        ctrl.$onInit();
        $scope.$apply(function() {
            deferredSpells.resolve(mySpells);
        });
        expect(ctrl.spellRubricsAvailable).toEqual([4,5,8,6,9]);
        expect(ctrl.spells).toEqual(mySpells);
    });

    it('should display an error message if initialization fails', function() {
        ctrl.allSpells = 'Some Error Message';
        ctrl.$onInit();
        expect(ctrl.errorMessage).toBe('Could not get the spells from the serv... I mean, the Library. Here is the librarians message: Some Error Message');
    });

    describe('after correct initialization', function(){ 
        beforeEach(function(){
            ctrl.spells = mySpells.slice();
            ctrl.spellRubricsAvailable = [4,5,8,6,9];
        });

        it('should be able to add a new spell to the spell book', function() {
            ctrl.addSpell(9);
            expect(ctrl.spellRubricsAvailable.indexOf(9)).toBe(-1);
            expect(_.find(ctrl.spells, {id: 9})).toEqual(_.find(ctrl.allSpells, {id: 9}));
        });

        it('should be able to remove a spell from the spell book', function() {
            ctrl.removeSpell(_.find(ctrl.allSpells, {id: 10}));
            expect(ctrl.spellRubricsAvailable.indexOf(10)).not.toBe(-1);
            expect(_.find(ctrl.spells, {id: 10})).toBeUndefined();
        });
    });

    it('should clear up success and error messages when closing alerts', function() {
        ctrl.successMessage = 'Success';
        ctrl.errorMessage = 'Failure';
        ctrl.closeAlert();
        expect(ctrl.successMessage).toBe('');
        expect(ctrl.errorMessage).toBe('');
    });

    describe('after making a back-up', function(){
        beforeEach(function(){
            var deferredSpells = $q.defer();
            spyOn(SpellsService, 'getMySpells').and.returnValue(deferredSpells.promise);
            ctrl.$onInit();
            $scope.$apply(function() {
                deferredSpells.resolve(mySpells);
            });
        });

        it('should show if the contents of the spellbook have been modified respect the backed-up version', function(){
            ctrl.addSpell(9);
            expect(ctrl.spellsAreModified).toBe(true);
            ctrl.removeSpell(_.find(ctrl.allSpells, {id: 9}));
            expect(ctrl.spellsAreModified).toBe(false);
        });

        it('should restore the backed-up version on cancellation', function(){
            ctrl.addSpell(9);
            ctrl.cancel();
            expect(ctrl.spellsAreModified).toBe(false);
            expect(_.find(ctrl.spells, {id: 9})).toBeUndefined();
        });

        it('should send to the backend the new spells to add to and those to remove from the spellbook', function(){
            ctrl.addSpell(9);
            ctrl.addSpell(4);
            ctrl.addSpell(8);
            ctrl.removeSpell(_.find(ctrl.allSpells, {id: 11}));
            var spellsAdded = [];
            var spellsRemoved = [];
            var deferredReply = $q.defer();
            spyOn(SpellsService, 'saveSpellbookChanges').and.callFake(function(added, removed) {
                spellsAdded = added;
                spellsRemoved = removed;
                return deferredReply.promise;
            });
            $scope.$apply(function() {
                deferredReply.resolve(mySpells);
            });
            if (ctrl.spellsAreModified) {
                ctrl.saveSpellbookChanges();
            }
            expect(SpellsService.saveSpellbookChanges).toHaveBeenCalled();
            expect(spellsAdded).toEqual(_.filter(ctrl.allSpells, function(spell) {
                return [9,4,8].indexOf(spell.id) > -1
            }));
            expect(spellsRemoved).toEqual([11]);
        });
    });
});
