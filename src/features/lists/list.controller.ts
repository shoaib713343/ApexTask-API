import { Request, Response } from "express";
import { listService } from "./list.service";
import { ApiResponse } from "../../utils/ApiResponse";
import { ApiError } from "../../utils/ApiError";

export async function createListController(req: Request, res: Response) {
    
    const { boardId } = req.params;
    if (!boardId) {
        throw new ApiError(400, "Board ID is required in the URL path");
    }

    const parsedBoardId = parseInt(boardId, 10);
    if (isNaN(parsedBoardId)) {
        throw new ApiError(400, "Invalid Board ID format");
    }

    if (!req.user || typeof req.user.id !== 'number') {
        throw new ApiError(401, "Unauthorized - User information missing");
    }
    const loggedInUserId = req.user.id;
    
    const { title } = req.body;
    if (!title) {
        throw new ApiError(400, "List title is required in the request body");
    }

    const newList = await listService.createList({
        boardId: parsedBoardId,
        loggedInUserId,
        title
    });

    return res.status(201).json( 
        new ApiResponse(
            201,
            "List created successfully",
            newList
        )
    );
};

export async function getListsController(req: Request, res: Response) {
    const { boardId } = req.params;
    if (!boardId) {
        throw new ApiError(400, "Board ID is required in the URL path");
    }

    const parsedBoardId = parseInt(boardId, 10);
    if (isNaN(parsedBoardId)) {
        throw new ApiError(400, "Invalid Board ID format");
    }

    if (!req.user || typeof req.user.id !== 'number') {
        throw new ApiError(401, "Unauthorized - User information missing");
    }
    const loggedInUserId = req.user.id;
    
    const lists = await listService.getListsByBoard({
        boardId: parsedBoardId,
        loggedInUserId
    });

    return res.status(200).json(
        new ApiResponse(
            200,
            "Lists fetched successfully",
            lists 
        )
    );
};

export async function updateListController(req: Request, res: Response) {
  const { listId } = req.params;
  const parsedListId = parseInt(listId, 10);
  if (isNaN(parsedListId)) {
    throw new ApiError(400, "Invalid List ID format");
  }

  if (!req.user || typeof req.user.id !== "number") {
    throw new ApiError(401, "Unauthorized - User information missing");
  }
  const loggedInUserId = req.user.id;

  const { title } = req.body;
  if (!title) {
    throw new ApiError(400, "List title is required");
  }

  const updatedList = await listService.updateList({
    listId: parsedListId,
    loggedInUserId,
    newTitle: title,
  });

  return res
    .status(200)
    .json(new ApiResponse(200, "List updated successfully", updatedList));
};

export async function deleteListController(req: Request, res: Response) {
  const { listId } = req.params;
  const parsedListId = parseInt(listId, 10);
  if (isNaN(parsedListId)) {
    throw new ApiError(400, "Invalid List ID format");
  }

  if (!req.user || typeof req.user.id !== "number") {
    throw new ApiError(401, "Unauthorized - User information missing");
  }
  const loggedInUserId = req.user.id;

  await listService.deleteList({
    listId: parsedListId,
    loggedInUserId,
  });

  return res
    .status(200)
    .json(new ApiResponse(200, "List deleted successfully"));
};

export async function reorderListsController(req: Request, res: Response) {
    
    const { boardId } = req.params;
    const parsedBoardId = parseInt(boardId, 10);
    if (isNaN(parsedBoardId)) {
        throw new ApiError(400, "Invalid Board ID format");
    }

    if (!req.user || typeof req.user.id !== 'number') {
        throw new ApiError(401, "Unauthorized - User information missing");
    }
    const loggedInUserId = req.user.id;
    
    const { orderedListIds } = req.body;
    if (!Array.isArray(orderedListIds)) {
        throw new ApiError(400, "orderedListIds must be an array");
    }
    await listService.reorderLists({
        boardId: parsedBoardId,
        loggedInUserId,
        orderedListIds
    });
    return res.status(200).json(
        new ApiResponse(
            200,
            "Lists reordered successfully"
        )
    );
}