export type IslandKind = 'info' | 'warning' | 'error';

/** Anything you can pass as expandable content: plain text or an Error (its stack is shown). */
export type IslandDetails = string | Error;

export interface Island {
	id: number;
	kind: IslandKind;
	/** The header. Always set by calling code and always visible. */
	message: string;
	/** Normalized expandable text. Only rendered when the island is expanded. */
	details?: string;
	duration: number; // ms
}

export interface SummonOptions {
	kind?: IslandKind;
	/** Longer text or an Error. Hidden until the user expands the island. */
	details?: IslandDetails;
}

const DEFAULT_DURATIONS: Record<IslandKind, number> = {
	info: 4000,
	warning: 6000,
	error: 8000
};

let nextId = 1;

function normalizeDetails(details: IslandDetails | undefined): string | undefined {
	if (details === undefined || details === null) return undefined;
	if (details instanceof Error) {
		return details.stack || `${details.name}: ${details.message}`;
	}
	const text = String(details);
	return text.length > 0 ? text : undefined;
}

class IslandManager {
	items = $state<Island[]>([]);

	summon(message: string, options: SummonOptions = {}): number {
		const kind = options.kind ?? 'info';
		const island: Island = {
			id: nextId++,
			kind,
			message,
			details: normalizeDetails(options.details),
			duration: DEFAULT_DURATIONS[kind]
		};
		this.items.push(island);
		return island.id;
	}

	dismiss(id: number) {
		this.items = this.items.filter((i) => i.id !== id);
	}

	clear() {
		this.items = [];
	}

	info = (message: string, options?: Omit<SummonOptions, 'kind'>) =>
		this.summon(message, { ...options, kind: 'info' });

	warning = (message: string, options?: Omit<SummonOptions, 'kind'>) =>
		this.summon(message, { ...options, kind: 'warning' });

	error = (message: string, options?: Omit<SummonOptions, 'kind'>) =>
		this.summon(message, { ...options, kind: 'error' });
}

export const islands = new IslandManager();