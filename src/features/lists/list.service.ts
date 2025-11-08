import { and, asc, count, eq } from "drizzle-orm";
import { db } from "../../db";
import { boards, lists, permissions } from "../../db/schema";
import { ApiError } from "../../utils/ApiError";


type CreateListInput = {
    boardId: number;
    loggedInUserId: number;
    title: string;
}

type GetlistsInput = {
    boardId: number;
    loggedInUserId: number;
}

type UpdateListInput = {
  listId: number;
  loggedInUserId: number;
  newTitle: string;
};

type DeleteListInput = {
  listId: number;
  loggedInUserId: number;
};

type ReorderListInput = {
    boardId: number;
    loggedInUserId: number;
    orderedListIds: number[];
};

class ListService{
    async createList(options: CreateListInput){
        const {boardId, loggedInUserId, title} = options;
        const board = await db.query.boards.findFirst({
            where: eq(boards.id, boardId)
        })
        if(!board){
            throw new ApiError(400, "No board found for this boardId");
        }
        const organizationId = board.organizationId;

        const isMember = await db.query.permissions.findFirst({
            where: and(
                eq(permissions.organizationId, organizationId),
                eq(permissions.userId, loggedInUserId)
            )
        });
        if(!isMember){
            throw new ApiError(403, "you are not authorized to perfrom this task")
        }
        const countResult =  await db.select({value: count()})
            .from(lists)
            .where(eq(lists.boardId, boardId))

        const newRank = countResult[0].value;

        const list = await db.insert(lists).values({
            title: title,
            boardId: boardId,
            rank: newRank
        }).returning({
            id: lists.id,
            title: lists.title,
            rank: lists.rank
        })

        return list[0];

    }

    async getListsByBoard(options: GetlistsInput){
        const {boardId, loggedInUserId} = options;

         const board = await db.query.boards.findFirst({
            where: eq(boards.id, boardId)
        })
        if(!board){
            throw new ApiError(400, "No board found for this boardId");
        }
        const organizationId = board.organizationId;

        const isMember = await db.query.permissions.findFirst({
            where: and(
                eq(permissions.organizationId, organizationId),
                eq(permissions.userId, loggedInUserId)
            )
        });
        if(!isMember){
            throw new ApiError(403, "you are not authorized to perfrom this task")
        }
        const list = await db.select()
            .from(lists)
            .where(eq(lists.boardId, boardId))
            .orderBy(asc(lists.rank));

        return list;

    }

    async updateList(options: UpdateListInput): Promise<any>{
        const { listId, loggedInUserId, newTitle } = options;
        const list = await db.query.lists.findFirst({
            where: eq(lists.id, listId)
        });
        if(!list){
            throw new ApiError(404, "List not found");
        }
        const board = await db.query.boards.findFirst({
            where: eq(boards.id, list.boardId)
        });
        if(!board){
            throw new ApiError(404, "Board not found for this list");
        }
        const isMember = await db.query.permissions.findFirst({
            where:
                and(
                    eq(permissions.organizationId, board.organizationId),
                    eq(permissions.userId, loggedInUserId)
                ),
        });
        if(!isMember) {
            throw new ApiError(
                403,
                "Forbidden: You do not have access to this list"
            );
        }

        const updatedListArray = await db
            .update(lists)
            .set({ title: newTitle })
            .where(eq(lists.id, listId))
            .returning({
                id: lists.id,
                title: lists.title,
                rank: lists.rank
            });

        return updatedListArray[0];
    }
    
    async deleteList(options: DeleteListInput): Promise<any>{
        const {loggedInUserId, listId} = options;

        const list = await db.query.lists.findFirst({
            where: eq(lists.id, listId),
        });
        if(!list){
            throw new ApiError(404, "List not found");
        }
        const board = await db.query.boards.findFirst({
            where: eq(boards.organizationId, list.boardId)
        });
        if (!board) {
      throw new ApiError(404, "Board not found for this list");
    }
    const isMember = await db.query.permissions.findFirst({
        where: and(
            eq(permissions.organizationId, board.organizationId),
            eq(permissions.userId, loggedInUserId)
        ),
    });
    if (!isMember) {
      throw new ApiError(
        403,
        "Forbidden: You do not have access to this list"
      );
    }
    await db.delete(lists).where(eq(lists.id, listId));
    }

    async reorderLists(options: ReorderListInput): Promise<void>{
        const {boardId, loggedInUserId, orderedListIds} = options;
        const board = await db.query.boards.findFirst({
            where: eq(
                boards.id, boardId
            )
        });
        if(!board){
            throw new ApiError(404, "No board found for this board Id");
        }
        const isMember = await db.query.permissions.findFirst({
            where: and(
                eq(permissions.organizationId, board.organizationId),
                eq(permissions.userId, loggedInUserId)
            )
        });
        if(!isMember){
            throw new ApiError(403, "You are not authorized to perform this task");
        }
        await db.transaction(async (tx)=> {

            const updatePromises = orderedListIds.map((listId, index)=>(
                tx.update(lists).set({rank:index}).where(eq(lists.id, listId))
            ));
            await Promise.all(updatePromises);
        });
    }

}

export const listService = new ListService();