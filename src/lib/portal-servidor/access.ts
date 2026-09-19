import { getTenantContextForModule, type AppContext } from "@/lib/platform/tenant-context";

export type PortalEmployee = {
  id: string;
  name: string;
  registration: string | null;
  role: { name: string } | null;
  department: { name: string } | null;
  secretariat: { name: string } | null;
};

export type EmployeePortalAccess =
  | {
      status: "AVAILABLE";
      context: AppContext;
      employee: PortalEmployee;
    }
  | {
      status: "UNAVAILABLE";
    };

/**
 * Resolves the portal identity exclusively from the authenticated session.
 *
 * This boundary deliberately accepts no employee identifier from the browser.
 * A valid PORTAL_SERVIDOR permission alone is insufficient: the linked
 * employee must also be active before any personal portal data is returned.
 */
export async function getEmployeePortalAccess(): Promise<EmployeePortalAccess> {
  const context = await getTenantContextForModule("PORTAL_SERVIDOR");
  const employeeId = context.user.employeeId;

  if (!employeeId) return { status: "UNAVAILABLE" };

  const employee = await context.prisma.employee.findFirst({
    where: {
      id: employeeId,
      isActive: true,
    },
    select: {
      id: true,
      name: true,
      registration: true,
      role: { select: { name: true } },
      department: { select: { name: true } },
      secretariat: { select: { name: true } },
    },
  });

  if (!employee) return { status: "UNAVAILABLE" };

  return {
    status: "AVAILABLE",
    context,
    employee,
  };
}
