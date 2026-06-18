export function getInitials(name: string) {
	let initials = name
		.split(" ")
		.map((n) => n[0])
		.join("")
		.toUpperCase()
		.slice(0, 2);

	// If initials doesnt contains only one character
	if (initials.length === 1 && name.length > 1) {
		initials += name[1]?.toUpperCase();
	}

	return initials;
}
