import { useAuthStore } from "@/lib/store/useAuthStore";
import type { RoleModule, SystemAction } from "@/validation/role.schema";

export function useCan(module: RoleModule, action: SystemAction): boolean {
	const user = useAuthStore((state) => state.user);
	if (!user) return false;
	if (user.role === "ADMIN" || user.role === "DEVELOPER") return true;
	return (
		user.permissions?.some(
			(permission) =>
				permission.module === module && permission.actions.includes(action),
		) ?? false
	);
}
