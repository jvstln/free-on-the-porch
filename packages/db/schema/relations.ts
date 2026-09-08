// Drizzle relational query definitions. These power the relational query API:
// `db.query.<table>.findFirst/findMany({ with: { ... } })` lets you fetch a
// table together with its related rows/columns in a single call, avoiding
// manual joins. Relations are grouped by domain below (auth, listing, thread).
//
// Note: `verification` (better-auth) has no FK to `user` (it's keyed by an
// identifier string, not user.id) so it has no relational edge here.
import { defineRelations } from "drizzle-orm";
import { account, session, user, userSettings } from "./auth";
import { comment, listing, listingClaimRequest, listingImage } from "./listing";
import { message, notification, thread, threadMember } from "./messaging";
import { block, report } from "./moderation";

export const relations = defineRelations(
	{
		listing,
		listingImage,
		user,
		userSettings,
		comment,
		listingClaimRequest,
		session,
		account,
		thread,
		message,
		threadMember,
		notification,
		report,
		block,
	},
	(r) => ({
		// ---- Auth / better-auth ----
		user: {
			sessions: r.many.session(),
			accounts: r.many.account(),
			settings: r.one.userSettings({
				from: r.user.id,
				to: r.userSettings.userId,
			}),
			threadMembers: r.many.threadMember(),
			notifications: r.many.notification(),
			reportsMade: r.many.report({
				from: r.user.id,
				to: r.report.reportedById,
			}),
			reportsAgainst: r.many.report({
				from: r.user.id,
				to: r.report.reportedUserId,
			}),
			blocksInitiated: r.many.block({
				from: r.user.id,
				to: r.block.blockerId,
			}),
			blocksReceived: r.many.block({
				from: r.user.id,
				to: r.block.blockedId,
			}),
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
			reports: r.many.report({
				from: r.listing.id,
				to: r.report.listingId,
			}),
			// A listing can have many conversation threads: every claimant gets
			// their own LISTING thread with the owner (see listing claim flow).
			threads: r.many.thread({
				from: r.listing.id,
				to: r.thread.listingId,
			}),
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

		// ---- Moderation domain ----
		report: {
			reportedBy: r.one.user({
				from: r.report.reportedById,
				to: r.user.id,
				optional: false,
			}),
			reportedUser: r.one.user({
				from: r.report.reportedUserId,
				to: r.user.id,
				optional: true,
			}),
			listing: r.one.listing({
				from: r.report.listingId,
				to: r.listing.id,
				optional: true,
			}),
		},

		block: {
			blocker: r.one.user({
				from: r.block.blockerId,
				to: r.user.id,
				optional: false,
			}),
			blocked: r.one.user({
				from: r.block.blockedId,
				to: r.user.id,
				optional: false,
			}),
		},

		// ---- User Settings ----
		userSettings: {
			user: r.one.user({
				from: r.userSettings.userId,
				to: r.user.id,
				optional: false,
			}),
		},

		// ---- Notifications ----
		notification: {
			user: r.one.user({ from: r.notification.userId, to: r.user.id }),
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
