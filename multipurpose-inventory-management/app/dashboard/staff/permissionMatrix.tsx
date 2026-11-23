"use client";

import { useMemo } from "react";
import { Button } from "@/components/ui/button";
import {
	isModuleAllowedForModel,
	useBusinessModel,
} from "@/lib/business-model";
import {
	ROLE_MODULES,
	type RoleModule,
	type RolePermissionEntry,
	type SystemAction,
} from "@/validation/role.schema";

const CRUD_ACTIONS: SystemAction[] = ["CREATE", "READ", "UPDATE", "DELETE"];
const RESTORE_MODULES: RoleModule[] = ["PURCHASE", "TRASH"];
const STOCK_MODULES: RoleModule[] = [
	"PRODUCT",
	"RAW_PRODUCT",
	"PREPARED_PRODUCT",
];
const STOCK_OUT_MODULES: RoleModule[] = [...STOCK_MODULES, "WASTAGE"];

const getActionsForModule = (module: RoleModule): SystemAction[] => {
	if (module === "ACTIVITY_LOG") return ["READ"];
	if (module === "TRASH") return ["READ", "DELETE", "RESTORE"];
	return [
		...CRUD_ACTIONS,
		...(RESTORE_MODULES.includes(module) ? ["RESTORE" as const] : []),
		...(STOCK_MODULES.includes(module) ? ["STOCK_IN" as const] : []),
		...(STOCK_OUT_MODULES.includes(module) ? ["STOCK_OUT" as const] : []),
	];
};

type Props = {
	value: RolePermissionEntry[];
	onChange: (permissions: RolePermissionEntry[]) => void;
};

export function PermissionsMatrix({ value, onChange }: Props) {
	const businessModel = useBusinessModel();
	const visibleModules = useMemo(
		() =>
			ROLE_MODULES.filter((module) =>
				isModuleAllowedForModel(module, businessModel),
			),
		[businessModel],
	);
	const permissionMap = useMemo(
		() =>
			new Map(value.map(({ module, actions }) => [module, new Set(actions)])),
		[value],
	);

	const toggle = (module: RoleModule, action: SystemAction) => {
		const actions = new Set(permissionMap.get(module) ?? []);
		if (actions.has(action)) actions.delete(action);
		else actions.add(action);
		const next = value.filter((permission) => permission.module !== module);
		if (actions.size) next.push({ module, actions: [...actions] });
		onChange(next);
	};

	const allActions: SystemAction[] = [
		...CRUD_ACTIONS,
		"RESTORE",
		"STOCK_IN",
		"STOCK_OUT",
	];

	return (
		<div className="flex min-h-0 flex-1 flex-col gap-3">
			<div className="flex items-center justify-between gap-3">
				<p className="text-sm text-muted-foreground">
					Choose the modules and actions that this role may access.
				</p>
				<Button
					type="button"
					variant="outline"
					size="sm"
					onClick={() => onChange([])}
					disabled={value.length === 0}
				>
					Clear all
				</Button>
			</div>
			<div className="min-h-0 flex-1 overflow-auto rounded-md border">
				<table className="w-full min-w-[760px] border-collapse text-sm">
					<thead className="sticky top-0 z-10 bg-muted">
						<tr>
							<th className="sticky left-0 z-20 w-48 border bg-muted p-3 text-left">
								Module
							</th>
							{allActions.map((action) => (
								<th key={action} className="border p-2 text-center text-xs">
									{action.replaceAll("_", " ")}
								</th>
							))}
						</tr>
					</thead>
					<tbody>
						{visibleModules.map((module) => {
							const allowed = getActionsForModule(module);
							const selected = permissionMap.get(module) ?? new Set();
							return (
								<tr key={module} className="hover:bg-muted/30">
									<th className="sticky left-0 border bg-background p-3 text-left font-medium">
										{module.replaceAll("_", " ")}
									</th>
									{allActions.map((action) => {
										const isAvailable = allowed.includes(action);
										const isChecked = selected.has(action);
										return (
											<td key={action} className="border p-0 text-center">
												<button
													type="button"
													disabled={!isAvailable}
													aria-pressed={isChecked}
													aria-label={`${isChecked ? "Remove" : "Grant"} ${action.replaceAll("_", " ")} permission for ${module.replaceAll("_", " ")}`}
													className="h-10 w-full disabled:cursor-not-allowed disabled:opacity-20"
													onClick={() => toggle(module, action)}
												>
													{isChecked ? "✓" : ""}
												</button>
											</td>
										);
									})}
								</tr>
							);
						})}
					</tbody>
				</table>
			</div>
		</div>
	);
}
