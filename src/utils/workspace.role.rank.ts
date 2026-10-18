import { WorkspaceRole } from "@prisma/client";

export const WorkspaceRoleRank = {
  [WorkspaceRole.MEMBER]: 1,
  [WorkspaceRole.ADMIN]: 2,
  [WorkspaceRole.OWNER]: 3,
};
export default WorkspaceRoleRank;
