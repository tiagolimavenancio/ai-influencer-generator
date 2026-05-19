"use client";

import { useState, useEffect, useMemo, useRef, useCallback } from "react";
import { useAuth } from "@/context/AuthContext";
import { getModels, Model } from "@/lib/db";

export function useModels() {
	const { user, isLoading: authLoading } = useAuth();
	const [models, setModels] = useState<Model[]>([]);
	const [loaded, setLoaded] = useState(false);
	const initialized = useRef(false);

	const loadModels = useCallback(async () => {
		if (!user || initialized.current) return;

		initialized.current = true;
		const data = await getModels(user.id);
		setModels(data);
		setLoaded(true);
	}, [user?.id]);

	useEffect(() => {
		loadModels();
	}, [loadModels]);

	const modelMap = useMemo(
		() => new Map(models.map((m) => [m.id, m])),
		[models],
	);

	return {
		models,
		modelMap,
		isLoading: authLoading || !loaded,
		hasModels: models.length > 0,
	};
}
