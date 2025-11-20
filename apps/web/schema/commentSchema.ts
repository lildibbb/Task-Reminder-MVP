import * as z from "zod";

export const commentSchema = z.object({
  comment_content: z.any(),
  type: z.string().optional().nullable(),
  parent_comment_id: z.string().optional().nullable(),
  file: z.instanceof(File).optional().nullable(),
});

export type CommentFormValues = z.infer<typeof commentSchema>;
