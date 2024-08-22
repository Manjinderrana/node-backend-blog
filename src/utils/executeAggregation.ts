import { ObjectId } from "mongoose"
import * as userBlogRolePermissionsService from "../modules/userBlogRolePermissions/userBlogRolePermissions.service"
import { customInterface } from "./interface"

export const authorizedBlogIds = async (
    userId: string | ObjectId,
    permissions: string[],
  ) => {
    return (
      await userBlogRolePermissionsService.aggregate([
        {
          $match: {
            userId,
            isDeleted: { $ne: true },
            ...(permissions.length ? { permissions: { $all: permissions } } : {}),
          },
        },
        {
          $lookup: {
            from: "blogs",
            let: { blogId: "$blogId" },
            pipeline: [
              {
                $match: {
                  $expr: { $eq: ["$$blogId", "$_id"] },
                  isDeleted: { $ne: true },
                },
              },
            ],
            as: "blogData",
          },
        },
        {
          $unwind: "$blogData",
        },
      ]
      )
    ).map((ele: customInterface) => ele?.blogId)
  }
