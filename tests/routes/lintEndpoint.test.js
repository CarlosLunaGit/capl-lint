const request = require('supertest');
const app = require('../../src/index');

describe('POST /lint', () => {
    it('should validate code and return errors for missing semicolons', async () => {
        const response = await request(app)
            .post('/lint')
            .send({ code: 'int x = 10;' })  // The semicolon is present, so expecting no errors
            .expect('Content-Type', /json/)
            .expect(200);

        expect(response.body).toEqual({ errors: [
            { line: 1, error: 'Line does not end with a semicolon.' }
        ] });
    });
});
