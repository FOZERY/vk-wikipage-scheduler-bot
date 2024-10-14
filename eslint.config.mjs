import eslintJs from "@eslint/js";
import eslintPluginPrettier from "eslint-plugin-prettier";
import eslintTs from "typescript-eslint";

import globals from "globals";

export default eslintTs.config(
	eslintJs.configs.recommended,
	...eslintTs.configs.recommended,
	{
		languageOptions: {
			parserOptions: {
				tsconfigRootDir: import.meta.dirname,
			},
			globals: {
				...globals.node,
				...globals.es2021,
			},
		},
	},
	{
		plugins: {
			prettier: eslintPluginPrettier,
		},
		rules: {
			"prettier/prettier": ["error", {}, { usePrettierrc: true }],
		},
	},
	{ files: ["**/*.ts"] },
	{ ignores: ["node_modules", "dist"] },
	{
		rules: {
			"@typescript-eslint/no-namespace": "off",
			"@typescript-eslint/no-unused-vars": "warn",
		},
	}
);
