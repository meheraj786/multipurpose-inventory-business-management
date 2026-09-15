"use client";

import { Check, X } from "lucide-react";
import { useMemo, useState } from "react";
import { Button } from "@/components/ui/button";
import { useUpdatePermissions } from "@/hooks/useStaff";
import {
	isModuleAllowedForModel,
	useBusinessModel,
} from "@/lib/business-model";
import {
	type PermissionEntry,
	SYSTEM_ACTIONS,
	SYSTEM_MODULES,
	type SystemAction,
	type SystemModule,
} from "@/validation/staff.schema";

type Props = {
	staffId: string;
	staffEmail: string;
	existingPermissions: { module: string; actions: string[] }[];
	onClose: () => void;
};

const HIDDEN_MODULES: SystemModule[] = [
	"AUTH",
	"USER",
	"ACCOUNT",
	"PERMISSION",
	"PRICING_PLAN",
	"NOTIFICATION",
	"ACTIVITY_LOG",
	"STAFF",
] as SystemModule[];

const HIDDEN_ACTIONS: SystemAction[] = ["STOCK_OUT"] as SystemAction[];

export function PermissionsMatrix({
	staffId,
	staffEmail,
	existingPermissions,
	onClose,
}: Props) {
	const businessModel = useBusinessModel();

	const visibleModules = useMemo(
		() =>
			SYSTEM_MODULES.filter(
				(mod) =>
					!HIDDEN_MODULES.includes(mod) &&
					isModuleAllowedForModel(mod, businessModel),
			),
		[businessModel],
	);

	const visibleActions = useMemo(
		() => SYSTEM_ACTIONS.filter((action) => !HIDDEN_ACTIONS.includes(action)),
		[],
	);

	const [state, setState] = useState<Record<string, Set<string>>>(() => {
		const initial = {} as Record<string, Set<string>>;
		SYSTEM_MODULES.forEach((mod) => {
			initial[mod] = new Set();
		});
		existingPermissions.forEach((p) => {
			if (SYSTEM_MODULES.includes(p.module as SystemModule)) {
				initial[p.module] = new Set(p.actions);
			}
		});
		return initial;
	});

	const { mutate: updatePermissions, isPending } =
		useUpdatePermissions(staffId);

	const toggle = (mod: SystemModule, action: SystemAction) => {
		setState((prev) => {
			const next = new Set(prev[mod]);
			next.has(action) ? next.delete(action) : next.add(action);
			return { ...prev, [mod]: next };
		});
	};

	const handleSave = () => {
		const payload: PermissionEntry[] = Object.entries(state)
			.filter(
				([mod, actions]) =>
					actions.size > 0 && visibleModules.includes(mod as SystemModule),
			)
			.map(([module, actions]) => ({
				module: module as SystemModule,
				actions: Array.from(actions).filter(
					(a) => !HIDDEN_ACTIONS.includes(a as SystemAction),
				) as SystemAction[],
			}))
			.filter((entry) => entry.actions.length > 0);
		updatePermissions(payload, { onSuccess: onClose });
	};

	return (
		<div className="flex flex-col h-[70vh]">
			<div className="p-4 border-b bg-muted/30">
				<h3 className="font-bold text-lg">{staffEmail}</h3>
				<p className="text-sm text-muted-foreground">
					Assign module-wise permissions
				</p>
			</div>

			<div className="flex-1 overflow-auto border rounded-md m-4">
				<table className="w-full text-sm border-collapse min-w-[800px]">
					<thead className="sticky top-0 bg-white shadow-sm z-20">
						<tr className="bg-muted">
							<th className="p-3 text-left border w-48 sticky left-0 bg-muted">
								Module
							</th>
							{visibleActions.map((action) => (
								<th
									key={action}
									className="p-2 text-center border min-w-[100px] text-[10px] uppercase tracking-wider"
								>
									{action.replace("_", " ")}
								</th>
							))}
						</tr>
					</thead>
					<tbody>
						{visibleModules.map((mod) => (
							<tr key={mod} className="hover:bg-muted/50 transition-colors">
								<td className="p-3 font-medium border sticky left-0 bg-white">
									{mod}
								</td>
								{visibleActions.map((action) => {
									const isActive = state[mod].has(action);
									return (
										<td key={action} className="p-0 border text-center">
											<button
												type="button"
												className="w-full h-full p-2 flex items-center justify-center cursor-pointer focus:outline-none focus:ring-2 focus:ring-primary focus:ring-inset"
												onClick={() => toggle(mod, action)}
												aria-label={`Toggle ${action} permission for ${mod}`}
											>
												<div
													className={`h-6 w-6 rounded flex items-center justify-center transition-all ${isActive ? "bg-primary text-white" : "bg-gray-100 text-gray-300"}`}
												>
													{isActive ? (
														<Check className="h-4 w-4" />
													) : (
														<X className="h-3 w-3" />
													)}
												</div>
											</button>
										</td>
									);
								})}
							</tr>
						))}
					</tbody>
				</table>
			</div>

			<div className="p-4 border-t flex justify-end gap-3">
				<Button variant="ghost" onClick={onClose}>
					Cancel
				</Button>
				<Button onClick={handleSave} disabled={isPending}>
					{isPending ? "Saving..." : "Save Permissions"}
				</Button>
			</div>
		</div>
	);
}
