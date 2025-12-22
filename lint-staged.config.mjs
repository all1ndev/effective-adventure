const config = {
	"*": "prettier --write --ignore-unknown",
	"*.{js,jsx,ts,tsx}": "eslint --fix",
};
export default config;
