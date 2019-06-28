module.exports = {
    testPathIgnorePatterns: [
        '/node_modules/',
        '/testServer/'
    ],
    transform: {
        "^.+\\.ts$": "ts-jest"
    },
}