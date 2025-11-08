import { Request, Response } from "express"
import { ApiError } from "../../utils/ApiError";
import { boardService } from "./board.service";
import { ApiResponse } from "../../utils/ApiResponse";

export async function createBoardController(req: Request, res: Response){
    const organizationIdString = req.params.orgId;
    if(!organizationIdString){
        throw new ApiError(400, "organizaiton Id is missing from the path");
    }
    const organizationId = parseInt(organizationIdString, 10);
    if(isNaN(organizationId)){
        throw new ApiError(400, "Invalid organization Id format in the URL");
    }
    if(!req.user || typeof req.user.id !== "number"){
        throw new ApiError(401, "Unauthorized or Invalid Uuser id format");
    }
    const loggedInUserId = req.user.id;
    const {name} = req.body;

    const board = await boardService.createBoard({organizationId, loggedInUserId, name});

    return res.status(201).json(
        new ApiResponse(
            201,
            "Board created succesfully",
            board
        )
    )

}

export async function getBoardsController(req: Request, res: Response) {
    const organizationIdString = req.params.orgId;
    if(!organizationIdString){
        throw new ApiError(400, "organization Id missing from the path");
    }
    const organizationId = parseInt(organizationIdString, 10);
    if(isNaN(organizationId)){
        throw new ApiError(400, "Invalid organization Id format in URL");
    }
    if(!req.user || typeof req.user.id !== "number"){
        throw new ApiError(401, "Invalid token");
    }
    const loggedInUserId = req.user.id;
    const boards = await boardService.getBoardsByOrg({organizationId, loggedInUserId});

    return res.status(200).json(
        new ApiResponse(
            200,
            "Successfully fetched boards data",
            boards
        )
    )
}

export async function getBoardByIdController(req: Request, res: Response) {
     const boardIdString = req.params.boardId;
    if(!boardIdString){
        throw new ApiError(400, "board Id missing from the path");
    }
    const boardId = parseInt(boardIdString, 10);
    if(isNaN(boardId)){
        throw new ApiError(400, "Invalid board Id format in URL");
    }
    if(!req.user || typeof req.user.id !== "number"){
        throw new ApiError(401, "Invalid token");
    }
    const loggedInUserId = req.user.id;
    const board = await boardService.getBoardById({boardId, loggedInUserId})

    return res.status(200).json(
        new ApiResponse(
            200,
            "Successfully fetched board details",
            board
        )
    )
}

export async function updateBoardController(req: Request, res: Response) {
    
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
    
    const { name } = req.body;
    if (!name) {
        throw new ApiError(400, "New name is required in the request body");
    }

    const updatedBoard = await boardService.updateBoard({
        boardId: parsedBoardId,
        loggedInUserId,
        name 
    });

    return res.status(200).json(
        new ApiResponse(
            200,
            "Board updated successfully",
            updatedBoard
        )
    );
}

export async function deleteBoardController(req: Request, res: Response) {
    
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
    
    await boardService.deleteBoard({
        boardId: parsedBoardId,
        loggedInUserId
    });

    return res.status(200).json(
        new ApiResponse(
            200,
            "Board deleted successfully"
        )
    );
}