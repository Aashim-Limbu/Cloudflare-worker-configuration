import { PrismaClient, User } from '@prisma/client/edge';
import { withAccelerate } from '@prisma/extension-accelerate';

interface Env {
	DATABASE_URL: string;
}
export default {
	async fetch(request: Request, env: Env, ctx: ExecutionContext) {
		const prisma = new PrismaClient({
			datasources: {
				db: {
					url: env.DATABASE_URL,
				},
			},
		}).$extends(withAccelerate());
		if (request.method === 'POST') {
			const { firstName, lastName, email, password, bio, title }: any = await request.json();
			const user = await prisma.user.create({
				data: {
					firstName,
					lastName,
					email,
					password,
				},
			});
			const profile = await prisma.profile.create({
				data: {
					userId: user.id,
					bio,
				},
			});
			const post = await prisma.post.create({
				data: {
					authorId: user.id,
					title,
				},
			});
			const result = JSON.stringify({ user, profile, post });
			console.log(request.body);
			return new Response(result);
		} else if (request.method === 'GET') {
			const user = await prisma.user.findMany({});
			return new Response(JSON.stringify(user));
		}
	},
};
