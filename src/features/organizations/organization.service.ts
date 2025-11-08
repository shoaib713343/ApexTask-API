import { and, eq, ne, count } from "drizzle-orm";
import { db } from "../../db";
import { organizations, permissions, users } from "../../db/schema";
import { ApiError } from "../../utils/ApiError";

type InviteOptions = {
  organizationId: number;
  emailToInvite: string;
  loggedInUserId: number;
};

type OrgMemberUser = {
  id: number;
  name: string | null;
  email: string | null;
};
type OrgMemberPermission = {
  role: "ADMIN" | "MEMBER";
  user: OrgMemberUser | null;
};
type OrgDetailsResponse = {
  id: number;
  name: string | null;
  permissions: OrgMemberPermission[];
};

type RemoveUserOptions = {
  organizationId: number;
  userIdToRemove: number;
  loggedInUserId: number;
};

type UpdateRoleOptions = {
  organizationId: number;
  loggedInUserId: number;
  userIdToUpdate: number;
  newRole: "ADMIN" | "MEMBER";
};

type UpdateOrgOptions = {
    organizationId: number;
    loggedInUserId: number;
    newName: string;
}

type DeleteOrgOptions = {
    organizationId: number;
    loggedInUserId: number;
}

class OrganizationService {
  constructor() {}
  async inviteUserToOrg(options: InviteOptions): Promise<void> {
    const { organizationId, emailToInvite, loggedInUserId } = options;

    const adminPermission = await db
      .select()
      .from(permissions)
      .where(
        and(
          eq(permissions.userId, loggedInUserId),
          eq(permissions.organizationId, organizationId),
          eq(permissions.role, "ADMIN")
        )
      );
    if (adminPermission.length === 0) {
      throw new ApiError(403, "Forbidden: Only admins can invite users");
    }

    const userToInvite = await db
      .select()
      .from(users)
      .where(eq(users.email, emailToInvite));
    if (userToInvite.length === 0) {
      throw new ApiError(404, "User with this email not found");
    }
    const user = userToInvite[0];

    const existingPermission = await db
      .select()
      .from(permissions)
      .where(
        and(
          eq(permissions.userId, user.id),
          eq(permissions.organizationId, organizationId)
        )
      );
    if (existingPermission.length > 0) {
      throw new ApiError(409, "User is already a member");
    }
    await db.insert(permissions).values({
      role: "MEMBER",
      userId: user.id,
      organizationId: organizationId,
    });
  }

  async getOrganizationDetails({
    organizationId,
    loggedInUserId,
  }: {
    organizationId: number;
    loggedInUserId: number;
  }): Promise<OrgDetailsResponse> {
    const isMember = await db
      .select()
      .from(permissions)
      .where(
        and(
          eq(permissions.organizationId, organizationId),
          eq(permissions.userId, loggedInUserId)
        )
      );
    if (isMember.length === 0) {
      throw new ApiError(403, "Not a member");
    }
    const organizationDetails = await db.query.organizations.findFirst({
      where: eq(organizations.id, organizationId),
      with: {
        permissions: {
          with: {
            user: {
              columns: {
                id: true,
                name: true,
                email: true,
              },
            },
          },
          columns: {
            role: true,
          },
        },
      },
    });

    if (!organizationDetails) {
      throw new ApiError(404, "Organization not found");
    }
    return organizationDetails;
  }

