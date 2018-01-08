/* eslint-env mocha */
describe('Dummy spec', function() {
    it('there should be some boilerplate test', function() {
        assert.isOk('everything', 'everything is ok');
        assert.match('foobar', /^foo/, 'regexp matches');
    });
});
