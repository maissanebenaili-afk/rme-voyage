// The real package ships ESM that Jest does not transform; tests only need to observe calls.
module.exports = { track: jest.fn(), inject: jest.fn(), pageview: jest.fn() };
