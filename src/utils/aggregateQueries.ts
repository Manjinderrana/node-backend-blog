import { ObjectId } from 'mongoose'

export const queryForAuthorizedBlogIds = (userId: ObjectId | string, permissions: string[]) => {
  return [
    {
      $match: {
        userId,
        isDeleted: { $ne: true },
        ...(permissions.length ? { permissions: { $all: permissions } } : {}),
      },
    },
    {
      $lookup: {
        from: 'blogs',
        let: { blogId: '$blogId' },
        pipeline: [
          {
            $match: {
              $expr: { $eq: ['$$blogId', '$_id'] },
              isDeleted: { $ne: true },
            },
          },
        ],
        as: 'blogData',
      },
    },
    {
      $unwind: '$blogData',
    },
    // {
    //   $project: { blogId: 1 },
    // },
  ]
}
