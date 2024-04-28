const request = require('supertest');
const app = require('../../src/index');  // Adjust the path to where your Express app is exported


describe('POST /lint', () => {
    it('should validate code and return errors for missing semicolons', async () => {
        console.log(app);
        const response = await request(app)
            .post('/lint')
            .send({ code: 'int x = 10\nint y = 20' })  // Send code without semicolons as expected by your linting logic
            .expect('Content-Type', /json/)
            .expect(200);

        // Check the response body to have errors corresponding to each line
        expect(response.body).toEqual({
            errors: [
                { line: 1, error: 'Line does not end with a semicolon.' },
                { line: 2, error: 'Line does not end with a semicolon.' }
            ]
        });
    });
});
