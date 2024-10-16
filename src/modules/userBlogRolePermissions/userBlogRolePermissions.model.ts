import mongoose from 'mongoose'

const UserBlogRolePermissionsSchema = new mongoose.Schema(
  {
    roleName: { type: String, required: true },
    permissions: [{ type: String, required: true }],
    blogId: { type: mongoose.Types.ObjectId, ref: 'blogs', required: true },
    userId: { type: mongoose.Types.ObjectId, ref: 'users', required: true },
    isDeleted: { type: Boolean, default: false },
  },
  { timestamps: true, versionKey: false },
)

UserBlogRolePermissionsSchema.index({ blogId: 1, userId: 1 })
UserBlogRolePermissionsSchema.index({ userId: 1, blogId: 1 })

const UserBlogRolePermissions = mongoose.model('userblogrolepermissions', UserBlogRolePermissionsSchema)

export default UserBlogRolePermissions
