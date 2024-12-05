"use server"

import dbConnect from "../../../lib/dbconnect"
import ImpressionModel from "../../models/impressions"

interface getImpressionsProps {
  articleName: string
}

export const getImpressions = async ({ articleName }: getImpressionsProps) => {
  try {
    await dbConnect()
    const impressions = await ImpressionModel.findOne({ articleName: articleName })

    if (!impressions) {
      const newDoc = await ImpressionModel.create({
        articleName: articleName,
        likes: 0,
        shares: 0
      })
      return {
        articleName: newDoc.articleName,
        likes: newDoc.likes,
        shares: newDoc.shares
      }
    }

    return {
      articleName: impressions.articleName,
      likes: impressions.likes,
      shares: impressions.shares
    }
  } catch (error) {
    console.error("Error getting impressions", error)
    return {
      articleName: articleName,
      likes: 22,
      shares: 5
    }
  }
}

interface toggleImpressionsProps {
  articleName: string
}

export const decreseLikes = async ({ articleName }: toggleImpressionsProps) => {
  try {
    await dbConnect()
    await ImpressionModel.findOneAndUpdate({ articleName: articleName }, { $inc: { "likes": -1 } }, { upsert: true, new: true })
  } catch (error) {
    console.error("Error liking post", error)
    return {
      articleName: articleName,
      likes: -1,
      shares: -1
    }
  }
}

export const increaseLikes = async ({ articleName }: toggleImpressionsProps) => {
  try {
    await dbConnect()
    await ImpressionModel.findOneAndUpdate({ articleName: articleName }, { $inc: { "likes": 1 } }, { upsert: true, new: true })
  } catch (error) {
    console.error("Error liking post", error)
    return {
      articleName: articleName,
      likes: -1,
      shares: -1
    }
  }
}

export const increaseShares = async ({ articleName }: toggleImpressionsProps) => {
  try {
    await ImpressionModel.findOneAndUpdate({ articleName: articleName }, { $inc: { "shares": 1 } }, { upsert: true, new: true })

  } catch (error) {
    console.error("Error copying to clipboard", error)
  }
}
