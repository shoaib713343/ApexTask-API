import { and, eq } from "drizzle-orm";
import { db } from "../../db";
import { boards, permissions } from "../../db/schema";
import { ApiError } from "../../utils/ApiError";

type CreateBoardInput = {
    organizationId: number;
    loggedInUserId: number;
    name: string;
}

type GetBoardInput = {
    organizationId: number;
    loggedInUserId: number;
}

type GetBoardByIdInput = {
    boardId: number;
    loggedInUserId: number;
}

type UpdateBoardInput = {
    boardId: number;
    loggedInUserId: number;
    name: string;
}

type DeleteBoardInput = {
    boardId: number;
    loggedInUserId: number;
};

class BoardService{

    async createBoard(options: CreateBoardInput):Promise<any>{
        const { organizationId, loggedInUserId, name } = options;

        const isMember = await db.select().from(permissions).where(
            and(eq(permissions.userId, loggedInUserId),
            eq(permissions.organizationId, organizationId))
        )
        if(isMember.length === 0){
            throw new ApiError(400, "Not or Member or Organization not found")
        }

        const board = await db.insert(boards).values({
            name: name,
            organizationId: organizationId
        }).returning( {
            id: boards.id,
            name: boards.name
    });
    return board[0];
    }

    async getBoardsByOrg(options: GetBoardInput): Promise<any>{
        const {organizationId, loggedInUserId} = options;
        const isMember = await db.select().from(permissions).where(
            and( 
                    eq(permissions.userId, loggedInUserId), 
                    eq(permissions.organizationId, organizationId) 
                )
        )
        if(isMember.length === 0){
            throw new ApiError(403, "Forbidden: You are not a member of this organization");
        }
        const board = await db.select().from(boards).where(
            eq(boards.organizationId, organizationId)
        );

        return board;   
    }

    async getBoardById(options: GetBoardByIdInput): Promise<any>{
        const {boardId, loggedInUserId} = options;

        const board = await db.query.boards.findFirst({
            where: eq(boards.id, boardId)
        });
        if(!board) {
            throw new ApiError(404, "Board not found");
        }
        const organizationId = board.organizationId;
        const isMember = await db.select().from(permissions).where(
            and(
                eq(permissions.organizationId, organizationId),
                eq(permissions.userId, loggedInUserId)
            )
        )
        if (isMember.length === 0) {
            throw new ApiError(403, "Forbidden: You do not have access to this board");
        }
        return board;
    }

    async updateBoard(options: UpdateBoardInput){
        const {boardId, name, loggedInUserId} = options;
         const board = await db.query.boards.findFirst({
            where: eq(boards.id, boardId)
         });

         if(!board){
            throw new ApiError(400, "The Board does not exists")
         }
        const organizationId = board.organizationId;
        const isAdmin = await db.query.permissions.findFirst({
            where: and(
                eq(permissions.organizationId, organizationId),
                eq(permissions.userId, loggedInUserId),
                eq(permissions.role, 'ADMIN')
            )
        })
        if(!isAdmin){
            throw new ApiError(403, "You are unauthorized to perform this task");
        }
        const updatedBoard = await db.update(boards).set({
            name: name
        }).where(
            eq(boards.id, boardId)
        ).returning({
            id: boards.id,
            name: boards.name,
            organizationId: boards.organizationId
        })

        return updatedBoard[0];
    }

    async deleteBoard(options: DeleteBoardInput): Promise<void> {
        const { boardId, loggedInUserId } = options;

        const board = await db.query.boards.findFirst({
            where: eq(boards.id, boardId)
        });

        if (!board) {
            throw new ApiError(404, "Board not found");
        }

        const organizationId = board.organizationId;

        const isAdmin = await db.query.permissions.findFirst({
            where: and(
                eq(permissions.organizationId, organizationId),
                eq(permissions.userId, loggedInUserId),
                eq(permissions.role, 'ADMIN')
            )
        });

        if (!isAdmin) {
            throw new ApiError(403, "Forbidden: Only organization admins can delete boards");
        }

        await db.transaction(async (tx) => {
            // In the future, we'd delete comments, then cards, then lists here.
            // For now, we just delete the board.
            await tx.delete(boards)
                .where(eq(boards.id, boardId));
        });
    }




}

export const boardService = new BoardService();