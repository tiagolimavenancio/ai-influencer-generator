/* eslint-disable react-hooks/set-state-in-effect */
"use client";

import { useState, useEffect } from "react";
import { useAuth } from "@/context/AuthContext";

interface UseUserDataOptions<T> {
	fetchFn: (userId: string) => Promise<T>;
	defaultValue: T;
}

export function useUserData<T>({
	fetchFn,
	defaultValue,
}: UseUserDataOptions<T>) {
	const { user, isLoading: authLoading } = useAuth();
	const [data, setData] = useState<T>(defaultValue);
	const [loading, setLoading] = useState(true);
	const [error, setError] = useState<Error | null>(null);
	const [loaded, setLoaded] = useState(false);

	useEffect(() => {
		if (!user || loaded) return;

		const userId = user.id;
		let cancelled = false;

		async function loadData() {
			try {
				const result = await fetchFn(userId);
				if (!cancelled) {
					setData(result);
					setLoaded(true);
				}
			} catch (err) {
				if (!cancelled) {
					setError(
						err instanceof Error ? err : new Error("Failed to load data"),
					);
					setLoaded(true);
				}
			} finally {
				if (!cancelled) {
					setLoading(false);
				}
			}
		}

		loadData();

		return () => {
			cancelled = true;
		};
	}, [user?.id, fetchFn, loaded]);

	return {
		data,
		loading: loading || authLoading || !loaded,
		error,
		user,
	};
}
