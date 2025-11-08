import { and, eq, count, sql } from "drizzle-orm";
import { db } from "../../db";
import { boards, cards, lists, permissions } from "../../db/schema";
import { ApiError } from "../../utils/ApiError";

type CreateCardInput = {
    listId: number;
    loggedInUserId: number;
    title: string;
    description?: string; 
}

type GetCardByIdInput = {
    cardId: number;
    loggedInUserId: number;
}

type MoveCardInput = {
    cardId: number;
    loggedInUserId: number;
    newListId: number;
    newRank: number;
}

class CardService{
    async createCard(options: CreateCardInput){
        const {listId, loggedInUserId, title, description} = options;
        const list = await db.query.lists.findFirst({
            where: eq(lists.id, listId),
        });
        if(!list){
            throw new ApiError(404, "No list found for this listId");
        }
        const board = await db.query.boards.findFirst({
            where: eq(boards.id, list.boardId),
        });
        if(!board){
            throw new ApiError(404, "No board found for this boardId");
        }
        const organizationId = board.organizationId;
        const isMember = await db.query.permissions.findFirst({
            where: and(
                eq(permissions.organizationId, organizationId),
                eq(permissions.userId, loggedInUserId)
            ),
        });
        if(!isMember){
            throw new ApiError(403, "you are authrozied to perform this task");
        }
        const countResult = await db.select({value: count()}).from(cards).where(
            eq(cards.listId, listId),
        )
        const newRank = countResult[0].value;

        const newCardArray = await db.insert(cards).values({
        title: title,
        description: description,
        listId: listId,
        rank: newRank
    }).returning();

    return newCardArray[0];
}

async getCardById(options:GetCardByIdInput): Promise<any>{
    const {cardId, loggedInUserId} = options;
    const card = await db.query.cards.findFirst({
            where: eq(cards.id, cardId)
        });

        if (!card) {
            throw new ApiError(404, "Card not found");
        }
    const list = await db.query.lists.findFirst({ where: eq(lists.id, card.listId) });
        if (!list) throw new ApiError(404, "List not found for this card");

        const board = await db.query.boards.findFirst({ where: eq(boards.id, list.boardId) });
        if (!board) throw new ApiError(404, "Board not found for this card");

    const isMember = await db.query.permissions.findFirst({
            where: and(
                eq(permissions.organizationId, board.organizationId),
                eq(permissions.userId, loggedInUserId)
            )
        });

        if (!isMember) {
            throw new ApiError(403, "Forbidden: You do not have access to this card");
        }
        return card;
}

async moveCard(options: MoveCardInput):Promise<any>{
    const {cardId, loggedInUserId, newListId, newRank} = options;

    const card = await db.query.cards.findFirst({
        where: eq(cards.id, cardId)
    });
    if(!card){
        throw new ApiError(404, "cant find any card with this card Id");
    }
    const curentList = await db.query.lists.findFirst({
        where: eq(lists.id, card.listId)
    });
    if(!curentList){
        throw new ApiError(404, "cant find any list with the list Id");
    }
    const newList = await db.query.lists.findFirst({
        where: eq(lists.id, newListId)
    });
    if(!newList){
        throw new ApiError(404, "cant find any list with the list Id");
    }
    if (curentList.boardId !== newList.boardId) {
    throw new ApiError(400, "Cannot move card to a list on a different board");
}
    const board = await db.query.boards.findFirst({
        where: eq(boards.id, newList.boardId)
    });
    if(!board){
        throw new ApiError(404, "cant find any board with the board Id");
    }
    const isMember = await db.query.permissions.findFirst({
        where: and(
            eq(permissions.organizationId, board.organizationId),
            eq(permissions.userId, loggedInUserId)
        )
    });
    if(!isMember){
        throw new ApiError(403, "You are not authorized to perfrom this task");
    }

    await db.transaction(async (tx)=>{
       if(card.listId === newListId){
        if(newRank > card.rank){
            await tx.execute(sql`
            UPDATE cards
            SET rank = rank - 1
            WHERE list_id = ${card.listId}
                AND rank > ${card.rank}
                AND rank <= ${newRank}
            `);
        } else if(newRank < card.rank){
            await tx.execute(sql`
                UPDATE cards
                SET rank = rank + 1
                WHERE list_id = ${card.listId}
                    AND rank >= ${newRank}
                    AND rank < ${card.rank}
                `);
        }
       } else {
        await tx.execute(sql`
            UPDATE cards
            SET rank = rank - 1
            WHERE list_id = ${card.listId}
             AND rank > ${card.rank}
            `);
        await tx.execute(sql`
            UPDATE cards
            SET rank = rank + 1
            WHERE list_id = ${newListId}
              AND rank >= ${newRank}
            `);
       }

       await tx.update(cards).set({listId: newListId, rank: newRank})
                .where(eq(cards.id, cardId));
    })


}

}

export const cardService = new CardService();