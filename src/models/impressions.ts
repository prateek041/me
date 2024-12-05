import mongoose, { Document, Schema } from "mongoose"
import z from "zod"

const impressionSchema = z.object({
  articleName: z.string(),
  likes: z.number(),
  shares: z.number()
})

export type IImpressionSchema = z.infer<typeof impressionSchema>

interface ImpressionDocument extends IImpressionSchema, Document { }

const ImpressionSchema = new Schema<ImpressionDocument>({
  articleName: {
    type: String,
    required: true,
  },
  likes: {
    type: Number,
    required: true,
    default: 0
  },
  shares: {
    type: Number,
    required: true,
    default: 0
  }
})

export default mongoose.models.Impressions || mongoose.model<ImpressionDocument>("Impressions", ImpressionSchema);

