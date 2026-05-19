"use client";

import { useState, useEffect, useRef, useCallback } from "react";
import { useAuth } from "@/context/AuthContext";
import { getProfile } from "@/lib/db";

export function useCredits() {
	const { user, isLoading: authLoading } = useAuth();
	const [credits, setCredits] = useState(300);
	const [loaded, setLoaded] = useState(false);
	const initialized = useRef(false);

	const loadCredits = useCallback(async () => {
		if (!user || initialized.current) return;

		initialized.current = true;
		try {
			const profile = await getProfile(user.id);
			if (profile) {
				setCredits(profile.credits);
			}
		} finally {
			setLoaded(true);
		}
	}, [user?.id]);

	useEffect(() => {
		loadCredits();
	}, [loadCredits]);

	return {
		credits,
		setCredits,
		isLoadingCredits: authLoading || !loaded,
	};
}
