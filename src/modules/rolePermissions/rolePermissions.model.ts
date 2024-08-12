import mongoose from "mongoose"
import { IPermissions } from "./rolePermissions.interface"

const RolePermissionsSchema = new mongoose.Schema<IPermissions>(
  {
    roleName: { type: String, required: true, unique: true },
    permissions: [{ type: String, required: true }],
    isDeleted: { type: Boolean, default: false },
  },
  { timestamps: true, versionKey: false },
)

const RolePermissions = mongoose.model<IPermissions>("rolepermissions", RolePermissionsSchema)

export default RolePermissions

