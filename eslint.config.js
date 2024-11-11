import eslint from "@eslint/js"
import pluginRouter from "@tanstack/eslint-plugin-router"
import reactPlugin from "eslint-plugin-react"
import reactHooks from "eslint-plugin-react-hooks"
import reactRefresh from "eslint-plugin-react-refresh"
import globals from "globals"
import tseslint from "typescript-eslint"

export default tseslint.config(
	{ ignores: [".vinxi", ".output", "node_modules", "**/*.config.{ts,tsx}"] },
	{
		files: ["**/*.{ts,tsx}"],
		extends: [
			eslint.configs.recommended,
			...tseslint.configs.recommended,
			...tseslint.configs.stylisticTypeChecked,
			...tseslint.configs.recommendedTypeChecked,
			...pluginRouter.configs["flat/recommended"]
		],
		languageOptions: {
			parserOptions: {
				projectService: true
			},
			ecmaVersion: 2020,
			globals: globals.browser
		},
		plugins: {
			react: reactPlugin,
			"react-hooks": reactHooks,
			"react-refresh": reactRefresh
		},
		rules: {
			...reactHooks.configs.recommended.rules,
			...reactPlugin.configs["jsx-runtime"].rules,
			"react-refresh/only-export-components": ["warn", { allowConstantExport: true }],
			"@typescript-eslint/only-throw-error": "off",
			"@typescript-eslint/no-misused-promises": [
				"error",
				{
					checksVoidReturn: {
						attributes: false
					}
				}
			],
			"@typescript-eslint/no-unused-vars": [
				"error",
				{
					args: "all",
					argsIgnorePattern: "^_",
					caughtErrors: "all",
					caughtErrorsIgnorePattern: "^_",
					destructuredArrayIgnorePattern: "^_",
					varsIgnorePattern: "^_",
					ignoreRestSiblings: true
				}
			]
		}
	}
)
