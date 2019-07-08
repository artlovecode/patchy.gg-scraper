module.exports = {
    "env": {
        "es6": true,
        "node": true,
        "jest": true
    },
    "parser": "@typescript-eslint/parser",
    "plugins": ["@typescript-eslint"],
    "extends": [
        "airbnb-base", 
        "plugin:prettier/recommended",
        "prettier",
        "plugin:@typescript-eslint/recommended"
    ],
    "globals": {
        "Atomics": "readonly",
        "SharedArrayBuffer": "readonly"
    },
    "settings": {
        "import/resolver": {
            "node": {
                "extensions": ['.js', '.ts']
            }
        }
    },
    "parserOptions": {
        "ecmaVersion": 2018,
        "sourceType": "module"
    },
    "rules": {
        "import/prefer-default-export": "off",
        "array-callback-return": "off",
        "no-console": "off",
        "@typescript-eslint/indent": "off"
    }
};