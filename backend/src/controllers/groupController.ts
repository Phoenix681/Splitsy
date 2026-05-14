import type { Response } from 'express';
import { prisma } from '../server.js';
import type { AuthRequest, CreateGroupBody, AddMemberBody } from '../types/index.js';
import { emitMemberAdded } from '../utils/socketEmitter.js';

/**
 * Create a new group
 * POST /api/groups
 * Body: { name, description? }
 * Requires: Authentication
 */
export const createGroup = async (
  req: AuthRequest,
  res: Response
): Promise<void> => {
  try {
    const userId = req.userId as string;
    const { name, description } = req.body as CreateGroupBody;

    // Validation
    if (!name || name.trim().length === 0) {
      res.status(400).json({ error: 'Group name is required' });
      return;
    }

    if (name.length > 100) {
      res.status(400).json({ error: 'Group name must be less than 100 characters' });
      return;
    }

    // Create group and add creator as member in a transaction
    const result = await prisma.$transaction(async (tx: any) => {
      // Create the group
      const group = await tx.group.create({
        data: {
          name: name.trim(),
          description: description?.trim() || null,
        },
      });

      // Add creator as first member
      await tx.groupMember.create({
        data: {
          user_id: userId!,
          group_id: group.id,
        },
      });

      return group;
    },{
      maxWait: 20000,
      timeout: 20000
    });

    res.status(201).json({
      message: 'Group created successfully',
      group: result,
    });
  } catch (error) {
    console.error('Create group error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
};

/**
 * Get all groups the user is a member of
 * GET /api/groups
 * Requires: Authentication
 */
export const getUserGroups = async (
  req: AuthRequest,
  res: Response
): Promise<void> => {
  try {
    const userId = req.userId as string;

    // Get all groups where user is a member
    const groupMemberships = await prisma.groupMember.findMany({
      where: {
        user_id: userId,
      },
      include: {
        group: {
          include: {
            members: true, // To count members
          },
        },
      },
      orderBy: {
        joined_at: 'desc',
      },
    });

    // Transform data for response
    const groups = groupMemberships.map((membership: any) => ({
      id: membership.group.id,
      name: membership.group.name,
      description: membership.group.description,
      created_at: membership.group.created_at,
      joined_at: membership.joined_at,
      memberCount: membership.group.members.length,
    }));

    res.status(200).json({ groups });
  } catch (error) {
    console.error('Get user groups error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
};

/**
 * Get single group details with members
 * GET /api/groups/:groupId
 * Requires: Authentication + User must be member of group
 */
export const getGroupById = async (
  req: AuthRequest,
  res: Response
): Promise<void> => {
  try {
    const userId = req.userId as string;
    const { groupId } = req.params as { groupId: string };

    // Check if user is a member of this group
    const membership = await prisma.groupMember.findFirst({
      where: {
        user_id: userId,
        group_id: groupId,
      },
    });

    if (!membership) {
      res.status(403).json({ error: 'You are not a member of this group' });
      return;
    }

    // Get group with all members
    const group = await prisma.group.findUnique({
      where: { id: groupId },
      include: {
        members: {
          include: {
            user: {
              select: {
                id: true,
                name: true,
                email: true,
              },
            },
          },
          orderBy: {
            joined_at: 'asc',
          },
        },
      },
    });

    if (!group) {
      res.status(404).json({ error: 'Group not found' });
      return;
    }

    // Transform members data
    const members = group.members.map((member: any) => ({
      id: member.user.id,
      name: member.user.name,
      email: member.user.email,
      joined_at: member.joined_at,
    }));

    res.status(200).json({
      group: {
        id: group.id,
        name: group.name,
        description: group.description,
        created_at: group.created_at,
        members,
      },
    });
  } catch (error) {
    console.error('Get group by ID error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
};

/**
 * Add a member to a group
 * POST /api/groups/:groupId/members
 * Body: { email }
 * Requires: Authentication + User must be member of group
 */
export const addMemberToGroup = async (
  req: AuthRequest,
  res: Response
): Promise<void> => {
  try {
    const userId = req.userId as string;
    const { groupId } = req.params as { groupId: string };
    const { email } = req.body as AddMemberBody;

    // Validation
    if (!email || email.trim().length === 0) {
      res.status(400).json({ error: 'Email is required' });
      return;
    }

    // Check if current user is a member of this group
    const currentUserMembership = await prisma.groupMember.findFirst({
      where: {
        user_id: userId,
        group_id: groupId,
      },
    });

    if (!currentUserMembership) {
      res.status(403).json({ error: 'You are not a member of this group' });
      return;
    }

    // Find user to add by email
    const userToAdd = await prisma.user.findUnique({
      where: { email: email.toLowerCase() },
      select: {
        id: true,
        name: true,
        email: true,
      },
    });

    if (!userToAdd) {
      res.status(404).json({ error: 'User with this email not found' });
      return;
    }

    // Check if user is already a member
    const existingMembership = await prisma.groupMember.findFirst({
      where: {
        user_id: userToAdd.id,
        group_id: groupId,
      },
    });

    if (existingMembership) {
      res.status(409).json({ error: 'User is already a member of this group' });
      return;
    }

    // Add user to group
    const newMembership = await prisma.groupMember.create({
      data: {
        user_id: userToAdd.id,
        group_id: groupId,
      },
    });

    const memberData = {
      id: userToAdd.id,
      name: userToAdd.name,
      email: userToAdd.email,
      joined_at: newMembership.joined_at,
    };

    res.status(201).json({
      message: 'Member added successfully',
      member: memberData,
    });

    // Emit Socket.io event to notify group members
    emitMemberAdded(groupId, memberData);
  } catch (error) {
    console.error('Add member error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
};

/**
 * Remove a member from a group
 * DELETE /api/groups/:groupId/members/:memberId
 * Requires: Authentication + User must be member of group
 */
export const removeMemberFromGroup = async (
  req: AuthRequest,
  res: Response
): Promise<void> => {
  try {
    const userId = req.userId as string;
    const { groupId, memberId } = req.params as { groupId: string; memberId: string };

    // Check if current user is a member of this group
    const currentUserMembership = await prisma.groupMember.findFirst({
      where: {
        user_id: userId,
        group_id: groupId,
      },
    });

    if (!currentUserMembership) {
      res.status(403).json({ error: 'You are not a member of this group' });
      return;
    }

    // Check if trying to remove themselves (allowed)
    // Or if they're removing someone else (also allowed in this simple version)
    const membershipToRemove = await prisma.groupMember.findFirst({
      where: {
        user_id: memberId,
        group_id: groupId,
      },
    });

    if (!membershipToRemove) {
      res.status(404).json({ error: 'Member not found in this group' });
      return;
    }

    // Check if this is the last member
    const memberCount = await prisma.groupMember.count({
      where: { group_id: groupId },
    });

    if (memberCount === 1) {
      res.status(400).json({ 
        error: 'Cannot remove the last member. Delete the group instead.' 
      });
      return;
    }

    // Remove member
    await prisma.groupMember.delete({
      where: { id: membershipToRemove.id },
    });

    res.status(200).json({ message: 'Member removed successfully' });
  } catch (error) {
    console.error('Remove member error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
};

/**
 * Delete a group
 * DELETE /api/groups/:groupId
 * Requires: Authentication + User must be member of group
 * Note: Deletes all related expenses, splits, and settlements (CASCADE)
 */
export const deleteGroup = async (
  req: AuthRequest,
  res: Response
): Promise<void> => {
  try {
    const userId = req.userId as string;
    const { groupId } = req.params as { groupId: string };

    // Check if user is a member of this group
    const membership = await prisma.groupMember.findFirst({
      where: {
        user_id: userId,
        group_id: groupId,
      },
    });

    if (!membership) {
      res.status(403).json({ error: 'You are not a member of this group' });
      return;
    }

    // Delete group (CASCADE will delete members, expenses, splits, settlements)
    await prisma.group.delete({
      where: { id: groupId },
    });

    res.status(200).json({ message: 'Group deleted successfully' });
  } catch (error) {
    console.error('Delete group error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
};