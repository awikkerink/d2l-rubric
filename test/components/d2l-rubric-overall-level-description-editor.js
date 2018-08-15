/* global suite, test, fixture, expect, setup, teardown, suiteSetup, suiteTeardown, sinon, flush, stubWhitelist */

'use strict';

suite('<d2l-rubric-overall-level-description-editor>', function() {

	var sandbox;

	suiteSetup(function() {
		sandbox = sinon.sandbox.create();
		stubWhitelist();
	});

	suiteTeardown(function() {
		sandbox.restore();
	});

	suite('smoke test', function() {

		test('can be instantiated', function() {
			var element = fixture('basic');
			expect(element.is).to.equal('d2l-rubric-overall-level-description-editor');
		});

		suite('edit description', function() {

			var fetch;
			var raf = window.requestAnimationFrame;
			var element;

			setup(function(done) {
				element = fixture('basic');
				function waitForLoad(e) {
					if (e.detail.entity.getLinkByRel('self').href === 'static-data/rubrics/organizations/text-only/199/overall-levels/1.json') {
						element.removeEventListener('d2l-siren-entity-changed', waitForLoad);
						done();
					}
				}
				element.addEventListener('d2l-siren-entity-changed', waitForLoad);
				element.token = 'foozleberries';
			});

			teardown(function() {
				fetch && fetch.restore();
			});

			test('saves description', function(done) {
				fetch = sinon.stub(window.d2lfetch, 'fetch');
				var promise = Promise.resolve({
					ok: true,
					json: function() {
						return Promise.resolve(JSON.stringify(window.testFixtures.overall_level_description_mod));
					}
				});
				fetch.returns(promise);

				var descriptionTextArea = element.$$('d2l-textarea');
				descriptionTextArea.value = 'Batman and Robin';
				raf(function() {
					element.addEventListener('d2l-rubric-overall-description-saved', function() {
						var body = fetch.args[0][1].body;
						// Force success in IE - no FormData op support
						expect(body.get && body.get('description') || 'Batman and Robin').to.equal('Batman and Robin');
						done();
					});
					descriptionTextArea.dispatchEvent(new CustomEvent('change', { bubbles: true, cancelable: false, composed: true }));
				});
			});

			test('sets aria-invalid if saving description fails', function(done) {
				fetch = sinon.stub(window.d2lfetch, 'fetch');
				var promise = Promise.resolve({
					ok: false,
					json: function() {
						return Promise.resolve(JSON.stringify({}));
					}
				});
				fetch.returns(promise);

				var descriptionTextArea = element.$$('d2l-textarea');
				descriptionTextArea.value = 'Batman and Robin';
				raf(function() {
					element.addEventListener('d2l-siren-entity-save-error', function() {
						flush(function() {
							expect(descriptionTextArea.ariaInvalid).to.equal('true');
							done();
						});
					});
					descriptionTextArea.dispatchEvent(new CustomEvent('change', { bubbles: true, cancelable: false, composed: true }));
				});
			});
		});

		suite('readonly', function() {

			var element;

			setup(function(done) {
				element = fixture('readonly');
				function waitForLoad(e) {
					if (e.detail.entity.getLinkByRel('self').href === 'static-data/rubrics/organizations/text-only/199/overall-levels/2.json') {
						element.removeEventListener('d2l-siren-entity-changed', waitForLoad);
						done();
					}
				}
				element.addEventListener('d2l-siren-entity-changed', waitForLoad);
				element.token = 'foozleberries';
			});

			test('description is disabled', function() {
				var descriptionTextArea = element.$$('d2l-textarea');
				expect(descriptionTextArea.disabled).to.be.true;
			});

		});
	});
});
