const PUBLIC_PAGES: Array<string | RegExp> = [
	/^\/$/, // Index/homepage
	"/login",
	"/register",
	"/forgot-password",
	"/reset-password",
	/^\/dashboard\/?$/, // Exactly /dashboard (Explore Feed)
	/^\/dashboard\/listings\/?$/, // Listings feed
	/^\/dashboard\/listings\/(?!new(?:\/|$)|me(?:\/|$))[^/]+\/?$/, // Public listing detail (excluding 'new' and 'me')
];

export function getIsPublicPage(pathname: string) {
	return PUBLIC_PAGES.some((publicPathname) => {
		return typeof publicPathname === "string"
			? pathname.startsWith(publicPathname)
			: publicPathname.test(pathname);
	});
}
