import { Dependencies } from "../index.mjs";
import { isUsing as isUsingNode } from "../node/check-using.mjs";

export async function fixAutoArgs(args) {
  if (!args[Dependencies.Node])
    args[Dependencies.Node] = await isUsingNode(args);
}
