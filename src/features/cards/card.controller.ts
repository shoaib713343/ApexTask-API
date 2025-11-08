import { Request, Response } from "express";
import { cardService } from "./card.service";
import { ApiResponse } from "../../utils/ApiResponse";
import { ApiError } from "../../utils/ApiError";

export async function createCardController(req: Request, res: Response) {
  const { listId } = req.params;
  const parsedListId = parseInt(listId, 10);

  if (isNaN(parsedListId)) {
    throw new ApiError(400, "Invalid List ID format");
  }
  if (!req.user || typeof req.user.id !== "number") {
    throw new ApiError(401, "Unauthorized - User information missing");
  }
  const loggedInUserId = req.user.id;
  const { title, description } = req.body;
  const newCard = await cardService.createCard({
    listId: parsedListId,
    loggedInUserId,
    title,
    description,
  });

  return res
    .status(201)
    .json(new ApiResponse(201, "Card created successfully", newCard));
}

export async function getCardByIdController(req: Request, res: Response) {
    const cardIdString = req.params.cardId;
    const cardId = parseInt(cardIdString, 10);
    if (isNaN(cardId)) {
        throw new ApiError(400, "Invalid Card ID format");
    }

    if (!req.user || typeof req.user.id !== 'number') {
        throw new ApiError(401, "Unauthorized");
    }
    const loggedInUserId = req.user.id;

    const card = await cardService.getCardById({cardId, loggedInUserId});

    return res.status(200).json(
        new ApiResponse(200, "Card fetched successfully", card)
    );
}

export async function moveCardController(req: Request, res: Response) {
    const { cardId } = req.params;
    const parsedCardId = parseInt(cardId, 10);
    if (isNaN(parsedCardId)) {
        throw new ApiError(400, "Invalid Card ID format");
    }

    if (!req.user || typeof req.user.id !== 'number') {
        throw new ApiError(401, "Unauthorized");
    }
    const loggedInUserId = req.user.id;

    const { newListId, newRank } = req.body;

    await cardService.moveCard({
        cardId: parsedCardId,
        loggedInUserId,
        newListId,
        newRank
    });

    return res.status(200).json(
        new ApiResponse(200, "Card moved successfully")
    );
}

