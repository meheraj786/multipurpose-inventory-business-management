"use client";

import { Check, X } from "lucide-react";
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
const STOCK_IN_MODULES: RoleModule[] = [
	"PRODUCT",
	"RAW_PRODUCT",
	"PREPARED_PRODUCT",
];
const STOCK_OUT_MODULES: RoleModule[] = [
	"PRODUCT",
	"RAW_PRODUCT",
	"PREPARED_PRODUCT",
	"WASTAGE",
];

const getActionsForModule = (module: RoleModule): SystemAction[] => {
	if (module === "ACTIVITY_LOG") return ["READ"];
	if (module === "TRASH") return ["READ", "DELETE", "RESTORE"];
	return [
		...CRUD_ACTIONS,
		...(RESTORE_MODULES.includes(module) ? ["RESTORE" as const] : []),
		...(STOCK_IN_MODULES.includes(module) ? ["STOCK_IN" as const] : []),
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
			new Map(
				value.map((permission) => [
					permission.module,
					new Set(permission.actions),
				]),
			),
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

	return (
		<div className="flex min-h-0 flex-1 flex-col gap-3">
			<div className="flex items-center justify-between gap-3">
				<p className="text-sm text-muted-foreground">
					Select what users with this role can do.
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
							{CRUD_ACTIONS.map((action) => (
								<th key={action} className="border p-2 text-center text-xs">
									{action}
								</th>
							))}
							<th className="border p-2 text-center text-xs">RESTORE</th>
							<th className="border p-2 text-center text-xs">STOCK IN</th>
							<th className="border p-2 text-center text-xs">STOCK OUT</th>
						</tr>
					</thead>
					<tbody>
						{visibleModules.map((module) => {
							const allowedActions = getActionsForModule(module);
							const selected = permissionMap.get(module) ?? new Set();
							return (
								<tr key={module} className="hover:bg-muted/30">
									<th className="sticky left-0 border bg-background p-3 text-left font-medium">
										{module.replaceAll("_", " ")}
									</th>
									{(
										[
											...CRUD_ACTIONS,
											"RESTORE",
											"STOCK_IN",
											"STOCK_OUT",
										] as SystemAction[]
									).map((action) => {
										const isAvailable = allowedActions.includes(action);
										const isChecked = selected.has(action);
										return (
											<td key={action} className="border p-0 text-center">
												<button
													type="button"
													disabled={!isAvailable}
													aria-pressed={isChecked}
													aria-label={`${isChecked ? "Remove" : "Grant"} ${action.replaceAll("_", " ")} permission for ${module.replaceAll("_", " ")}`}
													className="flex h-10 w-full items-center justify-center disabled:cursor-not-allowed disabled:opacity-20"
													onClick={() => toggle(module, action)}
												>
													<span
														className={`flex h-6 w-6 items-center justify-center rounded ${isChecked ? "bg-primary text-primary-foreground" : "bg-muted text-muted-foreground"}`}
													>
														{isChecked ? (
															<Check className="h-4 w-4" />
														) : (
															<X className="h-3 w-3" />
														)}
													</span>
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
