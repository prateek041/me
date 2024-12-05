"use client"
import { BiHeart, BiShare, BiSolidHeart, BiCheck } from "react-icons/bi"
import { useImpressions } from "../hooks/impressions"

interface ImpressionProps {
  articleName: string[]
}


export default function Impression({ articleName }: ImpressionProps) {

  const { likes, isLiked, copied, handleShare, shares, handleLike } = useImpressions({ articlePath: articleName })
  return (
    <div className="w-1/2 py-2 flex justify-between">
      <div onClick={handleLike} className="cursor-pointer flex items-center gap-x-2">
        {isLiked ? <BiSolidHeart className="text-2xl text-red-600" /> : <BiHeart className="text-2xl" />}
        {likes}</div>
      <div className="flex items-center gap-x-2" onClick={handleShare}>{copied ? (<div className="flex items-center gap-x-2"><BiCheck /> Copied</div>) : <div className="flex items-center gap-x-2"><BiShare className="text-2xl" /> {shares}</div>}</div>
    </div>
  )
}
