import { z } from "zod";

export const articleCategorySchema = z.union([
	z.literal("nutritie"),
	z.literal("medicatie"),
	z.literal("stil-de-viata"),
	z.literal("complicatii"),
	z.literal("recuperare"),
]);
export type ArticleCategory = z.infer<typeof articleCategorySchema>;

export const articleSchema = z.object({
	id: z.string(),
	title: z.string(),
	category: articleCategorySchema,
	content: z.string(),
	readTime: z.number(),
	imageUrl: z.string().optional(),
});

export type Article = z.infer<typeof articleSchema>;
export const articleListSchema = z.array(articleSchema);
