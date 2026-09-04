// Drizzle relational query definitions. These power the relational query API:
// `db.query.<table>.findFirst/findMany({ with: { ... } })` lets you fetch a
// table together with its related rows/columns in a single call, avoiding
// manual joins. Relations are grouped by domain below (auth, listing, thread).
//
// Note: `report` and `block` (moderation) are intentionally NOT defined here —
// they're written/queried directly, not relationally.
import { defineRelations } from "drizzle-orm";
import { account, session, user } from "./auth";
import { comment, listing, listingClaimRequest, listingImage } from "./listing";
import { message, thread, threadMember } from "./messaging";

export const relations = defineRelations(
	{
		listing,
		listingImage,
		user,
		comment,
		listingClaimRequest,
		session,
		account,
		thread,
		message,
		threadMember,
	},
	(r) => ({
		// ---- Auth / better-auth ----
		user: {
			sessions: r.many.session(),
			accounts: r.many.account(),
			threadMembers: r.many.threadMember(),
		},

		session: {
			user: r.one.user({ from: r.session.userId, to: r.user.id }),
		},
		account: {
			user: r.one.user({ from: r.account.userId, to: r.user.id }),
		},
		// ---------------------------

		// ---- Listing domain ----
		listing: {
			images: r.many.listingImage({
				from: r.listing.id,
				to: r.listingImage.listingId,
			}),
			// `optional: false` => the owner user is always present.
			user: r.one.user({
				from: r.listing.userId,
				to: r.user.id,
				optional: false,
			}),
			comments: r.many.comment(),
			pendingClaims: r.many.listingClaimRequest(),
			// A listing has at most one conversation thread (for claims/DMs).
			thread: r.one.thread(),
		},

		comment: {
			user: r.one.user({ from: r.comment.userId, to: r.user.id }),
			listing: r.one.listing({
				from: r.comment.listingId,
				to: r.listing.id,
			}),
		},

		listingClaimRequest: {
			listing: r.one.listing({
				from: r.listingClaimRequest.listingId,
				to: r.listing.id,
				optional: false,
			}),
			user: r.one.user({
				from: r.listingClaimRequest.userId,
				to: r.user.id,
				optional: false,
			}),
		},

		// ---- Messaging domain ----
		thread: {
			messages: r.many.message(),
			threadMembers: r.many.threadMember(),
			// Many-to-many from thread -> user through the thread_member join table.
			members: r.many.user({
				from: r.thread.id.through(r.threadMember.threadId),
				to: r.user.id.through(r.threadMember.userId),
			}),
			listing: r.one.listing({
				from: r.thread.listingId,
				to: r.listing.id,
				optional: true,
			}),
		},

		threadMember: {
			thread: r.one.thread({ from: r.threadMember.threadId, to: r.thread.id }),
			user: r.one.user({ from: r.threadMember.userId, to: r.user.id }),
		},

		message: {
			thread: r.one.thread({ from: r.message.threadId, to: r.thread.id }),
			sender: r.one.user({
				from: r.message.senderId,
				to: r.user.id,
				optional: false,
			}),
		},
	}),
);
