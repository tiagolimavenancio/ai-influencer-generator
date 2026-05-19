"use client";

import { useState, useEffect, useRef, useCallback } from "react";
import { useAuth } from "@/context/AuthContext";
import { getSocialAccounts, SocialAccount } from "@/lib/db";

export function useSocialAccounts() {
	const { user, isLoading: authLoading } = useAuth();
	const [accounts, setAccounts] = useState<SocialAccount[]>([]);
	const [loaded, setLoaded] = useState(false);
	const initialized = useRef(false);

	const loadAccounts = useCallback(async () => {
		if (!user || initialized.current) return;

		initialized.current = true;
		const data = await getSocialAccounts(user.id);
		setAccounts(data);
		setLoaded(true);
	}, [user?.id]);

	useEffect(() => {
		loadAccounts();
	}, [loadAccounts]);

	const connectedPlatforms = new Set(accounts.map((a) => a.platform));

	const getAccount = (platform: string) =>
		accounts.find((a) => a.platform === platform);

	return {
		accounts,
		connectedPlatforms,
		getAccount,
		isLoading: authLoading || !loaded,
	};
}
