import { db } from "@/db";
import { videos } from "@/db/schema";
import { serve } from "@upstash/workflow/nextjs"
import { eq, and } from "drizzle-orm";
import { UTApi } from "uploadthing/server";


interface InputType {
  userId: string;
  videoId: string;
  prompt: string;
};


const DESCRIPTION_SYSTEM_PROMPT = `Your task is to summarize the transcript of a video. Please follow these guidelines:
- Be brief. Condense the content into a summary that captures the key points and main ideas without losing important details.
- Avoid jargon or overly complex language unless necessary for the context.
- Focus on the most critical information, ignoring filler, repetitive statements, or irrelevant tangents.
- ONLY return the summary, no other text, annotations, or comments.
- Aim for a summary that is 3-5 sentences long and no more than 200 characters.`;


export const { POST } = serve(
  async (context) => {
    const utapi = new UTApi();
    const input = context.requestPayload as InputType;
    const { videoId, userId, prompt } = input;

    const video = await context.run("get-video", async () => {
      const [existingVideo] = await db
        .select()
        .from(videos)
        .where(and(
          eq(videos.id, videoId),
          eq(videos.userId, userId),
        ));


      if (!existingVideo) {
        throw new Error("Not Found");
      }
      return existingVideo;
    });


    const { body } = await context.call<{ data: Array<{ url: string }> }>(
      "generate-thumbnail",
      {
        url: "https://api.openai.com/v1/images/generations",
        method: "POST",
        body: {
          prompt,
          n: 1,
          model: "dall-e-3",
          size: "1792x1024",
        },
        headers: {
          authorization: `Bearer ${process.env.OPENAI_API_KEY}`,
        },
      });

    const tempThumbnailUrl = body.data[0].url;

    if (!tempThumbnailUrl) {
      throw new Error("Bad request");
    }

    await context.run("cleanup-thumbnail", async () => {
      if (video.thumbnailKey) {
        await utapi.deleteFiles(video.thumbnailKey);
        await db
          .update(videos)
          .set({ thumbnailKey: null, thumbnailUrl: null })
          .where(and(
            eq(videos.id, video.id),
            eq(videos.userId, video.userId),
          ));
      }
    });

    const uploadedThumbnail = await context.run("upload-thumbnail", async () => {
      const utapi = new UTApi();
      const { data, error } = await utapi.uploadFilesFromUrl(tempThumbnailUrl);

      if (!data) {
        throw new Error(error.message);
      }

      return data;
    });

    

    await context.run("update-video", async () => {
      await db
        .update(videos)
        .set({
          thumbnailKey: uploadedThumbnail.key,
          thumbnailUrl: uploadedThumbnail.url,

        })
        .where(and(
          eq(videos.id, video.id),
          eq(videos.userId, video.userId),
        ))
    })

    
  }
)