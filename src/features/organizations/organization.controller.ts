import { Request, Response } from "express";
import { organizationService } from "./organization.service";
import { ApiResponse } from "../../utils/ApiResponse";
import { ApiError } from "../../utils/ApiError";

export async function inviteController(req: Request, res: Response) {
    const organizationIdString = req.params.orgId;
    if (!organizationIdString) {
        throw new ApiError(400, "Organization ID is required in the URL path");
    }
    const organizationId = parseInt(organizationIdString, 10);
    if (isNaN(organizationId)) {
        throw new ApiError(400, "Invalid Organization ID format in URL path");
    }
    if (!req.user || typeof req.user.id !== 'number') {
        throw new ApiError(401, "Unauthorized - User information missing or invalid");
    }
    const loggedInUserId = req.user.id;

    const { email: emailToInvite } = req.body;
    if (!emailToInvite || typeof emailToInvite !== 'string') {
        throw new ApiError(400, "Email to invite is required in the request body");
    }
    
    await organizationService.inviteUserToOrg({organizationId, loggedInUserId, emailToInvite});

    return res.status(200).json(
        new ApiResponse(200, "User invited Succesfully")
    )
}

export async function getOrganizationController(req: Request, res: Response){
    const organizationIdString = req.params.orgId;
    if(!organizationIdString){
        throw new ApiError(400, "Organization Id is required in the url path");
    }
    const organizationId = Number(organizationIdString);
    if(isNaN(organizationId)){
        throw new ApiError(400, "Invalid organization Id format in the url");
    }
    if(!req.user || typeof req.user.id !== 'number'){
        throw new ApiError(401, "Unauthorized - User information missing or invalid");
    }
    const loggedInUserId = req.user.id;
    const organizationDetails = await organizationService.getOrganizationDetails({organizationId, loggedInUserId});

    return res.status(200).json(
        new ApiResponse(
            200,
            "Organization details fetched succesfully",
            organizationDetails
        )
    )

}

export async function removeUserController(req: Request, res: Response) {
    const organizationIdString = req.params.orgId;
    if(!organizationIdString) {
        throw new ApiError(400, "Organization Id is required in the path");
    }
    const organizationId = Number(organizationIdString);
    if(isNaN(organizationId)){
        throw new ApiError(400, "Invalid organization Id format in the url" );
    }
    if(!req.user || typeof req.user.id !== 'number'){
        throw new ApiError(401, "Unauthorized - User information missing or invalid");
    }
    const loggedInUserId = req.user.id;
    const userIdToRemoveString = req.params.userId;
    if(!userIdToRemoveString){
        throw new ApiError(400, "User ID to remove is required in the URL path");
    }
    
    const userIdToRemove = Number(userIdToRemoveString);
    if(isNaN(userIdToRemove)){
        throw new ApiError(400, "Invalid User ID format");
    }

    await organizationService.removeUserFromOrg({organizationId, userIdToRemove, loggedInUserId});

    return res.status(200).json(
        new ApiResponse(
            200,
            "Successfully removed the user from organization"
        )
    )
}

export async function updateRoleController(req: Request, res: Response) {
    const organizationIdString = req.params.orgId;
    if(!organizationIdString){
        throw new ApiError(400, "Organizaiton id is required in the path");
    }
    const organizationId = parseInt(organizationIdString, 10);
    if(isNaN(organizationId)){
        throw new ApiError(400, "Invalid Organization id format")
    }
    if(!req.user || typeof req.user.id !== 'number'){
        throw new ApiError(401, "Unauthorized - User information missing or invalid");
    }
    const loggedInUserId = req.user.id;
     const userIdToUpdateString = req.params.userId;
    if(!userIdToUpdateString){
        throw new ApiError(400, "User ID to remove is required in the URL path");
    }
    
    const userIdToUpdate = Number(userIdToUpdateString);
    if(isNaN(userIdToUpdate)){
        throw new ApiError(400, "Invalid User ID format");
    }
    const {newRole} = req.body;
    await organizationService.updateUserRole({organizationId, loggedInUserId, userIdToUpdate,newRole});

    return res.status(200).json(
        new ApiResponse(200, "User Role updated successfully")
    )


}

export async function updateOrgController(req: Request, res: Response) {
    const { orgId } = req.params;
    if(!orgId){
        throw new ApiError(400, "Organization ID is required in the URl path");
    }
    const organizationId = parseInt(orgId, 10);
    if(isNaN(organizationId)){
        throw new ApiError(400, "Invalid Organization ID format");
    }
    if(!req.user || typeof req.user.id !== 'number'){
        throw new ApiError(401, "Unauthorized - User information missing");
    }
    const loggedInUserId = req.user.id;

    const { name: newName } = req.body;
    if (!newName) {
        throw new ApiError(400, "New name is required in the request body");
    }
    await organizationService.updateOrganizationName({
        organizationId,
        loggedInUserId,
        newName
    });
    return res.status(200).json(
        new ApiResponse(
            200,
            "Organization name updated successfully",
        )
    );
}

export async function deleteOrgController(req: Request, res: Response) {
    

    const { orgId } = req.params;
    if (!orgId) {
        throw new ApiError(400, "Organization ID is required in the URL path");
    }

    const organizationId = parseInt(orgId, 10);
    if (isNaN(organizationId)) {
        throw new ApiError(400, "Invalid Organization ID format");
    }

    if (!req.user || typeof req.user.id !== 'number') {
        throw new ApiError(401, "Unauthorized - User information missing");
    }
    const loggedInUserId = req.user.id;
    
    
    await organizationService.deleteOrganization({
        organizationId,
        loggedInUserId
    });

    
    return res.status(200).json(
        new ApiResponse(
            200,
            "Organization deleted successfully"
        )
    );
}