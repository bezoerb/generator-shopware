describe('Dummy spec', function() {
    it('there should be some boilerplate test', function() {
        assert.isDefined($, 'jquery has been defined');

        assert.isOk('everything', 'everything is ok');
        assert.match('foobar', /^foo/, 'regexp matches');
    });
});
