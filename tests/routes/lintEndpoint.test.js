const { Request, Response } = require('jest-express');
const { lintCode } =  require('../../src/core/lintCode');

let req, res;

beforeEach(() => {
  req = new Request();
  res = new Response();
});

afterEach(() => {
  req.resetMocked();
  res.resetMocked();
});

test('POST /lint should validate code', () => {
  req.setBody({ code: 'int x = 10;' });
  lintCode(req, res);
  expect(res.json).toHaveBeenCalledWith({ errors: [] });
});