  async removeUserFromOrg(options: RemoveUserOptions): Promise<void> {
    const { organizationId, userIdToRemove, loggedInUserId } = options;
    const isAdmin = await db
      .select()
      .from(permissions)
      .where(
        and(
          eq(permissions.userId, loggedInUserId),
          eq(permissions.organizationId, organizationId),
          eq(permissions.role, "ADMIN")
        )
      );
    if (isAdmin.length === 0) {
      throw new ApiError(403, "Forbidden: Only admins can remove users");
    }
    if (loggedInUserId === userIdToRemove) {
      throw new ApiError(400, "Admin can't remove themselves");
    }
    const targetUserRole = await db
      .select()
      .from(permissions)
      .where(
        and(
          eq(permissions.userId, userIdToRemove),
          eq(permissions.organizationId, organizationId)
        )
      );
    if (targetUserRole.length === 0) {
      throw new ApiError(404, "User is not a member of this organization");
    }
    if (targetUserRole[0].role === "ADMIN") {
      const countAdminResult = await db
        .select({ value: count() })
        .from(permissions)
        .where(
          and(
            eq(permissions.organizationId, organizationId),
            eq(permissions.role, "ADMIN"),
            ne(permissions.userId, userIdToRemove)
          )
        );
      if (countAdminResult[0].value === 0) {
        throw new ApiError(
          400,
          "Cannot remove the last admin of the organization"
        );
      }
    }
    await db
      .delete(permissions)
      .where(
        and(
          eq(permissions.organizationId, organizationId),
          eq(permissions.userId, userIdToRemove)
        )
      );
  }

  async updateUserRole(options: UpdateRoleOptions): Promise<void> {
    const { organizationId, loggedInUserId, userIdToUpdate, newRole } = options;

    const isAdminArray = await db
      .select()
      .from(permissions)
      .where(
        and(
          eq(permissions.organizationId, organizationId),
          eq(permissions.userId, loggedInUserId),
          eq(permissions.role, "ADMIN")
        )
      );
    if (isAdminArray.length === 0) {
      throw new ApiError(403, "User is not authorized to perform this action");
    }
    if (newRole === "MEMBER") {
      const targetUserPermission = await db
        .select()
        .from(permissions)
        .where(
          and(
            eq(permissions.userId, userIdToUpdate),
            eq(permissions.organizationId, organizationId)
          )
        );
      if (
        targetUserPermission.length > 0 &&
        targetUserPermission[0].role === "ADMIN"
      ) {
        const adminCountResult = await db
          .select({ value: count() })
          .from(permissions)
          .where(
            and(
              eq(permissions.organizationId, organizationId),
              eq(permissions.role, "ADMIN"),
              ne(permissions.userId, userIdToUpdate)
            )
          );
        if (adminCountResult[0].value === 0) {
          throw new ApiError(
            400,
            "Cannot demote the last admin of the organization"
          );
        }
      }
    }
    await db.update(permissions)
        .set({role: newRole})
        .where(
            and(
                eq(permissions.userId, userIdToUpdate),
                eq(permissions.organizationId, organizationId)
            )
        );

  }

  async updateOrganizationName (options: UpdateOrgOptions):Promise<void> {
    const { organizationId, loggedInUserId, newName } = options;
     const isAdminArray = await db
      .select()
      .from(permissions)
      .where(
        and(
          eq(permissions.organizationId, organizationId),
          eq(permissions.userId, loggedInUserId),
          eq(permissions.role, "ADMIN")
        )
      );
    if (isAdminArray.length === 0) {
      throw new ApiError(403, "User is not authorized to perform this action");
    }
    await db.update(organizations).set({
        name: newName
    }).where(eq(organizations.id, organizationId));
  }

  async deleteOrganization(options: DeleteOrgOptions): Promise<void>{
    const { organizationId, loggedInUserId } = options;
   
    const allPermissions = await db.select()
        .from(permissions)
        .where(eq(permissions.organizationId, organizationId));

    if(allPermissions.length > 1){
        throw new ApiError(400, "Cannot delete organization: Other members still exist")
    }

    if (allPermissions.length === 0) {
            throw new ApiError(404, "Organization not found or is empty.");
        }
    const singlePermission = allPermissions[0];

    if(
        singlePermission.userId !== loggedInUserId ||
        singlePermission.role !== 'ADMIN'
    ) {
        throw new ApiError(403, "Forbidden: You are not the sole admin of this organization");
    }
    await db.transaction( async(tx)=>{
        await tx.delete(permissions)
            .where(eq(permissions.id, singlePermission.id));

        await tx.delete(organizations)
            .where(eq(organizations.id, organizationId))
    });
  }



}

export const organizationService = new OrganizationService();
