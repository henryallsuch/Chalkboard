import React, { useState, useEffect, useCallback, useRef } from 'react'

// ── Types ────────────────────────────────────────────────────────────────────

interface Post {
  id: number
  title: string
  body: string
  author: string
}

interface PostCardProps {
  post: Post
  onSelect: (id: number) => void
  isSelected?: boolean
}

// ── Child component ──────────────────────────────────────────────────────────

const PostCard: React.FC<PostCardProps> = ({ post, onSelect, isSelected = false }) => {
  return (
    <article
      className={`post-card ${isSelected ? 'post-card--selected' : ''}`}
      onClick={() => onSelect(post.id)}
    >
      <h2 className="post-card__title">{post.title}</h2>
      <p className="post-card__body">{post.body}</p>
      <footer>
        <span className="post-card__author">by {post.author}</span>
      </footer>
    </article>
  )
}

// ── Hook ─────────────────────────────────────────────────────────────────────

function usePosts(endpoint: string) {
  const [posts, setPosts] = useState<Post[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const abortRef = useRef<AbortController | null>(null)

  useEffect(() => {
    abortRef.current = new AbortController()

    const load = async () => {
      try {
        const res = await fetch(endpoint, { signal: abortRef.current!.signal })
        if (!res.ok) throw new Error(`HTTP ${res.status}`)
        const data: Post[] = await res.json()
        setPosts(data)
      } catch (err) {
        if (err instanceof Error && err.name !== 'AbortError') {
          setError(err.message)
        }
      } finally {
        setLoading(false)
      }
    }

    load()
    return () => abortRef.current?.abort()
  }, [endpoint])

  return { posts, loading, error }
}

// ── Main component ───────────────────────────────────────────────────────────

export default function PostList() {
  const { posts, loading, error } = usePosts('/api/posts')
  const [selectedId, setSelectedId] = useState<number | null>(null)

  const handleSelect = useCallback((id: number) => {
    setSelectedId((prev) => (prev === id ? null : id))
  }, [])

  if (loading) return <div className="spinner" aria-label="Loading…" />
  if (error) return <p className="error-message">Failed to load: {error}</p>

  return (
    <main className="post-list">
      <h1>Posts <span className="badge">{posts.length}</span></h1>
      {posts.length === 0
        ? <p className="empty-state">No posts yet.</p>
        : posts.map((post) => (
            <PostCard
              key={post.id}
              post={post}
              isSelected={post.id === selectedId}
              onSelect={handleSelect}
            />
          ))
      }
    </main>
  )
}
