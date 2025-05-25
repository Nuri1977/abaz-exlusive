import "better-auth";

declare module "better-auth" {
  interface User {
    isAdmin?: boolean;
  }
}
