import { useState, useEffect } from "react";
import { getImpressions, increaseLikes, increaseShares } from "../actions/impressions";
import { usePathname } from "next/navigation";

// TODO: implement Comment handling

interface useImpressionProps {
  articlePath: string[]
}

export const useImpressions = ({ articlePath }: useImpressionProps) => {
  const pathName = usePathname()
  const articleName = articlePath.join("-")
  const [likes, setLikes] = useState<number>(0)
  const [isLiked, setIsLiked] = useState<boolean>(false)
  const [shares, setShares] = useState<number>(0)
  const [copied, setCopied] = useState<boolean>(false)
  const [sharedOnce, setSharedOnce] = useState<boolean>(false)

  useEffect(() => {
    const fetchImpressions = async () => {
      const articleName = articlePath.join("-")
      const impressions = await getImpressions(JSON.parse(JSON.stringify({ articleName: articleName })))
      setLikes(impressions.likes)
      setShares(impressions.shares)
    }

    fetchImpressions()
  }, [articlePath])

  const handleLike = async () => {
    if (isLiked) {
      setLikes(likes - 1)
      console.log("please don't dislike :(")
    } else {
      setLikes(likes + 1)
      await increaseLikes(JSON.parse(JSON.stringify({ articleName: articleName })))
    }
    setIsLiked(!isLiked)
  }

  const handleShare = async () => {
    try {
      await navigator.clipboard.writeText(`https://www.prateeksingh.tech` + pathName)
      setCopied(true)
      setSharedOnce(true)
      setShares(shares + 1)
      if (!sharedOnce) {
        await increaseShares(JSON.parse(JSON.stringify({ articleName: articleName })))
      }
      setTimeout(() => setCopied(false), 2000)
    } catch (error) {
      console.error("Copy failed", error)
    }
  }

  return {
    likes, handleLike, isLiked, handleShare, shares, copied
  }
}
