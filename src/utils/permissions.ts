const LEVEL_TYPES = {
    BLOG: "BLOG",
  }
  
  export const ALL_PERMISSIONS = {

   USER_PERMISSIONS : [
    {
      TYPE: "BLOG",
      PERMISSION: "CREATE",
      LEVEL: LEVEL_TYPES.BLOG,
    },
    {
      TYPE: "BLOG",
      PERMISSION: "EDIT_OWN_BLOG",
      LEVEL: LEVEL_TYPES.BLOG,
    },
    {
      TYPE: "USER_MANAGEMENT",
      PERMISSION: "VIEW",
      LEVEL: LEVEL_TYPES.BLOG,
    },
    {
      TYPE: "BLOG",
      PERMISSION: "EDIT_OWN_BLOG",
      LEVEL: LEVEL_TYPES.BLOG,
    },
  ],

  MAINTAINER_PERMISSIONS : [
    {
      TYPE: "BLOG",
      PERMISSION: "CREATE",
      LEVEL: LEVEL_TYPES.BLOG,
    },
    {
      TYPE: "BLOG",
      PERMISSION: "EDIT_OWN_BLOG",
      LEVEL: LEVEL_TYPES.BLOG,
    },
    {
      TYPE: "USER_MANAGEMENT",
      PERMISSION: "VIEW",
      LEVEL: LEVEL_TYPES.BLOG,
    },
    {
      TYPE: "BLOG",
      PERMISSION: "EDIT_OWN_BLOG",
      LEVEL: LEVEL_TYPES.BLOG,
    },
  ],

  ADMIN_PERMISSIONS : [
    {
      TYPE: "BLOG",
      PERMISSION: "CREATE",
      LEVEL: LEVEL_TYPES.BLOG,
    },
    {
      TYPE: "BLOG",
      PERMISSION: "EDIT_ANY_BLOG",
      LEVEL: LEVEL_TYPES.BLOG,
    },
    {
      TYPE: "BLOG",
      PERMISSION: "VIEW_ALL_BLOGS",
      LEVEL: LEVEL_TYPES.BLOG,
    },
    {
      TYPE: "USER_MANAGEMENT",
      PERMISSION: "VIEW",
      LEVEL: LEVEL_TYPES.BLOG,
    },
    {
      TYPE: "USER_MANAGEMENT",
      PERMISSION: "EDIT",
      LEVEL: LEVEL_TYPES.BLOG,
    },
    {
      TYPE: "BLOG",
      PERMISSION: "DELETE_ANY_BLOG",
      LEVEL: LEVEL_TYPES.BLOG,
    },
  ]
}
