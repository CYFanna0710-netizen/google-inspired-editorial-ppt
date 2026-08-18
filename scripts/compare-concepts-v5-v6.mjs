import path from "node:path";
import {args,need,readJson,writeJson} from "./lib/common.mjs";
import {comparePlanner5And6} from "./lib/visual-concept-intelligence.mjs";

const a=args(),plan=await readJson(path.resolve(need(a,"plan"))),concepts=await readJson(path.resolve(need(a,"concepts"))),out=path.resolve(need(a,"out"));
const comparison=comparePlanner5And6(plan,concepts);
await writeJson(out,comparison);
console.log(`comparison=${out} pages=${comparison.pages.length} planner5Default=${comparison.invariant.planner5StillDefault} rendererModified=${comparison.invariant.rendererModified}`);
