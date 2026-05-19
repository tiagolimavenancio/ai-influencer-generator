'use client';

import { useState, useEffect, useMemo, useRef, useCallback } from 'react';
import { useAuth } from '@/context/AuthContext';
import { getPosts, Post } from '@/lib/db';

export function usePosts() {
  const { user, isLoading: authLoading } = useAuth();
  const [posts, setPosts] = useState<Post[]>([]);
  const [loaded, setLoaded] = useState(false);
  const initialized = useRef(false);

  const loadPosts = useCallback(async () => {
    if (!user || initialized.current) return;

    initialized.current = true;
    const data = await getPosts(user.id);
    setPosts(data);
    setLoaded(true);
  }, [user?.id]);

  useEffect(() => {
    loadPosts();
  }, [loadPosts]);

  const draftPosts = useMemo(
    () => posts.filter((p) => p.status === 'draft'),
    [posts],
  );

  const scheduledPosts = useMemo(
    () => posts.filter((p) => p.status === 'scheduled'),
    [posts],
  );

  const publishedPosts = useMemo(
    () => posts.filter((p) => p.status === 'published'),
    [posts],
  );

  const activePosts = useMemo(
    () => posts.filter((p) => p.status === 'draft' || p.status === 'scheduled'),
    [posts],
  );

  return {
    posts,
    draftPosts,
    scheduledPosts,
    publishedPosts,
    activePosts,
    isLoading: authLoading || !loaded,
  };
}