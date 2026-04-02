'use client'

import { useState, useTransition } from 'react'
import { followUser, unfollowUser } from '../actions/follow'

interface Props {
  targetId: string
  initialIsFollowing: boolean
  isFriend: boolean
}

export default function FollowButton({ targetId, initialIsFollowing, isFriend: initialIsFriend }: Props) {
  const [isFollowing, setIsFollowing] = useState(initialIsFollowing)
  const [isFriend, setIsFriend] = useState(initialIsFriend)
  const [isPending, startTransition] = useTransition()

  function toggle() {
    startTransition(async () => {
      if (isFollowing) {
        await unfollowUser(targetId)
        setIsFollowing(false)
        setIsFriend(false)
      } else {
        await followUser(targetId)
        setIsFollowing(true)
        // isFriend will be revalidated server-side on next load
      }
    })
  }

  if (isFollowing) {
    return (
      <button
        onClick={toggle}
        disabled={isPending}
        className="text-xs font-semibold px-3.5 py-1.5 rounded-full border border-gray-200 text-gray-600 hover:bg-red-50 hover:text-red-600 hover:border-red-200 transition-colors disabled:opacity-50"
        title="Click to unfollow"
      >
        {isPending ? '...' : isFriend ? '👥 Friends' : '✓ Following'}
      </button>
    )
  }

  return (
    <button
      onClick={toggle}
      disabled={isPending}
      className="text-xs font-semibold px-3.5 py-1.5 rounded-full bg-[#1a3a2a] text-white hover:bg-[#2d6a4f] transition-colors disabled:opacity-50"
    >
      {isPending ? '...' : '+ Follow'}
    </button>
  )
}
