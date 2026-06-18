const PUBLIC_PAGES: Array<string | RegExp> = [
	/^\/$/, // Index/homepage
	"/login",
	"/register",
	"/listings",
	"/dashboard/listings",
	/^\/dashboard\/?$/, // Exactly /dashboard (Explore Feed)
];

export function getIsPublicPage(pathname: string) {
	return PUBLIC_PAGES.some((publicPathname) => {
		return typeof publicPathname === "string"
			? pathname.startsWith(publicPathname)
			: publicPathname.test(pathname);
	});
}
